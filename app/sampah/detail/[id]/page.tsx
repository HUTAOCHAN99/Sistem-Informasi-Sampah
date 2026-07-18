'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SampahService } from '@/services/sampah.service';
import { Sampah } from '@/types';
import { formatDate, formatWeight } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ArrowLeft, Pencil, Trash2, ShieldAlert } from 'lucide-react';
import { useSampah } from '@/hooks/useSampah';
import { useAuth } from '@/hooks/useAuth';

export default function DetailSampahPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { deleteSampah } = useSampah();
  const { user, loading: authLoading } = useAuth();
  const isScopedRT = user?.role === 'rt';

  const [sampah, setSampah] = useState<Sampah | null>(null);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (id && !authLoading) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, authLoading]);

  const loadData = async () => {
    try {
      setFetching(true);
      const result = await SampahService.getById(id);
      if (!result) {
        setNotFound(true);
        return;
      }
      if (isScopedRT && result.rt_rw_id !== user?.rt_rw_id) {
        setDenied(true);
        return;
      }
      setSampah(result);
    } catch (error) {
      console.error('Gagal memuat data sampah:', error);
      toast.error('Gagal memuat data sampah');
      setNotFound(true);
    } finally {
      setFetching(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      try {
        await deleteSampah(id);
        toast.success('Data sampah berhasil dihapus');
        router.push('/sampah');
      } catch (error) {
        toast.error('Gagal menghapus data sampah');
      }
    }
  };

  if (fetching || authLoading) {
    return (
      <div className="min-h-screen flex">
        <Navbar />
        <div className="flex-1 lg:ml-64 mt-16 lg:mt-0 p-4 lg:p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (denied) {
    return (
      <div className="min-h-screen flex">
        <Navbar />
        <div className="flex-1 lg:ml-64 mt-16 lg:mt-0 p-4 lg:p-8">
          <Button variant="ghost" className="mb-4" onClick={() => router.push('/sampah')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 flex flex-col items-center gap-2 text-center text-gray-500">
              <ShieldAlert className="h-8 w-8" />
              <p>Akses ditolak. Data ini bukan milik RT/RW Anda.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (notFound || !sampah) {
    return (
      <div className="min-h-screen flex">
        <Navbar />
        <div className="flex-1 lg:ml-64 mt-16 lg:mt-0 p-4 lg:p-8">
          <Button variant="ghost" className="mb-4" onClick={() => router.push('/sampah')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Data sampah tidak ditemukan</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: 'Tanggal', value: formatDate(sampah.tanggal) },
    { label: 'RT/RW', value: `RT ${sampah.rt_rw?.rt ?? '-'} / RW ${sampah.rt_rw?.rw ?? '-'}` },
    { label: 'Jenis Sampah', value: sampah.kategori?.nama_kategori ?? '-' },
    { label: 'Berat', value: formatWeight(sampah.berat) },
    { label: 'Petugas', value: sampah.petugas },
    { label: 'Keterangan', value: sampah.keterangan || '-' },
  ];

  return (
    <div className="min-h-screen flex">
      <Navbar />

      <div className="flex-1 lg:ml-64 mt-16 lg:mt-0 p-4 lg:p-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Detail Data Sampah</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-gray-100">
              {rows.map((row) => (
                <div key={row.label} className="grid grid-cols-3 gap-4 py-3">
                  <span className="text-sm font-medium text-gray-500">{row.label}</span>
                  <span className="col-span-2 text-sm text-gray-900 break-words">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                className="flex-1"
                onClick={() => router.push(`/sampah/edit/${sampah.id}`)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-red-600 hover:text-red-700"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
