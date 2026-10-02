#!/usr/bin/env bash
# ==============================================================================
# CREATORIN VPS PRODUCTION PROVISIONING & HIGH-AVAILABILITY DEPLOYMENT SCRIPT
# Target Domain: creatorin.my.id | VPS IP: 101.50.1.15 | Port: 10220
# ==============================================================================

set -euo pipefail

echo "========================================================================="
echo "🚀 STARTING CREATORIN HIGH-PERFORMANCE VPS DEPLOYMENT SETUP"
echo "========================================================================="

# 1. Update OS Packages
echo "📦 Updating system packages..."
if [ -f /etc/debian_version ]; then
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y && apt-get upgrade -y
  apt-get install -y curl wget git build-essential nginx certbot python3-certbot-nginx ufw htop jq
elif [ -f /etc/redhat-release ]; then
  yum update -y
  yum install -y curl wget git gcc-c++ make nginx certbot python3-certbot-nginx htop jq
fi

# 2. Configure CSF / Firewall (Ensure Port 10220, 80, 443 are permanently allowed)
echo "🛡️ Configuring Firewall & CSF..."
if [ -f /etc/csf/csf.conf ]; then
  echo "CSF detected. Whitelisting ports 10220, 80, 443..."
  # Add 10220 to TCP_IN and TCP_OUT if not present
  grep -q "10220" /etc/csf/csf.conf || sed -i 's/^TCP_IN = "/TCP_IN = "10220,/' /etc/csf/csf.conf
  grep -q "10220" /etc/csf/csf.conf || sed -i 's/^TCP_OUT = "/TCP_OUT = "10220,/' /etc/csf/csf.conf
  # Disable testing mode
  sed -i 's/^TESTING = "1"/TESTING = "0"/' /etc/csf/csf.conf
  csf -r || true
fi

# 3. Kernel & OS Tuning for High Traffic & Stress Testing (65k Concurrent Conns)
echo "⚡ Applying High-Availability Kernel & Network Tuning..."
cat << 'EOF' > /etc/sysctl.d/99-creatorin-tuning.conf
# High throughput network tuning
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.core.netdev_max_backlog = 100000
net.ipv4.tcp_fin_timeout = 15
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_intvl = 15
net.ipv4.tcp_keepalive_probes = 5

# File descriptors and memory
fs.file-max = 2097152
fs.inotify.max_user_watches = 524288
vm.swappiness = 10
EOF
sysctl -p /etc/sysctl.d/99-creatorin-tuning.conf || true

# Set file descriptor limits in /etc/security/limits.conf
cat << 'EOF' >> /etc/security/limits.conf
* soft nofile 65535
* hard nofile 65535
root soft nofile 65535
root hard nofile 65535
EOF

# 4. Install Node.js 22 LTS
echo "🟢 Installing Node.js 22 LTS..."
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d'.' -f1)" != "v22" ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs || yum install -y nodejs
fi
echo "Node version: $(node -v)"
echo "NPM version : $(npm -v)"

# 5. Install PM2 Globally
echo "⚙️ Installing PM2 Process Manager..."
npm install -g pm2
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 20M
pm2 set pm2-logrotate:retain 10

# 6. Setup Application Directory
APP_DIR="/var/www/creatorin"
echo "📁 Setting up project in ${APP_DIR}..."
mkdir -p "${APP_DIR}"

if [ ! -d "${APP_DIR}/.git" ]; then
  git clone https://github.com/Satyasy/creatorin.git "${APP_DIR}"
else
  cd "${APP_DIR}"
  git fetch origin main
  git reset --hard origin/main
fi

cd "${APP_DIR}"

# 7. Write Environment Variables
echo "🔐 Configuring Environment (.env.local)..."
cat << 'EOF' > "${APP_DIR}/.env.local"
NEXT_PUBLIC_APP_URL=https://creatorin.my.id
NEXT_PUBLIC_SUPABASE_URL=https://lhmmutetdnnbehsjdxwq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobW11dGV0ZG5uYmVoc2pkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNjQwODksImV4cCI6MjEwMjk0MDA4OX0.8mCafBW8QXsiTaEWUzK9-tKjUAXjrxioQeK0X4N-GNs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobW11dGV0ZG5uYmVoc2pkeHdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzM2NDA4OSwiZXhwIjoyMTAyOTQwMDg5fQ.CKV1s4uvaiwJjRKwKThoTJ_gY_SmGXI_DUlHDy_i7SY
DATABASE_URL=postgresql://postgres.lhmmutetdnnbehsjdxwq:CreatorinPostgres2026!Secure@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
EOF

# 8. Install Dependencies & Build Next.js
echo "🔨 Installing npm dependencies & compiling production build..."
npm ci || npm install
npm run build

# 9. Configure PM2 Cluster Configuration (ecosystem.config.cjs)
cat << 'EOF' > "${APP_DIR}/ecosystem.config.cjs"
module.exports = {
  apps: [
    {
      name: 'creatorin',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/var/www/creatorin',
      instances: 'max', // Cluster mode using all available CPU cores
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/creatorin/err.log',
      out_file: '/var/log/creatorin/out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
EOF

mkdir -p /var/log/creatorin

# 10. Start or Reload PM2
echo "🚀 Starting Creatorin Cluster via PM2..."
pm2 startOrReload "${APP_DIR}/ecosystem.config.cjs" --update-env
pm2 save
pm2 startup systemd -u root --hp /root || true

# 11. Configure High-Performance Nginx Reverse Proxy
echo "🌐 Configuring Nginx Reverse Proxy & HTTP/2..."
cat << 'EOF' > /etc/nginx/conf.d/creatorin.conf
upstream creatorin_upstream {
    server 127.0.0.1:3000 max_fails=3 fail_timeout=10s;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name creatorin.my.id www.creatorin.my.id 101.50.1.15;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    # Security Headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # Static Assets Cache (Immutable 1 Year)
    location /_next/static/ {
        alias /var/www/creatorin/.next/static/;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /public/ {
        alias /var/www/creatorin/public/;
        expires 30d;
        access_log off;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Proxy All Other Traffic to Next.js Cluster
    location / {
        proxy_pass http://creatorin_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 15s;
    }
}
EOF

# Remove default site if exists
rm -f /etc/nginx/sites-enabled/default || true

nginx -t
systemctl restart nginx
systemctl enable nginx

# 12. Automated Free SSL Setup (Let's Encrypt Certbot)
echo "🔒 Requesting SSL Certificate from Let's Encrypt..."
certbot --nginx -d creatorin.my.id --non-interactive --agree-tos --email admin@creatorin.my.id --redirect || true

echo "========================================================================="
echo "✅ CREATORIN DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "🌐 URL       : https://creatorin.my.id"
echo "📊 PM2 Status: Run 'pm2 status' or 'pm2 logs creatorin'"
echo "📈 Nginx Test: Run 'systemctl status nginx'"
echo "========================================================================="
