# 📋 CareSync — Sprint 4 Backlog & Trello Specification

* **Sprint Cycle:** Sprint 4 (Enterprise System Hardening, Clinical Decision Support, Hospital Analytics & Capstone Defense Mastery)
* **Team:** Group 2 (CareSync Development Team)
* **Status:** 🚀 **ACTIVE SPRINT 4**
* **Target Throughput:** $\ge 90\%$ completion rate with 0 stale cards
* **Core Principle:** 100% Core Outpatient/Inpatient Hospital Scope (Zero Telemedicine)

---

## 🎯 1. Sprint 4 Goal & Epic

### `[SPRINT-4] Epic: Enterprise System Hardening, Hospital Analytics & Capstone Defense Mastery`
* **Column:** `⏳ Sprint 4: To Do`
* **Labels:** `Sprint-4` (Green), `Epic` (Blue)
* **Sprint Goal Statement:**  
  *"Harden the complete CareSync hospital management ecosystem for enterprise deployment and academic capstone defense: deliver an Executive Analytics & Hospital Census Dashboard, embed real-time Clinical Decision Support (drug allergy and dosage safety warnings), execute comprehensive multi-role simulated live hospital trials, and establish single-command demo recovery runners."*

---

## 📌 2. Trello Board Column Architecture

```
[ 📋 Product Backlog ] ──> [ ⏳ Sprint 4: To Do ] ──> [ 🚧 In Progress ] ──> [ 🔍 QA / Review ] ──> [ ✅ Done ]
```

---

## 📝 3. Sprint 4 Ticket Registry (Ready for Trello Copy & Paste)

### 1. 💾 Backend Engineer (Assignee: `@Harris Asani` — YOU)

#### Card Title: `[BE-401] Hospital Census, Diagnostic TAT & Revenue Metrics Aggregation API`
* **Column:** `✅ Done`
* **Member:** `@Harris Asani`
* **Labels:** `Backend` (Blue), `Sprint-4` (Green), `High Priority` (Red)
* **Checklist (Acceptance Criteria):**
  - [x] Implement analytics aggregation service computing daily patient intake rate, average doctor consultation duration, and lab Turnaround Time (TAT)
  - [x] Implement real-time bed / room occupancy calculator across consultation suites and lab benches
  - [x] Generate aggregated diagnostic test volume distribution (Hematology, Chemistry, Cardiology, Coagulation)
  - [x] Cache heavy statistical queries using NestJS in-memory cache / Redis with 60-second TTL
  - [x] Write unit and integration test suite with $\ge 90\%$ branch coverage for calculation accuracy (100% pass across 56 tests)
* **Sample Activity Comment:**  
  *"Building analytics aggregation engine and room occupancy telemetry with zero DB bottlenecks."*

---

### 2. 🎨 Frontend Specialist (Assignee: `@Edson Sode`)

#### Card Title: `[FE-501] Executive Hospital Analytics & Operations Telemetry Dashboard (/analytics)`
* **Column:** `✅ Done`
* **Member:** `@Edson Sode`
* **Labels:** `Frontend` (Orange), `Sprint-4` (Green), `UI/UX` (Yellow)
* **Checklist (Acceptance Criteria):**
  - [x] Build `/analytics` with Shadcn/Recharts visualizers (Patient Admission Flow, Doctor Utilization, Diagnostic Turnaround TAT, Suite Occupancy)
  - [x] Add interactive date range picker (Today, Last 7 Days, This Month, Year-to-Date)
  - [x] Implement Live Room / Suite Occupancy Monitor showing active exams and waiting room load
  - [x] Integrate 1-click "Download Executive Operations Report" in print-ready PDF format
  - [x] Maintain consistent Shadcn typography, dark/light theme polish, and WCAG AA contrast
* **Sample Activity Comment:**  
  *"Developed operations telemetry dashboard with responsive container queries and SVG hospital throughput charts."*

---

#### Card Title: `[FE-502] Clinical Decision Support (CDS) & Drug Allergy Safety Alerts`
* **Column:** `✅ Done`
* **Member:** `@Edson Sode`
* **Labels:** `Frontend` (Orange), `Sprint-4` (Green), `Safety` (Red)
* **Checklist (Acceptance Criteria):**
  - [x] Add real-time cross-checking in `patient-chart-modal.tsx` when a physician prescribes a medication against known patient allergies (e.g. Penicillin / Sulfa allergy triggers prominent safety dialog)
  - [x] Display contraindication warning badges in prescription builder
  - [x] Log all overridden allergy alerts with physician rationale to the immutable HIPAA Audit Log
  - [x] Ensure non-blocking UX so attending physicians maintain clinical autonomy
* **Sample Activity Comment:**  
  *"Embedded instant safety cross-checking between active allergies and new e-prescriptions."*

---

### 3. 🛡️ QA & Security Specialist (Assignee: `@Christian Jay Harris`)

#### Card Title: `[QA-601] Multi-Role Hospital Lifecycle Defense Simulation Suite`
* **Column:** `✅ Done`
* **Member:** `@Christian Jay Harris`
* **Labels:** `QA` (Cyan), `Sprint-4` (Green), `Testing` (Purple)
* **Checklist (Acceptance Criteria):**
  - [x] Run full automated lifecycle test from Walk-in Registration $\rightarrow$ Triage Vitals $\rightarrow$ Consultation $\rightarrow$ STAT Lab Order $\rightarrow$ Analyzer Verification $\rightarrow$ E-Prescription $\rightarrow$ Discharge
  - [x] Verify zero data loss and strict non-destructive append-only record guarantees
  - [x] Test RBAC privilege isolation: verify Receptionist cannot view SOAP notes or sign lab orders
  - [x] Verify AES-256-GCM encryption key rotation and decryption audit logging
  - [x] Document 100% pass verification logs in `docs/PROJECT_DEFENSE_MASTER_DECK.md`
* **Sample Activity Comment:**  
  *"Executed 15-step end-to-end multi-user role simulation; verified 100% RBAC isolation and audit integrity."*

---

### 4. 🚀 DevOps & Product Manager (Assignee: `@John Loyd Balbuena`)

#### Card Title: `[DEV-201] Live Demo Reset Runbook, Automated DB Seeding & Defense Master Script`
* **Column:** `✅ Done`
* **Member:** `@John Loyd Balbuena`
* **Labels:** `DevOps` (Teal), `Sprint-4` (Green), `Defense` (Yellow)
* **Checklist (Acceptance Criteria):**
  - [x] Test and certify `scripts/reset-demo.ps1` and `npm run seed` for instant 2-second panel reset during live defense
  - [x] Prepare offline fallback environment with local SQLite/Postgres container in case of Wi-Fi outages
  - [x] Finalize the 5-minute timed presentation pitch script highlighting healthcare problem statement, architecture, and live demo flow
  - [x] Verify all 4 team members have clearly rehearsed defense speaking roles
* **Sample Activity Comment:**  
  *"Rehearsed defense pitch and certified 2-second clean demo database reset runner."*

---

## 📊 4. Complete CareSync 4-Sprint Architecture Summary

| Sprint | Epic / Focus | Core Deliverables | Status |
| :---: | :--- | :--- | :---: |
| **Sprint 1** | Foundation & Core Registry | Patient Admission (`/patients`), PostgreSQL Neon Schema, Auth & RBAC | ✅ **Done** |
| **Sprint 2** | Consultation Scheduling & LIS Diagnostics | Scheduling Matrix (`/appointments`), Diagnostic Workbench (`/labs`), Lab Analyzer Telemetry | ✅ **Done** |
| **Sprint 3** | Clinical Closure & HIPAA Audit | Interactive Patient Chart (`SOAP`, Vitals), E-Prescriptions, Patient Portal (`/patient-portal`), Audit Log Inspector (`/audit-logs`), 1-Click PDF Medical Record Export | ✅ **Done** |
| **Sprint 4** | System Hardening, CDS & Capstone Defense | Operations Analytics (`/analytics`), Hospital Rooms (`/rooms`), Drug Allergy Clinical Decision Support, Multi-role Defense Rehearsal, Automated Backup & Reset Runbooks | ✅ **Done** |

