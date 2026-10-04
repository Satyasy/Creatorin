module.exports = {
  apps: [
    {
      name: 'creatorin',
      script: './node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/var/www/creatorin/current',
      instances: process.env.PM2_INSTANCES ? parseInt(process.env.PM2_INSTANCES, 10) : 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
      error_file: '/var/log/creatorin/err.log',
      out_file: '/var/log/creatorin/out.log',
      time: true,
    },
  ],
};
