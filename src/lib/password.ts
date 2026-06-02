import bcrypt from "bcryptjs";

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function getAdminCredentials(): { email: string; passwordHash: string } | null {
  const email = process.env.ADMIN_EMAIL;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!email || !passwordHash) return null;
  return { email: email.toLowerCase(), passwordHash };
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
