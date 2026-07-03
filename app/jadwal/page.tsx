'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useJadwal } from '@/hooks/useJadwal';
import { formatDate } from '@/lib/utils';
import { Plus, Search, Trash2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JadwalPage() {
  const { data, loading, deleteJadwal, refresh } = useJadwal();
  const [search, setSearch] = useState('');
  const router = useRouter();

  const filteredData = data.filter(item =>
    item.rt_rw?.rt?.toLowerCase().includes(search.toLowerCase()) ||
    item.hari.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      try {
        await deleteJadwal(id);
        toast.success('Jadwal berhasil dihapus');
        refresh();
      } catch (error) {
        toast.error('Gagal menghapus jadwal');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <Navbar />
        <div className="flex-1 lg:ml-64 mt-16 lg:mt-0 p-4 lg:p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Navbar />

      <div className="flex-1 lg:ml-64 mt-16 lg:mt-0 p-4 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Jadwal Setor</h1>
            <p className="text-gray-500">Kelola jadwal setor sampah tiap RT/RW</p>
          </div>
          <Button onClick={() => router.push('/jadwal/tambah')}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Jadwal
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari RT atau hari..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((jadwal) => (
            <Card key={jadwal.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-50">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        RT {jadwal.rt_rw?.rt || '-'} / RW {jadwal.rt_rw?.rw || '-'}
                      </h3>
                      <p className="text-sm text-gray-500">{jadwal.hari}</p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(jadwal.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm">
                  <p><span className="text-gray-500">Tanggal:</span> {formatDate(jadwal.tanggal)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada data jadwal</p>
          </div>
        )}
      </div>
    </div>
  );
}
