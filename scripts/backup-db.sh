#!/bin/bash
# scripts/backup-db.sh
# 데이터베이스 백업 자동화 스크립트
# Phase 3에서 사용 (Production 마이그레이션 전 필수)

set -e

DATABASE_URL="${1:-$DATABASE_URL}"
BACKUP_DIR="${2:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

echo "🗄️  DateLog Backend 데이터베이스 백업"
echo ""

# DATABASE_URL 확인
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not provided"
  echo "Usage: $0 [DATABASE_URL] [BACKUP_DIR]"
  echo "Example: $0 postgresql://user:pass@host:5432/db ./backups"
  exit 1
fi

# pg_dump 명령어 확인
if ! command -v pg_dump &> /dev/null; then
  echo "❌ pg_dump command not found"
  echo "Please install PostgreSQL client tools"
  exit 1
fi

# 백업 디렉토리 생성
echo "Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# pg_dump 실행
echo "Starting database backup..."
echo "Target: $BACKUP_FILE"
echo ""

if pg_dump "$DATABASE_URL" > "$BACKUP_FILE" 2>&1; then
  echo "✅ Database dump completed"
else
  echo "❌ Database dump failed"
  exit 1
fi

# 백업 파일 크기 확인
if [ -f "$BACKUP_FILE" ]; then
  BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
  echo "Backup file size: $BACKUP_SIZE"
else
  echo "❌ Backup file not created"
  exit 1
fi

# 백업 파일 검증
echo ""
echo "Validating backup file..."
if head -n 5 "$BACKUP_FILE" | grep -q "PostgreSQL database dump"; then
  echo "✅ Backup file validated (PostgreSQL dump format)"
else
  echo "⚠️  Backup file validation warning (unexpected format)"
  echo "First 5 lines:"
  head -n 5 "$BACKUP_FILE"
fi

# 백업 파일 내용 요약
echo ""
echo "Backup summary:"
TABLE_COUNT=$(grep -c "CREATE TABLE" "$BACKUP_FILE" || echo "0")
echo "- Tables: $TABLE_COUNT"

INDEX_COUNT=$(grep -c "CREATE INDEX" "$BACKUP_FILE" || echo "0")
echo "- Indexes: $INDEX_COUNT"

# 오래된 백업 정리 (7일 이상)
echo ""
echo "Cleaning up old backups (>7 days)..."
OLD_BACKUPS=$(find "$BACKUP_DIR" -name "backup_*.sql" -mtime +7 2>/dev/null || echo "")

if [ -n "$OLD_BACKUPS" ]; then
  echo "$OLD_BACKUPS" | while read -r OLD_FILE; do
    echo "Deleting: $OLD_FILE"
    rm -f "$OLD_FILE"
  done
  echo "✅ Old backups cleaned"
else
  echo "No old backups to clean"
fi

# 완료
echo ""
echo "========================================="
echo "✅ Backup process completed successfully"
echo ""
echo "Backup details:"
echo "- File: $BACKUP_FILE"
echo "- Size: $BACKUP_SIZE"
echo "- Tables: $TABLE_COUNT"
echo "- Indexes: $INDEX_COUNT"
echo ""
echo "⚠️  IMPORTANT: Download and store this backup securely"
echo "   before proceeding with Production migration!"
