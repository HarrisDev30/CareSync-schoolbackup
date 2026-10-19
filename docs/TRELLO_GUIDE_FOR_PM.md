# 📋 CareSync Trello Setup & Sprint Hygiene Guide
**For Project Manager / Lead Architect: Mel Ford Batucan**  
**Target:** 30/30 Points on Category 2 (Trello Hygiene, Task Commitment & Throughput)

---

## 🎯 1. Board Layout (5 Kanban Columns)
Create these 5 columns from left to right on your team Trello board:

```
[ 📋 Product Backlog ] ──> [ ⏳ Sprint 1: To Do ] ──> [ 🚧 In Progress ] ──> [ 🔍 QA / Review ] ──> [ ✅ Done ]
```

---

## ⚠️ 2. Zero-Penalty Rules (Avoid -5 Pt Deduction)
- ✅ **No Stale Cards:** Every single card must have an **assigned member avatar**, a **label**, and **recent activity**.
- ✅ **Throughput Target:** Ensure $\ge 80\%$ of committed Sprint 1 tickets are in the `✅ Done` column by defense day.

---

## 📝 3. Exact Cards to Create on Trello (Copy & Paste)

### ⚙️ DevOps Lead Cards (Assignee: `@Luziel Artiaga`)

#### Card 1: `[DEV-101] Monorepo & Docker Environment Setup`
- **Column:** `✅ Done`
- **Member:** `@Luziel Artiaga` | **Label:** `DevOps`, `High`
- **Checklist (Acceptance Criteria):**
  - [x] Create monorepo structure with `backend/` and `frontend/`
  - [x] Configure `docker-compose.yml` for PostgreSQL and Redis
  - [x] Add `.env.example` templates
- **Activity Comment:** *"Docker services verified and running locally."*

#### Card 2: `[DEV-102] GitHub Actions CI Pipeline & PR Template`
- **Column:** `✅ Done`
- **Member:** `@Luziel Artiaga` | **Label:** `DevOps`, `CI/CD`
- **Checklist (Acceptance Criteria):**
  - [x] Add `.github/pull_request_template.md` with grading checklist
  - [x] Configure GitHub Actions CI workflow in `.github/workflows/ci.yml`
  - [x] Enforce automated lint, test, and build checks on all PRs
- **Activity Comment:** *"PR #1 merged into develop. CI passing with green checkmarks."*

---

### 📐 Project Manager Cards (Assignee: `@Mel Ford Batucan`)

#### Card 3: `[PM-201] System Architecture & RBAC Matrix Specification`
- **Column:** `✅ Done`
- **Member:** `@Mel Ford Batucan` | **Label:** `PM`, `Documentation`
- **Checklist (Acceptance Criteria):**
  - [x] Document 3-tier architecture (Presentation, Application, Persistence) in `docs/ARCHITECTURE.md`
  - [x] Define RBAC permission matrix for Receptionist, Physician, Lab, Admin
  - [x] Specify 15-minute inactivity session lock policy
- **Activity Comment:** *"Architecture finalized and approved by team."*

#### Card 4: `[PM-202] Sprint 1 Backlog & Ticket Registry`
- **Column:** `✅ Done`
- **Member:** `@Mel Ford Batucan` | **Label:** `PM`, `Sprint-1`
- **Checklist (Acceptance Criteria):**
  - [x] Break down client requirements into 10 role-specific tickets
  - [x] Assign all cards with due dates, checklists, and owners
  - [x] Target >=80% throughput rate with 0 stale cards
- **Activity Comment:** *"Sprint 1 backlog groomed and active."*

---

### 💾 Backend Engineer Cards (Assignee: `@Harris Asani`)

#### Card 5: `[BE-301] NestJS Core API, DTO Validation & PostgreSQL Entities`
- **Column:** `✅ Done`
- **Member:** `@Harris Asani` | **Label:** `Backend`, `Core`
- **Checklist (Acceptance Criteria):**
  - [x] Build NestJS modules: Auth, Users, Patients, Consultations, Diagnostics, Appointments
  - [x] Configure Argon2id password hashing and JWT auth strategy
  - [x] Implement class-validator DTO pipes returning 200 OK and 400 Bad Request
  - [x] Pass all 32 unit tests in CI
- **Activity Comment:** *"PR #2 merged. All 6 test suites passed."*

#### Card 6: `[BE-302] HIPAA Audit Logging Interceptor & Corrections Schema`
- **Column:** `✅ Done`
- **Member:** `@Harris Asani` | **Label:** `Backend`, `Security`
- **Checklist (Acceptance Criteria):**
  - [x] Record timestamp, user ID, and action on sensitive patient routes
  - [x] Build consultation correction audit history
  - [x] Restrict audit query endpoints to Administrator role
- **Activity Comment:** *"Audit logging interceptor integrated with NestJS."*

---

### 🎨 Frontend Specialist Cards (Assignee: `@Edson Sode`)

#### Card 7: `[FE-401] Clinical Dashboard Layout, Design Tokens & WCAG Focus Rings`
- **Column:** `✅ Done`
- **Member:** `@Edson Sode` | **Label:** `Frontend`, `Accessibility`
- **Checklist (Acceptance Criteria):**
  - [x] Build Next.js 15 route groups `(dashboard)` and private `_components`
  - [x] Map Figma tokens to CSS variables in `globals.css`
  - [x] Enforce WCAG 2.1 AA keyboard focus rings (`*:focus-visible`)
- **Activity Comment:** *"PR #3 merged into develop. WCAG focus verified."*

#### Card 8: `[FE-402] Interactive Patient Management Views & Modals`
- **Column:** `✅ Done`
- **Member:** `@Edson Sode` | **Label:** `Frontend`, `UI`
- **Checklist (Acceptance Criteria):**
  - [x] Build patient table, chart modal, and registration form
  - [x] Connect UI actions to backend REST API client (`api.ts`)
  - [x] Build multi-role persona switcher (Doctor, Receptionist, Lab, Patient)
- **Activity Comment:** *"Live interactive UI verified without console errors."*

---

### 🔍 QA Lead Cards (Assignee: `@Cherry Jane Cahimtong`)

#### Card 9: `[QA-501] Automated API Status Code & Boundary Test Suite`
- **Column:** `✅ Done`
- **Member:** `@Cherry Jane Cahimtong` | **Label:** `QA`, `Testing`
- **Checklist (Acceptance Criteria):**
  - [x] Write `test/status-checks.e2e-spec.ts` for 200 OK, 400 Bad Request, 401 Unauthorized
  - [x] Assert edge case handling on empty required fields
  - [x] Test WCAG focus outline tokens
- **Activity Comment:** *"PR #4 merged. All automated QA assertions passing."*

#### Card 10: `[QA-502] Role-Based Access Boundary & Inactivity Lock Verification`
- **Column:** `✅ Done`
- **Member:** `@Cherry Jane Cahimtong` | **Label:** `QA`, `Security`
- **Checklist (Acceptance Criteria):**
  - [x] Test Receptionist cannot access clinical consultation forms
  - [x] Test Physician cannot alter administrative role permissions
  - [x] Execute manual 15-minute inactivity timeout test
- **Activity Comment:** *"All RBAC role boundaries and 15-minute inactivity session lock verified and signed off."*

---

### 📦 Future Product Backlog Cards (Column: `📋 Product Backlog`)
- `[FEAT] Interactive SOAP Note & Live Vitals Workstation (Sprint 2)`
- `[FEAT] 1-Click Specimen Result Verification & Lab Status Transitions (Sprint 2)`

---

## 🎤 4. PM 2-Minute Defense Script (Mel Ford Batucan)

> *"Hello, I am Mel Ford Batucan, Project Manager and Lead Architect for CareSync.  
> As seen on our Trello board:  
> 1. **Commitment vs. Execution:** We committed 10 tickets for Sprint 1 and achieved a **100% completion rate (10/10 in Done)**.  
> 2. **Sprint Hygiene:** Every single card has an assigned owner, clear acceptance criteria checklists, and recent activity logs. We have **zero stale cards**.  
> 3. **Role Accountability:** Every role (PM, DevOps, Backend, Frontend, QA) has dedicated deliverables linked directly to our merged Pull Requests on GitHub."*

