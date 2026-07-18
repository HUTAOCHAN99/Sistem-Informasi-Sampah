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

  /**
   * @param rtRwId Jika diisi, hasil dibatasi hanya untuk RT/RW ini. Halaman
   * yang memanggil method ini langsung (bukan lewat hook useSampah) WAJIB
   * meneruskan rtRwId untuk akun dengan role 'rt', supaya data RT/RW lain
   * tidak ikut terekspor/tertampil (mis. halaman /laporan).
   */
  static async getByDateRange(startDate: string, endDate: string, rtRwId?: string): Promise<Sampah[]> {
    let query = supabase
      .from('sampah')
      .select(`
        *,
        rt_rw:rt_rw_id (*),
        kategori:kategori_id (*)
      `)
      .gte('tanggal', startDate)
      .lte('tanggal', endDate);
    if (rtRwId) query = query.eq('rt_rw_id', rtRwId);
    const { data, error } = await query.order('tanggal', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getToday(rtRwId?: string): Promise<Sampah[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getByDateRange(today, today, rtRwId);
  }

  static async getByMonth(month: number, year: number, rtRwId?: string): Promise<Sampah[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return this.getByDateRange(startDate, endDate, rtRwId);
  }

  static async getDateRange(rtRwId?: string): Promise<{ minDate: string | null; maxDate: string | null }> {
    let minFiltered = supabase.from('sampah').select('tanggal');
    if (rtRwId) minFiltered = minFiltered.eq('rt_rw_id', rtRwId);
    const { data: minData, error: minError } = await minFiltered
      .order('tanggal', { ascending: true })
      .limit(1)
      .maybeSingle();

    let maxFiltered = supabase.from('sampah').select('tanggal');
    if (rtRwId) maxFiltered = maxFiltered.eq('rt_rw_id', rtRwId);
    const { data: maxData, error: maxError } = await maxFiltered
      .order('tanggal', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (minError) throw minError;
    if (maxError) throw maxError;

    return {
      minDate: minData?.tanggal || null,
      maxDate: maxData?.tanggal || null,
    };
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