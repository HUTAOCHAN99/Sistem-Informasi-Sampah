import { User } from '@/types';

/**
 * Akun dengan role 'rt' hanya boleh mengelola data pada RT/RW miliknya
 * sendiri (ditentukan oleh users.rt_rw_id). Akun 'admin' dan 'kades' tidak
 * dibatasi dan bisa melihat/mengelola seluruh data.
 */
export function isScopedToOwnRtRw(user: User | null | undefined): user is User & { rt_rw_id: string } {
  return !!user && user.role === 'rt' && !!user.rt_rw_id;
}

/**
 * Mengembalikan rt_rw_id yang harus dipakai untuk memfilter/mengunci data,
 * atau undefined jika user tidak dibatasi (admin/kades).
 */
export function getScopedRtRwId(user: User | null | undefined): string | undefined {
  return isScopedToOwnRtRw(user) ? user.rt_rw_id : undefined;
}

/**
 * Cek apakah user boleh mengelola (edit/hapus) sebuah record dengan
 * rt_rw_id tertentu.
 */
export function canManageRtRw(user: User | null | undefined, targetRtRwId?: string | null): boolean {
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'kades') return true;
  if (user.role === 'rt') return !!user.rt_rw_id && user.rt_rw_id === targetRtRwId;
  return false;
}

export const AKSES_DITOLAK_MESSAGE = 'Akses ditolak. Anda hanya dapat mengelola data RT/RW Anda sendiri.';
