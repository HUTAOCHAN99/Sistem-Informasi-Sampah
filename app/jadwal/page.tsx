'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, getDay, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useJadwal } from '@/hooks/useJadwal';
import { formatDate } from '@/lib/utils';
import { Plus, Search, Trash2, Calendar, ChevronLeft, ChevronRight, List } from 'lucide-react';
import toast from 'react-hot-toast';

type ViewMode = 'list' | 'calendar';

function JadwalContent() {
  const { data, loading, deleteJadwal, refresh } = useJadwal();
  const [search, setSearch] = useState('');
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>(
    searchParams.get('view') === 'calendar' ? 'calendar' : 'list'
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const router = useRouter();

  // Kalau ada yang mengarah ke /jadwal?view=calendar (mis. tombol "Lihat
  // Jadwal" dari dashboard), langsung buka tampilan kalender.
  useEffect(() => {
    if (searchParams.get('view') === 'calendar') {
      setViewMode('calendar');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const filteredData = data.filter((item) =>
    item.rt_rw?.rt?.toLowerCase().includes(search.toLowerCase()) ||
    item.hari.toLowerCase().includes(search.toLowerCase())
  );

  const groupedByDate = useMemo(() => {
    return filteredData.reduce<Record<string, typeof filteredData>>((acc, item) => {
      if (!acc[item.tanggal]) {
        acc[item.tanggal] = [];
      }
      acc[item.tanggal].push(item);
      return acc;
    }, {});
  }, [filteredData]);

  useEffect(() => {
    if (data.length > 0) {
      const fallbackDate = selectedDate || data[0].tanggal;
      if (!groupedByDate[fallbackDate]) {
        setSelectedDate(data[0].tanggal);
      } else if (!selectedDate) {
        setSelectedDate(fallbackDate);
      }
    } else {
      setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [data, selectedDate, groupedByDate]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const selectedSchedules = selectedDate ? groupedByDate[selectedDate] || [] : [];

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      try {
        await deleteJadwal(id);
        toast.success('Jadwal berhasil dihapus');
        refresh();
      } catch {
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

        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            Daftar Jadwal
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode('calendar')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Kalender Sampah
          </Button>
        </div>

        {viewMode === 'list' ? (
          <>
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
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(jadwal.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm">
                      <p>
                        <span className="text-gray-500">Tanggal:</span> {formatDate(jadwal.tanggal)}
                      </p>
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
          </>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Kalender Jadwal Setor</h2>
                    <p className="text-sm text-gray-500">Klik tanggal untuk melihat rincian jadwal</p>
                  </div>
                  <div className="flex items-center justify-between gap-2 sm:justify-end">
                    <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="min-w-[120px] sm:min-w-[140px] text-center text-sm sm:text-base font-semibold">
                      {format(currentMonth, 'MMMM yyyy', { locale: id })}
                    </div>
                    <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[11px] sm:text-sm font-medium text-gray-500 mb-2">
                  {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
                    <div key={day} className="truncate">{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {calendarDays.map((day) => {
                    const dayKey = format(day, 'yyyy-MM-dd');
                    const items = groupedByDate[dayKey] || [];
                    const hasSchedule = items.length > 0;
                    const isSelected = selectedDate === dayKey;
                    const isCurrentMonthDay = isSameMonth(day, currentMonth);

                    return (
                      <button
                        key={dayKey}
                        type="button"
                        onClick={() => setSelectedDate(dayKey)}
                        className={`flex min-h-[56px] sm:min-h-[84px] lg:min-h-[96px] flex-col overflow-hidden rounded-md sm:rounded-lg border p-1 sm:p-2 text-left transition ${
                          isSelected
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50'
                        } ${!isCurrentMonthDay ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs sm:text-sm font-semibold ${isSelected ? 'text-green-700' : 'text-gray-700'}`}>
                            {format(day, 'd')}
                          </span>
                          {hasSchedule && (
                            <span className="shrink-0 rounded-full bg-green-600 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium leading-none text-white">
                              {items.length}
                            </span>
                          )}
                        </div>

                        {/* Layar sempit: cukup titik penanda supaya tidak terpotong */}
                        {hasSchedule && (
                          <div className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                            {items.slice(0, 4).map((item) => (
                              <span key={item.id} className="h-1.5 w-1.5 rounded-full bg-green-600" />
                            ))}
                          </div>
                        )}

                        {/* Layar sm ke atas: ringkasan RT, disingkat supaya tetap muat */}
                        {hasSchedule && (
                          <div className="mt-1 hidden min-w-0 flex-1 flex-col gap-0.5 sm:flex">
                            {items.slice(0, 2).map((item) => (
                              <p
                                key={item.id}
                                className="truncate rounded bg-green-100 px-1 py-0.5 text-[10px] leading-tight text-green-800"
                                title={`RT ${item.rt_rw?.rt || '-'} / RW ${item.rt_rw?.rw || '-'}`}
                              >
                                RT {item.rt_rw?.rt || '-'}
                              </p>
                            ))}
                            {items.length > 2 && (
                              <p className="truncate text-[10px] text-gray-500">+{items.length - 2} lagi</p>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-4">Detail Jadwal</h2>
                <p className="text-sm text-gray-500 mb-4">
                  {selectedDate ? format(parseISO(selectedDate), 'EEEE, d MMMM yyyy', { locale: id }) : 'Pilih tanggal'}
                </p>

                {selectedSchedules.length > 0 ? (
                  <div className="space-y-3">
                    {selectedSchedules.map((jadwal) => (
                      <div key={jadwal.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-gray-900">
                            RT {jadwal.rt_rw?.rt || '-'} / RW {jadwal.rt_rw?.rw || '-'}
                          </p>
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                            {jadwal.hari}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">{formatDate(jadwal.tanggal)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                    Tidak ada jadwal pada tanggal ini.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function JadwalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex">
        <Navbar />
        <div className="flex-1 lg:ml-64 mt-16 lg:mt-0 p-4 lg:p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    }>
      <JadwalContent />
    </Suspense>
  );
}
