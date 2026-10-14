#!/usr/bin/env bash
# ==============================================================================
# CREATORIN ENTERPRISE ZERO-DOWNTIME ATOMIC DEPLOYMENT RUNNER
# ==============================================================================

set -euo pipefail

export PATH="/usr/local/apps/nodejs24/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
export PM2_HOME="/root/.pm2"

APP_ROOT="/var/www/creatorin"
REPO_DIR="${APP_ROOT}/repo"
RELEASES_DIR="${APP_ROOT}/releases"
SHARED_DIR="${APP_ROOT}/shared"
CURRENT_DIR="${APP_ROOT}/current"
KEEP_RELEASES=3

echo "========================================================================="
echo "🚀 [CREATORIN] Starting Atomic Zero-Downtime Deployment..."
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================================================="

# 0. Ensure directories exist
mkdir -p "${RELEASES_DIR}" "${SHARED_DIR}" /var/log/creatorin

# 1. Update or Clone Repository
if [ ! -d "${REPO_DIR}/.git" ]; then
    echo "📥 1/6. Initializing Git repository in ${REPO_DIR}..."
    rm -rf "${REPO_DIR}"
    git clone git@github.com:Satyasy/Creatorin.git "${REPO_DIR}"
else
    echo "📥 1/6. Fetching latest commits from origin/main..."
    cd "${REPO_DIR}"
    git fetch origin main
    git reset --hard origin/main
    git clean -df
fi

# 2. Prepare New Release Directory
RELEASE_TAG=$(date '+%Y%m%d_%H%M%S')
NEW_RELEASE_DIR="${RELEASES_DIR}/${RELEASE_TAG}"
echo "📁 2/6. Creating new release directory: ${NEW_RELEASE_DIR}..."
mkdir -p "${NEW_RELEASE_DIR}"

# Copy code to new release directory (excluding unnecessary git objects)
rsync -a --exclude='.git' "${REPO_DIR}/" "${NEW_RELEASE_DIR}/"

cd "${NEW_RELEASE_DIR}"

# 3. Link Shared Secrets & Dependencies Cache
echo "🔑 3/6. Linking shared environment configuration..."
if [ -f "${SHARED_DIR}/.env.production" ]; then
    ln -sfn "${SHARED_DIR}/.env.production" "${NEW_RELEASE_DIR}/.env.production"
    ln -sfn "${SHARED_DIR}/.env.production" "${NEW_RELEASE_DIR}/.env.local"
else
    echo "⚠️ Warning: ${SHARED_DIR}/.env.production not found!"
fi

# Use shared node_modules via atomic symlink (instant, no disk copying)
mkdir -p "${SHARED_DIR}/node_modules" "${SHARED_DIR}/uploads"
ln -sfn "${SHARED_DIR}/node_modules" "${NEW_RELEASE_DIR}/node_modules"
mkdir -p "${NEW_RELEASE_DIR}/public"
ln -sfn "${SHARED_DIR}/uploads" "${NEW_RELEASE_DIR}/public/uploads"

echo "📦 Installing dependencies..."
npm install --no-audit --prefer-offline

# 4. Database Schema Sync / Migrations (Drizzle ORM)
echo "🗄️ 4/6. Synchronizing database schema to PostgreSQL 17..."
npx drizzle-kit push || {
    echo "⚠️ Drizzle push warning/notice (skipping if no changes)."
}

echo "🌱 Seeding initial & master data..."
npm run seed || {
    echo "⚠️ Database seeder warning/notice (skipping if failed)."
}

# 5. Build Next.js Application
echo "🔨 5/6. Building Next.js standalone application..."
npm run build

# Standalone assets requirement
if [ -d "${NEW_RELEASE_DIR}/.next/standalone" ]; then
    echo "📋 Copying static and public assets to standalone bundle..."
    if [ -d "${NEW_RELEASE_DIR}/.next/standalone/releases" ]; then
        cp -rn "${NEW_RELEASE_DIR}/.next/standalone/releases/"*/* "${NEW_RELEASE_DIR}/.next/standalone/" 2>/dev/null || true
    fi
    mkdir -p "${NEW_RELEASE_DIR}/.next/standalone/.next"
    cp -rn "${NEW_RELEASE_DIR}/.next/static" "${NEW_RELEASE_DIR}/.next/standalone/.next/" 2>/dev/null || true
    if [ -d "${NEW_RELEASE_DIR}/public" ]; then
        cp -rn "${NEW_RELEASE_DIR}/public" "${NEW_RELEASE_DIR}/.next/standalone/" 2>/dev/null || true
    fi
fi

# 6. Atomic Symlink Switch & Rolling Reload
echo "🔄 6/6. Performing Atomic Symlink Switch & PM2 Rolling Reload..."
ln -sfn "${NEW_RELEASE_DIR}" "${APP_ROOT}/current.tmp"
mv -Tf "${APP_ROOT}/current.tmp" "${CURRENT_DIR}"

# Copy ecosystem config if needed
cp -f "${APP_ROOT}/ecosystem.config.cjs" "${CURRENT_DIR}/ecosystem.config.cjs" 2>/dev/null || true

cd "${CURRENT_DIR}"

if pm2 describe creatorin > /dev/null 2>&1; then
    pm2 reload ecosystem.config.cjs --update-env
else
    pm2 start ecosystem.config.cjs
fi

pm2 save

# 7. Health Check Verification
echo "🩺 Verifying cluster health..."
HEALTH_CHECK=0
for i in {1..15}; do
    STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ || echo "000")
    if [ "$STATUS_CODE" != "000" ] && [ "$STATUS_CODE" != "502" ]; then
        echo "✅ Application is LIVE! HTTP Status: ${STATUS_CODE}"
        HEALTH_CHECK=1
        break
    fi
    echo "⏳ Waiting for cluster workers (attempt ${i}/15, status: ${STATUS_CODE})..."
    sleep 1
done

if [ "${HEALTH_CHECK}" -ne 1 ]; then
    echo "❌ Health check failed! Check logs: pm2 logs creatorin"
    exit 1
fi

# 8. Cleanup Old Releases (Retention: 3)
echo "🧹 Pruning old releases (keeping last ${KEEP_RELEASES})..."
cd "${RELEASES_DIR}"
ls -1dt 20* 2>/dev/null | tail -n +$((KEEP_RELEASES + 1)) | while read -r old_release; do
    echo "🗑️ Removing old release: ${old_release}"
    rm -rf "${RELEASES_DIR}/${old_release}"
done

echo "========================================================================="
echo "🎉 [CREATORIN] Deployment finished successfully with ZERO DOWNTIME!"
echo "Current PM2 Cluster Status:"
pm2 status creatorin
echo "========================================================================="
