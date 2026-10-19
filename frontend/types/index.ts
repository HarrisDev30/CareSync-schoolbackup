export type Gender = 'Male' | 'Female' | 'Other / Intersex';

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type PatientStatus = 'Active' | 'In Consult' | 'Discharged';

export interface Patient {
  id: string;
  mrn: string;
  fullName: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  age: number;
  bloodType: BloodType;
  phone: string;
  status: PatientStatus;
  primaryPhysician?: string;
  allergies?: string[];
  emergencyContact?: string;
  createdAt: string;
}

export interface CreatePatientInput {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  bloodType: BloodType;
  nationalId?: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  primaryPhysician?: string;
  knownAllergies?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface UpdatePatientInput {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  bloodType?: BloodType;
  phoneNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  primaryPhysician?: string;
  knownAllergies?: string[];
  allergies?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContact?: string;
  status?: PatientStatus;
}

export interface ApiResponse<T> {
  statusCode: number;
  message?: string;
  data: T;
}

export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  physicianId: string;
  physicianName: string;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  reason: string;
  roomNumber?: string;
  notes?: string;
}

export interface CreateAppointmentInput {
  patientId: string;
  physicianId: string;
  scheduledAt: string;
  durationMinutes?: number;
  reason: string;
  roomNumber?: string;
  notes?: string;
}

export interface RescheduleAppointmentInput {
  scheduledAt: string;
  durationMinutes?: number;
  physicianId?: string;
  physicianName?: string;
  roomNumber?: string;
  reason?: string;
  notes?: string;
}

export type DiagnosticPriority = 'ROUTINE' | 'URGENT' | 'STAT';
export type DiagnosticStatus =
  | 'ORDERED'
  | 'PENDING'
  | 'COLLECTED'
  | 'PROCESSING'
  | 'IN_ANALYSIS'
  | 'RESULTED'
  | 'VERIFIED'
  | 'REVIEWED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export interface LabResultItem {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
  isPanicValue?: boolean;
  isPanic?: boolean;
  flag?: string;
  testName?: string;
}

export interface CreateDiagnosticOrderInput {
  patientId: string;
  testName: string;
  testCategory?: string;
  priority?: DiagnosticPriority;
  clinicalIndication?: string;
  physicianId?: string;
  physicianName?: string;
}

export type SpecimenTubeType =
  | 'Lavender EDTA (Hematology / CBC)'
  | 'Gold SST (Clinical Chemistry / Lipids)'
  | 'Light Blue Citrate (Coagulation / PT-INR)'
  | 'Green Heparin (STAT Biomarkers)'
  | 'Sterile Container (Urinalysis / Culture)';

export interface PanicCallLog {
  calledTo: string;
  calledAt: string;
  callerName: string;
  readBackConfirmed: boolean;
  notes?: string;
}

export interface LabOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  mrn: string;
  testName: string;
  testCategory: string;
  priority: DiagnosticPriority;
  status: DiagnosticStatus;
  requestedBy: string;
  requestedAt: string;
  clinicalIndication?: string;
  specimenTube?: SpecimenTubeType;
  results?: LabResultItem[];
  resultSummary?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  physicianReviewNotes?: string;
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  panicCallLog?: PanicCallLog;
  recollectionRequired?: boolean;
  recollectionRequisitionId?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId: string;
  userEmail: string;
  userRole: string;
  ipAddress: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface StaffUser {
  id: string;
  email: string;
  fullName: string;
  role: 'PHYSICIAN' | 'RECEPTIONIST' | 'LABORATORY_USER' | 'ADMINISTRATOR' | 'TRIAGE_NURSE' | 'PATIENT';
  department: string;
  mrn?: string;
  patientId?: string;
}

export interface PatientVital {
  id: string;
  recordedAt: string;
  bloodPressure: string;
  heartRate: number;
  oxygenSaturation: number;
  temperature: number;
  respiratoryRate: number;
  weightKg?: number;
  painScore?: number;
  recordedBy?: string;
  notes?: string;
}

export interface RecordVitalSignsInput {
  patientId: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  oxygenSaturation: number;
  temperature: number;
  respiratoryRate?: number;
  weightKg?: number;
  painScore?: number;
  notes?: string;
  recordedBy?: string;
}

export interface PrescriptionRefillRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  prescribedBy: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface PatientMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
  instructions: string;
  status: 'Active' | 'Discontinued' | 'As Needed';
  refillStatus?: 'PENDING' | 'APPROVED' | 'DENIED';
  refillRequestedAt?: string;
  refillNotes?: string;
}

export interface VitalSigns {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperatureCelsius?: number;
  oxygenSaturation?: number;
  weightKg?: number;
  recordedAt?: string;
  notes?: string;
}

export type ConsultationStatus = 'DRAFT' | 'FINALIZED';

export interface ConsultationCorrection {
  id: string;
  consultationId: string;
  amendedBy: string;
  amendedByName: string;
  amendmentReason: string;
  previousSnapshot: {
    chiefComplaint: string;
    physicalExamination?: string;
    primaryDiagnosisDescription: string;
    primaryDiagnosisCode?: string;
    treatmentPlan: string;
    vitalSigns?: VitalSigns;
  };
  updatedFields: {
    chiefComplaint: string;
    physicalExamination?: string;
    primaryDiagnosisDescription: string;
    primaryDiagnosisCode?: string;
    treatmentPlan: string;
    vitalSigns?: VitalSigns;
  };
  createdAt: string;
}

export interface CreateCorrectionInput {
  consultationId: string;
  amendmentReason: string;
  chiefComplaint: string;
  physicalExamination?: string;
  primaryDiagnosisDescription: string;
  primaryDiagnosisCode?: string;
  treatmentPlan: string;
  vitalSigns?: VitalSigns;
  amendedBy?: string;
  amendedByName?: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  physicianId: string;
  physicianName?: string;
  appointmentId?: string;
  chiefComplaint: string;
  vitalSigns?: VitalSigns;
  physicalExamination?: string;
  primaryDiagnosisDescription: string;
  primaryDiagnosisCode?: string;
  treatmentPlan: string;
  status: ConsultationStatus;
  finalizedAt?: string;
  createdAt: string;
  updatedAt?: string;
  corrections?: ConsultationCorrection[];
}

export interface CreateConsultationInput {
  patientId: string;
  appointmentId?: string;
  physicianId?: string;
  physicianName?: string;
  chiefComplaint: string;
  vitalSigns?: VitalSigns;
  physicalExamination?: string;
  primaryDiagnosisDescription: string;
  primaryDiagnosisCode?: string;
  treatmentPlan: string;
  status?: ConsultationStatus;
}

export interface CreatePrescriptionInput {
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  instructions: string;
  duration?: string;
  refills?: number;
  startDate?: string;
}

export interface DischargeSummary {
  patientId: string;
  dischargedAt: string;
  dischargedBy: string;
  disposition: 'Home / Self-Care' | 'Specialist Referral' | 'Transfer to Tertiary Facility' | 'Home Health Care' | 'Routine Outpatient Release';
  dischargeNotes: string;
  followUpInstructions: string;
  reconciliationCompleted: boolean;
}

export type RoomWing = 'Outpatient Clinic' | 'Cardiology & Specialty' | 'Diagnostic Laboratory';
export type RoomStatus = 'AVAILABLE' | 'IN_USE' | 'SANITIZING' | 'MAINTENANCE' | 'STAT_EMERGENCY';
export type RoomType = 'Examination Suite' | 'Consultation Room' | 'STAT Biomarkers Bench' | 'Procedure Suite' | 'Triage Bay';

export interface HospitalRoom {
  id: string;
  roomNumber: string;
  wing: RoomWing;
  status: RoomStatus;
  roomType: RoomType;
  floor: string;
  bedCount: number;
  bedType?: string;
  assignedDoctor?: string;
  assignedPatient?: string;
  patientId?: string;
  mrn?: string;
  reason?: string;
  elapsedMinutes?: number;
  expectedDurationMinutes?: number;
  equipment?: string[];
  notes?: string;
  updatedAt?: string;
}

export interface CreateRoomInput {
  roomNumber: string;
  wing: RoomWing;
  roomType: RoomType;
  floor?: string;
  bedCount?: number;
  bedType?: string;
  equipment?: string[];
  status?: RoomStatus;
  notes?: string;
}

export interface UpdateRoomInput {
  id: string;
  roomNumber?: string;
  wing?: RoomWing;
  status?: RoomStatus;
  roomType?: RoomType;
  floor?: string;
  bedCount?: number;
  bedType?: string;
  equipment?: string[];
  assignedDoctor?: string;
  assignedPatient?: string;
  patientId?: string;
  mrn?: string;
  reason?: string;
  elapsedMinutes?: number;
  expectedDurationMinutes?: number;
  notes?: string;
}

export type StaffRole = 'PHYSICIAN' | 'RECEPTIONIST' | 'LABORATORY_USER' | 'ADMINISTRATOR';

export interface StaffAccount {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: StaffRole;
  department: string;
  licenseNumber?: string;
  isActive: boolean;
  sessionLocked: boolean;
  lastActiveAt?: string;
  revokedAt?: string;
  revokedReason?: string;
  createdAt: string;
}

export interface CreateStaffAccountInput {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: StaffRole;
  department: string;
  licenseNumber?: string;
}

export interface UpdateStaffAccountInput {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: StaffRole;
  department?: string;
  licenseNumber?: string;
}


