'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRT } from '@/hooks/useRT';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

export default function TambahRTPage() {
  const router = useRouter();
  const { createRT } = useRT();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user && user.role === 'rt') {
      toast.error('Akun RT tidak dapat menambah RT/RW baru');
      router.push('/rt-rw');
    }
  }, [authLoading, user, router]);

  if (authLoading || (user && user.role === 'rt')) {
    return (
      <div className="min-h-screen flex bg-secondary/40">
        <Navbar />
        <div className="flex-1 lg:ml-64 mt-16 lg:mt-0 p-4 lg:p-8 flex items-center justify-center">
          {authLoading ? (
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
              <ShieldAlert className="h-8 w-8" />
              <p>Akses ditolak.</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  const [formData, setFormData] = useState({
    rt: '',
    rw: '',
    jumlah_kk: '',
    ketua_rt: '',
    nomor_hp: '',
  });

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
      await createRT({
        rt: formData.rt,
        rw: formData.rw,
        jumlah_kk: parseInt(formData.jumlah_kk),
        ketua_rt: formData.ketua_rt,
        nomor_hp: formData.nomor_hp,
      });
      toast.success('RT/RW berhasil ditambahkan');
      router.push('/rt-rw');
    } catch (error) {
      toast.error('Gagal menambahkan RT/RW');
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
            <CardTitle>Tambah RT/RW Baru</CardTitle>
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