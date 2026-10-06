# ==============================================================================
# CareSync Healthcare Platform — Database Restore Utility (PowerShell)
# Ticket: [DEV-103] Automated Database Migration Pipeline & Daily DB Backups
# ==============================================================================
param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$BackupFile,
    [string]$ContainerName = "caresync-postgres",
    [string]$DbUser = "caresync",
    [string]$DbName = "caresync_db"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupFile)) {
    Write-Error "Backup file '$BackupFile' does not exist."
    exit 1
}

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " Restoring CareSync Database (Windows PowerShell)" -ForegroundColor Cyan
Write-Host " Source: $BackupFile" -ForegroundColor Gray
Write-Host " Target: $DbName (User: $DbUser)" -ForegroundColor Gray
Write-Host "======================================================" -ForegroundColor Cyan

Get-Content $BackupFile | docker exec -i $ContainerName psql -U $DbUser -d $DbName

Write-Host "Database restored successfully." -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
