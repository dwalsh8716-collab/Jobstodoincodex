#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: scripts/restore_sqlite.sh /path/to/backup.db" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB_PATH="${ROOT_DIR}/backend/data/interview_agent.db"
BACKUP_PATH="$1"
STAMP="$(date -u +"%Y%m%dT%H%M%SZ")"

if [ ! -f "${BACKUP_PATH}" ]; then
  echo "Backup file not found: ${BACKUP_PATH}" >&2
  exit 1
fi

mkdir -p "$(dirname "${DB_PATH}")" "${ROOT_DIR}/backups"

if [ -f "${DB_PATH}" ]; then
  cp "${DB_PATH}" "${ROOT_DIR}/backups/pre_restore_${STAMP}.db"
fi

cp "${BACKUP_PATH}" "${DB_PATH}"
echo "Restored ${BACKUP_PATH} to ${DB_PATH}"
