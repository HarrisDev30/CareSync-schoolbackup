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
export type DiagnosticStatus = 'PENDING' | 'COLLECTED' | 'PROCESSING' | 'VERIFIED' | 'COMPLETED';

export interface LabResultItem {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
  isPanicValue?: boolean;
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
  results?: LabResultItem[];
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

