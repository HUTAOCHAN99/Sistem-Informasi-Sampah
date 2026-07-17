'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LogOut, User, Home, Users, Calendar, Package, BarChart3, FileText, MessageSquareWarning, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Data RT/RW', href: '/rt-rw', icon: Users },
  { name: 'Titik Jemput', href: '/dashboard/titik-jemput', icon: MapPin, adminOnly: true },
  { name: 'Jadwal Setor', href: '/jadwal', icon: Calendar },
  { name: 'Data Sampah', href: '/sampah', icon: Package },
  { name: 'Pengaduan Warga', href: '/pengaduan', icon: MessageSquareWarning },
  { name: 'Statistik', href: '/statistik', icon: BarChart3 },
  { name: 'Laporan', href: '/laporan', icon: FileText },
];

function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center justify-center rounded-full bg-white p-1 shadow-sm">
        <Image src="/icon-512.png" alt="SampahDesa" width={22} height={22} />
      </div>
      <h1 className={cn('text-lg font-bold tracking-tight', light ? 'text-[#EAF6EE]' : 'text-primary')}>
        SampahDesa
      </h1>
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const visibleNav = navigation.filter((item) => !item.adminOnly || user?.role === 'admin');

  return (
    <nav className="space-y-1">
      {visibleNav.map((item) => {
        const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-primary'
            )}
          >
            <item.icon className={cn('h-[18px] w-[18px]', active ? 'text-primary-foreground' : 'text-muted-foreground')} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

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
              "fixed inset-0 bg-[#0B3D2E]/50 transition-opacity",
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
              <Brand />
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4">
              <NavLinks onNavigate={() => setSidebarOpen(false)} />
              <button
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-[18px] w-[18px]" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r">
          <div className="flex items-center h-16 px-4 border-b">
            <Brand />
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <NavLinks />
          </div>
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{user?.nama || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user?.role || 'Guest'}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Top bar for mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#0B3D2E] border-b border-[#0F4732]">
        <div className="flex items-center justify-between h-16 px-4">
          <Brand light />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="text-[#EAF6EE] hover:bg-white/10 hover:text-white"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </>
  );
}