'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MiniGmaps } from '@/components/maps/MiniGmaps';
import { useAuth } from '@/hooks/useAuth';
import { useRT } from '@/hooks/useRT';
import { RT_RW } from '@/types';
import { MapPin, ExternalLink, Save, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

type FormState = {
  latitude: string;
  longitude: string;
  alamat_titik: string;
};

function toFormState(rt: RT_RW): FormState {
  return {
    latitude: rt.latitude != null ? String(rt.latitude) : '',
    longitude: rt.longitude != null ? String(rt.longitude) : '',
    alamat_titik: rt.alamat_titik || '',
  };
}

export default function KelolaTitikJemputPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { data, loading, updateRT } = useRT();

  const [forms, setForms] = useState<Record<string, FormState>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const next: Record<string, FormState> = {};
    data.forEach((rt) => {
      next[rt.id] = toFormState(rt);
    });
    setForms(next);
  }, [data]);

  useEffect(() => {
    if (!authLoading && user && user.role !== 'admin') {
      toast.error('Hanya admin yang dapat mengelola titik jemput');
      router.push('/dashboard');
    }
  }, [authLoading, user, router]);

  const handleChange = (id: string, field: keyof FormState, value: string) => {
    setForms((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (rt: RT_RW) => {
    const form = forms[rt.id];
    if (!form) return;

    const latTrim = form.latitude.trim();
    const lngTrim = form.longitude.trim();

    if ((latTrim && !lngTrim) || (!latTrim && lngTrim)) {
      toast.error('Isi latitude dan longitude keduanya, atau kosongkan keduanya');
      return;
    }

    const latitude = latTrim ? Number(latTrim) : null;
    const longitude = lngTrim ? Number(lngTrim) : null;

    if ((latTrim && Number.isNaN(latitude)) || (lngTrim && Number.isNaN(longitude))) {
      toast.error('Latitude/longitude harus berupa angka');
      return;
    }

    setSavingId(rt.id);
    try {
      await updateRT(rt.id, {
        latitude,
        longitude,
        alamat_titik: form.alamat_titik.trim() || null,
      });
      toast.success(`Titik jemput RT ${rt.rt}/RW ${rt.rw} berhasil disimpan`);
    } catch (error) {
      console.error(error);
      toast.error('Gagal menyimpan titik jemput');
    } finally {
      setSavingId(null);
    }
  };

  if (authLoading || (user && user.role !== 'admin')) {
    return (
      <div className="min-h-screen flex bg-secondary/40">
        <Navbar />
        <div className="flex-1 lg:ml-64 mt-16 lg:mt-0 p-4 lg:p-8 flex items-center justify-center">
          {authLoading ? (
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
              <ShieldAlert className="h-8 w-8" />
              <p>Akses ditolak. Halaman ini khusus admin.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-secondary/40">
      <Navbar />

      <div className="flex-1 lg:ml-64 mt-16 lg:mt-0 p-4 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Titik Jemput Sampah</h1>
            <p className="text-sm text-muted-foreground">
              Atur lokasi Google Maps titik jemput sampah untuk setiap RT/RW
            </p>
          </div>
          <a href="/titik-jemput" target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Lihat Halaman Publik
            </Button>
          </a>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : data.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            Belum ada data RT/RW. Tambahkan RT/RW terlebih dahulu di menu Data RT/RW.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {data.map((rt) => {
              const form = forms[rt.id] || toFormState(rt);
              const previewLat = form.latitude.trim() ? Number(form.latitude) : rt.latitude;
              const previewLng = form.longitude.trim() ? Number(form.longitude) : rt.longitude;

              return (
                <Card key={rt.id} className="border-border/70">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <MapPin className="h-4 w-4 text-primary" />
                      RT {rt.rt}/RW {rt.rw}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <MiniGmaps latitude={previewLat} longitude={previewLng} label={`RT ${rt.rt}/RW ${rt.rw}`} />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor={`lat-${rt.id}`}>Latitude</Label>
                        <Input
                          id={`lat-${rt.id}`}
                          placeholder="-7.123456"
                          value={form.latitude}
                          onChange={(e) => handleChange(rt.id, 'latitude', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`lng-${rt.id}`}>Longitude</Label>
                        <Input
                          id={`lng-${rt.id}`}
                          placeholder="109.123456"
                          value={form.longitude}
                          onChange={(e) => handleChange(rt.id, 'longitude', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`alamat-${rt.id}`}>Keterangan / Alamat Titik</Label>
                      <Input
                        id={`alamat-${rt.id}`}
                        placeholder="Contoh: Pos ronda RT 01, depan balai warga"
                        value={form.alamat_titik}
                        onChange={(e) => handleChange(rt.id, 'alamat_titik', e.target.value)}
                      />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Tips: buka Google Maps, klik kanan lokasi yang diinginkan, lalu salin koordinat yang muncul (format: latitude, longitude).
                    </p>

                    <Button
                      className="w-full"
                      onClick={() => handleSave(rt)}
                      disabled={savingId === rt.id}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {savingId === rt.id ? 'Menyimpan...' : 'Simpan Titik Jemput'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
