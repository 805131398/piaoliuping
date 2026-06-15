#!/bin/bash

# ========================================
# 首次部署脚本 - Language Learning
# ========================================

set -e

SERVICE_NAME="language-learning"
PROJECT_NAME="Language Learning"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "\n${GREEN}==>${NC} $1"
}

echo "========================================="
echo "  首次部署脚本 - $PROJECT_NAME"
echo "========================================="
echo ""

print_step "检查 Node.js 环境..."

if [ -d "$HOME/.fnm" ]; then
    export PATH="$HOME/.fnm:$PATH"
    if [ -x "$HOME/.fnm/fnm" ]; then
        eval "$("$HOME/.fnm/fnm" env --use-on-cd)" 2>/dev/null || true
    fi
fi

if ! command -v node &> /dev/null; then
    print_error "Node.js 未找到"
    exit 1
fi

print_success "Node.js 版本: $(node -v)"

print_step "检查环境变量配置..."

ENV_FILE=".env.production"
ENV_LOCAL=".env"

if [ -f "$ENV_FILE" ]; then
    print_success "找到生产环境配置: $ENV_FILE"
elif [ -f "$ENV_LOCAL" ]; then
    print_warning "未找到 $ENV_FILE，将使用 $ENV_LOCAL"
    ENV_FILE="$ENV_LOCAL"
else
    print_error "未找到环境配置文件"
    exit 1
fi

source "$ENV_FILE"

MISSING_VARS=()
[ -z "${DATABASE_URL:-}" ] && MISSING_VARS+=("DATABASE_URL")
[ -z "${AUTH_SECRET:-}" ] && MISSING_VARS+=("AUTH_SECRET")

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    print_error "缺少必要环境变量: ${MISSING_VARS[*]}"
    exit 1
fi

print_step "安装依赖..."

if [ -f "package-lock.json" ]; then
    npm ci
elif [ -f "pnpm-lock.yaml" ] && command -v pnpm &> /dev/null; then
    pnpm install --frozen-lockfile
else
    npm install
fi

print_step "执行数据库迁移..."
npx prisma generate
npx prisma migrate deploy || npx prisma db push

print_step "构建项目..."
npm run build

print_step "配置 PM2..."

if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

if pm2 describe "$SERVICE_NAME" &> /dev/null; then
    print_info "删除已存在服务: $SERVICE_NAME"
    pm2 delete "$SERVICE_NAME"
fi

PROJECT_DIR=$(pwd)
pm2 start npm --name "$SERVICE_NAME" --cwd "$PROJECT_DIR" -- start
pm2 save

echo ""
print_success "部署完成"
print_info "查看日志: pm2 logs $SERVICE_NAME"
print_info "重启服务: pm2 restart $SERVICE_NAME"
