'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PengaduanService } from '@/services/pengaduan.service';
import { PengaduanWarga } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';
import { MessageSquareWarning, Phone, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { getScopedRtRwId, canManageRtRw, AKSES_DITOLAK_MESSAGE } from '@/lib/rt-scope';

const STATUS_LABEL: Record<PengaduanWarga['status'], string> = {
  baru: 'Baru',
  diproses: 'Diproses',
  selesai: 'Selesai',
};

const STATUS_COLOR: Record<PengaduanWarga['status'], 'warning' | 'info' | 'success'> = {
  baru: 'warning',
  diproses: 'info',
  selesai: 'success',
};

export default function PengaduanPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<PengaduanWarga[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'semua' | PengaduanWarga['status']>('semua');
  const [selected, setSelected] = useState<PengaduanWarga | null>(null);
  const [catatan, setCatatan] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id, user?.rt_rw_id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const scopedRtRwId = getScopedRtRwId(user);
      const result = scopedRtRwId
        ? await PengaduanService.getByRT(scopedRtRwId)
        : await PengaduanService.getAll();
      setData(result);
    } catch (error) {
      toast.error('Gagal memuat data pengaduan');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (item: PengaduanWarga) => {
    setSelected(item);
    setCatatan(item.catatan_petugas || '');
  };

  const handleUpdateStatus = async (status: PengaduanWarga['status']) => {
    if (!selected) return;
    if (!canManageRtRw(user, selected.rt_rw_id)) {
      toast.error(AKSES_DITOLAK_MESSAGE);
      return;
    }
    setSaving(true);
    try {
      const updated = await PengaduanService.updateStatus(selected.id, status, catatan);
      setData((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setSelected(updated);
      toast.success('Status laporan diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui status');
    } finally {
      setSaving(false);
    }
  };

  const filteredData = filter === 'semua' ? data : data.filter((d) => d.status === filter);

  return (
    <div className="min-h-screen flex">
      <Navbar />

      <div className="flex-1 lg:ml-64 mt-16 lg:mt-0 p-4 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pengaduan Warga</h1>
            <p className="text-gray-500">Laporan sampah yang belum diangkut dari warga</p>
          </div>
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Status</SelectItem>
              <SelectItem value="baru">Baru</SelectItem>
              <SelectItem value="diproses">Diproses</SelectItem>
              <SelectItem value="selesai">Selesai</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              <MessageSquareWarning className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              Belum ada laporan untuk status ini
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredData.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openDetail(item)}
              >
                {item.foto_url && (
                  <img src={item.foto_url} alt="Foto laporan" className="w-full h-40 object-cover rounded-t-lg" />
                )}
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(STATUS_COLOR[item.status])}`}>
                      {STATUS_LABEL[item.status]}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{item.kode_tracking}</span>
                  </div>
                  <p className="text-sm font-medium line-clamp-2">{item.deskripsi}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{item.nama_pelapor} · RT {item.rt_rw?.rt}/RW {item.rt_rw?.rw}</span>
                    <span>{item.created_at && formatDate(item.created_at)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Detail Laporan</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {selected.foto_url && (
                <img src={selected.foto_url} alt="Foto laporan" className="w-full h-56 object-cover rounded-md" />
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Pelapor</p>
                  <p className="font-medium">{selected.nama_pelapor}</p>
                </div>
                <div>
                  <p className="text-gray-500">No. HP</p>
                  <p className="font-medium flex items-center gap-1">
                    {selected.no_hp ? (
                      <>
                        <Phone className="h-3.5 w-3.5" /> {selected.no_hp}
                      </>
                    ) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">RT/RW</p>
                  <p className="font-medium">RT {selected.rt_rw?.rt}/RW {selected.rt_rw?.rw}</p>
                </div>
                <div>
                  <p className="text-gray-500">Kode Tracking</p>
                  <p className="font-medium font-mono">{selected.kode_tracking}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 text-sm mb-1">Deskripsi</p>
                <p className="text-sm">{selected.deskripsi}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-500">Catatan untuk warga (opsional)</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Contoh: Sudah dijadwalkan pengangkutan besok pagi"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selected.status === 'baru' ? 'default' : 'outline'}
                  size="sm"
                  disabled={saving}
                  onClick={() => handleUpdateStatus('baru')}
                >
                  Tandai Baru
                </Button>
                <Button
                  variant={selected.status === 'diproses' ? 'default' : 'outline'}
                  size="sm"
                  disabled={saving}
                  onClick={() => handleUpdateStatus('diproses')}
                >
                  Tandai Diproses
                </Button>
                <Button
                  variant={selected.status === 'selesai' ? 'default' : 'outline'}
                  size="sm"
                  disabled={saving}
                  onClick={() => handleUpdateStatus('selesai')}
                >
                  Tandai Selesai
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
