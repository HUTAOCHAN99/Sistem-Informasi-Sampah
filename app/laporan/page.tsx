'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SampahService } from '@/services/sampah.service';
import { formatDate, formatWeight } from '@/lib/utils';
import { FileText, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { getScopedRtRwId } from '@/lib/rt-scope';

export default function LaporanPage() {
  const { user, loading: authLoading } = useAuth();
  const scopedRtRwId = getScopedRtRwId(user);
  const [type, setType] = useState<'harian' | 'bulanan'>('harian');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [rangeLoading, setRangeLoading] = useState(true);
  const [yearOptions, setYearOptions] = useState<number[]>([]);
  const [minDate, setMinDate] = useState<string | undefined>(undefined);
  const [maxDate, setMaxDate] = useState<string | undefined>(undefined);

  // Ambil rentang tanggal (terlama - terbaru) langsung dari data di database
  useEffect(() => {
    if (!authLoading) {
      loadDateRange();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, scopedRtRwId]);

  useEffect(() => {
    if (!rangeLoading && !authLoading) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, date, month, year, rangeLoading, authLoading, scopedRtRwId]);

  const loadDateRange = async () => {
    try {
      setRangeLoading(true);
      const { minDate: minD, maxDate: maxD } = await SampahService.getDateRange(scopedRtRwId);

      const currentYear = new Date().getFullYear();
      const minYear = minD ? new Date(minD).getFullYear() : currentYear;
      const maxYear = maxD ? new Date(maxD).getFullYear() : currentYear;

      const years: number[] = [];
      for (let y = maxYear; y >= minYear; y--) {
        years.push(y);
      }
      setYearOptions(years.length > 0 ? years : [currentYear]);
      setMinDate(minD || undefined);
      setMaxDate(maxD || undefined);

      // Default ke tanggal data terbaru bila tersedia
      if (maxD) {
        const d = new Date(maxD);
        setDate(maxD);
        setMonth((d.getMonth() + 1).toString());
        setYear((d.getFullYear()).toString());
      } else {
        setYear(currentYear.toString());
      }
    } catch (error) {
      toast.error('Gagal memuat rentang tanggal laporan');
    } finally {
      setRangeLoading(false);
    }
  };

  const getDaysInMonth = (monthNum: number, yearNum: number) => {
    return new Date(yearNum, monthNum, 0).getDate();
  };

  const loadData = async () => {
    try {
      setLoading(true);
      let result;

      if (type === 'harian') {
        result = await SampahService.getByDateRange(date, date, scopedRtRwId);
      } else {
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);
        const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`;
        const lastDay = getDaysInMonth(monthNum, yearNum);
        const endDate = `${year}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        result = await SampahService.getByDateRange(startDate, endDate, scopedRtRwId);
      }
      
      setData(result);
    } catch (error) {
      toast.error('Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  const getTotalBerat = () => {
    return data.reduce((sum, item) => sum + item.berat, 0);
  };

  const getTotalTransaksi = () => {
    return data.length;
  };

  const getPeriodInfo = () => {
    if (type === 'harian') {
      return {
        label: `Laporan Harian - ${formatDate(date)}`,
        fileSuffix: date,
      };
    }
    const monthName = new Date(2000, parseInt(month) - 1, 1).toLocaleString('id-ID', { month: 'long' });
    return {
      label: `Laporan Bulanan - ${monthName} ${year}`,
      fileSuffix: `${year}-${String(month).padStart(2, '0')}`,
    };
  };

  const handleExportExcel = async () => {
    if (data.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    try {
      const { label, fileSuffix } = getPeriodInfo();
      const ExcelJS = (await import('exceljs')).default;

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Sistem Informasi Sampah';
      workbook.created = new Date();

      const sheet = workbook.addWorksheet('Laporan', {
        pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
      });

      const headers = ['No', 'Tanggal', 'RT/RW', 'Jenis Sampah', 'Berat (Kg)', 'Petugas'];

      // Judul laporan
      sheet.mergeCells(1, 1, 1, headers.length);
      const titleCell = sheet.getCell('A1');
      titleCell.value = 'LAPORAN PENGELOLAAN SAMPAH';
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

      sheet.mergeCells(2, 1, 2, headers.length);
      const subtitleCell = sheet.getCell('A2');
      subtitleCell.value = label;
      subtitleCell.font = { italic: true, size: 11, color: { argb: 'FF555555' } };
      subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };

      sheet.addRow([]);

      // Header tabel
      const headerRow = sheet.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF15803D' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' },
        };
      });
      headerRow.height = 20;

      // Baris data
      data.forEach((item, idx) => {
        const row = sheet.addRow([
          idx + 1,
          formatDate(item.tanggal),
          `RT ${item.rt_rw?.rt ?? '-'}`,
          item.kategori?.nama_kategori ?? '-',
          item.berat,
          item.petugas,
        ]);
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' },
          };
          cell.alignment = {
            vertical: 'middle',
            horizontal: colNumber === 1 || colNumber === 5 ? 'center' : 'left',
          };
          if (colNumber === 5) cell.numFmt = '#,##0.0 "kg"';
        });
      });

      // Ringkasan
      const totalBerat = data.reduce((sum, item) => sum + (Number(item.berat) || 0), 0);
      const totalTransaksi = data.length;
      const rataRata = totalTransaksi > 0 ? totalBerat / totalTransaksi : 0;

      sheet.addRow([]);
      const summaryTitleRow = sheet.addRow(['RINGKASAN']);
      summaryTitleRow.getCell(1).font = { bold: true, size: 12 };

      const summaryRows = [
        ['Total Berat', `${totalBerat.toLocaleString('id-ID', { maximumFractionDigits: 1 })} kg`],
        ['Jumlah Transaksi', totalTransaksi],
        ['Rata-rata per Transaksi', `${rataRata.toLocaleString('id-ID', { maximumFractionDigits: 1 })} kg`],
      ];

      summaryRows.forEach(([labelText, value]) => {
        const row = sheet.addRow([labelText, value]);
        row.getCell(1).font = { bold: true };
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' },
          };
          cell.alignment = {
            vertical: 'middle',
            horizontal: colNumber === 1 ? 'left' : 'center',
          };
        });
      });

      // Lebar kolom
      sheet.getColumn(1).width = 6;
      sheet.getColumn(2).width = 20;
      sheet.getColumn(3).width = 12;
      sheet.getColumn(4).width = 22;
      sheet.getColumn(5).width = 16;
      sheet.getColumn(6).width = 20;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_${type === 'harian' ? 'Harian' : 'Bulanan'}_${fileSuffix}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Laporan Excel berhasil diunduh');
    } catch (error) {
      toast.error('Gagal membuat file Excel');
    }
  };

  return (
    <div className="min-h-screen flex">
      <Navbar />
      
      <div className="flex-1 lg:ml-64 mt-16 lg:mt-0 p-4 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
            <p className="text-gray-500">Cetak laporan pengelolaan sampah</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            {rangeLoading && (
              <p className="text-xs text-gray-400 mb-3">Memuat rentang tanggal dari data...</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Jenis Laporan</Label>
                <Select
                  value={type}
                  onValueChange={(value: 'harian' | 'bulanan') => setType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="harian">Harian</SelectItem>
                    <SelectItem value="bulanan">Bulanan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {type === 'harian' ? (
                <div className="space-y-2">
                  <Label>Tanggal</Label>
                  <Input
                    type="date"
                    value={date}
                    min={minDate}
                    max={maxDate}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Bulan</Label>
                    <Select value={month} onValueChange={setMonth}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(12)].map((_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {new Date(2000, i, 1).toLocaleString('id-ID', { month: 'long' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tahun</Label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((y) => (
                          <SelectItem key={y} value={y.toString()}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-500">Total Berat</p>
              <p className="text-2xl font-bold">{formatWeight(getTotalBerat())}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-500">Jumlah Transaksi</p>
              <p className="text-2xl font-bold">{getTotalTransaksi()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-500">Rata-rata per Transaksi</p>
              <p className="text-2xl font-bold">
                {getTotalTransaksi() > 0 ? formatWeight(getTotalBerat() / getTotalTransaksi()) : '0 kg'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detail Laporan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Tidak ada data untuk periode ini
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">RT/RW</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis Sampah</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Berat</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Petugas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{formatDate(item.tanggal)}</td>
                        <td className="px-4 py-3 text-sm">RT {item.rt_rw?.rt}</td>
                        <td className="px-4 py-3 text-sm">{item.kategori?.nama_kategori}</td>
                        <td className="px-4 py-3 text-sm font-medium">{formatWeight(item.berat)}</td>
                        <td className="px-4 py-3 text-sm">{item.petugas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}