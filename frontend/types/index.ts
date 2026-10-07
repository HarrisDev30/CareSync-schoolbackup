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
  | 'CANCELLED';

export interface LabResultItem {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
  isPanicValue?: boolean;
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
  results?: LabResultItem[];
  resultSummary?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  physicianReviewNotes?: string;
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
  notes?: string;
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
