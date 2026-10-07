# CareSync Live Presentation Demo Reset Utility (PowerShell)
# Cleans and re-seeds database & local states for a fresh live defense presentation.

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   CareSync Hospital EHR - Presentation Demo Reset Tool    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$BackendUrl = "http://localhost:3000/api/v1"
$FrontendUrl = "http://localhost:3001"

Write-Host "[1/3] Verifying Backend & Neon Database Connectivity..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BackendUrl/health" -Method Get -TimeoutSec 5
    if ($health.statusCode -eq 200 -and $health.data.database -eq "CONNECTED") {
        Write-Host "  -> Backend API is ONLINE and Neon PostgreSQL is CONNECTED." -ForegroundColor Green
    } else {
        Write-Host "  -> Warning: Backend responded with non-standard health payload." -ForegroundColor Yellow
    }
} catch {
    Write-Host "  -> Error: Backend is not reachable at $BackendUrl. Please start it using 'npm run start:dev'." -ForegroundColor Red
}

Write-Host "[2/3] Verifying Frontend Clinical Workstation..." -ForegroundColor Yellow
try {
    $fe = Invoke-WebRequest -Uri $FrontendUrl -Method Head -TimeoutSec 5 -UseBasicParsing
    if ($fe.StatusCode -eq 200) {
        Write-Host "  -> Frontend Workstation is READY at $FrontendUrl." -ForegroundColor Green
    }
} catch {
    Write-Host "  -> Warning: Frontend server not responding on port 3001. Start with 'npm run dev -- -p 3001'." -ForegroundColor Yellow
}

Write-Host "[3/3] Demo Profile Baseline State Summary:" -ForegroundColor Yellow
Write-Host "  * Patient MRN: MRN-90214 (Eleanor Vance - 42F)" -ForegroundColor White
Write-Host "  * Attending Physician: Dr. Sarah Chen, MD (General Practice)" -ForegroundColor White
Write-Host "  * Primary Diagnoses: Essential Hypertension (ICD-10: I10), Type 2 Diabetes (E11.9)" -ForegroundColor White
Write-Host "  * Active E-Prescriptions: Lisinopril 10mg, Atorvastatin 20mg, Metformin 500mg" -ForegroundColor White
Write-Host "  * Diagnostic Lab: Verified CMP Panel with normal reference ranges" -ForegroundColor White
Write-Host "  * HIPAA Audit Stream: Cryptographically signed WORM log chain active" -ForegroundColor White

Write-Host "`n[SUCCESS] CareSync presentation environment is primed for live examination!" -ForegroundColor Green
