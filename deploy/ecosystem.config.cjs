/** @type {import('pm2').StartOptions} */
module.exports = {
  apps: [
    {
      name: "portal-rt",
      cwd: "/var/www/rtgenz01/standalone-release",
      script: "server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
      },
    },
  ],
};
