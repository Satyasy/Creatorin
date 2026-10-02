const fs = require('fs');
const path = require('path');

const standaloneServer = path.join(__dirname, '.next', 'standalone', 'server.js');
const isStandalone = fs.existsSync(standaloneServer);

module.exports = {
  apps: [
    {
      name: 'creatorin',
      script: isStandalone ? '.next/standalone/server.js' : 'node_modules/next/dist/bin/next',
      args: isStandalone ? '' : 'start -p 3000',
      cwd: '/var/www/creatorin',
      instances: process.env.PM2_INSTANCES ? parseInt(process.env.PM2_INSTANCES, 10) : 4,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 5000,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
      error_file: '/var/log/creatorin/err.log',
      out_file: '/var/log/creatorin/out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
