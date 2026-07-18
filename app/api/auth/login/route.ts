import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { verifyPassword, isBcryptHash } from '@/lib/password';

// Route ini berjalan di server (Node runtime), sehingga password mentah dan
// password hash dari database TIDAK PERNAH terkirim ke browser.
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const { data: user, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    if (!isBcryptHash(user.password)) {
      // Data lama yang belum dimigrasi ke bcrypt hash. Jalankan
      // `npm run migrate:hash-passwords` untuk memperbaiki ini.
      return NextResponse.json(
        { error: 'Akun belum dimigrasi ke format password baru. Hubungi admin.' },
        { status: 500 }
      );
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    // Jangan pernah kirim hash password ke client.
    const { password: _omit, ...safeUser } = user;

    return NextResponse.json({ user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
