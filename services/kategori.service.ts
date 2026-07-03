import { supabase } from '@/lib/supabase';
import { KategoriSampah } from '@/types';

export class KategoriService {
  static async getAll(): Promise<KategoriSampah[]> {
    const { data, error } = await supabase
      .from('kategori_sampah')
      .select('*')
      .order('nama_kategori', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<KategoriSampah | null> {
    const { data, error } = await supabase
      .from('kategori_sampah')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async create(kategori: Omit<KategoriSampah, 'id' | 'created_at'>): Promise<KategoriSampah> {
    const { data, error } = await supabase
      .from('kategori_sampah')
      .insert([kategori])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, kategori: Partial<KategoriSampah>): Promise<KategoriSampah> {
    const { data, error } = await supabase
      .from('kategori_sampah')
      .update(kategori)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('kategori_sampah')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}