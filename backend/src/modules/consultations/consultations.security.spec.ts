import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SessionLockGuard } from '../../common/guards/session-lock.guard';
import { RedisService } from '../../common/services/redis.service';
import { UserRole, ConsultationStatus, CorrectionReason } from '../../common/constants/enums';
import { CreateConsultationDto, CreateCorrectionDto } from './dto/consultation.dto';

describe('QA-503: Clinical Encounter Security & Role Boundary Suite', () => {
  let rolesGuard: RolesGuard;
  let consultationsService: Partial<ConsultationsService>;
  let consultationsController: ConsultationsController;

  beforeEach(async () => {
    consultationsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      finalize: jest.fn(),
      submitCorrection: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsultationsController],
      providers: [
        Reflector,
        RolesGuard,
        {
          provide: ConsultationsService,
          useValue: consultationsService,
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(SessionLockGuard)
      .useValue({ canActivate: () => true })
      .compile();

    rolesGuard = module.get<RolesGuard>(RolesGuard);
    consultationsController = module.get<ConsultationsController>(ConsultationsController);
  });

  // Helper to create mock ExecutionContext
  const createMockContext = (role: UserRole, handler: Function): ExecutionContext => {
    return {
      getHandler: () => handler,
      getClass: () => ConsultationsController,
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'mock-user-uuid',
            role,
            email: 'test@caresync.org',
          },
        }),
        getResponse: () => ({}),
        getNext: () => ({}),
      }),
    } as unknown as ExecutionContext;
  };

  describe('1. Role Boundary Security (RBAC)', () => {
    it('should REJECT Receptionist attempting to create physician clinical note (403 Forbidden)', () => {
      const context = createMockContext(UserRole.RECEPTIONIST, consultationsController.create);
      expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should REJECT Receptionist attempting to sign & finalize physician note (403 Forbidden)', () => {
      const context = createMockContext(UserRole.RECEPTIONIST, consultationsController.finalize);
      expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should REJECT Laboratory Technician attempting to finalize physician note (403 Forbidden)', () => {
      const context = createMockContext(UserRole.LABORATORY_USER, consultationsController.finalize);
      expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should ALLOW Attending Physician to sign and finalize clinical note', () => {
      const context = createMockContext(UserRole.PHYSICIAN, consultationsController.finalize);
      expect(rolesGuard.canActivate(context)).toBe(true);
    });

    it('should ALLOW Administrator and Physician to view consultation history, but REJECT Receptionist', () => {
      const adminCtx = createMockContext(UserRole.ADMINISTRATOR, consultationsController.findAll);
      const docCtx = createMockContext(UserRole.PHYSICIAN, consultationsController.findAll);
      const recepCtx = createMockContext(UserRole.RECEPTIONIST, consultationsController.findAll);

      expect(rolesGuard.canActivate(adminCtx)).toBe(true);
      expect(rolesGuard.canActivate(docCtx)).toBe(true);
      expect(() => rolesGuard.canActivate(recepCtx)).toThrow(ForbiddenException);
    });
  });

  describe('2. Patient Vitals Boundary DTO Validation', () => {
    it('should PASS validation for physiological vitals within healthy and clinical ranges', async () => {
      const payload = {
        patientId: 'e4f5a6b7-8901-4345-a789-0123456789ab',
        chiefComplaint: 'Follow-up for essential hypertension',
        primaryDiagnosisDescription: 'Essential Hypertension',
        treatmentPlan: 'Maintain Lisinopril 10mg PO daily',
        vitalSigns: {
          bloodPressureSystolic: 120,
          bloodPressureDiastolic: 80,
          heartRate: 72,
          respiratoryRate: 16,
          temperatureCelsius: 36.8,
          oxygenSaturation: 98,
        },
      };

      const dto = plainToInstance(CreateConsultationDto, payload);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should REJECT vitals when blood pressure is physiologically out of bounds (<40 or >300 mmHg)', async () => {
      const payload = {
        patientId: 'e4f5a6b7-8901-4345-a789-0123456789ab',
        chiefComplaint: 'Triage evaluation',
        primaryDiagnosisDescription: 'Hypertension',
        treatmentPlan: 'Observation',
        vitalSigns: {
          bloodPressureSystolic: 350, // Exceeds Max(300)
          bloodPressureDiastolic: 10,  // Below Min(20)
        },
      };

      const dto = plainToInstance(CreateConsultationDto, payload);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const vitalsError = errors.find((e) => e.property === 'vitalSigns');
      expect(vitalsError).toBeDefined();
      expect(vitalsError?.children?.length).toBeGreaterThan(0);
    });

    it('should REJECT negative or physiologically impossible heart rate and oxygen saturation', async () => {
      const payload = {
        patientId: 'e4f5a6b7-8901-4345-a789-0123456789ab',
        chiefComplaint: 'Chest discomfort',
        primaryDiagnosisDescription: 'Angina pectoris',
        treatmentPlan: 'Cardiac workup',
        vitalSigns: {
          heartRate: -15, // Below Min(20)
          oxygenSaturation: 120, // Above Max(100)
          temperatureCelsius: 12.0, // Below Min(25.0)
        },
      };

      const dto = plainToInstance(CreateConsultationDto, payload);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const vitalsError = errors.find((e) => e.property === 'vitalSigns');
      const innerErrors = vitalsError?.children || [];
      const errorProps = innerErrors.map((e) => e.property);
      expect(errorProps).toContain('heartRate');
      expect(errorProps).toContain('oxygenSaturation');
      expect(errorProps).toContain('temperatureCelsius');
    });
  });

  describe('3. Malpractice Immutability & Append-Only Record Revision', () => {
    it('should enforce append-only revision when consultation is finalized', async () => {
      const mockResult = {
        consultation: {
          id: 'c1111111-1111-1111-1111-111111111111',
          status: ConsultationStatus.AMENDED,
          primaryDiagnosisDescription: 'Secondary Hypertension due to renal artery stenosis',
        },
        correction: {
          id: 'corr-1',
          reason: CorrectionReason.DIAGNOSTIC_REVISION,
          fieldModified: 'primaryDiagnosisDescription',
          originalValue: 'Essential Hypertension',
          correctedValue: 'Secondary Hypertension due to renal artery stenosis',
          justificationNotes: 'Renal angiogram revealed 85% right renal artery stenosis',
        },
      };

      (consultationsService.submitCorrection as jest.Mock).mockResolvedValue(mockResult);

      const dto: CreateCorrectionDto = {
        reason: CorrectionReason.DIAGNOSTIC_REVISION,
        fieldModified: 'primaryDiagnosisDescription',
        correctedValue: 'Secondary Hypertension due to renal artery stenosis',
        justificationNotes: 'Renal angiogram revealed 85% right renal artery stenosis',
      };

      const user = { id: 'doc-uuid-1', role: UserRole.PHYSICIAN } as any;
      const res = await consultationsController.submitCorrection(
        'c1111111-1111-1111-1111-111111111111',
        user,
        dto,
      );

      expect(res.statusCode).toBe(201);
      expect(res.data.consultation.status).toBe(ConsultationStatus.AMENDED);
      expect(res.data.correction.originalValue).toBe('Essential Hypertension');
      expect(consultationsService.submitCorrection).toHaveBeenCalledWith(
        'c1111111-1111-1111-1111-111111111111',
        'doc-uuid-1',
        dto,
      );
    });
  });
});
