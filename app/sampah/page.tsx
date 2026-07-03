'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useSampah } from '@/hooks/useSampah';
import { formatDate, formatWeight } from '@/lib/utils';
import { Plus, Search, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SampahPage() {
  const { data, loading, deleteSampah, refresh } = useSampah();
  const [search, setSearch] = useState('');
  const router = useRouter();

  const filteredData = data.filter(item =>
    item.rt_rw?.rt?.toLowerCase().includes(search.toLowerCase()) ||
    item.kategori?.nama_kategori?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      try {
        await deleteSampah(id);
        toast.success('Data sampah berhasil dihapus');
        refresh();
      } catch (error) {
        toast.error('Gagal menghapus data sampah');
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
            <h1 className="text-2xl font-bold text-gray-900">Data Sampah</h1>
            <p className="text-gray-500">Riwayat pencatatan sampah</p>
          </div>
          <Button onClick={() => router.push('/sampah/tambah')}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Data
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari berdasarkan RT atau jenis sampah..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RT/RW</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Sampah</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Berat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Petugas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(item.tanggal)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">RT {item.rt_rw?.rt}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.kategori?.nama_kategori}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatWeight(item.berat)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.petugas}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/sampah/detail/${item.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada data sampah</p>
          </div>
        )}
      </div>
    </div>
  );
}