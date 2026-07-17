'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSampah } from '@/hooks/useSampah';
import { SampahService } from '@/services/sampah.service';
import { RTService } from '@/services/rt.service';
import { KategoriService } from '@/services/kategori.service';
import { RT_RW, KategoriSampah } from '@/types';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export default function EditSampahPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { updateSampah } = useSampah();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [rtList, setRtList] = useState<RT_RW[]>([]);
  const [kategoriList, setKategoriList] = useState<KategoriSampah[]>([]);
  const [formData, setFormData] = useState({
    rt_rw_id: '',
    kategori_id: '',
    berat: '',
    tanggal: '',
    petugas: '',
    keterangan: '',
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setFetching(true);
      const [sampah, rtData, kategoriData] = await Promise.all([
        SampahService.getById(id),
        RTService.getAll(),
        KategoriService.getAll(),
      ]);

      setRtList(rtData);
      setKategoriList(kategoriData);

      if (!sampah) {
        setNotFound(true);
        return;
      }

      setFormData({
        rt_rw_id: sampah.rt_rw_id,
        kategori_id: sampah.kategori_id,
        berat: String(sampah.berat),
        tanggal: sampah.tanggal,
        petugas: sampah.petugas,
        keterangan: sampah.keterangan || '',
      });
    } catch (error) {
      console.error('Gagal memuat data sampah:', error);
      toast.error('Gagal memuat data sampah');
      setNotFound(true);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateSampah(id, {
        rt_rw_id: formData.rt_rw_id,
        kategori_id: formData.kategori_id,
        berat: parseFloat(formData.berat),
        tanggal: formData.tanggal,
        petugas: formData.petugas,
        keterangan: formData.keterangan || undefined,
      });
      toast.success('Data sampah berhasil diperbarui');
      router.push('/sampah');
    } catch (error) {
      console.error('Gagal memperbarui data sampah:', error);
      toast.error('Gagal memperbarui data sampah');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex">
        <Navbar />
        <div className="flex-1 lg:ml-64 mt-16 lg:mt-0 p-4 lg:p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (notFound) {
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
            <CardTitle>Edit Data Sampah</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tanggal">Tanggal</Label>
                <Input
                  id="tanggal"
                  name="tanggal"
                  type="date"
                  value={formData.tanggal}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rt_rw_id">RT/RW</Label>
                <Select
                  value={formData.rt_rw_id}
                  onValueChange={(value) => handleSelectChange('rt_rw_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih RT/RW" />
                  </SelectTrigger>
                  <SelectContent>
                    {rtList.map((rt) => (
                      <SelectItem key={rt.id} value={rt.id}>
                        RT {rt.rt} - RW {rt.rw}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kategori_id">Jenis Sampah</Label>
                <Select
                  value={formData.kategori_id}
                  onValueChange={(value) => handleSelectChange('kategori_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis sampah" />
                  </SelectTrigger>
                  <SelectContent>
                    {kategoriList.map((kategori) => (
                      <SelectItem key={kategori.id} value={kategori.id}>
                        {kategori.nama_kategori}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="berat">Berat (kg)</Label>
                <Input
                  id="berat"
                  name="berat"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={formData.berat}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="petugas">Petugas</Label>
                <Input
                  id="petugas"
                  name="petugas"
                  placeholder="Nama petugas"
                  value={formData.petugas}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
                <Input
                  id="keterangan"
                  name="keterangan"
                  placeholder="Catatan tambahan"
                  value={formData.keterangan}
                  onChange={handleChange}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
