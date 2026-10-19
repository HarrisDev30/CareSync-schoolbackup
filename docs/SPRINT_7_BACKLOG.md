# Sprint 7: Clinical Lifecycle Completeness, Patient Intake Modifications & Laboratory Exception Workflows

**Sprint Goal:** Complete all remaining one-sided, broken, or read-only operational loops across outpatient roles to achieve a 100% complete, fully interactive, closed-loop clinical outpatient hospital management system.

**Scope Boundary:** Strict Zero Telemedicine outpatient boundary; Slate anti-glare theme (`#eaedf2`); standard `h-10` interactive controls; tamper-evident WORM HIPAA audit logging.

---

## Sprint 7 Backlog & Ticket Breakdown

### `[FE-801]` Patient Profile & Demographics Editing Modal
- **Role:** Receptionist / Attending Physician / Medical Records Clerk
- **User Story:** As clinic staff, I need to edit and update a patient's demographics, contact numbers, emergency contacts, primary physician, and known drug allergies so that patient records remain accurate and the Clinical Decision Support (CDS) allergy engine protects against newly discovered adverse drug reactions.
- **Acceptance Criteria:**
  - `updatePatient(id, input)` added to `frontend/lib/api.ts` (mapped to backend `PUT /patients/:id` and local state cache).
  - `edit-patient-modal.tsx` built with responsive fields: phone number, email, residential address, emergency contact name/phone, blood type, primary physician, and interactive known allergies tag selector (with presets: Penicillin, Sulfa, NSAIDs, ACE Inhibitors, Beta-Blockers).
  - "Edit Profile" action added in `patients/page.tsx` table and in the banner header of `patient-chart-modal.tsx`.
  - When allergies are updated, subsequent prescriptions in `patient-chart-modal.tsx` immediately trigger CDS contraindication alerts.
  - HIPAA audit stream emits `PATIENT_RECORD_UPDATED`.
- **Status:** COMPLETED (Verified)

---

### `[FE-802]` Longitudinal Vital Signs Triage Recording & Ledger
- **Role:** Triage Nurse / Medical Assistant / Attending Clinician
- **User Story:** As a triage nurse or clinician, I need to record and persist standalone vital signs intake entries into the patient's permanent longitudinal chart so that patient vitals history is tracked over time, reflected in the patient portal, and accessible during physician consults.
- **Acceptance Criteria:**
  - `recordPatientVitals(patientId, input)` created in `frontend/lib/api.ts`.
  - In `patient-chart-modal.tsx` under the Vitals tab, add a dedicated "Record & Save Vital Signs" action that persists entries with timestamp, observer, BP, HR, SpO2, Temp, RR, and pain score.
  - Newly recorded vitals immediately update the patient banner vitals display, the longitudinal trend list, and the Patient Portal My Health Record view.
  - HIPAA audit stream emits `VITAL_SIGNS_RECORDED`.
- **Status:** COMPLETED (Verified)

---

### `[FE-803]` Laboratory Specimen Rejection & Recollection Workflow (`REJECTED`)
- **Role:** Laboratory Technician / Pathologist
- **User Story:** As a laboratory technician, I need to reject compromised, clotted, hemolyzed, or unlabeled specimens with a documented regulatory reason so that the hospital complies with CLIA/CAP quality assurance standards and the ordering physician is immediately prompted for recollection.
- **Acceptance Criteria:**
  - Add `'REJECTED'` to `DiagnosticStatus` in `frontend/types/index.ts`.
  - `rejectDiagnosticSpecimen(orderId, reason, notes)` added to `frontend/lib/api.ts`.
  - `specimen-rejection-modal.tsx` created with standard CLIA rejection reasons:
    - *Hemolysis (Gross Hemolysis Index > 300 mg/dL)*
    - *Specimen Clotted in EDTA Tube*
    - *Quantity Not Sufficient (QNS)*
    - *Unlabeled / Mislabeled Specimen Container*
    - *Improper Tube Type / Anticoagulant*
  - "Reject Specimen" action added to `/labs` order queue for collected specimens.
  - Rejection badge and reason displayed prominently in `/labs`, in-chart diagnostics tab, and patient portal.
  - HIPAA audit stream emits `DIAGNOSTIC_SPECIMEN_REJECTED`.
- **Status:** COMPLETED (Verified)

---

### `[FE-804]` Receptionist Appointment Reschedule & Modification Modal
- **Role:** Outpatient Receptionist / Scheduling Coordinator
- **User Story:** As a receptionist, I need to reschedule appointments to a new date/time slot, reassign examination rooms, or update visit reasons when patients call with scheduling conflicts without having to delete and re-register visits.
- **Acceptance Criteria:**
  - `rescheduleAppointment(appointmentId, input)` created in `frontend/lib/api.ts`.
  - `reschedule-modal.tsx` created in `frontend/app/(dashboard)/appointments/_components/` with date/time picker, room selector, and reason/notes editor.
  - "Reschedule" action button added to appointments table rows.
  - Updated schedule immediately updates the appointments calendar worklist, doctor triage queue, and patient portal visits view.
  - HIPAA audit stream emits `APPOINTMENT_RESCHEDULED`.
- **Status:** COMPLETED (Verified)

---

### `[FE-805]` Bidirectional Prescription Refill Authorization Workflow
- **Role:** Outpatient Patient / Attending Physician
- **User Story:** As a patient in the patient portal, when I request a prescription refill, it must create an actionable pending refill authorization for my attending physician in their clinical chart, allowing them to review, approve, or deny with notes.
- **Acceptance Criteria:**
  - `requestPrescriptionRefill(patientId, medicationId, notes)` and `reviewPrescriptionRefill(refillId, action, notes)` added to `frontend/lib/api.ts`.
  - In `patient-portal/page.tsx`, requesting a refill updates medication status to "Refill Pending Clinical Review".
  - In `patient-chart-modal.tsx` under the Prescriptions tab, render a "Pending Refill Authorizations" banner with "Approve (30-day extension)" and "Deny" actions.
  - On approval, prescription expiration is extended and status remains active; on denial, clinical reason is visible to the patient.
  - HIPAA audit stream emits `PRESCRIPTION_REFILL_REQUESTED` and `PRESCRIPTION_REFILL_APPROVED`/`DENIED`.
- **Status:** COMPLETED (Verified)

---

### `[QA-901]` End-to-End Test Suite Verification & Master Alignment
- **Role:** Lead QA Engineer / Compliance Auditor
- **User Story:** As QA lead, I must ensure all backend unit & integration tests pass (10 test suites, 60 tests) and all Next.js Turbopack static pages compile with 0 errors.
- **Acceptance Criteria:**
  - Full backend test execution (`npm test` in `backend/`): 10 passed test suites, 60 passed tests.
  - Full frontend production build (`npm run build` in `frontend/`): 12/12 static routes compiled with 0 errors.
  - Sprint 7 logs and defense guide updated.
- **Status:** COMPLETED (Verified)

