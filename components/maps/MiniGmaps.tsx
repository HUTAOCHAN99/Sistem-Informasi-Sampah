'use client';

import { MapPin } from 'lucide-react';

interface MiniGmapsProps {
  latitude?: number | null;
  longitude?: number | null;
  label?: string;
  className?: string;
}

/**
 * Menampilkan cuplikan kecil Google Maps untuk sebuah titik koordinat.
 * Tidak memerlukan API key karena memakai mode embed publik Google Maps.
 */
export function MiniGmaps({ latitude, longitude, label, className }: MiniGmapsProps) {
  const hasLocation =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !Number.isNaN(latitude) &&
    !Number.isNaN(longitude);

  if (!hasLocation) {
    return (
      <div
        className={`flex h-40 w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-muted/40 text-center ${className || ''}`}
      >
        <MapPin className="h-5 w-5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Titik jemput belum diatur</p>
      </div>
    );
  }

  const src = `https://www.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`;

  return (
    <div className={`overflow-hidden rounded-md border border-border ${className || ''}`}>
      <iframe
        title={label ? `Peta titik jemput ${label}` : 'Peta titik jemput'}
        src={src}
        width="100%"
        height="160"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
