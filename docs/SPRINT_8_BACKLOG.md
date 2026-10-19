# Sprint 8: Role-Specific Clinical Workstations, Triage Intake & Laboratory Diagnostic Workbench

**Sprint Goal:** Complete all missing role-specific identities and interactive operational loops for the Triage Nurse, Laboratory Technologist, Attending Physician, and Facility Attendant, making every hospital user role 100% distinct, interactive, and complete.

**Scope Boundary:** Strict Zero Telemedicine outpatient boundary; Slate anti-glare theme (`#eaedf2`); standard `h-10` interactive controls; tamper-evident WORM HIPAA audit logging.

---

## Sprint 8 Backlog & Ticket Breakdown

### `[FE-901]` Dedicated Triage Nurse Identity & Rapid Vitals Intake Station (`/triage`)
- **Role:** Triage Nurse / Medical Assistant (`Nurse Chloe Bennett, RN`)
- **User Story:** As an outpatient triage nurse, I need a dedicated terminal and a high-velocity triage intake queue showing all checked-in lobby patients so that I can rapidly assess acuity, record vitals (BP, HR, RR, SpO2, Temp, Pain Score 0–10 NRS), and route them to an assigned examination suite before the doctor consults.
- **Acceptance Criteria:**
  - Add `Nurse Chloe Bennett, RN` (`role: 'TRIAGE_NURSE'`, Department: `Outpatient Triage & Emergency Intake`) to `STAFF_PRESETS` in `frontend/lib/api.ts` and role switcher in `nav-user.tsx`.
  - Add role-gated sidebar navigation for `TRIAGE_NURSE` in `app-sidebar.tsx` linking to `/triage` (Triage Station), `/appointments` (Outpatient Roster), and `/rooms` (Exam Suites).
  - Create `frontend/app/(dashboard)/triage/page.tsx` with:
    - Live Lobby Triage Queue (showing waiting patients checked in by reception).
    - Rapid "Intake Vitals & Route to Suite" modal with interactive sliders and quick presets.
    - Automatic room assignment & appointment status update to `IN_PROGRESS`.
    - HIPAA audit stream emits `TRIAGE_INTAKE_COMPLETED` and `VITAL_SIGNS_RECORDED`.
- **Status:** COMPLETED & VERIFIED

---

### `[FE-902]` Laboratory Accessioning Bench, Tube Type Badging & Panic Call Log (`/labs`)
- **Role:** Medical Technologist / Laboratory User (`Elena Rostova`)
- **User Story:** As a laboratory technologist, I need to see physical specimen tube requirements (Lavender EDTA, Gold SST, Light Blue Citrate), log mandatory telephone read-back calls to physicians when panic values are detected, and trigger 1-click recollection orders when specimens are rejected so that diagnostic testing meets CLIA/CAP quality standards.
- **Acceptance Criteria:**
  - Extend `LabOrder` in `frontend/types/index.ts` with `specimenTube` and `panicCallLog` (`calledTo`, `calledAt`, `readBackConfirmed`, `callerNotes`).
  - Add visual colored specimen tube badges in `/labs` (Lavender EDTA for CBC, Gold SST for Chem/Lipids, Citrate for Coagulation).
  - Add "Log Critical Panic Call to MD" modal on orders with panic/critical values with mandatory verbal read-back confirmation.
  - Add 1-click "Trigger Recollection Requisition" on rejected specimens linking to the original requisition.
  - HIPAA audit stream emits `CRITICAL_PANIC_VALUE_NOTIFIED` and `SPECIMEN_RECOLLECTION_REQUESTED`.
- **Status:** COMPLETED & VERIFIED

---

### `[FE-903]` Physician Daily Clinical Inbasket & Action Center (`/patients`)
- **Role:** Attending Physician (`Dr. Sarah Chen, MD` / `Dr. Marcus Vance, MD`)
- **User Story:** As an attending physician, I need a personalized clinical inbasket showing only my assigned patients in exam rooms, pending SOAP notes, pending prescription refill authorizations, and unreviewed panic lab results in one unified view.
- **Acceptance Criteria:**
  - When logged in as a Physician, the Clinical Workstation surfaces an "Attending Physician Inbasket" alert strip showing:
    1. Active patients waiting in examination rooms for me.
    2. Pending prescription refill requests awaiting my sign-off (`[FE-805]`).
    3. Unreviewed critical lab results requiring my clinical sign-off.
    4. Rejected specimens requiring recollection approval.
  - 1-click quick jump from inbasket directly to the corresponding patient chart modal tab.
- **Status:** COMPLETED & VERIFIED

---

### `[FE-904]` Examination Room Turnover & Sanitation Lifecycle (`/rooms`)
- **Role:** Triage Nurse / Clinic Attendant / Facility Staff
- **User Story:** As clinic staff, after a patient is discharged, I need to toggle examination rooms through a sanitization lifecycle (`OCCUPIED` → `CLEANING_IN_PROGRESS` → `AVAILABLE`) with a logged turnover timestamp and attendant name so that clean suites are verified for incoming patients.
- **Acceptance Criteria:**
  - Add `CLEANING_IN_PROGRESS` room status with amber sanitizing badge.
  - Add 1-click "Mark Sanitizing" and "Certify Room Clean & Ready" quick actions on room cards.
  - Record room turnover completion in local state and HIPAA audit ledger (`ROOM_TURNOVER_COMPLETED`).
- **Status:** COMPLETED & VERIFIED

---

### `[QA-1001]` End-to-End Test Suite Verification & Master Alignment
- **Role:** Lead QA Engineer / Compliance Auditor
- **User Story:** As QA lead, I must ensure all backend unit & integration tests pass (10 test suites, 60 tests) and all Next.js Turbopack static pages compile with 0 errors.
- **Acceptance Criteria:**
  - Full backend test execution (`npm test` in `backend/`): 10 passed test suites, 60 passed tests.
  - Full frontend production build (`npm run build` in `frontend/`): 13/13 static routes compiled with 0 errors.
  - Sprint 8 logs updated and pushed to remote main branch.
- **Status:** COMPLETED & VERIFIED

