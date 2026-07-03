'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useRT } from '@/hooks/useRT';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RTPage() {
  const { data, loading, deleteRT, refresh } = useRT();
  const [search, setSearch] = useState('');
  const router = useRouter();

  const filteredData = data.filter(item => 
    item.rt.toLowerCase().includes(search.toLowerCase()) ||
    item.ketua_rt.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, rt: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus RT ${rt}?`)) {
      try {
        await deleteRT(id);
        toast.success(`RT ${rt} berhasil dihapus`);
        refresh();
      } catch (error) {
        toast.error('Gagal menghapus RT');
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
            <h1 className="text-2xl font-bold text-gray-900">Data RT/RW</h1>
            <p className="text-gray-500">Kelola data RT/RW di desa</p>
          </div>
          <Button onClick={() => router.push('/rt-rw/tambah')}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah RT/RW
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari RT atau ketua RT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((rt) => (
            <Card key={rt.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">RT {rt.rt}</h3>
                    <p className="text-sm text-gray-500">RW {rt.rw}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/rt-rw/edit/${rt.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(rt.id, rt.rt)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Ketua RT:</span> {rt.ketua_rt}</p>
                  <p><span className="text-gray-500">Jumlah KK:</span> {rt.jumlah_kk}</p>
                  <p><span className="text-gray-500">No. HP:</span> {rt.nomor_hp}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada data RT/RW</p>
          </div>
        )}
      </div>
    </div>
  );
}