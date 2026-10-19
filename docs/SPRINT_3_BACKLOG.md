# 📋 CareSync — Sprint 3 Backlog & Trello Specification

* **Sprint Cycle:** Sprint 3 (Clinical Closure, Patient Portal Experience & Audit Defense Readiness)
* **Team:** Group 2 (CareSync Development Team)
* **Status:** ✅ **COMPLETED & READY FOR TRELLO (100% Throughput — 6/6 Cards in Done)**
* **Target Throughput:** $\ge 85\%$ completion rate with 0 stale cards (Achieved: **100%**)
* **Core Principle:** 100% Core Hospital System Scope (Zero Telemedicine)

---

## 🎯 1. Sprint 3 Goal & Epic

### `[SPRINT-3] Epic: Clinical Closure, Patient Portal Experience & Audit Defense Readiness`
* **Column:** `✅ Done`
* **Labels:** `Sprint-3` (Purple), `Epic` (Blue)
* **Sprint Goal Statement:**  
  *"Complete the end-to-end outpatient healthcare journey from clinical diagnosis to resolution: empower physicians to issue official electronic prescriptions (Rx) and discharge summaries, deliver a transparent Patient Health Portal with verified lab results and medication timelines, provide administrators with an immutable HIPAA audit workbench, and prepare the live multi-role defense demonstration."*


---

## 📌 2. Trello Board Column Architecture

```
[ 📋 Product Backlog ] ──> [ ⏳ Sprint 3: To Do ] ──> [ 🚧 In Progress ] ──> [ 🔍 QA / Review ] ──> [ ✅ Done ]
```

> **Zero-Stale-Card Rule:** Every single card below has an **assigned member avatar**, a **color label**, a **checklist with $\ge 3$ acceptance items**, and **recent activity comments**.

---

## 📝 3. Sprint 3 Ticket Registry (Ready for Trello Copy & Paste)

### 1. 💾 Backend Engineer (Assignee: `@Harris Asani` — YOU)

#### Card Title: `[BE-304] E-Prescription & Patient Discharge Summary API`
* **Column:** `✅ Done`
* **Member:** `@Harris Asani`
* **Labels:** `Backend` (Blue), `Sprint-3` (Purple), `High Priority` (Red)
* **Checklist (Acceptance Criteria):**
  - [x] Implement prescription creation and storage with DTO validation (medication name, dosage, frequency, route, duration, refills)
  - [x] Link active medication orders to the patient and authoring physician
  - [x] Implement patient discharge transition moving status from `In Consult` $\rightarrow$ `Discharged`
  - [x] Automatically record all prescription issuances and discharge events into the immutable HIPAA `AuditLog`
  - [x] Support dual-mode persistence (NestJS PostgreSQL backend with client local fallback)
* **Sample Activity Comment:**  
  *"Implemented e-prescription order engine, patient discharge summary persistence, and automatic WORM audit logging."*

---

### 2. 🎨 Frontend Specialist (Assignee: `@Edson Sode`)

#### Card Title: `[FE-406] Patient Health Portal & 1-Click Official Medical Record Export`
* **Column:** `✅ Done`
* **Member:** `@Edson Sode`
* **Labels:** `Frontend` (Orange), `Sprint-3` (Purple), `UI/UX` (Yellow)
* **Checklist (Acceptance Criteria):**
  - [x] Polish `/patient-portal` so patients can view active prescriptions, verified lab findings, and upcoming visits
  - [x] Add 1-click "Export Official Medical Record" modal generating print-ready clinical EHR summary
  - [x] Include official CareSync hospital letterhead, MRN barcode, ICD-10 diagnosis chips, and digital physician signature stamp
  - [x] Maintain anti-glare clinical styling, zero layout shift, and WCAG AA contrast compliance
* **Sample Activity Comment:**  
  *"Constructed MedicalRecordExportModal with hospital letterhead and physician seal; connected 1-click export to patient portal and patient chart."*

---

### 3. 🎨 Frontend Specialist / Fullstack (Assignee: `@Edson Sode` / `@Harris Asani`)

#### Card Title: `[FE-407] Enterprise HIPAA Audit Log Workbench & Security Inspector`
* **Column:** `✅ Done`
* **Member:** `@Edson Sode` (or `@Harris Asani`)
* **Labels:** `Frontend` (Orange), `Security` (Red), `Sprint-3` (Purple)
* **Checklist (Acceptance Criteria):**
  - [x] Redesign `/audit-logs` into a full-width enterprise compliance workbench
  - [x] Implement multi-filter toolbar: filter by Actor (Receptionist, Physician, Lab User, Admin), Action type, and Date range
  - [x] Add visual security highlight badges for unauthorized attempts (HTTP 403 Forbidden events) and record amendments
  - [x] Restrict audit workbench access strictly to the `ADMINISTRATOR` role
* **Sample Activity Comment:**  
  *"Upgraded /audit-logs with anti-glare theme tokens, multi-filter toolbar, RBAC administrator access gate, and 1-click JSON compliance export."*

---

### 4. 🔍 QA & Testing Lead (Assignee: `@Cherry Jane Cahimtong`)

#### Card Title: `[QA-504] Full Hospital Lifecycle End-to-End Test Suite`
* **Column:** `✅ Done`
* **Member:** `@Cherry Jane Cahimtong`
* **Labels:** `QA` (Green), `Testing` (Yellow), `Sprint-3` (Purple)
* **Checklist (Acceptance Criteria):**
  - [x] Write automated integration test covering the complete outpatient journey:
    Walk-in Intake $\rightarrow$ Outpatient Triage $\rightarrow$ Doctor SOAP Chart $\rightarrow$ Lab Verification $\rightarrow$ Rx Discharge $\rightarrow$ Patient Portal
  - [x] Verify that discharged patient records reflect across all tables without page reload
  - [x] Assert that prescription records cannot be modified once marked discontinued
  - [x] Verify keyboard accessibility focus rings and screen reader ARIA labels across all new modals
* **Sample Activity Comment:**  
  *"Authored hospital-lifecycle.spec.ts covering 6 clinical phases and immutability guards (52/52 total backend Jest tests passing)."*

---

### 5. ⚙️ DevOps Lead (Assignee: `@Luziel Artiaga`)

#### Card Title: `[DEV-104] Production Multi-Container Orchestration & Live Demo Script`
* **Column:** `✅ Done`
* **Member:** `@Luziel Artiaga`
* **Labels:** `DevOps` (Blue), `Infrastructure` (Red), `Sprint-3` (Purple)
* **Checklist (Acceptance Criteria):**
  - [x] Validate single-command multi-container spin-up (`docker compose up --build`)
  - [x] Provide one-command database reset & seed runner for clean presentation restarts (`scripts/reset-demo.ps1` & `scripts/reset-demo.sh`)
  - [x] Verify container healthcheck probes for PostgreSQL (5432) and Redis (6379)
  - [x] Author DevOps defense cheat-sheet for live exam deployment questions (`docs/DEVOPS_DEFENSE_GUIDE.md`)
* **Sample Activity Comment:**  
  *"Deployed presentation demo reset runners and published master DevOps Defense Guide for oral examination."*

---

### 6. 📐 Project Manager & Architecture (Assignee: `@Mel Ford Batucan`)

#### Card Title: `[PM-204] Project Defense Master Deck & Trello Hygiene Finalization`
* **Column:** `✅ Done`
* **Member:** `@Mel Ford Batucan`
* **Labels:** `PM` (Purple), `Documentation` (Gray), `Sprint-3` (Purple)
* **Checklist (Acceptance Criteria):**
  - [x] Author team presentation slide deck outline aligned with 100-point defense grading matrix (`docs/PROJECT_DEFENSE_MASTER_DECK.md`)
  - [x] Structure 90-second per member speaking script for live client demonstration
  - [x] Audit Trello board for 100% compliance with zero-stale-card policy and $\ge 85\%$ completion rate
  - [x] Archive Sprint 2 execution metrics in project history documentation
* **Sample Activity Comment:**  
  *"Created master 100-point defense presentation deck with 90-second speaking scripts across all 5 team roles."*

---

## 📦 4. Future Product Backlog Cards (Column: `📋 Product Backlog`)

These standing cards advance into Sprint 4 & Future Milestones:
1. `[FEAT-601] Hospital Facility & Department Wing Room Management (/rooms) (Sprint 4)`
2. `[FEAT-602] Clinical Decision Support (CDS) & Drug Allergy Safety Engine (Sprint 4)`
3. `[FEAT-603] Executive Hospital Census & Diagnostic TAT Analytics Dashboard (/analytics) (Sprint 4)`
4. `[FEAT-604] Administrator Staff Access Governance & Record Addendum UI (Sprint 5)`

