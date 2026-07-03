import { supabase } from '@/lib/supabase';
import { RT_RW } from '@/types';

export class RTService {
  static async getAll(): Promise<RT_RW[]> {
    const { data, error } = await supabase
      .from('rt_rw')
      .select('*')
      .order('rt', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<RT_RW | null> {
    const { data, error } = await supabase
      .from('rt_rw')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async create(rt: Omit<RT_RW, 'id' | 'created_at'>): Promise<RT_RW> {
    const { data, error } = await supabase
      .from('rt_rw')
      .insert([rt])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, rt: Partial<RT_RW>): Promise<RT_RW> {
    const { data, error } = await supabase
      .from('rt_rw')
      .update(rt)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('rt_rw')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getByRT(rt: string): Promise<RT_RW | null> {
    const { data, error } = await supabase
      .from('rt_rw')
      .select('*')
      .eq('rt', rt)
      .single();

    if (error) throw error;
    return data;
  }
}