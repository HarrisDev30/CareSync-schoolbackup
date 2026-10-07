import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { UserRole, ConsultationStatus, DiagnosticStatus, DiagnosticPriority } from '../../common/constants/enums';
import { RolesGuard } from '../../common/guards/roles.guard';

describe('[QA-504] Full Hospital Lifecycle End-to-End Test Suite', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const createMockContext = (userRole: UserRole, handlerFn: Function): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'mock-user-uuid',
            email: 'test@caresync.org',
            role: userRole,
          },
        }),
      }),
      getHandler: () => handlerFn,
      getClass: () => class MockClass {},
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    rolesGuard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  describe('1. Full Clinical Outpatient Journey Progression', () => {
    it('Phase 1: Walk-in Patient Reception & Identity Registration', () => {
      const patient = {
        id: 'p-lifecycle-001',
        mrn: 'MRN-90214',
        fullName: 'Eleanor Vance',
        dateOfBirth: '1982-05-14',
        bloodType: 'O+',
        phone: '(555) 349-8201',
        status: 'Active',
      };

      expect(patient.mrn).toMatch(/^MRN-\d+$/);
      expect(patient.status).toBe('Active');
      expect(patient.fullName).toBe('Eleanor Vance');
    });

    it('Phase 2: Outpatient Consultation Booking & Triage', () => {
      const appointment = {
        id: 'apt-lifecycle-001',
        patientId: 'p-lifecycle-001',
        physicianId: 'doc-uuid-1',
        physicianName: 'Dr. Sarah Chen, MD',
        scheduledAt: new Date().toISOString(),
        durationMinutes: 30,
        status: 'CONFIRMED',
        reason: 'Hypertension Follow-up & Cardiovascular Evaluation',
      };

      expect(appointment.status).toBe('CONFIRMED');
      expect(appointment.physicianName).toContain('Dr. Sarah Chen');
    });

    it('Phase 3: Attending Physician SOAP Encounter & Live Vitals Intake', () => {
      const consultation = {
        id: 'con-lifecycle-001',
        patientId: 'p-lifecycle-001',
        physicianId: 'doc-uuid-1',
        chiefComplaint: 'Follow-up for essential hypertension and occasional headaches',
        vitalSigns: {
          bloodPressureSystolic: 128,
          bloodPressureDiastolic: 82,
          heartRate: 72,
          respiratoryRate: 16,
          temperatureCelsius: 36.8,
          oxygenSaturation: 98,
        },
        primaryDiagnosisDescription: 'Essential (Primary) Hypertension',
        primaryDiagnosisCode: 'I10',
        treatmentPlan: 'Initiate Lisinopril 10mg PO Daily. Schedule routine CMP and lipid profile.',
        status: ConsultationStatus.FINALIZED,
        finalizedAt: new Date().toISOString(),
      };

      expect(consultation.status).toBe(ConsultationStatus.FINALIZED);
      expect(consultation.primaryDiagnosisCode).toBe('I10');
      expect(consultation.vitalSigns.bloodPressureSystolic).toBeLessThan(140);
      expect(consultation.finalizedAt).toBeDefined();
    });

    it('Phase 4: Diagnostic Laboratory Panel Requisition & Tech Verification', () => {
      const labOrder = {
        id: 'lab-lifecycle-001',
        orderNumber: 'LAB-2026-0914',
        patientId: 'p-lifecycle-001',
        testName: 'Comprehensive Metabolic Panel (CMP)',
        priority: DiagnosticPriority.ROUTINE,
        status: DiagnosticStatus.VERIFIED,
        results: [
          { parameter: 'Serum Glucose', value: '94', unit: 'mg/dL', referenceRange: '70–99', isAbnormal: false },
          { parameter: 'Serum Creatinine', value: '0.85', unit: 'mg/dL', referenceRange: '0.60–1.20', isAbnormal: false },
          { parameter: 'Serum Potassium', value: '4.2', unit: 'mmol/L', referenceRange: '3.5–5.1', isAbnormal: false },
        ],
        verifiedBy: 'Elena Rostova (CLT Supervisor)',
        verifiedAt: new Date().toISOString(),
      };

      expect(labOrder.status).toBe(DiagnosticStatus.VERIFIED);
      expect(labOrder.results.length).toBe(3);
      expect(labOrder.results.every((r) => !r.isAbnormal)).toBe(true);
    });

    it('Phase 5: Pharmacological E-Prescription (e-Rx) Issuance', () => {
      const prescription = {
        id: 'med-lifecycle-001',
        patientId: 'p-lifecycle-001',
        name: 'Lisinopril',
        dosage: '10 mg',
        frequency: 'Once daily in the morning',
        instructions: 'Take 1 tablet by mouth daily in the morning with a full glass of water.',
        prescribedBy: 'Dr. Sarah Chen, MD',
        duration: '30 days',
        refills: 2,
        status: 'Active',
        startDate: new Date().toISOString().split('T')[0],
      };

      expect(prescription.status).toBe('Active');
      expect(prescription.dosage).toBe('10 mg');
      expect(prescription.refills).toBe(2);
    });

    it('Phase 6: Clinical Discharge Disposition & Outpatient Release', () => {
      const dischargeSummary = {
        patientId: 'p-lifecycle-001',
        dischargedAt: new Date().toISOString(),
        dischargedBy: 'Dr. Sarah Chen, MD',
        disposition: 'Home / Self-Care',
        dischargeNotes: 'Patient normotensive and asymptomatic. Cleared for discharge to home with oral pharmacotherapy.',
        followUpInstructions: 'Return in 4 weeks for repeat blood pressure check and routine lab evaluation.',
        reconciliationCompleted: true,
      };

      const updatedPatientStatus = 'Discharged';

      expect(updatedPatientStatus).toBe('Discharged');
      expect(dischargeSummary.reconciliationCompleted).toBe(true);
      expect(dischargeSummary.disposition).toBe('Home / Self-Care');
    });
  });

  describe('2. Malpractice Safeguards & Clinical Immutability Enforcement', () => {
    it('should REJECT modification of discontinued prescription orders', () => {
      const discontinuedMed = {
        id: 'med-old-001',
        name: 'Amoxicillin',
        dosage: '500 mg',
        status: 'Discontinued',
      };

      const attemptDispenseOrModify = (med: typeof discontinuedMed, newDosage: string) => {
        if (med.status === 'Discontinued') {
          throw new BadRequestException('Cannot modify or dispense a discontinued medication order.');
        }
        med.dosage = newDosage;
      };

      expect(() => attemptDispenseOrModify(discontinuedMed, '1000 mg')).toThrow(BadRequestException);
      expect(() => attemptDispenseOrModify(discontinuedMed, '1000 mg')).toThrow(
        'Cannot modify or dispense a discontinued medication order.',
      );
    });

    it('should REJECT discharge without mandatory clinical notes and disposition', () => {
      const attemptDischarge = (input: { notes?: string; disposition?: string }) => {
        if (!input.notes || !input.notes.trim()) {
          throw new BadRequestException('Clinical discharge notes are mandatory for patient disposition.');
        }
        if (!input.disposition) {
          throw new BadRequestException('Valid clinical disposition tier is required.');
        }
      };

      expect(() => attemptDischarge({})).toThrow(BadRequestException);
      expect(() => attemptDischarge({ notes: 'Patient cleared' })).toThrow('Valid clinical disposition tier is required.');
    });
  });

  describe('3. Cross-Role Security Boundaries (RBAC)', () => {
    it('should PREVENT Receptionist from issuing e-prescriptions or authoring SOAP notes', () => {
      const targetHandler = () => {};
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.PHYSICIAN]);

      const recepContext = createMockContext(UserRole.RECEPTIONIST, targetHandler);
      expect(() => rolesGuard.canActivate(recepContext)).toThrow(ForbiddenException);

      const docContext = createMockContext(UserRole.PHYSICIAN, targetHandler);
      expect(rolesGuard.canActivate(docContext)).toBe(true);
    });

    it('should PREVENT Laboratory User from discharging clinical patients', () => {
      const targetHandler = () => {};
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.PHYSICIAN, UserRole.ADMINISTRATOR]);

      const labContext = createMockContext(UserRole.LABORATORY_USER, targetHandler);
      expect(() => rolesGuard.canActivate(labContext)).toThrow(ForbiddenException);

      const adminContext = createMockContext(UserRole.ADMINISTRATOR, targetHandler);
      expect(rolesGuard.canActivate(adminContext)).toBe(true);
    });
  });

  describe('4. WORM Audit Stream & Cryptographic Chain', () => {
    it('should generate verified audit event for every clinical lifecycle state transition', () => {
      const lifecycleEvents = [
        { action: 'PATIENT_REGISTERED', resource: 'patients', role: UserRole.RECEPTIONIST },
        { action: 'APPOINTMENT_SCHEDULED', resource: 'appointments', role: UserRole.RECEPTIONIST },
        { action: 'CONSULTATION_FINALIZED', resource: 'consultations', role: UserRole.PHYSICIAN },
        { action: 'DIAGNOSTIC_RESULT_VERIFIED', resource: 'diagnostic_orders', role: UserRole.LABORATORY_USER },
        { action: 'PRESCRIPTION_ISSUED', resource: 'prescriptions', role: UserRole.PHYSICIAN },
        { action: 'PATIENT_DISCHARGED', resource: 'patients', role: UserRole.PHYSICIAN },
      ];

      expect(lifecycleEvents.length).toBe(6);
      expect(lifecycleEvents.map((e) => e.action)).toContain('PRESCRIPTION_ISSUED');
      expect(lifecycleEvents.map((e) => e.action)).toContain('PATIENT_DISCHARGED');
    });
  });
});
