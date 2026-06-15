#!/usr/bin/env bash

# Standalone starter for Next.js (output: 'standalone')
# - Loads environment variables from .env.production by default
# - Ensures build output exists; builds if missing
# - Copies .next/static and public into the standalone tree
# - Starts the server via .next/standalone/server.js

set -Eeuo pipefail

# Resolve project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

# Read environment file if provided (default: .env.production)
ENV_FILE="${1:-.env.production}"
if [[ -f "${ENV_FILE}" ]]; then
  echo "[start-standalone] Loading env from ${ENV_FILE}"
  # Export all vars while sourcing
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
else
  echo "[start-standalone] Env file not found: ${ENV_FILE} (skipping)"
fi

# Validate required auth variables (will warn but continue)
missing=()
[[ -z "${AUTH_URL:-}" ]] && missing+=(AUTH_URL)
[[ -z "${AUTH_SECRET:-}" ]] && missing+=(AUTH_SECRET)
[[ -z "${AUTH_GITHUB_ID:-}" ]] && missing+=(AUTH_GITHUB_ID)
[[ -z "${AUTH_GITHUB_SECRET:-}" ]] && missing+=(AUTH_GITHUB_SECRET)
# AUTH_TRUST_HOST defaults to true if not set
AUTH_TRUST_HOST="${AUTH_TRUST_HOST:-true}"

if (( ${#missing[@]} > 0 )); then
  echo "[start-standalone] WARNING: Missing required env vars: ${missing[*]}"
  echo "  You can set them in ${ENV_FILE} or export before running this script."
fi

# Defaults for runtime
PORT="${PORT:-3000}"
HOSTNAME="${HOSTNAME:-0.0.0.0}"
NODE_ENV="${NODE_ENV:-production}"

# Ensure build exists
if [[ ! -f ".next/standalone/server.js" ]]; then
  echo "[start-standalone] Build not found. Running: npm run build"
  npm run build
fi

# Ensure standalone has static and public assets
mkdir -p .next/standalone/.next
if [[ -d ".next/static" ]]; then
  # Copy static assets
  rm -rf .next/standalone/.next/static || true
  cp -R .next/static .next/standalone/.next/static
  echo "[start-standalone] Copied .next/static -> .next/standalone/.next/static"
fi
if [[ -d "public" ]]; then
  # Copy public assets
  rm -rf .next/standalone/public || true
  cp -R public .next/standalone/public
  echo "[start-standalone] Copied public -> .next/standalone/public"
fi

# Summary
echo "[start-standalone] Starting server"
echo "  AUTH_URL=${AUTH_URL:-<unset>}"
echo "  AUTH_TRUST_HOST=${AUTH_TRUST_HOST}"
echo "  PORT=${PORT} HOSTNAME=${HOSTNAME} NODE_ENV=${NODE_ENV}"

# Start standalone server with env
exec env \
  AUTH_URL="${AUTH_URL:-}" \
  AUTH_TRUST_HOST="${AUTH_TRUST_HOST}" \
  AUTH_SECRET="${AUTH_SECRET:-}" \
  AUTH_GITHUB_ID="${AUTH_GITHUB_ID:-}" \
  AUTH_GITHUB_SECRET="${AUTH_GITHUB_SECRET:-}" \
  PORT="${PORT}" HOSTNAME="${HOSTNAME}" NODE_ENV="${NODE_ENV}" \
  node .next/standalone/server.js
