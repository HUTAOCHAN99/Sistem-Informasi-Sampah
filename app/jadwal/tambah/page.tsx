'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJadwal } from '@/hooks/useJadwal';
import { useRT } from '@/hooks/useRT';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const HARI_OPTIONS = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu', 'Minggu'];

export default function TambahJadwalPage() {
  const router = useRouter();
  const { createJadwal } = useJadwal();
  const { data: rtList, loading: loadingRT } = useRT();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rt_rw_id: '',
    hari: '',
    tanggal: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.rt_rw_id || !formData.hari || !formData.tanggal) {
      toast.error('Mohon lengkapi semua field');
      return;
    }

    setLoading(true);

    try {
      await createJadwal({
        rt_rw_id: formData.rt_rw_id,
        hari: formData.hari,
        tanggal: formData.tanggal,
      });
      toast.success('Jadwal berhasil ditambahkan');
      router.push('/jadwal');
    } catch (error) {
      toast.error('Gagal menambahkan jadwal');
    } finally {
      setLoading(false);
    }
  };

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
            <CardTitle>Tambah Jadwal Setor</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rt_rw_id">RT/RW</Label>
                <Select
                  value={formData.rt_rw_id}
                  onValueChange={(value) => setFormData({ ...formData, rt_rw_id: value })}
                  disabled={loadingRT}
                >
                  <SelectTrigger id="rt_rw_id">
                    <SelectValue placeholder="Pilih RT/RW" />
                  </SelectTrigger>
                  <SelectContent>
                    {rtList.map((rt) => (
                      <SelectItem key={rt.id} value={rt.id}>
                        RT {rt.rt} / RW {rt.rw}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hari">Hari</Label>
                <Select
                  value={formData.hari}
                  onValueChange={(value) => setFormData({ ...formData, hari: value })}
                >
                  <SelectTrigger id="hari">
                    <SelectValue placeholder="Pilih hari" />
                  </SelectTrigger>
                  <SelectContent>
                    {HARI_OPTIONS.map((hari) => (
                      <SelectItem key={hari} value={hari}>
                        {hari}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tanggal">Tanggal</Label>
                <Input
                  id="tanggal"
                  name="tanggal"
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Simpan'}
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
