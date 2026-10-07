# 🛡️ CareSync DevOps & Infrastructure Defense Guide [DEV-104]

This document serves as the master engineering reference for the DevOps Lead (**John Loyd Balbuena**) and the CareSync engineering team (**Harris Asani**, **Edson Sode**, **Christian Jay Harris**) during project defense and technical Q&A.

---

## 🏗️ 1. Architecture Topology

```mermaid
flowchart TD
    Client["Client Browsers (Clinical Desks, In-Hospital Tablets)"] -->|HTTPS / Port 3001| NextJS["Frontend: Next.js 16 (App Router + Turbopack)"]
    NextJS -->|REST API / Bearer JWT| NestJS["Backend: NestJS 10 (Fastify / Express API)"]
    
    subgraph Data Tier
        NestJS -->|SSL Pooled Connection (5432)| Neon["PostgreSQL 16 (Neon Serverless Pooler)"]
        NestJS -->|RESP Protocol / Fallback| Redis["Redis 7 (In-Memory Cache & Session Lock)"]
    end
    
    subgraph Security & Storage
        NestJS -->|AES-256-GCM| CryptoEngine["Cryptographic Envelope & Field Level Encryption"]
        Neon -->|Daily Cron Volume Dump| BackupVolume["Automated DB Backups (7-Day Rolling Retention)"]
    end
```

---

## 🐳 2. Containerization & Orchestration

### Multi-Container Configuration (`docker-compose.yml`)
* **PostgreSQL 16 Alpine**:
  - Image: `postgres:16-alpine`
  - Container: `caresync-postgres`
  - Healthcheck: `pg_isready -U ${DB_USER} -d ${DB_NAME}` with 10s interval, 5s timeout, 5 retries.
  - Initial Schema Migration: Mounted at `/docker-entrypoint-initdb.d/init.sql`.
* **Redis 7 Alpine**:
  - Image: `redis:7-alpine`
  - Container: `caresync-redis`
  - Security: Protected with `--requirepass` password authentication.
  - Healthcheck: `redis-cli ping` probe.
  - Graceful Fallback: If Redis is temporarily unreachable, NestJS automatically activates an in-memory TTL cache without terminating the application.

---

## 🗄️ 3. Database Resilience & Disaster Recovery

### Automated Backups (`scripts/backup-db.ps1` & `scripts/backup-db.sh`)
* **Mechanism**: Creates timestamped PostgreSQL dumps (`caresync_backup_YYYYMMDD_HHMMSS.sql`).
* **Retention Policy**: 7-day automatic rolling rotation. Backups older than 7 days are automatically pruned to prevent disk exhaustion.
* **Restore Utility**: Single-command restore (`scripts/restore-db.ps1` & `scripts/restore-db.sh`) for rapid point-in-time recovery during catastrophic failures.

### Cloud Scalability (Neon PostgreSQL)
* Connection pooling via PgBouncer prevents connection starvation under high concurrent clinical load.
* Enforces TLS/SSL (`sslmode=require`) in transit, satisfying HIPAA Technical Safeguard 45 CFR § 164.312(e)(1).

---

## 🎤 4. Anticipated Panel Questions & High-Score Responses

### Q1: "What happens if the Redis container crashes during active hospital operation?"
> **Answer**: *"CareSync is engineered with high fault tolerance. Our `RedisService` wraps all cache operations in try-catch guards. If the Redis container goes down or network partition occurs, the backend automatically transitions to an in-memory fallback cache. Clinical consultation charting, patient intakes, and diagnostic workflows proceed uninterrupted without throwing unhandled 500 errors."*

### Q2: "How do you ensure zero data loss during database schema updates or migrations?"
> **Answer**: *"We maintain automated CI/CD schema verification in GitHub Actions (`.github/workflows/ci.yml`). Every commit validates that existing migrations run cleanly against an isolated test database. In production, our pre-deployment hook executes `scripts/backup-db.sh` or `scripts/backup-db.ps1` to take a full snapshot before executing TypeORM migrations. If a migration fails, the transaction automatically rolls back."*

### Q3: "How is Protected Health Information (PHI) secured at rest in the database?"
> **Answer**: *"Beyond disk-level encryption, CareSync implements application-level AES-256-GCM envelope encryption via our `CryptoService`. Sensitive patient fields (e.g. National ID, telephone numbers) are encrypted with a 32-byte cryptographically secure key and authenticated with a 16-byte GCM authentication tag before hitting PostgreSQL. Even if a raw database dump is compromised, patient identities remain unreadable."*

---

## 🚀 5. Live Presentation Quick-Start Commands

```powershell
# 1. Reset & Seed Live Database with Demo Data (Under 2 Seconds)
powershell -ExecutionPolicy Bypass -File .\scripts\reset-demo.ps1

# 2. Run Complete Backend Test Suite Verification (56/56 Tests Green)
cmd /c "npm test"

# 3. Verify Frontend Production Build (11/11 Static Pages Generated)
cd frontend
cmd /c "npm run build"
```
