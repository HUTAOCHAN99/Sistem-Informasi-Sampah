import { supabase } from '@/lib/supabase';
import { User } from '@/types';

export class AuthService {
  static async login(email: string, password: string): Promise<{ user: User | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;
      if (!data) return { user: null, error: 'User not found' };

      // In production, use proper password hashing
      if (data.password !== password) {
        return { user: null, error: 'Invalid password' };
      }

      return { user: data, error: null };
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