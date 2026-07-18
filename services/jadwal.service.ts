import { supabase } from '@/lib/supabase';
import { Jadwal } from '@/types';

export class JadwalService {
  static async getAll(): Promise<Jadwal[]> {
    const { data, error } = await supabase
      .from('jadwal')
      .select(`
        *,
        rt_rw:rt_rw_id (*)
      `)
      .order('tanggal', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Jadwal | null> {
    const { data, error } = await supabase
      .from('jadwal')
      .select(`
        *,
        rt_rw:rt_rw_id (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async create(jadwal: Omit<Jadwal, 'id' | 'created_at'>): Promise<Jadwal> {
    const { data, error } = await supabase
      .from('jadwal')
      .insert([jadwal])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, jadwal: Partial<Jadwal>): Promise<Jadwal> {
    const { data, error } = await supabase
      .from('jadwal')
      .update(jadwal)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('jadwal')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getByRT(rtId: string): Promise<Jadwal[]> {
    const { data, error } = await supabase
      .from('jadwal')
      .select(`
        *,
        rt_rw:rt_rw_id (*)
      `)
      .eq('rt_rw_id', rtId)
      .order('tanggal', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * @param rtRwId Jika diisi, hanya jadwal untuk RT/RW ini yang dikembalikan.
   */
  static async getToday(rtRwId?: string): Promise<Jadwal[]> {
    const today = new Date().toISOString().split('T')[0];
    let query = supabase
      .from('jadwal')
      .select(`
        *,
        rt_rw:rt_rw_id (*)
      `)
      .eq('tanggal', today);
    if (rtRwId) query = query.eq('rt_rw_id', rtRwId);
    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }
}