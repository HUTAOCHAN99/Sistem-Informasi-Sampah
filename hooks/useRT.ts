import { useState, useEffect } from 'react';
import { RTService } from '@/services/rt.service';
import { RT_RW } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { getScopedRtRwId, canManageRtRw, AKSES_DITOLAK_MESSAGE } from '@/lib/rt-scope';

export function useRT() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<RT_RW[]>([]);
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
      if (scopedRtRwId) {
        // Akun RT hanya boleh melihat baris RT/RW miliknya sendiri.
        const own = await RTService.getById(scopedRtRwId);
        setData(own ? [own] : []);
      } else {
        const result = await RTService.getAll();
        setData(result);
      }
      setError(null);
    } catch (err) {
      setError('Gagal memuat data RT/RW');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createRT = async (rt: Omit<RT_RW, 'id' | 'created_at'>) => {
    if (getScopedRtRwId(user)) {
      // Akun RT tidak boleh menambah RT/RW baru; itu wewenang admin/kades.
      throw new Error(AKSES_DITOLAK_MESSAGE);
    }
    try {
      const result = await RTService.create(rt);
      setData([...data, result]);
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateRT = async (id: string, rt: Partial<RT_RW>) => {
    if (!canManageRtRw(user, id)) {
      throw new Error(AKSES_DITOLAK_MESSAGE);
    }
    try {
      const result = await RTService.update(id, rt);
      setData(data.map(item => item.id === id ? result : item));
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteRT = async (id: string) => {
    if (getScopedRtRwId(user)) {
      // Akun RT tidak boleh menghapus data RT/RW; itu wewenang admin/kades.
      throw new Error(AKSES_DITOLAK_MESSAGE);
    }
    try {
      await RTService.delete(id);
      setData(data.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { data, loading, error, createRT, updateRT, deleteRT, refresh: loadData };
}
