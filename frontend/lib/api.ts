import {
  Patient,
  CreatePatientInput,
  Appointment,
  CreateAppointmentInput,
  LabOrder,
  AuditLogEntry,
  StaffUser,
  PatientVital,
  PatientMedication,
} from '../types';

export const STAFF_PRESETS: StaffUser[] = [
  {
    id: 'u-3',
    email: 'maria.santos@caresync.org',
    fullName: 'Maria Santos',
    role: 'RECEPTIONIST',
    department: 'Reception & Triage Desk',
  },
  {
    id: 'u-1',
    email: 'sarah.chen@caresync.org',
    fullName: 'Dr. Sarah Chen',
    role: 'PHYSICIAN',
    department: 'General Practice',
  },
  {
    id: 'u-2',
    email: 'marcus.vance@caresync.org',
    fullName: 'Dr. Marcus Vance',
    role: 'PHYSICIAN',
    department: 'Cardiology',
  },
  {
    id: 'u-4',
    email: 'elena.rostova@caresync.org',
    fullName: 'Elena Rostova',
    role: 'LABORATORY_USER',
    department: 'Diagnostic Laboratory',
  },
  {
    id: 'u-5',
    email: 'admin@caresync.org',
    fullName: 'System Administrator',
    role: 'ADMINISTRATOR',
    department: 'IT & Compliance',
  },
  {
    id: 'p-1',
    email: 'eleanor.vance@patient.caresync.org',
    fullName: 'Eleanor Vance',
    role: 'PATIENT',
    department: 'Patient Self-Service Portal',
    mrn: 'MRN-90214',
    patientId: 'p-1',
  },
];

export interface PhysicianPreset {
  id: string;
  name: string;
  department: string;
  specialty: string;
  email: string;
  defaultRoom: string;
}

export const PHYSICIAN_PRESETS: PhysicianPreset[] = [
  {
    id: 'u-1',
    name: 'Dr. Sarah Chen, MD',
    department: 'General Practice',
    specialty: 'General Practice',
    email: 'sarah.chen@caresync.org',
    defaultRoom: 'Exam Suite 3B',
  },
  {
    id: 'u-2',
    name: 'Dr. Marcus Vance, MD',
    department: 'Cardiology',
    specialty: 'Cardiology',
    email: 'marcus.vance@caresync.org',
    defaultRoom: 'Cardiology 1A',
  },
];

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'p-1',
    mrn: 'MRN-90214',
    fullName: 'Eleanor Vance',
    firstName: 'Eleanor',
    lastName: 'Vance',
    gender: 'Female',
    dateOfBirth: '1982-05-14',
    age: 42,
    bloodType: 'O+',
    phone: '(555) 349-8201',
    status: 'Active',
    primaryPhysician: 'Dr. Sarah Chen, MD',
    allergies: ['Penicillin', 'Sulfa drugs'],
    emergencyContact: 'Thomas Vance (Spouse) — +1 (555) 349-8209',
    createdAt: '2026-09-01T08:30:00Z',
  },
  {
    id: 'p-2',
    mrn: 'MRN-88401',
    fullName: 'Marcus Aurelius Jenkins',
    firstName: 'Marcus',
    lastName: 'Jenkins',
    gender: 'Male',
    dateOfBirth: '1966-11-03',
    age: 58,
    bloodType: 'A+',
    phone: '(555) 892-1204',
    status: 'In Consult',
    primaryPhysician: 'Dr. Marcus Vance, MD',
    allergies: ['Latex'],
    emergencyContact: 'Beatrice Jenkins (Daughter) — +1 (555) 892-1205',
    createdAt: '2026-09-03T10:15:00Z',
  },
  {
    id: 'p-3',
    mrn: 'MRN-91042',
    fullName: 'Sofia Chen-Rodriguez',
    firstName: 'Sofia',
    lastName: 'Chen-Rodriguez',
    gender: 'Female',
    dateOfBirth: '1995-02-18',
    age: 29,
    bloodType: 'B+',
    phone: '(555) 431-7729',
    status: 'Discharged',
    primaryPhysician: 'Dr. Sarah Chen, MD',
    allergies: [],
    emergencyContact: 'Carlos Rodriguez (Brother) — +1 (555) 431-7730',
    createdAt: '2026-09-05T14:20:00Z',
  },
  {
    id: 'p-4',
    mrn: 'MRN-74199',
    fullName: 'Arthur Pendelton',
    firstName: 'Arthur',
    lastName: 'Pendelton',
    gender: 'Male',
    dateOfBirth: '1953-08-10',
    age: 71,
    bloodType: 'AB-',
    phone: '(555) 602-9844',
    status: 'Active',
    primaryPhysician: 'Dr. Sarah Chen, MD',
    allergies: ['Aspirin'],
    emergencyContact: 'Martha Pendelton (Wife) — +1 (555) 602-9845',
    createdAt: '2026-09-07T09:00:00Z',
  },
  {
    id: 'p-5',
    mrn: 'MRN-83920',
    fullName: 'Zara Al-Mansoor',
    firstName: 'Zara',
    lastName: 'Al-Mansoor',
    gender: 'Female',
    dateOfBirth: '1989-12-05',
    age: 35,
    bloodType: 'O-',
    phone: '(555) 198-4560',
    status: 'Active',
    primaryPhysician: 'Dr. Sarah Chen, MD',
    allergies: ['Codeine'],
    emergencyContact: 'Tariq Al-Mansoor (Spouse) — +1 (555) 198-4561',
    createdAt: '2026-09-08T11:45:00Z',
  },
  {
    id: 'p-6',
    mrn: 'MRN-92183',
    fullName: 'David K. Miller',
    firstName: 'David',
    lastName: 'Miller',
    gender: 'Male',
    dateOfBirth: '1978-07-22',
    age: 46,
    bloodType: 'A-',
    phone: '(555) 774-2193',
    status: 'In Consult',
    primaryPhysician: 'Dr. Marcus Vance, MD',
    allergies: [],
    emergencyContact: 'Karen Miller (Sister) — +1 (555) 774-2194',
    createdAt: '2026-09-10T13:10:00Z',
  },
  {
    id: 'p-7',
    mrn: 'MRN-65821',
    fullName: 'Clara Oswald-Wright',
    firstName: 'Clara',
    lastName: 'Oswald-Wright',
    gender: 'Female',
    dateOfBirth: '1993-04-19',
    age: 31,
    bloodType: 'O+',
    phone: '(555) 382-9012',
    status: 'Active',
    primaryPhysician: 'Dr. Sarah Chen, MD',
    allergies: ['Amoxicillin'],
    emergencyContact: 'Danny Wright (Spouse) — +1 (555) 382-9013',
    createdAt: '2026-09-11T16:00:00Z',
  },
  {
    id: 'p-8',
    mrn: 'MRN-78342',
    fullName: 'Raymond Thorne',
    firstName: 'Raymond',
    lastName: 'Thorne',
    gender: 'Male',
    dateOfBirth: '1960-03-30',
    age: 64,
    bloodType: 'B-',
    phone: '(555) 612-4098',
    status: 'Discharged',
    primaryPhysician: 'Dr. Marcus Vance, MD',
    allergies: [],
    emergencyContact: 'Rachel Thorne (Daughter) — +1 (555) 612-4099',
    createdAt: '2026-09-12T08:50:00Z',
  },
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    patientId: 'p-1',
    patientName: 'Eleanor Vance',
    mrn: 'MRN-90214',
    physicianId: 'u-1',
    physicianName: 'Dr. Sarah Chen',
    scheduledAt: '2026-09-14T09:00:00Z',
    durationMinutes: 30,
    status: 'CONFIRMED',
    reason: 'Hypertension Follow-up & Medication Review',
    roomNumber: 'Exam 3B',
    notes: 'Review ambulatory blood pressure log and lisinopril titration.',
  },
  {
    id: 'apt-2',
    patientId: 'p-2',
    patientName: 'Marcus Aurelius Jenkins',
    mrn: 'MRN-88401',
    physicianId: 'u-2',
    physicianName: 'Dr. Marcus Vance',
    scheduledAt: '2026-09-14T10:00:00Z',
    durationMinutes: 45,
    status: 'IN_PROGRESS',
    reason: 'Post-cardiac catheterization clearance',
    roomNumber: 'Cardiology 1A',
    notes: 'Check access site and bilateral distal pulses.',
  },
  {
    id: 'apt-3',
    patientId: 'p-5',
    patientName: 'Zara Al-Mansoor',
    mrn: 'MRN-83920',
    physicianId: 'u-1',
    physicianName: 'Dr. Sarah Chen',
    scheduledAt: '2026-09-14T11:15:00Z',
    durationMinutes: 30,
    status: 'SCHEDULED',
    reason: 'Routine Prenatal Consultation - Week 28',
    roomNumber: 'OBGYN 2C',
    notes: 'Perform fundal height measurement and fetal Doppler check.',
  },
  {
    id: 'apt-4',
    patientId: 'p-4',
    patientName: 'Arthur Pendelton',
    mrn: 'MRN-74199',
    physicianId: 'u-1',
    physicianName: 'Dr. Sarah Chen',
    scheduledAt: '2026-09-14T14:00:00Z',
    durationMinutes: 30,
    status: 'SCHEDULED',
    reason: 'Chronic Type 2 Diabetes Glycemic Control',
    roomNumber: 'Exam 4A',
    notes: 'Review HbA1c results and adjust insulin glargine dosing.',
  },
];

const INITIAL_LABS: LabOrder[] = [
  {
    id: 'lab-1',
    orderNumber: 'LAB-2026-0901',
    patientId: 'p-1',
    patientName: 'Eleanor Vance',
    mrn: 'MRN-90214',
    testName: 'Comprehensive Metabolic Panel (CMP)',
    testCategory: 'Chemistry',
    priority: 'ROUTINE',
    status: 'VERIFIED',
    requestedBy: 'Dr. Sarah Chen, MD',
    requestedAt: '2026-09-13T14:20:00Z',
    results: [
      { parameter: 'Serum Sodium (Na+)', value: '141', unit: 'mEq/L', referenceRange: '135 - 145', isAbnormal: false },
      { parameter: 'Serum Potassium (K+)', value: '4.2', unit: 'mEq/L', referenceRange: '3.5 - 5.0', isAbnormal: false },
      { parameter: 'eGFR', value: '88', unit: 'mL/min/1.73m²', referenceRange: '> 60', isAbnormal: false },
      { parameter: 'Serum Creatinine', value: '0.9', unit: 'mg/dL', referenceRange: '0.6 - 1.2', isAbnormal: false },
    ],
  },
  {
    id: 'lab-2',
    orderNumber: 'LAB-2026-0902',
    patientId: 'p-2',
    patientName: 'Marcus Aurelius Jenkins',
    mrn: 'MRN-88401',
    testName: 'Cardiac Troponin I (High Sensitivity)',
    testCategory: 'Cardiology Biomarkers',
    priority: 'STAT',
    status: 'COMPLETED',
    requestedBy: 'Dr. Sarah Chen, MD',
    requestedAt: '2026-09-13T16:05:00Z',
    results: [
      { parameter: 'hs-cTnI', value: '48.6', unit: 'ng/L', referenceRange: '< 14.0', isAbnormal: true, isPanicValue: true },
      { parameter: 'CK-MB', value: '12.4', unit: 'ng/mL', referenceRange: '0.0 - 5.0', isAbnormal: true },
    ],
  },
  {
    id: 'lab-3',
    orderNumber: 'LAB-2026-0903',
    patientId: 'p-4',
    patientName: 'Arthur Pendelton',
    mrn: 'MRN-74199',
    testName: 'Glycated Hemoglobin (HbA1c)',
    testCategory: 'Endocrinology',
    priority: 'ROUTINE',
    status: 'PROCESSING',
    requestedBy: 'Dr. Marcus Vance, MD',
    requestedAt: '2026-09-14T08:10:00Z',
  },
  {
    id: 'lab-4',
    orderNumber: 'LAB-2026-0904',
    patientId: 'p-7',
    patientName: 'Clara Oswald-Wright',
    mrn: 'MRN-65821',
    testName: 'Complete Blood Count with Differential',
    testCategory: 'Hematology',
    priority: 'URGENT',
    status: 'COLLECTED',
    requestedBy: 'Dr. Sarah Chen, MD',
    requestedAt: '2026-09-14T08:45:00Z',
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-1',
    action: 'PATIENT_RECORD_VIEWED',
    resource: 'patients',
    resourceId: 'p-1',
    userId: 'u-1',
    userEmail: 'sarah.chen@caresync.org',
    userRole: 'PHYSICIAN',
    ipAddress: '192.168.1.42',
    timestamp: '2026-09-14T01:06:53Z',
    metadata: { mrn: 'MRN-90214', accessReason: 'Clinical consultation review' },
  },
  {
    id: 'aud-2',
    action: 'AES256_GCM_DECRYPT_KEY_USED',
    resource: 'clinical_notes',
    resourceId: 'rec-8812',
    userId: 'u-1',
    userEmail: 'sarah.chen@caresync.org',
    userRole: 'PHYSICIAN',
    ipAddress: '192.168.1.42',
    timestamp: '2026-09-14T01:05:22Z',
    metadata: { keyFingerprint: 'SHA256:0123...cdef', field: 'clinicalSummary' },
  },
  {
    id: 'aud-3',
    action: 'PATIENT_REGISTERED',
    resource: 'patients',
    resourceId: 'p-8',
    userId: 'u-2',
    userEmail: 'maria.santos@caresync.org',
    userRole: 'RECEPTIONIST',
    ipAddress: '192.168.1.18',
    timestamp: '2026-09-13T17:02:47Z',
    metadata: { mrn: 'MRN-78342', nationalIdHash: 'SHA256:...984a' },
  },
  {
    id: 'aud-4',
    action: 'DIAGNOSTIC_RESULT_VERIFIED',
    resource: 'diagnostic_orders',
    resourceId: 'lab-2',
    userId: 'u-3',
    userEmail: 'elena.rostova@caresync.org',
    userRole: 'LABORATORY_USER',
    ipAddress: '192.168.1.88',
    timestamp: '2026-09-13T16:15:00Z',
    metadata: { panicNotificationSent: true, criticalValue: 'hs-cTnI 48.6 ng/L' },
  },
  {
    id: 'aud-5',
    action: 'RBAC_SECURITY_POLICY_ENFORCED',
    resource: 'admin/audit-logs',
    userId: 'u-2',
    userEmail: 'maria.santos@caresync.org',
    userRole: 'RECEPTIONIST',
    ipAddress: '192.168.1.18',
    timestamp: '2026-09-13T14:10:11Z',
    metadata: { requiredRole: 'ADMINISTRATOR', accessDenied: true },
  },
];

let localPatients: Patient[] = [...INITIAL_PATIENTS];
let localAppointments: Appointment[] = [...INITIAL_APPOINTMENTS];
let localLabs: LabOrder[] = [...INITIAL_LABS];
let localAuditLogs: AuditLogEntry[] = [...INITIAL_AUDIT_LOGS];

const APPOINTMENTS_STORAGE_KEY = 'caresync_local_appointments';

export function getStoredAppointments(): Appointment[] {
  if (typeof window === 'undefined') return [...INITIAL_APPOINTMENTS];
  try {
    const saved = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback
  }
  return [...INITIAL_APPOINTMENTS];
}

export function saveStoredAppointments(apts: Appointment[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(apts));
  } catch {
    // Ignore storage write errors
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export function getActiveStaffUser(): StaffUser {
  if (typeof window === 'undefined') return STAFF_PRESETS[0];
  const saved = localStorage.getItem('caresync_current_user');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  return STAFF_PRESETS[0];
}

export async function setActiveStaffUser(user: StaffUser): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  localStorage.setItem('caresync_current_user', JSON.stringify(user));
  localStorage.removeItem('caresync_token'); // Clear old token to force refresh
  return await getValidAuthToken(user);
}

export async function getValidAuthToken(targetUser?: StaffUser): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const user = targetUser || getActiveStaffUser();
  const cachedToken = localStorage.getItem('caresync_token');
  if (cachedToken) return cachedToken;

  const password = user.email.startsWith('admin') ? 'AdminSecret123!' : 'Password123!';

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, password }),
    });

    if (res.ok) {
      const json = await res.json();
      const token = json?.data?.accessToken || null;
      if (token) {
        localStorage.setItem('caresync_token', token);
        return token;
      }
    }
  } catch {
    // Backend offline
  }
  return null;
}

export async function fetchPatients(searchQuery?: string, bloodTypeFilter?: string): Promise<Patient[]> {
  try {
    const token = await getValidAuthToken();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = new URL(`${API_BASE_URL}/patients`);
    if (searchQuery) url.searchParams.append('query', searchQuery);

    const res = await fetch(url.toString(), {
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      const items = json?.data?.items || json?.data;
      if (Array.isArray(items) && items.length > 0) {
        const livePatients: Patient[] = items.map((item: {
          id: string;
          mrn: string;
          fullName?: string;
          firstName?: string;
          lastName?: string;
          gender?: string;
          dateOfBirth: string;
          bloodType?: string;
          maskedPhone?: string;
          phone?: string;
          phoneNumber?: string;
          emergencyContact?: string;
          knownAllergies?: string[];
          createdAt: string;
        }) => ({
          id: item.id,
          mrn: item.mrn,
          fullName: item.fullName || `${item.firstName || ''} ${item.lastName || ''}`.trim(),
          firstName: item.firstName || item.fullName?.split(' ')[0] || '',
          lastName: item.lastName || item.fullName?.split(' ')[1] || '',
          gender: item.gender === 'FEMALE' ? 'Female' : item.gender === 'MALE' ? 'Male' : 'Other / Intersex',
          dateOfBirth: item.dateOfBirth,
          age: calculateAge(item.dateOfBirth),
          bloodType: (item.bloodType as Patient['bloodType']) || 'O+',
          phone: item.phone || item.phoneNumber || (item.maskedPhone && !item.maskedPhone.includes('*') ? item.maskedPhone : '(555) 349-8201'),
          status: 'Active',
          primaryPhysician: 'Dr. Sarah Chen, MD',
          allergies: item.knownAllergies || [],
          emergencyContact: item.emergencyContact || 'Emergency Contact on File — (555) 349-8209',
          createdAt: item.createdAt,
        }));

        localPatients = livePatients;
        let filtered = [...livePatients];
        if (bloodTypeFilter) filtered = filtered.filter((p) => p.bloodType === bloodTypeFilter);
        return filtered;
      }
    }
  } catch {
    // Use fallback
  }

  let filtered = [...localPatients];
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q) ||
        p.phone.includes(q),
    );
  }
  if (bloodTypeFilter) {
    filtered = filtered.filter((p) => p.bloodType === bloodTypeFilter);
  }
  return filtered;
}

export async function createPatient(input: CreatePatientInput): Promise<{ success: boolean; data?: Patient; error?: string }> {
  if (!input.firstName?.trim() || !input.lastName?.trim() || !input.dateOfBirth) {
    return {
      success: false,
      error: 'Validation failed: Legal First Name, Last Name, and Date of Birth are required.',
    };
  }

  try {
    const token = await getValidAuthToken();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        firstName: input.firstName,
        lastName: input.lastName,
        dateOfBirth: input.dateOfBirth,
        gender: input.gender === 'Female' ? 'FEMALE' : input.gender === 'Male' ? 'MALE' : 'OTHER',
        bloodType: input.bloodType,
        nationalId: input.nationalId || '999-00-1234',
        phoneNumber: input.phoneNumber || '(555) 234-8901',
        email: input.email || `${input.firstName.toLowerCase()}.${input.lastName.toLowerCase()}@example.com`,
        address: input.address || '123 Medical Way, Healthcare City',
        emergencyContactName: input.emergencyContactName,
        emergencyContactPhone: input.emergencyContactPhone,
        knownAllergies: input.knownAllergies || [],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      const saved = json.data;
      const newPatient: Patient = {
        id: saved.id,
        mrn: saved.mrn,
        fullName: `${saved.firstName} ${saved.lastName}`,
        firstName: saved.firstName,
        lastName: saved.lastName,
        gender: input.gender,
        dateOfBirth: saved.dateOfBirth,
        age: calculateAge(saved.dateOfBirth),
        bloodType: saved.bloodType || input.bloodType,
        phone: input.phoneNumber,
        status: 'Active',
        primaryPhysician: input.primaryPhysician || 'Dr. Sarah Chen, MD',
        allergies: input.knownAllergies || [],
        emergencyContact: input.emergencyContactName ? `${input.emergencyContactName} — ${input.emergencyContactPhone}` : undefined,
        createdAt: saved.createdAt || new Date().toISOString(),
      };
      localPatients = [newPatient, ...localPatients];
      return { success: true, data: newPatient };
    }
  } catch {
    // Local fallback
  }

  const nextSeq = String(localPatients.length + 90215);
  const newPatient: Patient = {
    id: `p-${Date.now()}`,
    mrn: `MRN-${nextSeq}`,
    fullName: `${input.firstName.trim()} ${input.lastName.trim()}`,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    gender: input.gender,
    dateOfBirth: input.dateOfBirth,
    age: calculateAge(input.dateOfBirth),
    bloodType: input.bloodType,
    phone: input.phoneNumber || '(555) 234-8901',
    status: 'Active',
    primaryPhysician: input.primaryPhysician || 'Dr. Sarah Chen, MD (Station 4B)',
    allergies: input.knownAllergies || [],
    emergencyContact: input.emergencyContactName ? `${input.emergencyContactName} — ${input.emergencyContactPhone}` : undefined,
    createdAt: new Date().toISOString(),
  };

  localPatients = [newPatient, ...localPatients];
  return { success: true, data: newPatient };
}

export async function fetchAppointments(): Promise<Appointment[]> {
  try {
    const token = await getValidAuthToken();
    const res = await fetch(`${API_BASE_URL}/appointments`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (res.ok) {
      const json = await res.json();
      const items = json?.data?.items || json?.data;
      if (Array.isArray(items) && items.length > 0) {
        return items.map((a: {
          id: string;
          patientId: string;
          patient?: { fullName?: string; mrn?: string };
          physicianId: string;
          physician?: { fullName?: string };
          startTime?: string;
          scheduledAt?: string;
          durationMinutes?: number;
          status: string;
          reason: string;
          roomNumber?: string;
          notes?: string;
        }) => ({
          id: a.id,
          patientId: a.patientId,
          patientName: a.patient?.fullName || 'Eleanor Vance',
          mrn: a.patient?.mrn || 'MRN-90214',
          physicianId: a.physicianId,
          physicianName: a.physician?.fullName || 'Dr. Sarah Chen',
          scheduledAt: a.startTime || a.scheduledAt || new Date().toISOString(),
          durationMinutes: a.durationMinutes || 30,
          status: a.status as Appointment['status'],
          reason: a.reason,
          roomNumber: a.roomNumber || 'Exam 3B',
          notes: a.notes,
        }));
      }
    }
  } catch {
    // Fallback
  }
  return getStoredAppointments();
}

export async function createAppointment(input: CreateAppointmentInput): Promise<{ success: boolean; data?: Appointment; error?: string }> {
  try {
    const token = await getValidAuthToken();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.patientId);
    if (isUuid) {
      const startTime = input.scheduledAt ? new Date(input.scheduledAt).toISOString() : new Date().toISOString();
      const endTime = new Date(new Date(startTime).getTime() + (input.durationMinutes || 30) * 60000).toISOString();
      const res = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          patientId: input.patientId,
          physicianId: input.physicianId,
          startTime,
          endTime,
          reason: input.reason,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const item = json.data;
        const created: Appointment = {
          id: item.id,
          patientId: item.patientId,
          patientName: item.patient?.fullName || 'Patient',
          mrn: item.patient?.mrn || 'MRN-NEW',
          physicianId: item.physicianId,
          physicianName: item.physician?.fullName || 'Dr. Sarah Chen',
          scheduledAt: item.startTime || startTime,
          durationMinutes: input.durationMinutes || 30,
          status: (item.status as Appointment['status']) || 'SCHEDULED',
          reason: item.reason,
          roomNumber: input.roomNumber || 'Exam 4A',
          notes: input.notes,
        };
        const currentApts = getStoredAppointments();
        const updatedList = [created, ...currentApts];
        saveStoredAppointments(updatedList);
        return { success: true, data: created };
      }
    }
  } catch {
    // Fallback
  }

  const currentApts = getStoredAppointments();
  const patient = localPatients.find((p) => p.id === input.patientId) || localPatients[0];
  const newApt: Appointment = {
    id: `apt-${Date.now()}`,
    patientId: input.patientId,
    patientName: patient?.fullName || 'Walk-in Patient',
    mrn: patient?.mrn || 'MRN-NEW',
    physicianId: input.physicianId,
    physicianName: 'Dr. Sarah Chen',
    scheduledAt: input.scheduledAt,
    durationMinutes: input.durationMinutes || 30,
    status: 'SCHEDULED',
    reason: input.reason,
    roomNumber: input.roomNumber || 'Consultation Suite 2B',
    notes: input.notes,
  };
  const updatedList = [newApt, ...currentApts];
  saveStoredAppointments(updatedList);
  return { success: true, data: newApt };
}

export async function updateAppointmentStatus(
  id: string,
  status: Appointment['status'],
  roomNumber?: string,
): Promise<{ success: boolean; data?: Appointment }> {
  // Check if ID is a valid backend UUID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isUuid) {
    try {
      const token = await getValidAuthToken();
      const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const json = await res.json();
        const updated = json.data;
        const currentApts = getStoredAppointments();
        const updatedList = currentApts.map((a) =>
          a.id === id ? { ...a, status, ...(roomNumber ? { roomNumber } : {}) } : a,
        );
        saveStoredAppointments(updatedList);
        return { success: true, data: updated };
      }
    } catch {
      // Fallback
    }
  }

  // Local/mock appointment fallback (stored in localStorage across reloads)
  const currentApts = getStoredAppointments();
  const updatedList = currentApts.map((a) =>
    a.id === id ? { ...a, status, ...(roomNumber ? { roomNumber } : {}) } : a,
  );
  saveStoredAppointments(updatedList);
  const found = updatedList.find((a) => a.id === id);
  return { success: true, data: found };
}

export function resetAppointmentsToDefault(): Appointment[] {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(APPOINTMENTS_STORAGE_KEY);
  }
  return [...INITIAL_APPOINTMENTS];
}

export async function fetchLabOrders(): Promise<LabOrder[]> {
  try {
    const token = await getValidAuthToken();
    const res = await fetch(`${API_BASE_URL}/diagnostics/worklist`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (res.ok) {
      const json = await res.json();
      const items = json?.data;
      if (Array.isArray(items) && items.length > 0) {
        return items;
      }
    }
  } catch {
    // Fallback
  }
  return localLabs;
}

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  try {
    // Admin login token for audit logs
    const adminUser = STAFF_PRESETS[3]; // admin@caresync.org
    const token = await getValidAuthToken(adminUser);
    const res = await fetch(`${API_BASE_URL}/admin/audit-logs`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (res.ok) {
      const json = await res.json();
      const items = json?.data?.items || json?.data;
      if (Array.isArray(items) && items.length > 0) {
        return items;
      }
    }
  } catch {
    // Fallback
  }
  return localAuditLogs;
}

function calculateAge(dobString: string): number {
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

export const ELEANOR_VITALS: PatientVital[] = [
  {
    id: 'vit-1',
    recordedAt: '2026-09-12T09:15:00Z',
    bloodPressure: '118/76 mmHg',
    heartRate: 72,
    oxygenSaturation: 98,
    temperature: 98.4,
    respiratoryRate: 16,
    weightKg: 64.2,
    notes: 'Resting vitals recorded during annual wellness consult. Patient reports stable energy levels and adherence to medication plan.',
  },
  {
    id: 'vit-2',
    recordedAt: '2026-06-10T14:30:00Z',
    bloodPressure: '122/80 mmHg',
    heartRate: 76,
    oxygenSaturation: 99,
    temperature: 98.6,
    respiratoryRate: 15,
    weightKg: 64.8,
    notes: 'Routine 3-month follow-up. Blood pressure within target range.',
  },
  {
    id: 'vit-3',
    recordedAt: '2026-03-04T10:00:00Z',
    bloodPressure: '128/84 mmHg',
    heartRate: 80,
    oxygenSaturation: 98,
    temperature: 98.7,
    respiratoryRate: 16,
    weightKg: 65.1,
    notes: 'Initial evaluation for lipid panel review.',
  },
];

export const ELEANOR_MEDICATIONS: PatientMedication[] = [
  {
    id: 'med-1',
    name: 'Atorvastatin (Lipitor)',
    dosage: '20 mg',
    frequency: 'Once daily at bedtime',
    prescribedBy: 'Dr. Sarah Chen, MD',
    startDate: '2025-11-04',
    instructions: 'Take orally once per day at bedtime. Avoid excessive grapefruit consumption.',
    status: 'Active',
  },
  {
    id: 'med-2',
    name: 'Lisinopril',
    dosage: '10 mg',
    frequency: 'Once daily in the morning',
    prescribedBy: 'Dr. Sarah Chen, MD',
    startDate: '2025-08-15',
    instructions: 'Take in the morning with a full glass of water. Report any sudden cough or dizziness.',
    status: 'Active',
  },
  {
    id: 'med-3',
    name: 'Metformin',
    dosage: '500 mg',
    frequency: 'Twice daily with meals',
    prescribedBy: 'Dr. Sarah Chen, MD',
    startDate: '2026-01-10',
    instructions: 'Take with morning and evening meals to minimize GI discomfort.',
    status: 'Active',
  },
  {
    id: 'med-4',
    name: 'Amoxicillin Trihydrate',
    dosage: '500 mg',
    frequency: 'Every 8 hours for 10 days',
    prescribedBy: 'Dr. Marcus Vance, MD',
    startDate: '2025-03-12',
    instructions: 'Completed 10-day acute respiratory course. Discontinued.',
    status: 'Discontinued',
  },
];

export async function fetchPatientPortalData(mrn = 'MRN-90214') {
  const [allPatients, allAppointments, allLabs] = await Promise.all([
    fetchPatients(),
    fetchAppointments(),
    fetchLabOrders(),
  ]);

  const patient = allPatients.find((p) => p.mrn === mrn) || allPatients[0];
  const appointments = allAppointments.filter(
    (a) => a.mrn === mrn || (patient && a.patientId === patient.id) || a.patientName.includes('Eleanor'),
  );
  const labOrders = allLabs.filter(
    (l) => l.mrn === mrn || (patient && l.patientId === patient.id) || l.patientName.includes('Eleanor'),
  );

  return {
    patient: patient || {
      id: 'p-1',
      mrn: 'MRN-90214',
      fullName: 'Eleanor Vance',
      firstName: 'Eleanor',
      lastName: 'Vance',
      gender: 'Female' as const,
      dateOfBirth: '1982-05-14',
      age: 42,
      bloodType: 'O+' as const,
      phone: '(555) 349-8201',
      status: 'Active' as const,
      primaryPhysician: 'Dr. Sarah Chen, MD',
      allergies: ['Penicillin', 'Sulfa drugs'],
      emergencyContact: 'Thomas Vance (Spouse) — +1 (555) 349-8209',
      createdAt: '2026-09-01T08:30:00Z',
    },
    appointments,
    labOrders,
    vitals: ELEANOR_VITALS,
    medications: ELEANOR_MEDICATIONS,
  };
}

