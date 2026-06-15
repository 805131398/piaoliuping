#!/bin/bash

# PostgreSQL 数据库恢复脚本
# 用法: ./scripts/db-restore.sh <backup_file> [target_database_url]

set -e

BACKUP_FILE="$1"
TARGET_DB_URL="$2"

if [ -z "$BACKUP_FILE" ]; then
  echo "用法: ./scripts/db-restore.sh <backup_file> [target_database_url]"
  echo "示例: ./scripts/db-restore.sh pgsql-bak/db_backup.sql.gz"
  echo "示例: ./scripts/db-restore.sh pgsql-bak/db_backup.sql.gz 'postgresql://user:pass@host:5432/db'"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "错误: 备份文件不存在: $BACKUP_FILE"
  exit 1
fi

# 如果没有提供目标数据库URL，从 .env 读取
if [ -z "$TARGET_DB_URL" ]; then
  if [ -f ".env" ]; then
    export $(grep -E '^DATABASE_URL=' .env | xargs)
    TARGET_DB_URL="$DATABASE_URL"
  fi
fi

if [ -z "$TARGET_DB_URL" ]; then
  echo "错误: 未提供目标数据库 URL"
  echo "请提供第二个参数或确保 .env 文件中包含 DATABASE_URL"
  exit 1
fi

# 解析数据库 URL
DB_USER=$(echo $TARGET_DB_URL | sed -E 's|postgresql://([^:]+):.*|\1|')
DB_PASS=$(echo $TARGET_DB_URL | sed -E 's|postgresql://[^:]+:([^@]+)@.*|\1|')
DB_HOST=$(echo $TARGET_DB_URL | sed -E 's|postgresql://[^@]+@([^:]+):.*|\1|')
DB_PORT=$(echo $TARGET_DB_URL | sed -E 's|postgresql://[^@]+@[^:]+:([0-9]+)/.*|\1|')
DB_NAME=$(echo $TARGET_DB_URL | sed -E 's|postgresql://[^/]+/([^?]+).*|\1|')

echo "======================================"
echo "PostgreSQL 数据库恢复"
echo "======================================"
echo "备份文件: $BACKUP_FILE"
echo "目标主机: $DB_HOST"
echo "目标端口: $DB_PORT"
echo "目标数据库: $DB_NAME"
echo "用户: $DB_USER"
echo "======================================"
echo ""
read -p "确认恢复? 这将覆盖目标数据库中的数据! (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "已取消"
  exit 0
fi

echo "正在恢复数据库..."

# 根据文件类型选择解压方式
if [[ "$BACKUP_FILE" == *.gz ]]; then
  gunzip -c "$BACKUP_FILE" | PGPASSWORD="$DB_PASS" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --set ON_ERROR_STOP=off \
    2>&1
else
  PGPASSWORD="$DB_PASS" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --set ON_ERROR_STOP=off \
    -f "$BACKUP_FILE" \
    2>&1
fi

if [ $? -eq 0 ]; then
  echo "======================================"
  echo "恢复成功!"
  echo "======================================"
else
  echo "恢复过程中有一些警告/错误，请检查输出"
fi
