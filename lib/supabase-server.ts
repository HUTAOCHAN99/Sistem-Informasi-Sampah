import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Gunakan Service Role Key jika tersedia (direkomendasikan untuk operasi login di server,
// supaya tidak bergantung pada policy RLS yang mengizinkan SELECT * FROM users via anon key).
// Jika belum diset, fallback ke anon key agar proyek tetap berjalan.
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client ini HANYA boleh diimpor dari kode yang berjalan di server
// (API routes, server actions, script). Paket 'server-only' akan membuat
// build gagal jika ada yang mengimpornya dari komponen client.
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
