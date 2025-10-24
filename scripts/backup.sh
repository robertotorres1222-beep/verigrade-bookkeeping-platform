#!/bin/bash

# Database backup script for VeriGrade platform
set -e

# Configuration
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="verigrade_backup_${DATE}.sql"
RETENTION_DAYS=30

# Database configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-verigrade}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-verigrade123}

echo "🗄️ Starting database backup..."

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

# Create database backup
echo "📦 Creating database backup..."
PGPASSWORD=${DB_PASSWORD} pg_dump \
  -h ${DB_HOST} \
  -p ${DB_PORT} \
  -U ${DB_USER} \
  -d ${DB_NAME} \
  --verbose \
  --clean \
  --no-owner \
  --no-privileges \
  --format=custom \
  --file=${BACKUP_DIR}/${BACKUP_FILE}

# Compress backup
echo "🗜️ Compressing backup..."
gzip ${BACKUP_DIR}/${BACKUP_FILE}
BACKUP_FILE="${BACKUP_FILE}.gz"

# Upload to S3 (if configured)
if [ ! -z "$AWS_S3_BUCKET" ]; then
  echo "☁️ Uploading backup to S3..."
  aws s3 cp ${BACKUP_DIR}/${BACKUP_FILE} s3://${AWS_S3_BUCKET}/backups/${BACKUP_FILE}
  
  # Set lifecycle policy for old backups
  aws s3 cp ${BACKUP_DIR}/${BACKUP_FILE} s3://${AWS_S3_BUCKET}/backups/${BACKUP_FILE} \
    --storage-class STANDARD_IA \
    --expires $(date -d "+30 days" --iso-8601)
fi

# Clean up old backups
echo "🧹 Cleaning up old backups..."
find ${BACKUP_DIR} -name "verigrade_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

# Verify backup
echo "✅ Verifying backup..."
if [ -f "${BACKUP_DIR}/${BACKUP_FILE}" ]; then
  BACKUP_SIZE=$(du -h ${BACKUP_DIR}/${BACKUP_FILE} | cut -f1)
  echo "✅ Backup created successfully: ${BACKUP_FILE} (${BACKUP_SIZE})"
else
  echo "❌ Backup failed!"
  exit 1
fi

# Send notification (if configured)
if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
  curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"✅ VeriGrade database backup completed successfully: ${BACKUP_FILE} (${BACKUP_SIZE})\"}" \
    ${SLACK_WEBHOOK_URL}
fi

echo "🎉 Backup process completed successfully!"


