import fs from "fs";
import path from "path";

const ENV_PATHS = [
  path.join(process.cwd(), ".env.local"),
  path.join(process.cwd(), "..", ".env.local"),
  "/var/www/rtgenz01/.env.local",
];

function parseEnvFile(content: string): Record<string, string> {
  const env: Record<string, string> = {};

  for (const line of content.split("\n")) {
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

let cached: Record<string, string> | null = null;

function loadEnv(): Record<string, string> {
  if (cached) return cached;

  for (const filePath of ENV_PATHS) {
    if (!fs.existsSync(filePath)) continue;
    cached = parseEnvFile(fs.readFileSync(filePath, "utf8"));
    break;
  }

  return cached ?? {};
}

export function getEnvValue(key: string): string | null {
  const value = loadEnv()[key];
  return value || null;
}

export function getAdminAccounts(): { email: string; passwordHash: string }[] {
  const pairs: [string, string][] = [
    ["ADMIN_EMAIL", "ADMIN_PASSWORD_HASH"],
    ["ADMIN_EMAIL_2", "ADMIN_PASSWORD_HASH_2"],
  ];

  const accounts: { email: string; passwordHash: string }[] = [];

  for (const [emailKey, hashKey] of pairs) {
    const email = getEnvValue(emailKey);
    const passwordHash = getEnvValue(hashKey);
    if (email && passwordHash) {
      accounts.push({ email: email.toLowerCase(), passwordHash });
    }
  }

  return accounts;
}

export function getAdminEnv(): { email: string; passwordHash: string } | null {
  return getAdminAccounts()[0] ?? null;
}

export function getKeuanganPasswordHash(): string | null {
  return getEnvValue("KEUANGAN_PASSWORD_HASH");
}
