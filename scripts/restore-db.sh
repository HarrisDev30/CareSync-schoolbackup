#!/bin/sh
# ==============================================================================
# CareSync Healthcare Platform — Database Restore Utility
# Ticket: [DEV-103] Automated Database Migration Pipeline & Daily DB Backups
# ==============================================================================
set -e

BACKUP_FILE="$1"
CONTAINER_NAME="${CONTAINER_NAME:-caresync-postgres}"
DB_USER="${DB_USER:-caresync}"
DB_NAME="${DB_NAME:-caresync_db}"

if [ -z "${BACKUP_FILE}" ]; then
  echo "Usage: $0 <path_to_backup_file.sql.gz>"
  echo "Example: $0 ./backups/caresync_backup_20261006_120000.sql.gz"
  exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "[-] ERROR: Backup file '${BACKUP_FILE}' not found."
  exit 1
fi

echo "======================================================"
echo " Restoring CareSync Database from Backup"
echo " Source: ${BACKUP_FILE}"
echo " Target DB: ${DB_NAME} (User: ${DB_USER})"
echo "======================================================"

echo "[1/2] Streaming decompressed SQL into container '${CONTAINER_NAME}'..."
if echo "${BACKUP_FILE}" | grep -q "\.gz$"; then
  gzip -dc "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}"
else
  docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" < "${BACKUP_FILE}"
fi

echo "[2/2] Database restored successfully."
echo "======================================================"
