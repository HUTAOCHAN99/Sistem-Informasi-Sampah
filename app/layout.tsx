import type { Metadata, Viewport } from 'next';
import "./globals.css";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Sistem Informasi Pengelolaan Sampah Desa',
  description: 'Aplikasi pengelolaan sampah desa berbasis web',
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sampah Desa",
  },
};

export const viewport: Viewport = {
  themeColor: '#0B3D2E',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}