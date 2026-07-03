import { useState, useEffect } from 'react';
import { JadwalService } from '@/services/jadwal.service';
import { Jadwal } from '@/types';

export function useJadwal() {
  const [data, setData] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await JadwalService.getAll();
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
      const result = await JadwalService.create(jadwal);
      setData([...data, result]);
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateJadwal = async (id: string, jadwal: Partial<Jadwal>) => {
    try {
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
      await JadwalService.delete(id);
      setData(data.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { data, loading, error, createJadwal, updateJadwal, deleteJadwal, refresh: loadData };
}
