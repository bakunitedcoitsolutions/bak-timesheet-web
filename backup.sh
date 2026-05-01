#!/bin/bash

# ==============================
# CONFIG
# ==============================
DB_URL="postgresql://postgres.xvawguznlgvlfygfexfz:u4jEd8Jx2zm2NOo0@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"

# Output file
DUMP_FILE="test_full_db_supabase_dump.sql"

# ==============================
# START BACKUP
# ==============================

echo "🚀 Starting Supabase backup..."

# Dump database (schemas only)
pg_dump "$DB_URL" \
  --schema=public \
  --schema=auth \
  --schema=storage \
  --schema=realtime \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  -f "$DUMP_FILE"

# Check if pg_dump succeeded
if [ $? -ne 0 ]; then
  echo "❌ Database dump failed"
  exit 1
fi

echo "✅ Database dump completed: $DUMP_FILE"

echo "🎉 Backup completed successfully!"