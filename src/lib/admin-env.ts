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

export function getAdminEnv(): { email: string; passwordHash: string } | null {
  if (cached) {
    const email = cached["ADMIN_EMAIL"];
    const passwordHash = cached["ADMIN_PASSWORD_HASH"];
    if (email && passwordHash) return { email: email.toLowerCase(), passwordHash };
    return null;
  }

  for (const filePath of ENV_PATHS) {
    if (!fs.existsSync(filePath)) continue;
    cached = parseEnvFile(fs.readFileSync(filePath, "utf8"));
    break;
  }

  if (!cached) return null;

  const email = cached["ADMIN_EMAIL"];
  const passwordHash = cached["ADMIN_PASSWORD_HASH"];
  if (!email || !passwordHash) return null;
  return { email: email.toLowerCase(), passwordHash };
}
