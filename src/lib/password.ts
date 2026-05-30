import bcrypt from "bcryptjs";

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL || "admin@tamanbalaraja.rt";
  const passwordHash =
    process.env.ADMIN_PASSWORD_HASH ||
    "$2b$10$VQl5pWbFt6zIsvrnUUGNJOip320nebQsS6SxQYz3WUcrGToi1vRZK";

  return { email: email.toLowerCase(), passwordHash };
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const admin = getAdminCredentials();
  if (email.toLowerCase() !== admin.email) return false;
  return verifyPassword(password, admin.passwordHash);
}
