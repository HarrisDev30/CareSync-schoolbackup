# 🎙️ CareSync Backend Defense Master Guide
**Role: Backend Engineer — Harris Asani**  
**Course / Subject:** 1st Quarter Lab Progress Exam & Project Defense  
**Instructor:** Kristian Joy Arendain  
**Date:** September 16, 2026  

---

## 🎯 Target Grading Matrix Breakdown (100 Points)

| # | Category | Weight | Your Role Contribution |
|---|---|:---:|---|
| **1** | **Code Progress & Single Running Feature** | **40 pts** | Database connectivity (Neon Cloud PostgreSQL), valid HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`). |
| **2** | **Trello Hygiene & Git Velocity** | **30 pts** | Role accountability (`[BE-301]` / `[BE-302]` tickets), feature & fix PRs merged into `develop`. |
| **3** | **Code Quality & Architecture** | **20 pts** | NestJS Modular Monolith, Domain-Driven Design (DDD), AES-256-GCM PHI encryption, 0 `any` bypasses. |
| **4** | **Agency Presentation & Client Defense** | **10 pts** | Role-aligned walk-through & technical Q&A defense. |

---

## 🖥️ 1. Morning Pre-Flight Setup (10 Minutes Before Defense)

### Start Both Local Servers
Open PowerShell in the workspace:

1. **Backend Server**:
   ```powershell
   cd c:\Users\Asani_ELEC5\Documents\projects\caresync\backend
   node dist/main.js
   ```
   *Expected Output: `CareSync Backend running on: http://localhost:3000/api/v1`*

2. **Frontend App**:
   ```powershell
   cd c:\Users\Asani_ELEC5\Documents\projects\caresync\frontend
   npm run dev -- -p 3001
   ```
   *Expected Output: `▲ Next.js 16.3.5 (Turbopack) - Local: http://localhost:3001`*

### Have Exactly These 3 Browser Tabs Open:
- **Tab 1:** `http://localhost:3000/api/docs` *(Swagger Interactive API Documentation)*
- **Tab 2:** `http://localhost:3000/api/v1` *(Live Backend Root & Database Status Check)*
- **Tab 3:** `http://localhost:3001` *(CareSync Clinical Dashboard)*

---

## 🔄 2. Presentation Flow & Team Hand-Off

1. **PM (Mel Ford Batucan)** introduces sprint throughput ($\ge 80\%$ Done tickets, zero stale cards).
2. **Frontend (Edson Sode)** demonstrates the interactive UI, private `_components`, and WCAG focus rings.
3. **Edson hands off to you:**  
   > *"Now Harris, our Backend Engineer, will present our database connectivity, API status contracts, and security architecture."*
4. **YOU TAKE OVER SCREEN & MIC.**

---

## 🎬 3. Your Live Script & Action Walkthrough (~90–120 Seconds)

### Step 1: Architecture & Neon Cloud Database (30 Seconds)
> **What to show on screen:** Open **Tab 2** (`http://localhost:3000/api/v1`).

**Verbatim Script:**
> *"Thank you, Edson. Good day, Sir. I am Harris Asani, Backend Engineer for CareSync.*
> 
> *I architected our backend using **NestJS 11**, **TypeORM**, and **Redis**, structured as a **Modular Monolith** adhering strictly to Domain-Driven Design (DDD).*
> 
> *As you can see on our live root endpoint right here, our service is operational and connected live to our **Neon Cloud PostgreSQL** database over SSL. We have cleanly decoupled modules for Auth, Patients, Appointments, Consultations, Diagnostics, and Audit Logs."*

---

### Step 2: Live API Status Code Verification (Cat 1.3 - 45 Seconds)
> **What to show on screen:** Switch to **Tab 1** (`http://localhost:3000/api/docs`).

**Verbatim Script:**
> *"To fulfill Category 1.3, every route is documented through OpenAPI and enforced by global NestJS **ValidationPipes** and strict class-validator DTOs.*
> 
> *Let's demonstrate our API status contracts on `POST /api/v1/patients`:*

> **What to DO in Swagger:**
> 1. Expand **`POST /api/v1/patients`** ➔ Click **"Try it out"**.
> 2. Replace the request body with empty brackets `{}` ➔ Click **"Execute"**.
> 3. Point to the response: **`400 Bad Request`**.
>
> **Say this:**
> *"When a client submits malformed or missing required data, our validation layer catches it instantly and returns a clean `400 Bad Request` with structured field errors, protecting our database from corrupt records."*
>
> 4. Now paste a valid patient payload (or show the successful response).
>
> **Say this:**
> *"When valid data is provided, it returns `201 Created`, generating a unique Medical Record Number (MRN) and writing the record directly into Neon PostgreSQL."*

---

### Step 3: Clinical HIPAA Security & Testing (30 Seconds)
> **What to show on screen:** Scroll down in Swagger or show passing terminal unit tests.

**Verbatim Script:**
> *"For clinical data protection and compliance:*
> 1. ***AES-256-GCM Field Encryption:*** *All sensitive patient health information (PHI)—including national IDs, contact numbers, and home addresses—is encrypted at rest using AES-256-GCM (`iv:auth_tag:ciphertext`) before saving to PostgreSQL.*
> 2. ***15-Minute Session Inactivity Lock:*** *We implemented a custom `SessionLockGuard` with Redis sliding-window TTL that automatically locks inactive terminals after 15 minutes (`HTTP 423 Locked`).*
> 3. ***Testing & Reliability:*** *We have **32 automated unit tests across 6 test suites** with 100% pass rate covering our cryptography engine, Argon2id hashing, and clinical domain logic."*

---

### Step 4: Hand-Off to DevOps (5 Seconds)
**Verbatim Script:**
> *"I will now hand the presentation over to Luziel for our Git branching velocity and CI/CD pipelines."*

---

## 🔑 4. Swagger Quick-Reference (In Case You Need To Authorize)

If an endpoint returns `401 Unauthorized`:
1. In Swagger, go to **`POST /api/v1/auth/login`**.
2. Click **"Try it out"** and execute:
   ```json
   {
     "email": "maria.santos@caresync.org",
     "password": "Password123!"
   }
   ```
3. Copy the `accessToken`.
4. Click the green **"Authorize" 🔓** button at the top of Swagger, paste the token, and click **Authorize**.

---

## 🛡️ 5. Technical Q&A Defense Comebacks (Category 4.2 - 5 pts)

### Q1: *"Is your backend connected to a real database or just in-memory mocks?"*
> **Your Answer:**  
> *"It is connected live to a cloud Neon PostgreSQL database via TypeORM with SSL pooling. Every time a patient or lab order is created, an actual SQL INSERT query executes, and all records persist across restarts."*

### Q2: *"How do you handle unexpected server errors or database downtime?"*
> **Your Answer:**  
> *"We implemented a global `AllExceptionsFilter`. If an unhandled exception or database timeout occurs, it catches the error, securely logs the stack trace internally, and returns a sanitized JSON response with the proper HTTP status code so the client app never crashes."*

### Q3: *"How does your PHI encryption work?"*
> **Your Answer:**  
> *"In `CryptoService`, we use Node's `crypto` module with the `aes-256-gcm` cipher. For each encrypted field, we generate a fresh 16-byte initialization vector (IV) and store it in `iv:auth_tag:ciphertext` format. This ensures semantic security and prevents replay or tampering."*

### Q4: *"Why did you use NestJS instead of basic Express?"*
> **Your Answer:**  
> *"NestJS provides an enterprise architecture out of the box with Dependency Injection, modular domain separation, and native TypeScript decorators. It enforces strict boundaries between controllers, services, and repositories, making the codebase scalable and maintainable."*

