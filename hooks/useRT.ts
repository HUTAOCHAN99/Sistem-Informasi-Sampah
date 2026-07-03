import { useState, useEffect } from 'react';
import { RTService } from '@/services/rt.service';
import { RT_RW } from '@/types';

export function useRT() {
  const [data, setData] = useState<RT_RW[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await RTService.getAll();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data RT/RW');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createRT = async (rt: Omit<RT_RW, 'id' | 'created_at'>) => {
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