#!/usr/bin/env bash
# ==============================================================================
# CREATORIN ZERO-DOWNTIME PRODUCTION DEPLOYMENT RUNNER
# ==============================================================================

set -euo pipefail

APP_DIR="/var/www/creatorin"
cd "${APP_DIR}"

echo "========================================================================="
echo "🚀 [CREATORIN] Starting Zero-Downtime Deployment..."
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================================================="

# 1. Pull Latest Code
echo "📥 1/5. Pulling latest commits from origin main..."
git fetch origin main
git reset --hard origin/main

# 2. Check Environment Variables
if [ -f "${APP_DIR}/.env.production" ]; then
  echo "📄 Found .env.production, ensuring symlink / copy..."
  cp -f "${APP_DIR}/.env.production" "${APP_DIR}/.env.local"
fi

# 3. Install Dependencies
echo "📦 2/5. Installing production dependencies..."
npm ci --prefer-offline || npm install

# 4. Compile Standalone Next.js Build
echo "🔨 3/5. Building Next.js application..."
npm run build

# 5. Prepare Standalone Assets (Next.js Standalone requirement)
if [ -d "${APP_DIR}/.next/standalone" ]; then
  echo "📋 4/5. Copying static & public assets into standalone bundle..."
  mkdir -p "${APP_DIR}/.next/standalone/.next"
  cp -r "${APP_DIR}/.next/static" "${APP_DIR}/.next/standalone/.next/" 2>/dev/null || true
  cp -r "${APP_DIR}/public" "${APP_DIR}/.next/standalone/" 2>/dev/null || true
fi

# 6. Zero-Downtime PM2 Rolling Reload
echo "🔄 5/5. Performing PM2 zero-downtime rolling reload..."
mkdir -p /var/log/creatorin

if pm2 describe creatorin > /dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi

pm2 save

echo "========================================================================="
echo "✅ [CREATORIN] Deployment finished successfully with ZERO DOWNTIME!"
echo "Current PM2 Cluster Status:"
pm2 status creatorin
echo "========================================================================="
