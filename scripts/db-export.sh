#!/bin/bash

# PostgreSQL 数据库导出脚本
# 用法: ./scripts/db-export.sh [output_file]

set -e

# 默认输出文件名
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="${1:-pgsql-bak/db_backup_${TIMESTAMP}.sql.gz}"

# 从 .env 文件读取数据库连接信息
if [ -f ".env" ]; then
  export $(grep -E '^DATABASE_URL=' .env | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  echo "错误: 未找到 DATABASE_URL 环境变量"
  echo "请确保 .env 文件中包含 DATABASE_URL"
  exit 1
fi

# 解析 DATABASE_URL
# 格式: postgresql://user:password@host:port/database
DB_URL=$DATABASE_URL
DB_USER=$(echo $DB_URL | sed -E 's|postgresql://([^:]+):.*|\1|')
DB_PASS=$(echo $DB_URL | sed -E 's|postgresql://[^:]+:([^@]+)@.*|\1|')
DB_HOST=$(echo $DB_URL | sed -E 's|postgresql://[^@]+@([^:]+):.*|\1|')
DB_PORT=$(echo $DB_URL | sed -E 's|postgresql://[^@]+@[^:]+:([0-9]+)/.*|\1|')
DB_NAME=$(echo $DB_URL | sed -E 's|postgresql://[^/]+/([^?]+).*|\1|')

echo "======================================"
echo "PostgreSQL 数据库导出"
echo "======================================"
echo "主机: $DB_HOST"
echo "端口: $DB_PORT"
echo "数据库: $DB_NAME"
echo "用户: $DB_USER"
echo "输出文件: $OUTPUT_FILE"
echo "======================================"

# 确保输出目录存在
mkdir -p $(dirname "$OUTPUT_FILE")

# 导出数据库 (使用 pg_dump)
echo "正在导出数据库..."
PGPASSWORD="$DB_PASS" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  --verbose 2>&1 | gzip > "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
  FILE_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
  echo "======================================"
  echo "导出成功!"
  echo "文件: $OUTPUT_FILE"
  echo "大小: $FILE_SIZE"
  echo "======================================"
else
  echo "导出失败!"
  exit 1
fi
