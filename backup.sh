#!/bin/bash
# Move to the Next.js backend directory
cd "$(dirname "$0")"

# Execute the backup script using npx tsx
echo "Starting backup at $(date)" >> logs/backup-cron.log
npx tsx scripts/backup_to_gdrive.ts >> logs/backup-cron.log 2>&1
EXIT_CODE=$?
echo "Backup finished at $(date)" >> logs/backup-cron.log
exit $EXIT_CODE
