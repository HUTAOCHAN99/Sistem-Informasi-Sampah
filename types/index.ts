export interface User {
  id: string;
  nama: string;
  email: string;
  password?: string;
  role: 'admin' | 'rt' | 'kades';
  // Hanya diisi untuk akun role 'rt': menghubungkan akun ke satu baris RT/RW
  // spesifik, supaya akun tersebut hanya bisa mengelola data RT/RW miliknya.
  rt_rw_id?: string | null;
  created_at?: string;
}

export interface RT_RW {
  id: string;
  rt: string;
  rw: string;
  jumlah_kk: number;
  ketua_rt: string;
  nomor_hp: string;
  // Titik jemput sampah
  latitude?: number | null;
  longitude?: number | null;
  alamat_titik?: string | null;
  created_at?: string;
}

export interface KategoriSampah {
  id: string;
  nama_kategori: string;
  created_at?: string;
}

export interface Jadwal {
  id: string;
  rt_rw_id: string;
  hari: string;
  tanggal: string;
  created_at?: string;
  rt_rw?: RT_RW;
}

export interface Sampah {
  id: string;
  rt_rw_id: string;
  kategori_id: string;
  berat: number;
  tanggal: string;
  petugas: string;
  keterangan?: string;
  created_at?: string;
  rt_rw?: RT_RW;
  kategori?: KategoriSampah;
}

export interface Statistik {
  total_sampah_hari: number;
  total_sampah_bulan: number;
  rt_sudah_setor: number;
  rt_belum_setor: number;
  grafik_per_jenis: GrafikData[];
  grafik_per_rt: GrafikData[];
  grafik_bulanan: GrafikData[];
}

export interface GrafikData {
  name: string;
  value: number;
}

export interface PengaduanWarga {
  id: string;
  kode_tracking: string;
  nama_pelapor: string;
  no_hp?: string;
  rt_rw_id: string;
  deskripsi: string;
  foto_url?: string;
  status: 'baru' | 'diproses' | 'selesai';
  catatan_petugas?: string;
  created_at?: string;
  updated_at?: string;
  rt_rw?: RT_RW;
}

export interface Laporan {
  id: string;
  tanggal: string;
  total_berat: number;
  jumlah_transaksi: number;
  rt_terbanyak: string;
  kategori_terbanyak: string;
}