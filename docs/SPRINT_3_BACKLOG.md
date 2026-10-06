# 📋 CareSync — Sprint 3 Backlog & Trello Specification

* **Sprint Cycle:** Sprint 3 (Clinical Closure, Patient Portal Experience & Audit Defense Readiness)
* **Team:** Group 2 (CareSync Development Team)
* **Status:** ⏳ **READY FOR SPRINT 3 EXECUTION**
* **Target Throughput:** $\ge 85\%$ completion rate with 0 stale cards
* **Core Principle:** 100% Core Hospital System Scope (Zero Telemedicine)

---

## 🎯 1. Sprint 3 Goal & Epic

### `[SPRINT-3] Epic: Clinical Closure, Patient Portal Experience & Audit Defense Readiness`
* **Column:** `⏳ Sprint 3: To Do`
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
* **Column:** `⏳ Sprint 3: To Do`
* **Member:** `@Harris Asani`
* **Labels:** `Backend` (Blue), `Sprint-3` (Purple), `High Priority` (Red)
* **Checklist (Acceptance Criteria):**
  - [ ] Implement `POST /api/v1/prescriptions` endpoint with DTO validation (medication name, dosage, frequency, route, duration, refills)
  - [ ] Link active medication orders to the patient and authoring physician
  - [ ] Implement `POST /api/v1/patients/:id/discharge` endpoint transitioning patient status from `In Consult` $\rightarrow$ `Discharged`
  - [ ] Automatically record all prescription issuances and discharge events into the immutable HIPAA `AuditLog`
  - [ ] Support dual-mode persistence (NestJS PostgreSQL backend with client local fallback)
* **Sample Activity Comment:**  
  *"Architecting prescription entity and discharge transition endpoints in NestJS consultations module."*

---

### 2. 🎨 Frontend Specialist (Assignee: `@Edson Sode`)

#### Card Title: `[FE-406] Patient Health Portal & 1-Click Official Medical Record Export`
* **Column:** `⏳ Sprint 3: To Do`
* **Member:** `@Edson Sode`
* **Labels:** `Frontend` (Orange), `Sprint-3` (Purple), `UI/UX` (Yellow)
* **Checklist (Acceptance Criteria):**
  - [ ] Polish `/patient-portal` so patients can view active prescriptions, verified lab findings, and upcoming visits
  - [ ] Add 1-click "Export Official Medical Record" modal generating print-ready clinical EHR summary
  - [ ] Include official CareSync hospital letterhead, MRN barcode, ICD-10 diagnosis chips, and digital physician signature stamp
  - [ ] Maintain anti-glare clinical styling, zero layout shift, and WCAG AA contrast compliance
* **Sample Activity Comment:**  
  *"Building print-ready medical record export template and wiring patient portal data streams."*

---

### 3. 🎨 Frontend Specialist / Fullstack (Assignee: `@Edson Sode` / `@Harris Asani`)

#### Card Title: `[FE-407] Enterprise HIPAA Audit Log Workbench & Security Inspector`
* **Column:** `⏳ Sprint 3: To Do`
* **Member:** `@Edson Sode` (or `@Harris Asani`)
* **Labels:** `Frontend` (Orange), `Security` (Red), `Sprint-3` (Purple)
* **Checklist (Acceptance Criteria):**
  - [ ] Redesign `/audit-logs` into a full-width enterprise compliance workbench
  - [ ] Implement multi-filter toolbar: filter by Actor (Receptionist, Physician, Lab User, Admin), Action type, and Date range
  - [ ] Add visual security highlight badges for unauthorized attempts (HTTP 403 Forbidden events) and record amendments
  - [ ] Restrict audit workbench access strictly to the `ADMINISTRATOR` role
* **Sample Activity Comment:**  
  *"Wiring audit log workbench to backend admin endpoints with interactive security filters."*

---

### 4. 🔍 QA & Testing Lead (Assignee: `@Cherry Jane Cahimtong`)

#### Card Title: `[QA-504] Full Hospital Lifecycle End-to-End Test Suite`
* **Column:** `⏳ Sprint 3: To Do`
* **Member:** `@Cherry Jane Cahimtong`
* **Labels:** `QA` (Green), `Testing` (Yellow), `Sprint-3` (Purple)
* **Checklist (Acceptance Criteria):**
  - [ ] Write automated integration test covering the complete outpatient journey:
    Walk-in Intake $\rightarrow$ Outpatient Triage $\rightarrow$ Doctor SOAP Chart $\rightarrow$ Lab Verification $\rightarrow$ Rx Discharge $\rightarrow$ Patient Portal
  - [ ] Verify that discharged patient records reflect across all tables without page reload
  - [ ] Assert that prescription records cannot be modified once marked discontinued
  - [ ] Verify keyboard accessibility focus rings and screen reader ARIA labels across all new modals
* **Sample Activity Comment:**  
  *"Writing comprehensive end-to-end integration test asserting cross-role state propagation."*

---

### 5. ⚙️ DevOps Lead (Assignee: `@Luziel Artiaga`)

#### Card Title: `[DEV-104] Production Multi-Container Orchestration & Live Demo Script`
* **Column:** `⏳ Sprint 3: To Do`
* **Member:** `@Luziel Artiaga`
* **Labels:** `DevOps` (Blue), `Infrastructure` (Red), `Sprint-3` (Purple)
* **Checklist (Acceptance Criteria):**
  - [ ] Validate single-command multi-container spin-up (`docker compose up --build`)
  - [ ] Provide one-command database reset & seed runner for clean presentation restarts (`npm run seed`)
  - [ ] Verify container healthcheck probes for PostgreSQL (5432) and Redis (6379)
  - [ ] Author DevOps defense cheat-sheet for live exam deployment questions
* **Sample Activity Comment:**  
  *"Verifying Docker compose multi-stage builds and automated seed re-hydration script."*

---

### 6. 📐 Project Manager & Architecture (Assignee: `@Mel Ford Batucan`)

#### Card Title: `[PM-204] Project Defense Master Deck & Trello Hygiene Finalization`
* **Column:** `⏳ Sprint 3: To Do`
* **Member:** `@Mel Ford Batucan`
* **Labels:** `PM` (Purple), `Documentation` (Gray), `Sprint-3` (Purple)
* **Checklist (Acceptance Criteria):**
  - [ ] Author team presentation slide deck outline aligned with 100-point defense grading matrix
  - [ ] Structure 90-second per member speaking script for live client demonstration
  - [ ] Audit Trello board for 100% compliance with zero-stale-card policy and $\ge 85\%$ completion rate
  - [ ] Archive Sprint 2 execution metrics in project history documentation
* **Sample Activity Comment:**  
  *"Drafting defense slide deck and coordinating cross-member hand-off cues."*

---

## 📦 4. Future Product Backlog Cards (Column: `📋 Product Backlog`)

These standing cards remain in the product backlog to demonstrate long-term system vision:
1. `[FEAT-601] WebRTC Telemedicine Video Room for Virtual Consultations (Future Milestone)`
2. `[FEAT-602] Twilio / SendGrid SMS & Email Automated Appointment Reminders (Future Milestone)`
3. `[FEAT-603] Biometric & Smart Card Single Sign-On for Hospital Staff (Future Milestone)`
4. `[FEAT-604] Clinical Trend Analytics & Disease Surveillance Dashboard (Future Milestone)`
