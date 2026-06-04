import bcrypt from "bcryptjs";
import { getAdminEnv } from "./admin-env";

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function getAdminCredentials(): { email: string; passwordHash: string } | null {
  return getAdminEnv();
}

export function isAdminConfigured(): boolean {
  return getAdminCredentials() !== null;
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const admin = getAdminCredentials();
  if (!admin) return false;
  if (email.toLowerCase() !== admin.email) return false;
  return verifyPassword(password, admin.passwordHash);
}
