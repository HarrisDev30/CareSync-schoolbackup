# 🎓 CareSync Hospital EHR — Project Defense Master Deck & Speaking Script [PM-204]

**Target Duration**: 10 Minutes Total (7.5 Minutes Core Presentation + 2.5 Minutes Live Q&A)  
**Evaluation Standard**: Aligned with the 100-Point Senior Capstone / Enterprise Defense Rubric

---

## 👥 Team Rosters & Responsibilities

| Name | Role | Primary Presentation Focus | Time |
| :--- | :--- | :--- | :--- |
| **Mel Ford Batucan** | Project Manager & System Architect | Vision, Problem Statement, Agile Velocity & Rubric Alignment | 90 sec |
| **Harris Asani** | Lead Backend & Cryptographic Engineer | NestJS Architecture, AES-256-GCM, RBAC & E-Prescription APIs | 90 sec |
| **Edson Sode** | Senior Frontend Specialist | Anti-Glare UX, SOAP Clinical Workstation, 1-Click EHR Export & Audit Workbench | 90 sec |
| **Cherry Jane Cahimtong** | QA & Security Testing Lead | 52/52 Jest Tests, Role Boundary 403 Enforcement & Physiological DTO Validation | 90 sec |
| **Luziel Artiaga** | DevOps & Infrastructure Lead | Docker Orchestration, Neon Cloud Pooling, Redis Failover & Backup Pipelines | 90 sec |

---

## 🖥️ Slide-by-Slide Outline & Member Speaking Scripts

### Slide 1: Title & Executive Summary
* **Presenter**: `@Mel Ford Batucan` (0:00 – 0:45)
* **Visuals**: CareSync Logo, "Enterprise Hospital Information Management System", Team Member badges.
* **Speaking Script**:
  > *"Good morning, esteemed panel and guests. Today, our team proudly presents **CareSync**, an enterprise-grade Hospital Information and Clinical Workstation System designed for modern outpatient hospitals.*  
  > *In busy clinical environments, legacy EHR systems suffer from three fatal flaws: fragmented patient data, eye-straining UI glare that causes physician fatigue, and vulnerability to medical record tampering.*  
  > *CareSync resolves these challenges through an end-to-end, HIPAA-compliant platform uniting patient registration, interactive clinical SOAP notes, real-time diagnostic laboratory results, electronic prescriptions, and tamper-evident audit logging."*

---

### Slide 2: Project Management Velocity & Scrum Execution
* **Presenter**: `@Mel Ford Batucan` (0:45 – 1:30)
* **Visuals**: Sprints 1, 2, and 3 Trello Burn-down, 0 Stale Cards metric, 100% completion rate.
* **Speaking Script**:
  > *"As Project Manager, I directed our team across three rigorous 2-week sprints following strict Agile Scrum principles.*  
  > * *Sprint 1 established our core role-based access control (RBAC) and walk-in patient triage.*  
  > * *Sprint 2 delivered our interactive doctor SOAP workstation and 1-click diagnostic laboratory verification workbench.*  
  > * *Sprint 3 achieved complete clinical closure: e-prescriptions, formal discharge summaries, a secure patient portal, and 1-click certified medical record exports.*  
  > *Across all 3 sprints, our team maintained a 100% ticket completion velocity with zero stale cards. I now hand over to our Lead Backend Engineer, Harris Asani."*

---

### Slide 3: Backend Architecture & Cryptographic Engine
* **Presenter**: `@Harris Asani` (1:30 – 3:00)
* **Visuals**: Clean Architecture Diagram (Controllers $\rightarrow$ Services $\rightarrow$ TypeORM $\rightarrow$ Neon PostgreSQL), AES-256-GCM Cryptographic Envelope.
* **Speaking Script**:
  > *"Thank you, Mel Ford. On the backend, CareSync is powered by a high-performance NestJS framework backed by Neon serverless PostgreSQL with connection pooling and SSL encryption.*  
  > *Security and legal immutability were our primary architectural directives:*  
  > *1. **Field-Level Envelope Encryption**: Under HIPAA § 164.312, sensitive identifiers such as National IDs and phone numbers are encrypted at rest with AES-256-GCM using a cryptographically random 16-byte initialization vector and GCM authentication tag.*  
  > *2. **Dual-Mode Persistence**: Every clinical action—from booking appointments to issuing prescriptions—is backed by real-time REST endpoints with client-side local storage fallback to ensure zero clinical workflow stoppage even during network interruptions.*  
  > *3. **Malpractice Guard**: Once an attending physician signs and finalizes a SOAP consultation, the clinical record becomes strictly append-only. Any subsequent amendments require a legally justified correction record with doctor identification and SHA-256 hashing."*

---

### Slide 4: Frontend Clinical Workstation & Anti-Glare Experience
* **Presenter**: `@Edson Sode` (3:00 – 4:30)
* **Visuals**: Live Walkthrough on screen (`http://localhost:3001`): Receptionist 2-pane scheduler, Doctor Patient Chart, and 1-Click Export Modal.
* **Speaking Script**:
  > *"Thank you, Harris. As Frontend Specialist, I engineered the clinical user experience in Next.js 16 with Tailwind CSS and Shadcn UI.*  
  > *Three key design innovations distinguish CareSync:*  
  > *1. **Anti-Glare Clinical Canvas**: Hospital terminals are used under harsh fluorescent lights for 12-hour shifts. We eliminated pure-white glare by calibrating a clinical slate background (`#eaedf2`) and removing artificial subpixel smoothing to restore native Windows ClearType LCD contrast.*  
  > *2. **Tabbed Doctor Workstation**: Inside `/patients`, attending physicians have an integrated 5-tab workstation with real-time AHA vital evaluation (alerting to hypertensive crisis or hypoxia), ICD-10 quick diagnostic chips, and e-prescription formulary presets.*  
  > *3. **1-Click Certified Medical Record Export**: Both physicians and patients (via `/patient-portal`) can export an official, print-ready EHR document featuring hospital letterhead, diagnostic panels, active Rx, and a digital physician attestation stamp with document control numbering."*

---

### Slide 5: Quality Assurance, Security Boundaries & Test Suite
* **Presenter**: `@Cherry Jane Cahimtong` (4:30 – 6:00)
* **Visuals**: Jest Terminal Output showing **52/52 Passing Tests across 8 Test Suites**, Role boundary matrix (HTTP 403 Forbidden).
* **Speaking Script**:
  > *"Thank you, Edson. As QA Lead, my mission was to guarantee clinical software reliability and strict compliance with medical legal boundaries.*  
  > *CareSync features **52 automated unit and integration tests** passing with zero failures across 8 dedicated suites:*  
  > *1. **Role Boundary Enforcement**: Our tests assert that non-physician staff (such as Receptionists) are strictly barred with HTTP 403 Forbidden when attempting to diagnose, sign clinical notes, or prescribe medications.*  
  > *2. **Physiological DTO Boundary Validation**: We validated that vitals input adheres to strict physiological thresholds using NestJS `class-validator`. Biologically impossible readings (e.g. systolic BP > 300 or heart rate < 20) are automatically rejected with HTTP 400 Bad Request.*  
  > *3. **End-to-End Hospital Lifecycle Suite (`[QA-504]`)**: We authored a comprehensive lifecycle test verifying the complete outpatient journey from walk-in intake through diagnostic labs, e-prescriptions, and discharge.*  
  > *I now pass to our DevOps Lead, Luziel Artiaga."*

---

### Slide 6: DevOps, Cloud Orchestration & Disaster Recovery
* **Presenter**: `@Luziel Artiaga` (6:00 – 7:30)
* **Visuals**: Docker Compose Architecture, GitHub Actions CI Pipeline, Automated Database Backup Logs (`scripts/backup-db.ps1`).
* **Speaking Script**:
  > *"Thank you, Cherry Jane. In healthcare informatics, system downtime directly impacts patient safety. As DevOps Lead, I architected a zero-downtime deployment and disaster recovery infrastructure:*  
  > *1. **Multi-Container Docker Environment**: Our `docker-compose.yml` orchestrates PostgreSQL 16 and Redis 7 with integrated container healthchecks and automated initialization scripts.*  
  > *2. **Automated Backup & Pruning Utility**: We deployed automated database backup scripts with rolling 7-day retention. Every night, a timestamped snapshot is captured and archived, with older dumps safely pruned.*  
  > *3. **Continuous Integration Pipeline**: In GitHub Actions (`.github/workflows/ci.yml`), every push automatically checks out code, installs dependencies, verifies database migrations, and runs all 52 unit and security tests before code can merge into production.*  
  > *4. **Live Presentation Reset**: We authored a 1-command reset tool (`scripts/reset-demo.ps1`) ensuring our live presentation environment can be primed in under 5 seconds.*  
  > *Thank you. We are now eager to take questions from the panel."*

---

## 🎯 100-Point Grading Matrix Checklist

| Rubric Criterion | Weight | CareSync Project Evidence |
| :--- | :--- | :--- |
| **System Architecture & Clean Seams** | 20 pts | NestJS modular design, Next.js App Router, Clean separation of concern |
| **Security, HIPAA & Cryptography** | 20 pts | AES-256-GCM envelope encryption, Argon2id passwords, WORM Audit Logs |
| **Clinical UI/UX & Accessibility** | 20 pts | Anti-glare slate theme, WCAG AA contrast, 1-Click EHR export, zero layout shift |
| **Software Quality & Testing** | 20 pts | 52/52 passing Jest tests, RBAC 403 enforcement, physiological vitals bounds |
| **DevOps, CI/CD & Delivery** | 20 pts | Docker orchestration, automated DB backup rotation, GitHub Actions CI green |
| **Total Score** | **100 pts** | **Exemplary Performance Across All Dimensions** |
