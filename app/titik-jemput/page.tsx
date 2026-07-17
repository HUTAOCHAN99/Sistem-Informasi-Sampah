'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MiniGmaps } from '@/components/maps/MiniGmaps';
import { RTService } from '@/services/rt.service';
import { RT_RW } from '@/types';
import { ArrowLeft, MapPin, Search, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TitikJemputPage() {
  const router = useRouter();
  const [data, setData] = useState<RT_RW[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    RTService.getAll()
      .then(setData)
      .catch(() => toast.error('Gagal memuat data titik jemput'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = data.filter(
    (item) =>
      item.rt.toLowerCase().includes(search.toLowerCase()) ||
      item.rw.toLowerCase().includes(search.toLowerCase()) ||
      (item.alamat_titik || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-[#0B3D2E] px-4 py-6 text-[#EAF6EE] sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/login')}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              aria-label="Kembali"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-lg font-bold">Titik Jemput Sampah</h1>
              <p className="text-xs text-[#EAF6EE]/75">Lokasi pengumpulan sampah di setiap RT/RW desa</p>
            </div>
          </div>
          <MapPin className="hidden h-8 w-8 text-[#EAF6EE]/60 sm:block" />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8">
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Cari RT, RW, atau alamat titik jemput..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            {data.length === 0 ? 'Belum ada data RT/RW.' : 'Tidak ditemukan hasil yang cocok.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((rt) => (
              <Card key={rt.id} className="overflow-hidden">
                <MiniGmaps latitude={rt.latitude} longitude={rt.longitude} label={`RT ${rt.rt}/RW ${rt.rw}`} />
                <CardContent className="p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      RT {rt.rt}/RW {rt.rw}
                    </h3>
                    {rt.latitude != null && rt.longitude != null && (
                      <a
                        href={`https://www.google.com/maps?q=${rt.latitude},${rt.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Buka Peta
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {rt.alamat_titik || 'Alamat titik jemput belum ditambahkan admin'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push('/login')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Login
        </Button>
      </div>
    </div>
  );
}
