'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut, User, Home, Users, Calendar, Package, BarChart3, FileText, MessageSquareWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Data RT/RW', href: '/rt-rw', icon: Users },
  { name: 'Jadwal Setor', href: '/jadwal', icon: Calendar },
  { name: 'Data Sampah', href: '/sampah', icon: Package },
  { name: 'Pengaduan Warga', href: '/pengaduan', icon: MessageSquareWarning },
  { name: 'Statistik', href: '/statistik', icon: BarChart3 },
  { name: 'Laporan', href: '/laporan', icon: FileText },
];

export function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <div
          className={cn(
            "fixed inset-0 z-40 flex",
            sidebarOpen ? "pointer-events-auto" : "pointer-events-none"
          )}
        >
          <button
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "fixed inset-0 bg-black/50 transition-opacity",
              sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          />
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h1 className="text-xl font-bold text-primary">SampahDesa</h1>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="p-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5 text-gray-500" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 w-full rounded-lg hover:bg-gray-100 transition-colors text-red-600"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r">
          <div className="flex items-center h-16 px-4 border-b">
            <h1 className="text-xl font-bold text-primary">SampahDesa</h1>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <item.icon className="h-5 w-5 text-gray-500" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{user?.nama || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Guest'}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Top bar for mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold text-primary">SampahDesa</h1>
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </>
  );
}