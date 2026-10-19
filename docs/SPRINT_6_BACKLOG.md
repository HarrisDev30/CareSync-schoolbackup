# 📋 CareSync — Sprint 6 Backlog & Trello Specification

* **Sprint Cycle:** Sprint 6 (Closed-Loop Clinical Workflows, Patient Self-Service & Facility Turnover Automation)
* **Team:** Group 2 (CareSync Development Team)
* **Status:** 🚧 **IN PROGRESS (5/6 in Done — [FE-701], [FE-702], [BE-601], [FE-703], [FE-704] Delivered)**
* **Target Throughput:** $100\%$ operational completion across all user roles
* **Core Principle:** Complete End-to-End User Story Parity (Zero Dead Ends, Zero Broken Loops)

---

## 🎯 1. Sprint 6 Goal & Epic

### `[SPRINT-6] Epic: Closed-Loop Clinical Workflows, Patient Self-Service & Facility Turnover Automation`
* **Column:** `🚧 In Progress`
* **Labels:** `Sprint-6` (Teal), `Epic` (Blue)
* **Sprint Goal Statement:**  
  *"Transform CareSync into a fully closed-loop operational hospital system by eliminating every one-sided or read-only workflow: enable patient self-service appointment booking & cancellation in `/patient-portal`, integrate direct diagnostic lab ordering inside the Doctor's Patient Chart (`patient-chart-modal.tsx`), automate hospital suite turnover sanitization upon patient discharge, add staff profile editing in `/users`, and deliver certified diagnostic laboratory report exports."*

---

## 📌 2. Trello Board Column Architecture

```
[ 📋 Product Backlog ] ──> [ ⏳ Sprint 6: To Do ] ──> [ 🚧 In Progress ] ──> [ 🔍 QA / Review ] ──> [ ✅ Done ]
```

> **Zero-Stale-Card Rule:** Every single ticket below has an **assigned member avatar**, a **color label**, a **checklist with $\ge 3$ acceptance items**, and **activity comments**.

---

## 📝 3. Sprint 6 Ticket Registry (Ready for Trello Copy & Paste)

### 1. 🎨 Frontend Specialist (Assignee: `@Edson Sode` / `@Harris Asani`)

#### Card Title: `[FE-701] Patient Portal Appointment Booking, Rescheduling & Real Check-In Suite`
* **Column:** `✅ Done`
* **Member:** `@Edson Sode` (or `@Harris Asani`)
* **Labels:** `Frontend` (Orange), `Sprint-6` (Teal), `Patient-Portal` (Green)
* **User Story:**  
  *“As an outpatient clinic patient viewing my portal, I want to book an in-person follow-up appointment with my doctor, confirm my arrival pre-check-in, or cancel a visit from my self-service portal, so that my care schedule is managed directly without front-desk phone delays.”*
* **Checklist (Acceptance Criteria):**
  - [x] Add **"+ Request Outpatient Appointment"** button on `/patient-portal?tab=appointments` opening the `BookAppointmentModal`
  - [x] Support selecting Department Wing (*Outpatient Clinic*, *Cardiology & Specialty*, *Diagnostic Laboratory*), Attending Physician (`PHYSICIAN_PRESETS`), appointment date/time slot, and clinical visit reason (chief complaint)
  - [x] Connect submission to `createAppointment()` in `frontend/lib/api.ts` with instant persistence to database/storage
  - [x] Ensure booked appointments immediately reflect in the Patient Portal list with status `SCHEDULED` and simultaneously appear on Receptionist Admissions Desk (`/`) and Calendar (`/appointments`)
  - [x] Upgrade **"Confirm Check-In"** button to update appointment status to `CONFIRMED` via `updateAppointmentStatus()` with live timestamp and visual badge change
  - [x] Add **"Cancel Appointment"** action on upcoming visits with cancellation reason prompt, transitioning status to `CANCELLED` and recording `APPOINTMENT_CANCELLED_BY_PATIENT` in the HIPAA Audit Log
* **Sample Activity Comment:**  
  *"Implemented bidirectional appointment booking, real arrival check-in, and cancellation tracking in the Patient Portal."*

---

#### Card Title: `[FE-702] Physician Direct Diagnostic Lab Ordering Tab inside Patient Chart`
* **Column:** `✅ Done`
* **Member:** `@Edson Sode`
* **Labels:** `Frontend` (Orange), `Sprint-6` (Teal), `Clinical` (Blue)
* **User Story:**  
  *“As an attending physician examining a patient in consultation, I want to order STAT or Routine diagnostic lab panels directly within the patient chart modal, so that the requisition dispatches immediately to the Laboratory queue without switching roles or screens.”*
* **Checklist (Acceptance Criteria):**
  - [x] Add a dedicated **"Diagnostics"** tab trigger inside `patient-chart-modal.tsx` with live order count badge
  - [x] Provide high-frequency outpatient test chips: *Comprehensive Metabolic Panel (CMP-14), High-Sensitivity Troponin I (hs-cTnI), Lipid Panel, Glycated Hemoglobin (HbA1c), Complete Blood Count with Diff (CBC)*
  - [x] Allow priority toggle (`ROUTINE` vs `STAT Urgent`) and clinical indication / notes field
  - [x] Connect order submission to `createDiagnosticOrder()` in `frontend/lib/api.ts` with patient ID, MRN, and physician credentials pre-bound
  - [x] Display active specimen status card and ensure the order immediately appears in the Laboratory Technician's worklist (`/labs`)
  - [x] Record `DIAGNOSTIC_ORDER_PLACED` in the HIPAA Audit Log
* **Sample Activity Comment:**  
  *"Connected in-chart lab requisition drawer so physicians can dispatch STAT diagnostic orders directly from the consultation workstation."*

---

### 2. 💾 Backend Engineer (Assignee: `@Harris Asani` — YOU)

#### Card Title: `[BE-601] Clinical Discharge Suite-Turnover & Sanitization Automation`
* **Column:** `✅ Done`
* **Member:** `@Harris Asani`
* **Labels:** `Backend` (Blue), `Sprint-6` (Teal), `Facility` (Purple)
* **User Story:**  
  *“As a hospital operations manager, when a physician authorizes a patient discharge, I want the system to automatically transition their occupied examination room to `SANITIZING` status with a turnover countdown, so environmental turnover is immediate and room capacity is accurately reflected.”*
* **Checklist (Acceptance Criteria):**
  - [x] Enhance `dischargePatient()` in `frontend/lib/api.ts` and `handleDischargePatient` in `patient-chart-modal.tsx` to automatically query the patient's assigned room from `getStoredHospitalRooms()`
  - [x] When an occupied room is matched, automatically transition room status from `IN_USE` / `STAT_EMERGENCY` to `SANITIZING`, detach occupant data, and set `elapsedMinutes: 1` with `expectedDurationMinutes: 10`
  - [x] In `/rooms`, show active sanitization turnover state with countdown timer and one-click "Mark Ready" button for environmental cleaning staff
  - [x] Record `FACILITY_ROOM_TURNOVER_INITIATED` in the HIPAA Audit Log
* **Sample Activity Comment:**  
  *"Automated hospital room turnover synchronization upon physician discharge sign-off."*

---

### 3. 🎨 Frontend Specialist (Assignee: `@Edson Sode` / `@Harris Asani`)

#### Card Title: `[FE-703] Administrator Staff Account Profile Editing Modal (/users)`
* **Column:** `✅ Done`
* **Member:** `@Edson Sode`
* **Labels:** `Frontend` (Orange), `Sprint-6` (Teal), `RBAC` (Purple)
* **User Story:**  
  *“As a Hospital Security Administrator, I want to edit a staff member's department assignment, clinical license number, or contact details, so staff records reflect clinical reassignments without recreating accounts.”*
* **Checklist (Acceptance Criteria):**
  - [x] Add an **"Edit"** action button on each staff row in `/users` opening `EditStaffModal`
  - [x] Allow editing `firstName`, `lastName`, `department` (with department presets based on role), and `licenseNumber`
  - [x] Connect to `updateStaffAccount()` calling backend `PUT /api/v1/admin/users/:id` with resilient local storage fallback
  - [x] Record `STAFF_ACCOUNT_MODIFIED` in the HIPAA Audit Log
* **Sample Activity Comment:**  
  *"Added staff account profile editing modal in /users for department transfers and credential updates."*

---

#### Card Title: `[FE-704] Certified Diagnostic Laboratory Report PDF Export & Pathologist Sign-Off`
* **Column:** `✅ Done`
* **Member:** `@Edson Sode` / `@Harris Asani`
* **Labels:** `Frontend` (Orange), `Sprint-6` (Teal), `Diagnostics` (Cyan)
* **User Story:**  
  *“As a laboratory technologist or physician, when diagnostic results are verified, I want to export an official certified laboratory report in print-ready PDF format with hospital letterhead, reference ranges, and pathologist signature.”*
* **Checklist (Acceptance Criteria):**
  - [x] Build `DiagnosticReportExportModal` for verified lab orders in `/labs` and `/patient-portal?tab=labs`
  - [x] Render official hospital banner, requisition barcode/accession number, specimen collection time, verifying technologist signature block, and tabular parameters with abnormal/panic highlights
  - [x] Provide 1-click browser print / PDF download matching clinical laboratory standards
* **Sample Activity Comment:**  
  *"Built certified Diagnostic Laboratory Report export dialog with letterhead and reference range table."*

---

### 4. 🔍 QA & DevOps Leads (Assignee: `@Cherry Jane Cahimtong` & `@Luziel Artiaga`)

#### Card Title: `[QA-801] Closed-Loop Integration Test Suite & Master Documentation Alignment`
* **Column:** `⏳ To Do`
* **Member:** `@Cherry Jane Cahimtong` & `@Luziel Artiaga`
* **Labels:** `QA` (Green), `DevOps` (Blue), `Sprint-6` (Teal)
* **User Story:**  
  *“As the QA and DevOps leads, I want automated verification of appointment booking, diagnostic dispatch, and room turnover, and alignment of all defense documentation with 10 passing test suites.”*
* **Checklist (Acceptance Criteria):**
  - [ ] Verify unit & integration test coverage for patient appointment booking, cancellation, and room turnover
  - [ ] Update `docs/PROJECT_DEFENSE_MASTER_DECK.md` and `docs/DEVOPS_DEFENSE_GUIDE.md` to reflect the accurate **60/60 passing tests across 10 suites**
  - [ ] Create `docs/SPRINT_6_LOGS.md` upon completion of all Sprint 6 cards
* **Sample Activity Comment:**  
  *"Updated defense deck to 60/60 tests (10 suites) and verified zero regressions across all new closed-loop workflows."*

---

## 📊 4. 6-Sprint Master Roadmap Progression

| Sprint | Epic / Focus | Core User Stories & Deliverables | Status |
| :---: | :--- | :--- | :---: |
| **Sprint 1** | Foundation, RBAC & Core Registry | Centralized Patient Records (`/patients`), Argon2id + JWT Auth, AES-256-GCM Encryption, 15m Session Lock | ✅ **Done** |
| **Sprint 2** | Consultation Scheduling & LIS Diagnostics | Follow-up Scheduling (`/appointments`), Consultation Documentation (`SOAP` & AHA Vitals), Diagnostic Result Management (`/labs`) | ✅ **Done** |
| **Sprint 3** | Clinical Closure & HIPAA Audit | E-Prescriptions, Discharge Summary, Immutable Audit Trail (`/audit-logs`), 1-Click Official Medical Record PDF Export | ✅ **Done** |
| **Sprint 4** | System Hardening, CDS & Facility Telemetry | Executive Analytics (`/analytics`), Hospital Wing Rooms (`/rooms`), 4-View Patient Portal (`/patient-portal`), Drug Allergy CDS | ✅ **Done** |
| **Sprint 5** | Staff Access Governance & Record Corrections | User Access Revocation (`/users`), Safe Record Corrections (`patient-chart-modal.tsx`), Navigation & Breadcrumbs | ✅ **Done** |
| **Sprint 6** | Closed-Loop Workflows & Completeness | Patient Appointment Booking & Cancel (`/patient-portal`), In-Chart Diagnostic Orders, Room Turnover Automation, Staff Profile Edit, Certified Lab PDF Export | ⏳ **In Progress** |

