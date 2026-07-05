import { supabase } from '@/lib/supabase';
import { PengaduanWarga } from '@/types';

const BUCKET_NAME = 'pengaduan';

function generateKodeTracking(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // tanpa karakter yang mirip (0/O, 1/I)
  let kode = '';
  for (let i = 0; i < 6; i++) {
    kode += chars[Math.floor(Math.random() * chars.length)];
  }
  return kode;
}

export class PengaduanService {
  // Dipakai di halaman publik /lapor
  static async uploadFoto(file: File): Promise<string> {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  // Dipakai di halaman publik /lapor
  static async create(
    pengaduan: Omit<PengaduanWarga, 'id' | 'created_at' | 'updated_at' | 'status' | 'kode_tracking'>
  ): Promise<PengaduanWarga> {
    const kode_tracking = generateKodeTracking();

    const { data, error } = await supabase
      .from('pengaduan_warga')
      .insert([{ ...pengaduan, kode_tracking, status: 'baru' }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Dipakai di halaman publik /lacak
  static async getByKodeTracking(kode: string): Promise<PengaduanWarga | null> {
    const { data, error } = await supabase
      .from('pengaduan_warga')
      .select(`*, rt_rw:rt_rw_id (*)`)
      .eq('kode_tracking', kode.toUpperCase().trim())
      .single();

    if (error) return null;
    return data;
  }

  // Dipakai di dashboard RT/Admin
  static async getAll(): Promise<PengaduanWarga[]> {
    const { data, error } = await supabase
      .from('pengaduan_warga')
      .select(`*, rt_rw:rt_rw_id (*)`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Dipakai di dashboard RT/Admin untuk update status & catatan
  static async updateStatus(
    id: string,
    status: PengaduanWarga['status'],
    catatan_petugas?: string
  ): Promise<PengaduanWarga> {
    const { data, error } = await supabase
      .from('pengaduan_warga')
      .update({ status, catatan_petugas, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('pengaduan_warga')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
