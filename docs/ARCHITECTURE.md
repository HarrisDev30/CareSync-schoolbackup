# CareSync Outpatient Hospital EHR — System Architecture Reference

## 1. System Architecture Blueprint

CareSync is an enterprise Outpatient Hospital Information and Clinical Workstation System designed to unify patient data flow across receptionists, general practitioners, diagnostic laboratories, specialists, and hospital administration (**Strictly Zero Telemedicine**).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PRESENTATION LAYER (Next.js 16)                       │
│   React 19 + TypeScript + Tailwind CSS + Shadcn UI + Lucide Icons           │
│   Anti-Glare Slate Theme (#eaedf2) + High-Contrast Typography               │
│   Routes: /patients, /appointments, /rooms, /labs, /analytics, /audit-logs   │
│   Accessibility: WCAG 2.1 AA (*:focus-visible, 100% keyboard nav)          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / REST API / Bearer JWT
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                        APPLICATION LAYER (NestJS 10)                        │
│   Modules: Auth, Patients, Consultations, Diagnostics, Analytics, AuditLogs │
│   Security: Scoped RBAC Guards, JWT Tokens, Argon2id Hashing, AES-256 Crypto│
│   Validation: Class-Validator DTO Validation Pipes (Physiological bounds)  │
│   Rate Limiting & Throttling: 100 req/min per IP                            │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ TypeORM / SQL / SSL Connection Pool
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                            DATA & STORAGE TIER                              │
│   PostgreSQL 16 (Neon Serverless Pooler): Relational storage with SSL       │
│   Redis 7 (In-Memory Cache): Session tracking, 15m inactivity lock cache    │
│   WORM Audit Engine: Tamper-evident append-only compliance logs             │
│   Disaster Recovery: Automated 7-day rolling backups (backup-db.ps1)        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Role-Based Access Control (RBAC) Matrix

| Resource / Action | Receptionist | Attending Physician | Laboratory Tech | Hospital Administrator |
| :--- | :---: | :---: | :---: | :---: |
| **Walk-In Registration & Intake** | ✅ | ✅ | ❌ | ✅ |
| **Department Wing Room Assignment** | ✅ | ✅ | ❌ | ✅ |
| **Clinical SOAP Charting & Vitals** | ❌ | ✅ | ❌ | ❌ |
| **STAT Diagnostic Lab Orders** | ❌ | ✅ | ❌ | ❌ |
| **Diagnostic Specimen Result Entry**| ❌ | ❌ | ✅ | ❌ |
| **E-Prescription & Formulary Dispense**| ❌ | ✅ | ❌ | ❌ |
| **Certified EHR Record Export** | ❌ | ✅ | ❌ | ✅ |
| **Tamper-Evident WORM Audit Logs** | ❌ | ❌ | ❌ | ✅ |
| **Executive Operations Analytics** | ❌ | ❌ | ❌ | ✅ |

---

## 3. Cryptographic & Data Integrity Layer

1. **AES-256-GCM Field-Level Envelope Encryption**:
   - Sensitive demographics (National ID, telephone) are encrypted before writing to PostgreSQL.
   - Utilizes cryptographically random 16-byte initialization vectors and GCM authentication tags.
2. **Argon2id Password Hashing**:
   - Memory-hard hashing algorithm resistant to GPU brute-force attacks.
3. **Medical Legal Immutability & Append-Only Auditing**:
   - Finalized consultations cannot be updated or deleted in place.
   - Any clinical modification is saved as an addendum referencing the parent consultation.
   - Write-Once-Read-Many (WORM) audit logs capture user ID, IP address, and timestamp for all actions.

---

## 4. Engineering Team Roles

- **Harris Asani**: Lead Backend & Cryptographic Engineer (NestJS, Argon2id, AES-256-GCM, RBAC Matrix, Analytics Aggregation APIs)
- **Edson Sode**: Senior Frontend Specialist (Next.js 16, Anti-Glare UX `#eaedf2`, 5-Tab Doctor Workstation, Department Wing Room Management, Executive Analytics Visualizer)
- **Christian Jay Harris**: QA, Security Testing & Medical Validation Lead (56/56 Jest Tests across 9 Suites, Role Boundary HTTP 403 Guards, Physiological DTO Validation, End-to-End Hospital Lifecycle Suite)
- **John Loyd Balbuena**: DevOps, Database Systems & Infrastructure Lead (Docker Compose, Neon PostgreSQL Connection Pooling, Automated 7-Day Backup Rotation `scripts/backup-db.ps1`, 1-Command Demo Reset `scripts/reset-demo.ps1`, CI/CD Pipeline)
