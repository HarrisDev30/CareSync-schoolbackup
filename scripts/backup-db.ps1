# ==============================================================================
# CareSync Healthcare Platform — Automated Database Backup Utility (PowerShell)
# Ticket: [DEV-103] Automated Database Migration Pipeline & Daily DB Backups
# ==============================================================================
[CmdletBinding()]
param(
    [string]$BackupDir = "./backups",
    [string]$ContainerName = "caresync-postgres",
    [string]$DbUser = "caresync",
    [string]$DbName = "caresync_db",
    [int]$RetentionDays = 7
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " Starting CareSync Automated Database Backup (Windows)" -ForegroundColor Cyan
Write-Host " Timestamp: $(Get-Date -Format 'o')" -ForegroundColor Gray
Write-Host " Target DB: $DbName (User: $DbUser)" -ForegroundColor Gray
Write-Host "======================================================" -ForegroundColor Cyan

# Ensure backup directory exists
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$rawSqlFile = Join-Path $BackupDir "caresync_backup_$timestamp.sql"

# 1. Execute pg_dump inside container
Write-Host "[1/3] Executing pg_dump from container '$ContainerName'..." -ForegroundColor Yellow
docker exec $ContainerName pg_dump -U $DbUser -d $DbName --clean --if-exists > $rawSqlFile

if (-not (Test-Path $rawSqlFile) -or (Get-Item $rawSqlFile).Length -le 100) {
    Write-Error "Backup file is empty or suspiciously small. Aborting."
    if (Test-Path $rawSqlFile) { Remove-Item $rawSqlFile -Force }
    exit 1
}

$fileSize = (Get-Item $rawSqlFile).Length
Write-Host "[2/3] Backup created: $rawSqlFile ($fileSize bytes)" -ForegroundColor Green

# 2. Rotate old backups
Write-Host "[3/3] Enforcing backup retention policy (Retention: $RetentionDays days)..." -ForegroundColor Yellow
$cutoffDate = (Get-Date).AddDays(-$RetentionDays)
Get-ChildItem -Path $BackupDir -Filter "caresync_backup_*.sql*" | Where-Object { $_.LastWriteTime -lt $cutoffDate } | ForEach-Object {
    Write-Host "  Removing expired backup: $($_.Name)" -ForegroundColor DarkGray
    Remove-Item $_.FullName -Force
}

Write-Host "======================================================" -ForegroundColor Green
Write-Host " CareSync Database Backup Completed Successfully" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
