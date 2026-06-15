#!/bin/bash

# PostgreSQL 数据库同步脚本 (从源同步到目标)
# 用法: ./scripts/db-sync.sh <source_url> <target_url>
# 或编辑脚本中的 URL 后直接运行

set -e

# ============================================
# 配置区域 - 请根据实际情况修改
# ============================================

# 源数据库 (从这里导出数据)
# 示例: postgresql://user:password@host:5432/database
SOURCE_DB_URL="${1:-$SOURCE_DATABASE_URL}"

# 目标数据库 (导入到这里)
# 示例: postgresql://user:password@host:5432/database
TARGET_DB_URL="${2:-$TARGET_DATABASE_URL}"

# ============================================

if [ -z "$SOURCE_DB_URL" ] || [ -z "$TARGET_DB_URL" ]; then
  echo "PostgreSQL 数据库同步工具"
  echo "=========================="
  echo ""
  echo "用法:"
  echo "  方式1: ./scripts/db-sync.sh <源数据库URL> <目标数据库URL>"
  echo "  方式2: 设置环境变量后运行"
  echo "         export SOURCE_DATABASE_URL='postgresql://...'"
  echo "         export TARGET_DATABASE_URL='postgresql://...'"
  echo "         ./scripts/db-sync.sh"
  echo ""
  echo "URL 格式: postgresql://user:password@host:port/database"
  echo ""
  echo "示例:"
  echo "  ./scripts/db-sync.sh \\"
  echo "    'postgresql://user:pass@prod-server:5432/mydb' \\"
  echo "    'postgresql://user:pass@localhost:5432/mydb'"
  exit 1
fi

# 解析源数据库 URL
SRC_USER=$(echo $SOURCE_DB_URL | sed -E 's|postgresql://([^:]+):.*|\1|')
SRC_PASS=$(echo $SOURCE_DB_URL | sed -E 's|postgresql://[^:]+:([^@]+)@.*|\1|')
SRC_HOST=$(echo $SOURCE_DB_URL | sed -E 's|postgresql://[^@]+@([^:]+):.*|\1|')
SRC_PORT=$(echo $SOURCE_DB_URL | sed -E 's|postgresql://[^@]+@[^:]+:([0-9]+)/.*|\1|')
SRC_NAME=$(echo $SOURCE_DB_URL | sed -E 's|postgresql://[^/]+/([^?]+).*|\1|')

# 解析目标数据库 URL
TGT_USER=$(echo $TARGET_DB_URL | sed -E 's|postgresql://([^:]+):.*|\1|')
TGT_PASS=$(echo $TARGET_DB_URL | sed -E 's|postgresql://[^:]+:([^@]+)@.*|\1|')
TGT_HOST=$(echo $TARGET_DB_URL | sed -E 's|postgresql://[^@]+@([^:]+):.*|\1|')
TGT_PORT=$(echo $TARGET_DB_URL | sed -E 's|postgresql://[^@]+@[^:]+:([0-9]+)/.*|\1|')
TGT_NAME=$(echo $TARGET_DB_URL | sed -E 's|postgresql://[^/]+/([^?]+).*|\1|')

echo "======================================"
echo "PostgreSQL 数据库同步"
echo "======================================"
echo ""
echo "源数据库:"
echo "  主机: $SRC_HOST:$SRC_PORT"
echo "  数据库: $SRC_NAME"
echo "  用户: $SRC_USER"
echo ""
echo "目标数据库:"
echo "  主机: $TGT_HOST:$TGT_PORT"
echo "  数据库: $TGT_NAME"
echo "  用户: $TGT_USER"
echo ""
echo "======================================"
echo ""
read -p "确认同步? 目标数据库的数据将被覆盖! (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "已取消"
  exit 0
fi

# 创建临时文件
TEMP_FILE=$(mktemp)
trap "rm -f $TEMP_FILE" EXIT

echo ""
echo "[1/2] 正在从源数据库导出..."
PGPASSWORD="$SRC_PASS" pg_dump \
  -h "$SRC_HOST" \
  -p "$SRC_PORT" \
  -U "$SRC_USER" \
  -d "$SRC_NAME" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  > "$TEMP_FILE"

DUMP_SIZE=$(ls -lh "$TEMP_FILE" | awk '{print $5}')
echo "导出完成, 大小: $DUMP_SIZE"

echo ""
echo "[2/2] 正在向目标数据库导入..."
PGPASSWORD="$TGT_PASS" psql \
  -h "$TGT_HOST" \
  -p "$TGT_PORT" \
  -U "$TGT_USER" \
  -d "$TGT_NAME" \
  --set ON_ERROR_STOP=off \
  -f "$TEMP_FILE" \
  2>&1 | grep -v "^NOTICE:" | grep -v "^DROP" | grep -v "does not exist" || true

echo ""
echo "======================================"
echo "同步完成!"
echo "======================================"
