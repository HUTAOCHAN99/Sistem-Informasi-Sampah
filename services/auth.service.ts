import { User } from '@/types';

export class AuthService {
  static async login(email: string, password: string): Promise<{ user: User | null; error: any }> {
    try {
      // Verifikasi email/password dilakukan di server (app/api/auth/login)
      // menggunakan bcrypt, supaya password hash tidak pernah sampai ke browser.
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { user: null, error: data.error || 'Login gagal' };
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  }

  static async logout(): Promise<void> {
    // Implement logout logic
  }

  static getCurrentUser(): User | null {
    // Get user from session/localStorage
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  static setCurrentUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    // Simpan juga di cookie agar middleware (server-side) bisa mengenali sesi login
    document.cookie = `user=${encodeURIComponent(user.id)}; path=/; max-age=${60 * 60 * 24 * 7}`;
  }

  static clearCurrentUser(): void {
    localStorage.removeItem('user');
    document.cookie = 'user=; path=/; max-age=0';
  }
}
