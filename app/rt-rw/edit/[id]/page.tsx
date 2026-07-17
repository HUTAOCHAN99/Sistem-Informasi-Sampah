'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRT } from '@/hooks/useRT';
import { RTService } from '@/services/rt.service';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export default function EditRTPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { updateRT } = useRT();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState({
    rt: '',
    rw: '',
    jumlah_kk: '',
    ketua_rt: '',
    nomor_hp: '',
  });

  useEffect(() => {
    if (id) {
      loadRT();
    }
  }, [id]);

  const loadRT = async () => {
    try {
      setFetching(true);
      const rt = await RTService.getById(id);
      if (!rt) {
        setNotFound(true);
        return;
      }
      setFormData({
        rt: rt.rt,
        rw: rt.rw,
        jumlah_kk: String(rt.jumlah_kk),
        ketua_rt: rt.ketua_rt,
        nomor_hp: rt.nomor_hp,
      });
    } catch (error) {
      console.error('Gagal memuat data RT/RW:', error);
      toast.error('Gagal memuat data RT/RW');
      setNotFound(true);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateRT(id, {
        rt: formData.rt,
        rw: formData.rw,
        jumlah_kk: parseInt(formData.jumlah_kk),
        ketua_rt: formData.ketua_rt,
        nomor_hp: formData.nomor_hp,
      });
      toast.success('RT/RW berhasil diperbarui');
      router.push('/rt-rw');
    } catch (error) {
      console.error('Gagal memperbarui RT/RW:', error);
      toast.error('Gagal memperbarui RT/RW');
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
          <Button variant="ghost" className="mb-4" onClick={() => router.push('/rt-rw')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Data RT/RW tidak ditemukan</p>
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
            <CardTitle>Edit RT/RW</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rt">RT</Label>
                  <Input
                    id="rt"
                    name="rt"
                    placeholder="Contoh: 01"
                    value={formData.rt}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rw">RW</Label>
                  <Input
                    id="rw"
                    name="rw"
                    placeholder="Contoh: 01"
                    value={formData.rw}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ketua_rt">Ketua RT</Label>
                <Input
                  id="ketua_rt"
                  name="ketua_rt"
                  placeholder="Nama ketua RT"
                  value={formData.ketua_rt}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jumlah_kk">Jumlah KK</Label>
                <Input
                  id="jumlah_kk"
                  name="jumlah_kk"
                  type="number"
                  placeholder="Jumlah kepala keluarga"
                  value={formData.jumlah_kk}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomor_hp">Nomor HP</Label>
                <Input
                  id="nomor_hp"
                  name="nomor_hp"
                  placeholder="08123456789"
                  value={formData.nomor_hp}
                  onChange={handleChange}
                  required
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
