import { useState, useEffect } from 'react';
import { JadwalService } from '@/services/jadwal.service';
import { Jadwal } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { getScopedRtRwId, canManageRtRw, AKSES_DITOLAK_MESSAGE } from '@/lib/rt-scope';

export function useJadwal() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id, user?.rt_rw_id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const scopedRtRwId = getScopedRtRwId(user);
      const result = scopedRtRwId
        ? await JadwalService.getByRT(scopedRtRwId)
        : await JadwalService.getAll();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data jadwal');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createJadwal = async (jadwal: Omit<Jadwal, 'id' | 'created_at'>) => {
    try {
      const scopedRtRwId = getScopedRtRwId(user);
      const payload = scopedRtRwId ? { ...jadwal, rt_rw_id: scopedRtRwId } : jadwal;

      const result = await JadwalService.create(payload);
      setData([...data, result]);
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateJadwal = async (id: string, jadwal: Partial<Jadwal>) => {
    try {
      const scopedRtRwId = getScopedRtRwId(user);
      if (scopedRtRwId) {
        const existing = await JadwalService.getById(id);
        if (!existing || !canManageRtRw(user, existing.rt_rw_id)) {
          throw new Error(AKSES_DITOLAK_MESSAGE);
        }
        jadwal = { ...jadwal, rt_rw_id: scopedRtRwId };
      }

      const result = await JadwalService.update(id, jadwal);
      setData(data.map(item => (item.id === id ? result : item)));
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteJadwal = async (id: string) => {
    try {
      const scopedRtRwId = getScopedRtRwId(user);
      if (scopedRtRwId) {
        const existing = await JadwalService.getById(id);
        if (!existing || !canManageRtRw(user, existing.rt_rw_id)) {
          throw new Error(AKSES_DITOLAK_MESSAGE);
        }
      }

      await JadwalService.delete(id);
      setData(data.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { data, loading, error, createJadwal, updateJadwal, deleteJadwal, refresh: loadData };
}
