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
* **Column:** `🚧 In Progress`
* **Member:** `@Harris Asani`
* **Labels:** `Backend` (Blue), `Sprint-2` (Purple), `High Priority` (Red)
* **Checklist (Acceptance Criteria):**
  - [ ] Implement `POST /api/v1/consultations/:id/soap-notes` endpoint with DTO validation
  - [ ] Add `PatientVital` database entity and relational mapping for Blood Pressure, Heart Rate, SpO2, and Temperature
  - [ ] Enforce `@Roles('PHYSICIAN')` guard to prevent unauthorized staff from altering clinical assessments
  - [ ] Automatically record all consultation creations into the immutable HIPAA `AuditLog`
  - [ ] Return standard 200 OK and sanitized 400 Bad Request error envelopes
* **Sample Activity Comment:**  
  *"Created consultation SOAP DTO validation pipes and wired patient vitals entity relationship in TypeORM."*

---

### 2. 🎨 Frontend Specialist (Assignee: `@Edson Sode` / `@Harris Asani`)

#### Card Title: `[FE-405] Receptionist UX Refinement: 2-Pane Scheduler & Glare Reduction`
* **Column:** `🚧 In Progress`
* **Member:** `@Edson Sode` (or `@Harris Asani`)
* **Labels:** `Frontend` (Orange), `Sprint-2` (Purple), `UI/UX` (Yellow)
* **Checklist (Acceptance Criteria):**
  - [x] Redesign Consultation Scheduling page to full-width `dashboard-01`
  - [x] Build 2-pane Cal.com-style booking modal with zero vertical scrolling
  - [x] Add distinct Morning (☀️) and Afternoon (🌤️) 30-minute time slot picker
  - [x] Implement softer clinical slate light theme (`#f1f5f9`) to eliminate glare
  - [x] Elevate calendar contrast and weekday visibility for WCAG AA compliance
* **Sample Activity Comment:**  
  *"Full-width layout and Cal.com zero-scroll scheduler verified."*

---

### 3. 🎨 Frontend Specialist (Assignee: `@Edson Sode`)

#### Card Title: `[FE-403] Patient Chart Redesign & Interactive Clinical Entry Modal`
* **Column:** `⏳ Sprint 2: To Do`
* **Member:** `@Edson Sode`
* **Labels:** `Frontend` (Orange), `Sprint-2` (Purple), `UI/UX` (Yellow)
* **Checklist (Acceptance Criteria):**
  - [ ] Add "New Clinical Note" form inside the Patient Chart modal (Subjective, Objective, Assessment, Plan inputs)
  - [ ] Add quick Vital input fields with immediate visual status badges (Normal vs. High BP)
  - [ ] Connect form submission to `api.ts` so new notes persist immediately without page reload
  - [ ] Maintain zero internal vertical scrolling and high-contrast WCAG AA typography
* **Sample Activity Comment:**  
  *"Designing interactive clinical input tabs inside `patient-chart-modal.tsx`."*

---

### 4. 🔬 Diagnostic & Lab Lead (Assignee: `@Harris Asani` / `@Edson Sode`)

#### Card Title: `[FE-404] 1-Click Specimen Result Verification & Lab Status Transitions`
* **Column:** `⏳ Sprint 2: To Do`
* **Member:** `@Edson Sode` (or `@Harris Asani`)
* **Labels:** `Frontend` (Orange), `Diagnostics` (Green), `Sprint-2` (Purple)
* **Checklist (Acceptance Criteria):**
  - [ ] Add "Enter Results" modal for lab technicians to input numerical test values (e.g., Cholesterol, Glucose)
  - [ ] Add 1-click "Verify Specimen" button moving orders from `PROCESSING` $\rightarrow$ `VERIFIED`
  - [ ] Highlight abnormal test values in high-contrast amber/red badges
  - [ ] Restrict result entry and verification actions to the `LABORATORY_USER` role
* **Sample Activity Comment:**  
  *"Implementing specimen result verification modal and state transitions in `labs/page.tsx`."*

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
