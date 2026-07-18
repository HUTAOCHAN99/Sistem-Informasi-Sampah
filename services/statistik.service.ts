import { supabase } from '@/lib/supabase';
import { Statistik, GrafikData } from '@/types';

export class StatistikService {
  /**
   * @param rtRwId Jika diisi, semua data dibatasi hanya untuk RT/RW ini
   * (dipakai untuk akun dengan role 'rt'). Jika undefined, data seluruh
   * desa ditampilkan (dipakai untuk admin/kades).
   */
  static async getDashboardData(rtRwId?: string): Promise<Statistik> {
    const today = new Date().toISOString().split('T')[0];
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const startMonth = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endMonth = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Get today's total
    let todayQuery = supabase
      .from('sampah')
      .select('berat')
      .eq('tanggal', today);
    if (rtRwId) todayQuery = todayQuery.eq('rt_rw_id', rtRwId);
    const { data: todayData } = await todayQuery;

    const totalToday = todayData?.reduce((sum, item) => sum + item.berat, 0) || 0;

    // Get month's total
    let monthQuery = supabase
      .from('sampah')
      .select('berat')
      .gte('tanggal', startMonth)
      .lte('tanggal', endMonth);
    if (rtRwId) monthQuery = monthQuery.eq('rt_rw_id', rtRwId);
    const { data: monthData } = await monthQuery;

    const totalMonth = monthData?.reduce((sum, item) => sum + item.berat, 0) || 0;

    // Get RT status. Akun yang dibatasi ke satu RT/RW hanya boleh tahu
    // status RT/RW-nya sendiri, bukan status atau jumlah RT/RW lain.
    let rtSudahSetor: number;
    let rtBelumSetor: number;
    if (rtRwId) {
      const { data: setorSendiri } = await supabase
        .from('sampah')
        .select('id')
        .eq('tanggal', today)
        .eq('rt_rw_id', rtRwId)
        .limit(1);
      const sudahSetor = (setorSendiri?.length || 0) > 0;
      rtSudahSetor = sudahSetor ? 1 : 0;
      rtBelumSetor = sudahSetor ? 0 : 1;
    } else {
      const { data: allRT } = await supabase.from('rt_rw').select('id');
      const { data: setorRT } = await supabase
        .from('sampah')
        .select('rt_rw_id')
        .eq('tanggal', today);

      rtSudahSetor = new Set(setorRT?.map(item => item.rt_rw_id) || []).size;
      rtBelumSetor = (allRT?.length || 0) - rtSudahSetor;
    }

    // Get charts data
    const grafikPerJenis = await this.getGrafikPerJenis(startMonth, endMonth, rtRwId);
    const grafikPerRT = await this.getGrafikPerRT(startMonth, endMonth, rtRwId);
    const grafikBulanan = await this.getGrafikBulanan(year, rtRwId);

    return {
      total_sampah_hari: totalToday,
      total_sampah_bulan: totalMonth,
      rt_sudah_setor: rtSudahSetor,
      rt_belum_setor: rtBelumSetor,
      grafik_per_jenis: grafikPerJenis,
      grafik_per_rt: grafikPerRT,
      grafik_bulanan: grafikBulanan,
    };
  }

  static async getGrafikPerJenis(startDate: string, endDate: string, rtRwId?: string): Promise<GrafikData[]> {
    let query = supabase
      .from('sampah')
      .select(`
        berat,
        kategori:kategori_id (nama_kategori)
      `)
      .gte('tanggal', startDate)
      .lte('tanggal', endDate);
    if (rtRwId) query = query.eq('rt_rw_id', rtRwId);
    const { data } = await query;

    const grouped = data?.reduce((acc: any, item: any) => {
      const name = item.kategori?.nama_kategori || 'Lainnya';
      acc[name] = (acc[name] || 0) + item.berat;
      return acc;
    }, {});

    return Object.entries(grouped || {}).map(([name, value]) => ({ name, value: value as number }));
  }

  static async getGrafikPerRT(startDate: string, endDate: string, rtRwId?: string): Promise<GrafikData[]> {
    let query = supabase
      .from('sampah')
      .select(`
        berat,
        rt_rw:rt_rw_id (rt)
      `)
      .gte('tanggal', startDate)
      .lte('tanggal', endDate);
    if (rtRwId) query = query.eq('rt_rw_id', rtRwId);
    const { data } = await query;

    const grouped = data?.reduce((acc: any, item: any) => {
      const name = `RT ${item.rt_rw?.rt || 'Unknown'}`;
      acc[name] = (acc[name] || 0) + item.berat;
      return acc;
    }, {});

    return Object.entries(grouped || {}).map(([name, value]) => ({ name, value: value as number }));
  }

  static async getAvailableYears(rtRwId?: string): Promise<number[]> {
    let query = supabase
      .from('sampah')
      .select('tanggal');
    if (rtRwId) query = query.eq('rt_rw_id', rtRwId);
    const { data, error } = await query;

    if (error) throw error;

    const years = new Set<number>();
    data?.forEach((item) => {
      const match = item.tanggal?.match(/^(\d{4})-/);
      if (match) {
        years.add(Number(match[1]));
      }
    });

    return Array.from(years).sort((a, b) => a - b);
  }

  static getRangeForPeriod(year: number, month?: number | null): { startDate: string; endDate: string } {
    if (month) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      return { startDate, endDate };
    }
    return { startDate: `${year}-01-01`, endDate: `${year}-12-31` };
  }

  static async getGrafikBulanan(year: number, rtRwId?: string): Promise<GrafikData[]> {
    const months = [];
    for (let month = 1; month <= 12; month++) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      let query = supabase
        .from('sampah')
        .select('berat')
        .gte('tanggal', startDate)
        .lte('tanggal', endDate);
      if (rtRwId) query = query.eq('rt_rw_id', rtRwId);
      const { data } = await query;

      const total = data?.reduce((sum, item) => sum + item.berat, 0) || 0;
      months.push({
        name: new Date(year, month - 1).toLocaleString('id-ID', { month: 'short' }),
        value: total
      });
    }
    return months;
  }
}