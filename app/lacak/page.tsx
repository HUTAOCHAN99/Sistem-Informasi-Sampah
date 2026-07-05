'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PengaduanService } from '@/services/pengaduan.service';
import { PengaduanWarga } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';
import { Search, ArrowLeft, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_LABEL: Record<PengaduanWarga['status'], string> = {
  baru: 'Menunggu Diproses',
  diproses: 'Sedang Diproses',
  selesai: 'Selesai',
};

const STATUS_ICON: Record<PengaduanWarga['status'], any> = {
  baru: Clock,
  diproses: Loader2,
  selesai: CheckCircle2,
};

const STATUS_COLOR: Record<PengaduanWarga['status'], 'warning' | 'info' | 'success'> = {
  baru: 'warning',
  diproses: 'info',
  selesai: 'success',
};

function LacakContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [kode, setKode] = useState(searchParams.get('kode') || '');
  const [hasil, setHasil] = useState<PengaduanWarga | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (kodeInput: string) => {
    if (!kodeInput.trim()) return;
    setLoading(true);
    setNotFound(false);
    setHasil(null);
    try {
      const data = await PengaduanService.getByKodeTracking(kodeInput);
      if (data) {
        setHasil(data);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const kodeParam = searchParams.get('kode');
    if (kodeParam) handleSearch(kodeParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(kode);
  };

  const StatusIcon = hasil ? STATUS_ICON[hasil.status] : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-primary">
            Cek Status Laporan
          </CardTitle>
          <CardDescription className="text-center">
            Masukkan kode tracking yang Anda terima saat mengirim laporan
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kode">Kode Tracking</Label>
              <div className="flex gap-2">
                <Input
                  id="kode"
                  placeholder="Contoh: AB12CD"
                  value={kode}
                  onChange={(e) => setKode(e.target.value.toUpperCase())}
                  className="uppercase tracking-widest font-mono"
                  maxLength={6}
                  required
                />
                <Button type="submit" disabled={loading}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {loading && (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            {notFound && !loading && (
              <div className="text-center py-4 text-sm text-red-600 bg-red-50 rounded-md">
                Kode tracking tidak ditemukan. Periksa kembali kode Anda.
              </div>
            )}

            {hasil && !loading && (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(STATUS_COLOR[hasil.status])}`}>
                    {StatusIcon && <StatusIcon className="h-3.5 w-3.5" />}
                    {STATUS_LABEL[hasil.status]}
                  </span>
                  <span className="text-xs text-gray-400">
                    {hasil.created_at && formatDate(hasil.created_at)}
                  </span>
                </div>

                {hasil.foto_url && (
                  <img src={hasil.foto_url} alt="Foto laporan" className="w-full h-40 object-cover rounded-md" />
                )}

                <div>
                  <p className="text-xs text-gray-500 mb-1">RT/RW</p>
                  <p className="text-sm">RT {hasil.rt_rw?.rt}/RW {hasil.rt_rw?.rw}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Deskripsi</p>
                  <p className="text-sm">{hasil.deskripsi}</p>
                </div>

                {hasil.catatan_petugas && (
                  <div className="bg-blue-50 rounded-md p-3">
                    <p className="text-xs text-blue-600 font-medium mb-1">Catatan Petugas</p>
                    <p className="text-sm text-blue-900">{hasil.catatan_petugas}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => router.push('/lapor')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Form Laporan
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function LacakPage() {
  return (
    <Suspense fallback={null}>
      <LacakContent />
    </Suspense>
  );
}
