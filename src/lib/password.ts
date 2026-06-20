import bcrypt from "bcryptjs";
import { getAdminAccounts } from "./admin-env";

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function getAdminCredentials(): { email: string; passwordHash: string } | null {
  return getAdminAccounts()[0] ?? null;
}

export function isAdminConfigured(): boolean {
  return getAdminAccounts().length > 0;
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const normalizedEmail = email.toLowerCase();
  const admin = getAdminAccounts().find((account) => account.email === normalizedEmail);
  if (!admin) return false;
  return verifyPassword(password, admin.passwordHash);
}
