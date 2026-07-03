import { supabase } from '@/lib/supabase';
import { Statistik, GrafikData } from '@/types';

export class StatistikService {
  static async getDashboardData(): Promise<Statistik> {
    const today = new Date().toISOString().split('T')[0];
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const startMonth = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endMonth = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Get today's total
    const { data: todayData } = await supabase
      .from('sampah')
      .select('berat')
      .eq('tanggal', today);

    const totalToday = todayData?.reduce((sum, item) => sum + item.berat, 0) || 0;

    // Get month's total
    const { data: monthData } = await supabase
      .from('sampah')
      .select('berat')
      .gte('tanggal', startMonth)
      .lte('tanggal', endMonth);

    const totalMonth = monthData?.reduce((sum, item) => sum + item.berat, 0) || 0;

    // Get RT status
    const { data: allRT } = await supabase.from('rt_rw').select('id');
    const { data: setorRT } = await supabase
      .from('sampah')
      .select('rt_rw_id')
      .eq('tanggal', today);

    const rtSudahSetor = new Set(setorRT?.map(item => item.rt_rw_id) || []).size;
    const rtBelumSetor = (allRT?.length || 0) - rtSudahSetor;

    // Get charts data
    const grafikPerJenis = await this.getGrafikPerJenis(startMonth, endMonth);
    const grafikPerRT = await this.getGrafikPerRT(startMonth, endMonth);
    const grafikBulanan = await this.getGrafikBulanan(year);

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

  static async getGrafikPerJenis(startDate: string, endDate: string): Promise<GrafikData[]> {
    const { data } = await supabase
      .from('sampah')
      .select(`
        berat,
        kategori:kategori_id (nama_kategori)
      `)
      .gte('tanggal', startDate)
      .lte('tanggal', endDate);

    const grouped = data?.reduce((acc: any, item: any) => {
      const name = item.kategori?.nama_kategori || 'Lainnya';
      acc[name] = (acc[name] || 0) + item.berat;
      return acc;
    }, {});

    return Object.entries(grouped || {}).map(([name, value]) => ({ name, value: value as number }));
  }

  static async getGrafikPerRT(startDate: string, endDate: string): Promise<GrafikData[]> {
    const { data } = await supabase
      .from('sampah')
      .select(`
        berat,
        rt_rw:rt_rw_id (rt)
      `)
      .gte('tanggal', startDate)
      .lte('tanggal', endDate);

    const grouped = data?.reduce((acc: any, item: any) => {
      const name = `RT ${item.rt_rw?.rt || 'Unknown'}`;
      acc[name] = (acc[name] || 0) + item.berat;
      return acc;
    }, {});

    return Object.entries(grouped || {}).map(([name, value]) => ({ name, value: value as number }));
  }

  static async getGrafikBulanan(year: number): Promise<GrafikData[]> {
    const months = [];
    for (let month = 1; month <= 12; month++) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const { data } = await supabase
        .from('sampah')
        .select('berat')
        .gte('tanggal', startDate)
        .lte('tanggal', endDate);

      const total = data?.reduce((sum, item) => sum + item.berat, 0) || 0;
      months.push({
        name: new Date(year, month - 1).toLocaleString('id-ID', { month: 'short' }),
        value: total
      });
    }
    return months;
  }
}