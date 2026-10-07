import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { Patient } from '../patients/entities/patient.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Consultation } from '../consultations/entities/consultation.entity';
import { DiagnosticOrder } from '../diagnostics/entities/diagnostic-order.entity';
import { DiagnosticResult } from '../diagnostics/entities/diagnostic-result.entity';
import { User } from '../users/entities/user.entity';
import {
  AppointmentStatus,
  ConsultationStatus,
  DiagnosticPriority,
  DiagnosticStatus,
  UserRole,
} from '../../common/constants/enums';

describe('AnalyticsService (Unit Tests)', () => {
  let service: AnalyticsService;

  const mockPatientRepo = {
    count: jest.fn(),
  };

  const mockAppointmentRepo = {
    count: jest.fn(),
  };

  const mockConsultationRepo = {
    count: jest.fn(),
    find: jest.fn(),
  };

  const mockDiagnosticOrderRepo = {
    find: jest.fn(),
  };

  const mockDiagnosticResultRepo = {
    count: jest.fn(),
  };

  const mockUserRepo = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(Patient),
          useValue: mockPatientRepo,
        },
        {
          provide: getRepositoryToken(Appointment),
          useValue: mockAppointmentRepo,
        },
        {
          provide: getRepositoryToken(Consultation),
          useValue: mockConsultationRepo,
        },
        {
          provide: getRepositoryToken(DiagnosticOrder),
          useValue: mockDiagnosticOrderRepo,
        },
        {
          provide: getRepositoryToken(DiagnosticResult),
          useValue: mockDiagnosticResultRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    jest.clearAllMocks();
  });

  describe('getCensus()', () => {
    it('should aggregate 11 hospital rooms into 3 wings with accurate occupancy rates', async () => {
      const census = await service.getCensus();

      expect(census.totalRooms).toBe(11);
      expect(census.inUseCount).toBe(6);
      expect(census.availableCount).toBe(3);
      expect(census.sanitizingCount).toBe(1);
      expect(census.statEmergencyCount).toBe(1);
      expect(census.occupancyRatePercent).toBeGreaterThan(0);
      expect(census.wings.length).toBe(3);

      const outpatientWing = census.wings.find((w) => w.name === 'Outpatient Clinic');
      expect(outpatientWing).toBeDefined();
      expect(outpatientWing?.total).toBe(4);
    });
  });

  describe('getMetrics()', () => {
    it('should calculate clinical throughput and average consultation duration', async () => {
      mockPatientRepo.count.mockResolvedValueOnce(5).mockResolvedValueOnce(20);
      mockAppointmentRepo.count.mockResolvedValueOnce(3).mockResolvedValueOnce(2);
      mockConsultationRepo.count.mockResolvedValueOnce(4);
      mockDiagnosticResultRepo.count.mockResolvedValueOnce(1);

      const baseTime = new Date('2026-10-07T08:00:00Z');
      const finalizedTime = new Date('2026-10-07T08:25:00Z'); // 25 minutes duration
      mockConsultationRepo.find.mockResolvedValueOnce([
        {
          id: 'c-1',
          createdAt: baseTime,
          finalizedAt: finalizedTime,
          updatedAt: finalizedTime,
        },
      ]);

      const metrics = await service.getMetrics();

      expect(metrics.todayPatientIntake).toBeGreaterThanOrEqual(5);
      expect(metrics.totalRegisteredPatients).toBeGreaterThanOrEqual(8);
      expect(metrics.activeWaitingQueue).toBe(3);
      expect(metrics.averageConsultationDurationMinutes).toBe(25);
    });
  });

  describe('getDiagnosticTat()', () => {
    it('should calculate overall mean TAT and categorize volume', async () => {
      const orderCreatedAt = new Date('2026-10-07T09:00:00Z');
      const resultVerifiedAt = new Date('2026-10-07T09:20:00Z'); // 20 min TAT

      mockDiagnosticOrderRepo.find.mockResolvedValueOnce([
        {
          id: 'do-1',
          testName: 'Cardiac High-Sensitivity Troponin I',
          priority: DiagnosticPriority.STAT,
          createdAt: orderCreatedAt,
          result: {
            verifiedAt: resultVerifiedAt,
            updatedAt: resultVerifiedAt,
          },
        },
        {
          id: 'do-2',
          testName: 'Complete Blood Count (CBC) with Diff',
          priority: DiagnosticPriority.ROUTINE,
          createdAt: orderCreatedAt,
          result: {
            verifiedAt: new Date('2026-10-07T09:40:00Z'), // 40 min TAT
            updatedAt: new Date('2026-10-07T09:40:00Z'),
          },
        },
      ]);

      const tat = await service.getDiagnosticTat();

      expect(tat.overallMeanTatMinutes).toBe(30);
      expect(tat.statEmergencyMeanTatMinutes).toBe(20);
      expect(tat.routineMeanTatMinutes).toBe(40);
      expect(tat.targetComplianceRatePercent).toBe(100);
      expect(tat.volumeByCategory['Cardiac Biomarkers']).toBeGreaterThanOrEqual(1);
      expect(tat.volumeByCategory['Hematology']).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getDoctorWorkload()', () => {
    it('should aggregate doctor consultations and durations', async () => {
      mockUserRepo.find.mockResolvedValueOnce([
        {
          id: 'u-1',
          fullName: 'Dr. Sarah Chen, MD',
          department: 'Outpatient Clinic',
          role: UserRole.PHYSICIAN,
        },
      ]);

      mockConsultationRepo.count
        .mockResolvedValueOnce(10) // finalized
        .mockResolvedValueOnce(2); // active draft

      mockConsultationRepo.find.mockResolvedValueOnce([
        {
          createdAt: new Date('2026-10-07T08:00:00Z'),
          finalizedAt: new Date('2026-10-07T08:20:00Z'),
          updatedAt: new Date('2026-10-07T08:20:00Z'),
        },
      ]);

      const workload = await service.getDoctorWorkload();

      expect(workload.length).toBe(1);
      expect(workload[0].physicianName).toBe('Dr. Sarah Chen, MD');
      expect(workload[0].completedConsultations).toBe(10);
      expect(workload[0].activeConsultations).toBe(2);
      expect(workload[0].averageDurationMinutes).toBe(20);
    });
  });
});

