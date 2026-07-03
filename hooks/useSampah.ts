import { useState, useEffect } from 'react';
import { SampahService } from '@/services/sampah.service';
import { Sampah } from '@/types';

export function useSampah() {
  const [data, setData] = useState<Sampah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await SampahService.getAll();
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
      const result = await SampahService.create(sampah);
      setData([result, ...data]);
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateSampah = async (id: string, sampah: Partial<Sampah>) => {
    try {
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
      await SampahService.delete(id);
      setData(data.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { data, loading, error, createSampah, updateSampah, deleteSampah, refresh: loadData };
}