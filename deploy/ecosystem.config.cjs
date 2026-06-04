const fs = require("fs");

const ENV_FILE = "/var/www/rtgenz01/.env.local";

function loadEnvFile(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;

  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    value = value.replace(/\\\$/g, "$");
    env[key] = value;
  }

  return env;
}

const fileEnv = loadEnvFile(ENV_FILE);

/** @type {import('pm2').StartOptions} */
module.exports = {
  apps: [
    {
      name: "portal-rt",
      cwd: "/var/www/rtgenz01/standalone-release",
      script: "server.js",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
        ...fileEnv,
      },
    },
  ],
};
