import { useState, useEffect } from 'react';
import { SampahService } from '@/services/sampah.service';
import { Sampah } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { getScopedRtRwId, canManageRtRw, AKSES_DITOLAK_MESSAGE } from '@/lib/rt-scope';

export function useSampah() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<Sampah[]>([]);
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
        ? await SampahService.getByRT(scopedRtRwId)
        : await SampahService.getAll();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data sampah');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createSampah = async (sampah: Omit<Sampah, 'id' | 'created_at'>) => {
    try {
      const scopedRtRwId = getScopedRtRwId(user);
      // Akun RT tidak boleh mencatat data untuk RT/RW lain, apapun yang
      // dipilih di form: paksa selalu memakai rt_rw_id miliknya sendiri.
      const payload = scopedRtRwId ? { ...sampah, rt_rw_id: scopedRtRwId } : sampah;

      const result = await SampahService.create(payload);
      setData([result, ...data]);
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateSampah = async (id: string, sampah: Partial<Sampah>) => {
    try {
      const scopedRtRwId = getScopedRtRwId(user);
      if (scopedRtRwId) {
        const existing = await SampahService.getById(id);
        if (!existing || !canManageRtRw(user, existing.rt_rw_id)) {
          throw new Error(AKSES_DITOLAK_MESSAGE);
        }
        // Jangan biarkan RT memindahkan datanya ke RT/RW lain.
        sampah = { ...sampah, rt_rw_id: scopedRtRwId };
      }

      const result = await SampahService.update(id, sampah);
      setData(data.map(item => item.id === id ? result : item));
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteSampah = async (id: string) => {
    try {
      const scopedRtRwId = getScopedRtRwId(user);
      if (scopedRtRwId) {
        const existing = await SampahService.getById(id);
        if (!existing || !canManageRtRw(user, existing.rt_rw_id)) {
          throw new Error(AKSES_DITOLAK_MESSAGE);
        }
      }

      await SampahService.delete(id);
      setData(data.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { data, loading, error, createSampah, updateSampah, deleteSampah, refresh: loadData };
}
