import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const user = request.cookies.get('user')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');

  // If user is not logged in and trying to access protected route
  if (!user && !isLoginPage && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is logged in and trying to access login page
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/rt-rw/:path*',
    '/jadwal/:path*',
    '/sampah/:path*',
    '/statistik/:path*',
    '/laporan/:path*',
    '/pengaduan/:path*',
  ],
};