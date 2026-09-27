#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB_PATH="${ROOT_DIR}/backend/data/interview_agent.db"
BACKUP_DIR="${ROOT_DIR}/backups"
STAMP="$(date -u +"%Y%m%dT%H%M%SZ")"

mkdir -p "${BACKUP_DIR}"

if [ ! -f "${DB_PATH}" ]; then
  echo "No SQLite database found at ${DB_PATH}" >&2
  exit 1
fi

sqlite3 "${DB_PATH}" ".backup '${BACKUP_DIR}/interview_agent_${STAMP}.db'"
echo "${BACKUP_DIR}/interview_agent_${STAMP}.db"
