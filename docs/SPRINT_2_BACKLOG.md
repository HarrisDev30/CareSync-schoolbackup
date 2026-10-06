# 📋 CareSync — Sprint 2 Backlog & Trello Specification

* **Sprint Cycle:** Sprint 2 (Interactive Clinical Care, Diagnostic Verification & Notifications)
* **Team:** Group 2 (CareSync Development Team)
* **Status:** ⏳ **READY FOR TRELLO SETUP**
* **Target Throughput:** $\ge 80\%$ completion rate with 0 stale cards

---

## 🎯 1. Sprint 2 Goal & Epic

### `[SPRINT-2] Epic: Interactive Clinical Encounter, Lab Verification & Telemedicine Foundation`
* **Column:** `⏳ Sprint 2: To Do`
* **Labels:** `Sprint-2` (Purple), `Epic` (Blue)
* **Sprint Goal Statement:**  
  *"Advance CareSync from foundational intake to active clinical treatment: enable physicians to record live SOAP consultation notes and vitals, allow laboratory staff to enter and verify diagnostic test results with 1-click status transitions, and establish the technical groundwork for telemedicine and automated patient reminders."*

---

## 📌 2. Trello Board Column Architecture

```
[ 📋 Product Backlog ] ──> [ ⏳ Sprint 2: To Do ] ──> [ 🚧 In Progress ] ──> [ 🔍 QA / Review ] ──> [ ✅ Done ]
```

> **Zero-Stale-Card Rule:** Every single card below must have an **assigned member avatar**, a **color label**, a **checklist with $\ge 3$ acceptance items**, and **recent activity comments**.

---

## 📝 3. Sprint 2 Ticket Registry (Ready for Trello Copy & Paste)

### 1. 💾 Backend Engineer (Assignee: `@Harris Asani` — YOU)

#### Card Title: `[BE-303] Interactive SOAP Note Persistence & Live Vitals API`
* **Column:** `✅ Done`
* **Member:** `@Harris Asani`
* **Labels:** `Backend` (Blue), `Sprint-2` (Purple), `High Priority` (Red)
* **Checklist (Acceptance Criteria):**
  - [x] Implement `POST /api/v1/consultations` and `POST /api/v1/consultations/:id/finalize` endpoints with DTO validation
  - [x] Add `VitalSigns` interface and relational mapping for Blood Pressure, Heart Rate, SpO2, and Temperature
  - [x] Enforce `@Roles('PHYSICIAN')` and session lock guards to prevent unauthorized staff from altering clinical assessments
  - [x] Automatically record consultation events with immutable audit logging and malpractice compliance
  - [x] Support dual-mode persistence: NestJS server API with automatic fallback to client local storage (`caresync_local_consultations`)
* **Sample Activity Comment:**  
  *"Completed SOAP consultation persistence and live vitals integration with dual backend/local fallback."*

---

### 2. 🎨 Frontend Specialist (Assignee: `@Edson Sode` / `@Harris Asani`)

#### Card Title: `[FE-405] Receptionist UX Refinement: 2-Pane Scheduler & Glare Reduction`
* **Column:** `✅ Done`
* **Member:** `@Edson Sode` (or `@Harris Asani`)
* **Labels:** `Frontend` (Orange), `Sprint-2` (Purple), `UI/UX` (Yellow)
* **Checklist (Acceptance Criteria):**
  - [x] Redesign Consultation Scheduling page to full-width `dashboard-01`
  - [x] Build 2-pane Cal.com-style booking modal with zero vertical scrolling
  - [x] Add distinct Morning (☀️) and Afternoon (🌤️) 30-minute time slot picker
  - [x] Implement softer clinical slate light theme (`#f1f5f9`) to eliminate glare
  - [x] Elevate calendar contrast and weekday visibility for WCAG AA compliance
  - [x] Add scalable indexed EHR patient combobox for high-volume hospital search
* **Sample Activity Comment:**  
  *"Full-width layout, Cal.com zero-scroll scheduler, and scalable EHR patient search combobox verified."*

---

### 3. 🎨 Frontend Specialist (Assignee: `@Edson Sode`)

#### Card Title: `[FE-403] Patient Chart Redesign & Interactive Clinical Entry Modal`
* **Column:** `✅ Done`
* **Member:** `@Edson Sode`
* **Labels:** `Frontend` (Orange), `Sprint-2` (Purple), `UI/UX` (Yellow)
* **Checklist (Acceptance Criteria):**
  - [x] Add "New Clinical Note" form inside the Patient Chart modal (Subjective, Objective, Assessment with ICD-10 presets, Plan inputs)
  - [x] Add live Vitals intake fields with immediate visual AHA status badges (Normal, Elevated, Stage 1/2 HTN, Crisis, Hypoxia, Tachycardia)
  - [x] Connect form submission to `api.ts` so new notes persist immediately without page reload (Draft vs. Finalize & Sign)
  - [x] Render historical chronological signed SOAP encounters with verified timestamps and provider stamps
  - [x] Maintain zero internal vertical page scrolling and high-contrast WCAG AA typography
* **Sample Activity Comment:**  
  *"Interactive clinical workstation with tabbed SOAP entry, ICD-10 chips, and AHA live vitals evaluation completed."*

---

### 4. 🔬 Diagnostic & Lab Lead (Assignee: `@Harris Asani` / `@Edson Sode`)

#### Card Title: `[FE-404] 1-Click Specimen Result Verification & Lab Status Transitions`
* **Column:** `✅ Done`
* **Member:** `@Edson Sode` (or `@Harris Asani`)
* **Labels:** `Frontend` (Orange), `Diagnostics` (Green), `Sprint-2` (Purple)
* **Checklist (Acceptance Criteria):**
  - [x] Add "Enter Results" modal for lab technicians to input numerical test values (e.g., Cholesterol, Glucose)
  - [x] Add 1-click "Verify Specimen" button moving orders from `PROCESSING` $\rightarrow$ `VERIFIED`
  - [x] Highlight abnormal test values in high-contrast amber/red badges
  - [x] Restrict result entry and verification actions to the `LABORATORY_USER` role
  - [x] Add supervisor sign-off and physician clinical review workflows with local storage fallback
* **Sample Activity Comment:**  
  *"Implemented formal clinical workbench, scalable test requisition, specimen verification, and physician review."*

---

### 5. 📐 Project Manager & Architecture (Assignee: `@Mel Ford Batucan`)

#### Card Title: `[PM-203] Telemedicine & Automated Patient Notification Specifications`
* **Column:** `⏳ Sprint 2: To Do`
* **Member:** `@Mel Ford Batucan`
* **Labels:** `PM` (Purple), `Documentation` (Gray), `Sprint-2` (Purple)
* **Checklist (Acceptance Criteria):**
  - [ ] Draft client requirements document for Telemedicine Video Room integration (`docs/TELEMEDICINE_SPEC.md`)
  - [ ] Define automated notification payload schema for SMS and Email appointment reminders
  - [ ] Maintain Trello sprint velocity and verify 0 stale cards across all members
  - [ ] Prepare Sprint 2 presentation slides for client review
* **Sample Activity Comment:**  
  *"Drafted functional requirements for patient notifications and telemedicine room links."*

---

### 6. 🔍 QA & Testing Lead (Assignee: `@Cherry Jane Cahimtong`)

#### Card Title: `[QA-503] Clinical Encounter Security & Role Boundary E2E Test Suite`
* **Column:** `⏳ Sprint 2: To Do`
* **Member:** `@Cherry Jane Cahimtong`
* **Labels:** `QA` (Green), `Testing` (Yellow), `Sprint-2` (Purple)
* **Checklist (Acceptance Criteria):**
  - [ ] Write Supertest test: Receptionist attempts to sign a physician SOAP note (assert 403 Forbidden)
  - [ ] Write boundary test: Patient vitals out of clinical range trigger proper DTO validation error (400 Bad Request)
  - [ ] Test that verified lab results appear in the patient chart without manual browser reload
  - [ ] Verify keyboard accessibility focus rings on new clinical modal tabs
* **Sample Activity Comment:**  
  *"Writing automated boundary tests for the new clinical SOAP endpoints."*

---

### 7. ⚙️ DevOps Lead (Assignee: `@Luziel Artiaga`)

#### Card Title: `[DEV-103] Automated Database Migration Pipeline & Daily DB Backups`
* **Column:** `⏳ Sprint 2: To Do`
* **Member:** `@Luziel Artiaga`
* **Labels:** `DevOps` (Blue), `Infrastructure` (Red), `Sprint-2` (Purple)
* **Checklist (Acceptance Criteria):**
  - [ ] Create automated PostgreSQL volume backup script in Docker environment
  - [ ] Add database migration verification step to GitHub Actions CI (`npm run migration:run`)
  - [ ] Ensure seamless database schema updates without data loss
* **Sample Activity Comment:**  
  *"Configured automated PostgreSQL dump utility for local backup container."*

---

## 📦 4. Future Product Backlog Cards (Column: `📋 Product Backlog`)

Leave these in the backlog column to demonstrate long-term product vision:
1. `[FEAT-601] WebRTC Telemedicine Video Room for Virtual Consultations (Sprint 3)`
2. `[FEAT-602] Twilio / SendGrid SMS & Email Appointment Reminder Automation (Sprint 3)`
3. `[FEAT-603] 1-Click PDF Medical Record Export with Electronic Physician Signature (Sprint 3)`
4. `[FEAT-604] Clinical Trend Analytics & Disease Surveillance Dashboard (Sprint 3)`
