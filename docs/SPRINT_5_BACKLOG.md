# 📋 CareSync — Sprint 5 Backlog & Trello Specification

* **Sprint Cycle:** Sprint 5 (Staff Access Governance, Safe Medical Record Corrections & Final UI Polish)
* **Team:** Group 2 (CareSync Development Team)
* **Status:** ✅ **COMPLETED & READY FOR TRELLO (100% Throughput — 6/6 Cards in Done)**
* **Target Throughput:** $100\%$ completion rate with 0 stale cards (Achieved: **100%**)
* **Core Principle:** 100% Client Requirement Coverage from `system_overview.md` (Zero Telemedicine)

---

## 🎯 1. Sprint 5 Goal & Epic

### `[SPRINT-5] Epic: Administrator Staff Governance, Safe Record Corrections & Navigation Polish`
* **Column:** `✅ Done`
* **Labels:** `Sprint-5` (Teal), `Epic` (Blue)
* **Sprint Goal Statement:**  
  *"Achieve 100% end-to-end UI coverage of every client requirement in `system_overview.md`: deliver the Administrator Staff Directory & Immediate Access Revocation Workbench (`/users`) to demonstrate 'Staff Member Leaves → Account Disabled → Access Revoked', embed the Safe Medical Record Corrections & Revision Ledger UI (`Original Record → Correction → Updated Record → Audit History`) inside the Doctor Patient Chart, and finalize dynamic sidebar/breadcrumb navigation and codebase hygiene."*

---

## 📌 2. Trello Board Column Architecture

```
[ 📋 Product Backlog ] ──> [ ⏳ Sprint 5: To Do ] ──> [ 🚧 In Progress ] ──> [ 🔍 QA / Review ] ──> [ ✅ Done ]
```

> **Zero-Stale-Card Rule:** Every single card below has an **assigned member avatar**, a **color label**, a **checklist with $\ge 3$ acceptance items**, and **activity comments**.

---

## 📝 3. Sprint 5 Ticket Registry (Ready for Trello Copy & Paste)

### 1. 💾 Backend Engineer (Assignee: `@Harris Asani` — YOU)

#### Card Title: `[BE-501] Staff Access Governance, Session Revocation & Record Addendum API Integration`
* **Column:** `✅ Done`
* **Member:** `@Harris Asani`
* **Labels:** `Backend` (Blue), `Sprint-5` (Teal), `Security` (Red)
* **Checklist (Acceptance Criteria):**
  - [x] Connect `GET /api/v1/admin/users`, `POST /api/v1/admin/users`, `PUT /api/v1/admin/users/:id`, and `POST /api/v1/admin/users/:id/revoke` in `frontend/lib/api.ts` with dual-mode local fallback (`caresync_staff_directory_v1`)
  - [x] Support both immediate access revocation (`isActive: false`, `sessionLocked: true`, Redis session eviction, `USER_ACCESS_REVOKED` audit event) and access restoration (`USER_ACCESS_RESTORED`)
  - [x] Connect `POST /api/v1/consultations/:id/corrections` (`submitConsultationCorrection`) in `frontend/lib/api.ts` so finalized SOAP notes preserve an immutable prior snapshot in `corrections[]` and record `CONSULTATION_CORRECTION_SUBMITTED` in the HIPAA Audit Log
  - [x] Ensure `types/index.ts` defines `ConsultationCorrection` and `StaffAccount` interfaces for end-to-end TypeScript safety
* **Sample Activity Comment:**  
  *"Connected NestJS UsersController revocation endpoints and ConsultationsController append-only corrections ledger to the dual-mode API client."*

---

### 2. 🎨 Frontend Specialist (Assignee: `@Edson Sode` / `@Harris Asani`)

#### Card Title: `[FE-601] Administrator Staff Directory & Immediate Access Revocation Workbench (/users)`
* **Column:** `✅ Done`
* **Member:** `@Edson Sode` (or `@Harris Asani`)
* **Labels:** `Frontend` (Orange), `Sprint-5` (Teal), `RBAC` (Purple)
* **Checklist (Acceptance Criteria):**
  - [x] Build `/users` (`Staff & Access Control`) page and add it to the Administrator sidebar in `frontend/components/app-sidebar.tsx`
  - [x] Render 4-card Staff Governance KPI strip: Total Hospital Staff, Active Clinical Accounts, Revoked / Disabled Accounts, and Enforced RBAC Roles
  - [x] Build searchable Staff Directory table with role filter tabs (`ALL`, `PHYSICIAN`, `RECEPTIONIST`, `LABORATORY_USER`, `REVOKED`) and status badges (`Active & Authorized`, `Access Revoked (Disabled)`)
  - [x] Add **"+ Provision Staff Account"** modal with Argon2id password hashing indicator and department assignment
  - [x] Add 1-click **"Revoke Access"** confirmation action (`Staff Member Leaves → Account Disabled → Access Revoked`) and **"Restore Access"** toggle, restricted strictly to `ADMINISTRATOR`
* **Sample Activity Comment:**  
  *"Delivered /users staff governance workbench demonstrating live user access revocation, Argon2id provisioning, and session purge."*

---

#### Card Title: `[FE-602] Safe Medical Record Corrections & Addendum Ledger UI in Doctor Chart`
* **Column:** `✅ Done`
* **Member:** `@Edson Sode`
* **Labels:** `Frontend` (Orange), `Sprint-5` (Teal), `Clinical` (Green)
* **Checklist (Acceptance Criteria):**
  - [x] Add **"Amend / Add Correction"** button on `Signed & Finalized` SOAP notes inside `patient-chart-modal.tsx` (visible to `PHYSICIAN` role)
  - [x] Build inline **Medical Record Correction Form** requiring a mandatory legal `Amendment Reason` alongside updated SOAP fields (`Subjective`, `Objective`, `Assessment`, `Plan`)
  - [x] Display an `"Amended (N)"` badge and expandable **Immutable Revision History (`Original Record → Correction → Updated Record`)** timeline on amended SOAP encounters showing the preserved original snapshot, amendment reason, authoring doctor, and timestamp
  - [x] Automatically record every amendment into the HIPAA Audit Log (`/audit-logs`)
* **Sample Activity Comment:**  
  *"Added non-destructive SOAP note addendum workflow and immutable revision ledger timeline to patient-chart-modal.tsx."*

---

#### Card Title: `[FE-603] Dynamic Sidebar Active Highlight, Patient Portal Breadcrumbs & Codebase Cleanup`
* **Column:** `✅ Done`
* **Member:** `@Edson Sode`
* **Labels:** `Frontend` (Orange), `Sprint-5` (Teal), `UI/UX` (Yellow)
* **Checklist (Acceptance Criteria):**
  - [x] Update `DynamicBreadcrumbPage` in `frontend/app/(dashboard)/layout.tsx` to display the specific Patient Portal view (`My Health Record`, `My Appointments`, `Diagnostic Results`, `Prescriptions & Care`) based on `?tab=` and display `Staff & Access Control` for `/users`
  - [x] Update `frontend/components/nav-main.tsx` to compute `isActive` dynamically from `usePathname()` and `useSearchParams()` so the active sidebar item highlights accurately across all roles and Patient Portal tabs
  - [x] Delete the 5 unused duplicate room component files in `frontend/app/(dashboard)/analytics/_components/` (`assign-room-modal.tsx`, `cds-safety-telemetry-strip.tsx`, `hospital-floor-grid.tsx`, `patient-throughput-stream.tsx`, `room-detail-modal.tsx`)
* **Sample Activity Comment:**  
  *"Synced header breadcrumbs and sidebar active states with query tabs and removed orphaned duplicate components."*

---

### 3. 🔍 QA & Testing Lead (Assignee: `@Cherry Jane Cahimtong`)

#### Card Title: `[QA-701] Staff Access Revocation & Append-Only Record Correction Test Suite`
* **Column:** `✅ Done`
* **Member:** `@Cherry Jane Cahimtong`
* **Labels:** `QA` (Green), `Testing` (Yellow), `Sprint-5` (Teal)
* **Checklist (Acceptance Criteria):**
  - [x] Add unit test suite `users.service.spec.ts` verifying staff creation with Argon2id hashing and `revokeAccess()` (`isActive = false`, `sessionLocked = true`, Redis session key eviction)
  - [x] Verify in `consultations.service.spec.ts` / `hospital-lifecycle.spec.ts` that `submitCorrection()` preserves the original SOAP record in `consultation_corrections` and rejects amendments on unsigned `DRAFT` notes with HTTP 400
  - [x] Verify zero TypeScript compilation errors (`npx tsc --noEmit`) and 100% green backend Jest suite (60/60 tests across 10 suites)
* **Sample Activity Comment:**  
  *"Authored users.service.spec.ts for access revocation and verified 60/60 passing tests across 10 Jest suites."*

---

### 4. ⚙️ DevOps Lead & Project Manager (Assignee: `@Luziel Artiaga` & `@Mel Ford Batucan`)

#### Card Title: `[DEV-301] 5-Sprint Master Documentation & Demo Reset Alignment`
* **Column:** `✅ Done`
* **Member:** `@Luziel Artiaga` & `@Mel Ford Batucan`
* **Labels:** `DevOps` (Blue), `PM` (Purple), `Sprint-5` (Teal)
* **Checklist (Acceptance Criteria):**
  - [x] Verify `scripts/reset-demo.ps1` and `scripts/reset-demo.sh` for clean 2-second presentation resets
  - [x] Update `docs/PROJECT_DEFENSE_MASTER_DECK.md` RBAC Matrix & Golden Path to include Administrator Staff Access Revocation (`/users`) and Physician Safe Record Corrections
  - [x] Generate `docs/SPRINT_5_LOGS.md` upon Sprint 5 completion and mark all 6 cards `✅ Done`
* **Sample Activity Comment:**  
  *"Aligned defense master deck and finalized Sprint 5 execution logs at 100% throughput."*

---

## 📊 4. Complete CareSync 5-Sprint Master Roadmap

| Sprint | Epic / Focus | Core Client Requirements Delivered (`system_overview.md`) | Status |
| :---: | :--- | :--- | :---: |
| **Sprint 1** | Foundation, RBAC & Core Registry | Centralized Patient Records (`/patients`), Argon2id + JWT Auth, AES-256-GCM Encryption, 15m Session Lock | ✅ **Done** |
| **Sprint 2** | Consultation Scheduling & LIS Diagnostics | Follow-up Scheduling (`/appointments`), Consultation Documentation (`SOAP` & AHA Vitals), Diagnostic Result Management (`/labs`) | ✅ **Done** |
| **Sprint 3** | Clinical Closure & HIPAA Audit | E-Prescriptions, Discharge Summary, Immutable Audit Trail (`/audit-logs`), 1-Click Official Medical Record PDF Export | ✅ **Done** |
| **Sprint 4** | System Hardening, CDS & Facility Telemetry | Executive Analytics (`/analytics`), Hospital Wing Rooms (`/rooms`), 4-View Patient Portal (`/patient-portal`), Drug Allergy CDS | ✅ **Done** |
| **Sprint 5** | Staff Access Governance & Record Corrections | User Access Revocation (`/users`: *Staff Leaves $\rightarrow$ Disabled $\rightarrow$ Revoked*), Safe Record Corrections (*Original $\rightarrow$ Correction $\rightarrow$ Updated $\rightarrow$ Audit*), Navigation Polish | ✅ **Done** |


