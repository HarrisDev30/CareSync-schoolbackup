#!/bin/sh
# ==============================================================================
# CareSync Healthcare Platform — Automated Database Backup Utility
# Ticket: [DEV-103] Automated Database Migration Pipeline & Daily DB Backups
# ==============================================================================
set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
CONTAINER_NAME="${CONTAINER_NAME:-caresync-postgres}"
DB_USER="${DB_USER:-caresync}"
DB_NAME="${DB_NAME:-caresync_db}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/caresync_backup_${TIMESTAMP}.sql.gz"

echo "======================================================"
echo " Starting CareSync Automated Database Backup"
echo " Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo " Target DB: ${DB_NAME} (User: ${DB_USER})"
echo "======================================================"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

# Execute pg_dump inside container and pipe through gzip
echo "[1/3] Streaming compressed pg_dump from container '${CONTAINER_NAME}'..."
docker exec "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists | gzip > "${BACKUP_FILE}"

# Verify backup size
FILE_SIZE=$(wc -c < "${BACKUP_FILE}" 2>/dev/null || stat -c%s "${BACKUP_FILE}" 2>/dev/null || echo 0)
if [ "$FILE_SIZE" -le 100 ]; then
  echo "[-] ERROR: Backup file is empty or suspiciously small (${FILE_SIZE} bytes)."
  rm -f "${BACKUP_FILE}"
  exit 1
fi

echo "[2/3] Backup created successfully: ${BACKUP_FILE} (${FILE_SIZE} bytes)"

# Rotate old backups (delete files older than RETENTION_DAYS)
echo "[3/3] Enforcing backup retention policy (Keeping past ${RETENTION_DAYS} days)..."
find "${BACKUP_DIR}" -name "caresync_backup_*.sql.gz" -type f -mtime +"${RETENTION_DAYS}" -exec rm -f {} \;

echo "======================================================"
echo " CareSync Database Backup Completed Successfully"
echo "======================================================"
