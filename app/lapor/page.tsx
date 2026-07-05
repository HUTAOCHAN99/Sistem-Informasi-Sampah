'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RTService } from '@/services/rt.service';
import { PengaduanService } from '@/services/pengaduan.service';
import { RT_RW } from '@/types';
import { ImagePlus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LaporPage() {
  const router = useRouter();
  const [rtList, setRtList] = useState<RT_RW[]>([]);
  const [namaPelapor, setNamaPelapor] = useState('');
  const [noHp, setNoHp] = useState('');
  const [rtRwId, setRtRwId] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    RTService.getAll()
      .then(setRtList)
      .catch(() => toast.error('Gagal memuat daftar RT/RW'));
  }, []);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 5MB');
      return;
    }

    setFoto(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rtRwId) {
      toast.error('Pilih RT/RW terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      let foto_url: string | undefined;
      if (foto) {
        foto_url = await PengaduanService.uploadFoto(foto);
      }

      const hasil = await PengaduanService.create({
        nama_pelapor: namaPelapor,
        no_hp: noHp || undefined,
        rt_rw_id: rtRwId,
        deskripsi,
        foto_url,
      });

      toast.success('Laporan berhasil dikirim!');
      router.push(`/lacak?kode=${hasil.kode_tracking}`);
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengirim laporan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <div className="p-3 rounded-full bg-red-50">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-primary">
            Lapor Sampah Belum Diangkut
          </CardTitle>
          <CardDescription className="text-center">
            Isi form berikut untuk melaporkan sampah yang perlu diangkut. Tidak perlu akun.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama</Label>
              <Input
                id="nama"
                placeholder="Nama Anda"
                value={namaPelapor}
                onChange={(e) => setNamaPelapor(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hp">No. HP (opsional)</Label>
              <Input
                id="hp"
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rt">RT/RW</Label>
              <Select value={rtRwId} onValueChange={setRtRwId}>
                <SelectTrigger id="rt">
                  <SelectValue placeholder="Pilih RT/RW Anda" />
                </SelectTrigger>
                <SelectContent>
                  {rtList.map((rt) => (
                    <SelectItem key={rt.id} value={rt.id}>
                      RT {rt.rt}/RW {rt.rw}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <textarea
                id="deskripsi"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                placeholder="Contoh: Sampah menumpuk di depan gang, belum diangkut sejak 3 hari"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="foto">Foto (opsional)</Label>
              {previewUrl ? (
                <div className="relative">
                  <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-md border" />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => { setFoto(null); setPreviewUrl(null); }}
                  >
                    Ganti
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="foto"
                  className="flex flex-col items-center justify-center gap-2 h-32 rounded-md border-2 border-dashed border-input cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <ImagePlus className="h-6 w-6 text-gray-400" />
                  <span className="text-sm text-gray-500">Ketuk untuk unggah foto</span>
                </label>
              )}
              <input
                id="foto"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFotoChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Mengirim...' : 'Kirim Laporan'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => router.push('/lacak')}
            >
              <Search className="h-4 w-4 mr-2" />
              Cek Status Laporan Saya
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
