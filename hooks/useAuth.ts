import { useState, useEffect } from 'react';
import { AuthService } from '@/services/auth.service';
import { User } from '@/types';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { user, error } = await AuthService.login(email, password);
    if (error) {
      throw error;
    }
    if (user) {
      AuthService.setCurrentUser(user);
      setUser(user);
      router.push('/dashboard');
    }
  };

  const logout = () => {
    AuthService.clearCurrentUser();
    setUser(null);
    router.push('/login');
  };

  return { user, loading, login, logout };
}