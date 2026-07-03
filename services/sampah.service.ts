import { supabase } from '@/lib/supabase';
import { Sampah } from '@/types';

export class SampahService {
  static async getAll(): Promise<Sampah[]> {
    const { data, error } = await supabase
      .from('sampah')
      .select(`
        *,
        rt_rw:rt_rw_id (*),
        kategori:kategori_id (*)
      `)
      .order('tanggal', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Sampah | null> {
    const { data, error } = await supabase
      .from('sampah')
      .select(`
        *,
        rt_rw:rt_rw_id (*),
        kategori:kategori_id (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async create(sampah: Omit<Sampah, 'id' | 'created_at'>): Promise<Sampah> {
    const { data, error } = await supabase
      .from('sampah')
      .insert([sampah])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, sampah: Partial<Sampah>): Promise<Sampah> {
    const { data, error } = await supabase
      .from('sampah')
      .update(sampah)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('sampah')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getByDateRange(startDate: string, endDate: string): Promise<Sampah[]> {
    const { data, error } = await supabase
      .from('sampah')
      .select(`
        *,
        rt_rw:rt_rw_id (*),
        kategori:kategori_id (*)
      `)
      .gte('tanggal', startDate)
      .lte('tanggal', endDate)
      .order('tanggal', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getToday(): Promise<Sampah[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getByDateRange(today, today);
  }

  static async getByMonth(month: number, year: number): Promise<Sampah[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return this.getByDateRange(startDate, endDate);
  }

  static async getByRT(rtId: string): Promise<Sampah[]> {
    const { data, error } = await supabase
      .from('sampah')
      .select(`
        *,
        rt_rw:rt_rw_id (*),
        kategori:kategori_id (*)
      `)
      .eq('rt_rw_id', rtId)
      .order('tanggal', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}