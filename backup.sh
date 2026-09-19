#!/bin/bash
# Automatically resolve to the directory this script lives in (works for both sportsvilla and sportsvilla-production)
cd "$(dirname "$0")"

echo "Starting cron backup at $(date)" >> logs/backup-cron.log
npx tsx scripts/backup_to_gdrive.ts >> logs/backup-cron.log 2>&1
EXIT_CODE=$?
echo "Backup finished at $(date) with exit code $EXIT_CODE" >> logs/backup-cron.log
exit $EXIT_CODE
