/**
 * Script migrasi satu-kali: hash semua password di tabel `users` yang
 * masih tersimpan dalam bentuk plaintext, menjadi bcrypt hash.
 *
 * Cara pakai:
 *   1. Isi .env.local dengan NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY
 *      (Service Role Key didapat dari Supabase Dashboard > Project Settings > API,
 *      JANGAN dipakai di kode client / NEXT_PUBLIC_*).
 *   2. Jalankan: npm run migrate:hash-passwords
 *
 * Script ini aman dijalankan berkali-kali (idempotent): password yang sudah
 * berupa bcrypt hash akan dilewati.
 */
import { createClient } from '@supabase/supabase-js';
import { hashPassword, isBcryptHash } from '../lib/password';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error(
    '❌ NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi di .env.local'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  const { data: users, error } = await supabase.from('users').select('id, email, password');

  if (error) {
    console.error('❌ Gagal mengambil data users:', error.message);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.log('Tidak ada user ditemukan.');
    return;
  }

  let migrated = 0;
  let skipped = 0;

  for (const user of users) {
    if (isBcryptHash(user.password)) {
      skipped++;
      continue;
    }

    const hashed = await hashPassword(user.password);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashed })
      .eq('id', user.id);

    if (updateError) {
      console.error(`❌ Gagal update user ${user.email}:`, updateError.message);
      continue;
    }

    console.log(`✅ Password di-hash untuk: ${user.email}`);
    migrated++;
  }

  console.log(`\nSelesai. ${migrated} password di-hash, ${skipped} sudah dalam bentuk hash.`);
}

main();
