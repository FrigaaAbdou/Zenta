import { compare, hash } from "bcryptjs";

const PASSWORD_SALT_ROUNDS = 10;

export async function hashAdminPassword(password: string) {
  return hash(password, PASSWORD_SALT_ROUNDS);
}

export async function verifyAdminPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}
