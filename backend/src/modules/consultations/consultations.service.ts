import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Consultation } from './entities/consultation.entity';
import { ConsultationCorrection } from '../corrections/entities/consultation-correction.entity';
import {
  CreateConsultationDto,
  UpdateConsultationDto,
  CreateCorrectionDto,
} from './dto/consultation.dto';
import { ConsultationStatus, CorrectionReason } from '../../common/constants/enums';

@Injectable()
export class ConsultationsService {
  constructor(
    @InjectRepository(Consultation)
    private readonly consultationRepository: Repository<Consultation>,
    @InjectRepository(ConsultationCorrection)
    private readonly correctionRepository: Repository<ConsultationCorrection>,
    private readonly dataSource: DataSource,
  ) {}

  async create(physicianId: string, dto: CreateConsultationDto): Promise<Consultation> {
    const consultation = this.consultationRepository.create({
      patientId: dto.patientId,
      physicianId,
      appointmentId: dto.appointmentId,
      chiefComplaint: dto.chiefComplaint,
      vitalSigns: dto.vitalSigns || {},
      primaryDiagnosisDescription: dto.primaryDiagnosisDescription,
      primaryDiagnosisCode: dto.primaryDiagnosisCode,
      treatmentPlan: dto.treatmentPlan,
      status: ConsultationStatus.DRAFT,
    });

    return await this.consultationRepository.save(consultation);
  }

  async findAll(patientId?: string, physicianId?: string): Promise<Consultation[]> {
    const query = this.consultationRepository.createQueryBuilder('c')
      .leftJoinAndSelect('c.patient', 'patient')
      .leftJoinAndSelect('c.physician', 'physician')
      .leftJoinAndSelect('c.corrections', 'corrections');

    if (patientId) {
      query.andWhere('c.patientId = :patientId', { patientId });
    }
    if (physicianId) {
      query.andWhere('c.physicianId = :physicianId', { physicianId });
    }

    return await query.orderBy('c.createdAt', 'DESC').getMany();
  }

  async findById(id: string): Promise<Consultation> {
    const consultation = await this.consultationRepository.findOne({
      where: { id },
      relations: ['patient', 'physician', 'appointment', 'corrections', 'corrections.correctedBy'],
    });

    if (!consultation) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }

    return consultation;
  }

  /**
   * Direct Update - ONLY permitted while consultation is in DRAFT state.
   */
  async update(id: string, physicianId: string, dto: UpdateConsultationDto): Promise<Consultation> {
    const consultation = await this.findById(id);

    if (consultation.physicianId !== physicianId) {
      throw new ForbiddenException('Only the authoring physician can modify this consultation');
    }

    if (consultation.status !== ConsultationStatus.DRAFT) {
      throw new BadRequestException(
        'Clinical encounter has been finalized and sealed. Direct edits are prohibited to preserve medical integrity. Please submit an append-only correction via POST /consultations/:id/corrections.',
      );
    }

    if (dto.chiefComplaint !== undefined) consultation.chiefComplaint = dto.chiefComplaint;
    if (dto.vitalSigns !== undefined) consultation.vitalSigns = dto.vitalSigns;
    if (dto.primaryDiagnosisDescription !== undefined)
      consultation.primaryDiagnosisDescription = dto.primaryDiagnosisDescription;
    if (dto.primaryDiagnosisCode !== undefined)
      consultation.primaryDiagnosisCode = dto.primaryDiagnosisCode;
    if (dto.treatmentPlan !== undefined) consultation.treatmentPlan = dto.treatmentPlan;

    return await this.consultationRepository.save(consultation);
  }

  /**
   * Sign & Finalize: Seals the clinical encounter, making it immutable to direct updates.
   */
  async finalize(id: string, physicianId: string): Promise<Consultation> {
    const consultation = await this.findById(id);

    if (consultation.physicianId !== physicianId) {
      throw new ForbiddenException('Only the attending physician may sign and finalize this record');
    }

    if (consultation.status === ConsultationStatus.FINALIZED) {
      return consultation;
    }

    consultation.status = ConsultationStatus.FINALIZED;
    consultation.finalizedAt = new Date();

    return await this.consultationRepository.save(consultation);
  }

  /**
   * Safe Record Correction (Append-Only Revision Seam):
   * Preserves historical medical records by recording the previous snapshot into an
   * immutable ledger and marking the active record as AMENDED.
   */
  async submitCorrection(
    id: string,
    physicianId: string,
    dto: CreateCorrectionDto,
  ): Promise<{ consultation: Consultation; correction: ConsultationCorrection }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const consultation = await queryRunner.manager.findOne(Consultation, {
        where: { id },
      });

      if (!consultation) {
        throw new NotFoundException(`Consultation with ID ${id} not found`);
      }

      if (consultation.status === ConsultationStatus.DRAFT) {
        throw new BadRequestException(
          'Consultation is still in DRAFT status. You can update it directly using PUT /consultations/:id without submitting an amendment.',
        );
      }

      // Freeze current snapshot before applying amendment
      const previousSnapshot = { ...consultation };

      const fieldModified =
        dto.fieldModified ||
        (dto.primaryDiagnosisDescription ? 'primaryDiagnosisDescription' : 'treatmentPlan');
      const originalValue = String((consultation as any)[fieldModified] || '');
      const correctedValue =
        dto.correctedValue ||
        String(
          (dto as any)[fieldModified] ||
            dto.primaryDiagnosisDescription ||
            dto.treatmentPlan ||
            '',
        );
      const reason = dto.reason || CorrectionReason.DIAGNOSTIC_REVISION;
      const justificationNotes =
        dto.justificationNotes || dto.amendmentReason || 'Clinical amendment submitted';

      const correction = queryRunner.manager.create(ConsultationCorrection, {
        consultationId: id,
        correctedById: physicianId,
        reason,
        justificationNotes,
        fieldModified,
        originalValue,
        correctedValue,
        previousSnapshot,
      });

      const savedCorrection = await queryRunner.manager.save(correction);

      // Apply amended value and update status to AMENDED
      if (dto.fieldModified && dto.correctedValue) {
        (consultation as any)[dto.fieldModified] = dto.correctedValue;
      }
      if (dto.primaryDiagnosisDescription) consultation.primaryDiagnosisDescription = dto.primaryDiagnosisDescription;
      if (dto.primaryDiagnosisCode) consultation.primaryDiagnosisCode = dto.primaryDiagnosisCode;
      if (dto.treatmentPlan) consultation.treatmentPlan = dto.treatmentPlan;
      if (dto.chiefComplaint) consultation.chiefComplaint = dto.chiefComplaint;
      if (dto.vitalSigns) consultation.vitalSigns = dto.vitalSigns;

      consultation.status = ConsultationStatus.AMENDED;

      const updatedConsultation = await queryRunner.manager.save(consultation);

      await queryRunner.commitTransaction();

      return {
        consultation: updatedConsultation,
        correction: savedCorrection,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}

