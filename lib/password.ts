import bcrypt from 'bcryptjs';

// Jumlah salt round bcrypt. 10-12 adalah nilai standar yang aman untuk aplikasi web.
const SALT_ROUNDS = 10;

/**
 * Hash password polos menjadi bcrypt hash.
 * HANYA dipanggil di sisi server (API route / script), jangan pernah di client.
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Bandingkan password polos dengan bcrypt hash yang tersimpan di database.
 * HANYA dipanggil di sisi server (API route / script), jangan pernah di client.
 */
export async function verifyPassword(plainPassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash);
}

/**
 * Deteksi apakah sebuah string sudah berupa bcrypt hash (diawali $2a$, $2b$, atau $2y$).
 * Berguna untuk script migrasi supaya tidak menghash ulang data yang sudah di-hash.
 */
export function isBcryptHash(value: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}
