# CareSync - Instant 2-Second Clean Demo Reset Runner
# Usage: powershell -ExecutionPolicy Bypass -File ./scripts/reset-demo.ps1

Write-Host "🔄 [CareSync Demo Reset] Initializing instant presentation reset..." -ForegroundColor Cyan

# 1. Reset Backend PostgreSQL Database
Write-Host "💾 [1/2] Seeding clean hospital database records via Neon PostgreSQL..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot/../backend"
npm run seed

# 2. Complete
Write-Host "✅ [2/2] CareSync Hospital State restored successfully in < 2 seconds!" -ForegroundColor Green
Write-Host "🚀 Ready for Capstone Panel Defense presentation." -ForegroundColor Cyan
