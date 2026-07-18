'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatistikService } from '@/services/statistik.service';
import { GrafikData } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CHART_COLORS,
  CustomTooltip,
  EmptyChartState,
  ChartLegend,
  ChartCardSkeleton,
} from '@/components/charts/chart-helpers';
import { formatWeight } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { getScopedRtRwId } from '@/lib/rt-scope';

const BULAN_OPTIONS = [
  { value: '0', label: 'Semua Bulan' },
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

export default function StatistikPage() {
  const { user, loading: authLoading } = useAuth();
  const scopedRtRwId = getScopedRtRwId(user);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(0); // 0 = semua bulan
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [grafikBulanan, setGrafikBulanan] = useState<GrafikData[]>([]);
  const [grafikPerJenis, setGrafikPerJenis] = useState<GrafikData[]>([]);
  const [grafikPerRT, setGrafikPerRT] = useState<GrafikData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const loadAvailableYears = async () => {
      try {
        const years = await StatistikService.getAvailableYears(scopedRtRwId);
        setAvailableYears(years);

        if (years.length > 0) {
          const latestYear = years[years.length - 1];
          setYear((currentYear) => (years.includes(currentYear) ? currentYear : latestYear));
        }
      } catch (error) {
        console.error('Gagal memuat daftar tahun:', error);
      }
    };

    loadAvailableYears();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, scopedRtRwId]);

  useEffect(() => {
    if (authLoading) return;

    if (availableYears.length === 0 && year) {
      return;
    }

    if (availableYears.length > 0 && !availableYears.includes(year)) {
      setYear(availableYears[availableYears.length - 1]);
      return;
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, availableYears, authLoading, scopedRtRwId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = StatistikService.getRangeForPeriod(year, month || null);

      const [jenis, rt, bulanan] = await Promise.all([
        StatistikService.getGrafikPerJenis(startDate, endDate, scopedRtRwId),
        StatistikService.getGrafikPerRT(startDate, endDate, scopedRtRwId),
        StatistikService.getGrafikBulanan(year, scopedRtRwId),
      ]);

      setGrafikPerJenis(jenis);
      setGrafikPerRT(rt);
      setGrafikBulanan(bulanan);
    } catch (error) {
      console.error('Gagal memuat statistik:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPerJenis = grafikPerJenis.reduce((sum, item) => sum + item.value, 0);
  const monthLabel = BULAN_OPTIONS.find((m) => m.value === month.toString())?.label || 'Semua Bulan';
  const trendLabel = grafikBulanan.length > 1
    ? (() => {
        const latest = grafikBulanan[grafikBulanan.length - 1]?.value || 0;
        const previous = grafikBulanan[grafikBulanan.length - 2]?.value || 0;
        if (latest > previous) return 'naik';
        if (latest < previous) return 'turun';
        return 'stabil';
      })()
    : 'tersedia';

  return (
    <div className="min-h-screen flex bg-secondary/40">
      <Navbar />

      <div className="flex-1 lg:ml-64 mt-16 lg:mt-0 p-4 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Statistik Sampah</h1>
            <p className="text-sm text-muted-foreground">Analisis data pengelolaan sampah</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={month.toString()} onValueChange={(value) => setMonth(parseInt(value))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Bulan" />
              </SelectTrigger>
              <SelectContent>
                {BULAN_OPTIONS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                {(availableYears.length > 0 ? availableYears : [new Date().getFullYear()]).map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCardSkeleton />
            <ChartCardSkeleton />
            <div className="lg:col-span-2">
              <ChartCardSkeleton />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Volume Sampah per Jenis</CardTitle>
                <p className="text-xs text-muted-foreground">Periode {monthLabel} {year}</p>
              </CardHeader>
              <CardContent>
                {grafikPerJenis.length === 0 ? (
                  <div className="h-72">
                    <EmptyChartState text="Belum ada data sampah pada periode ini" />
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="h-64 w-full sm:w-1/2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={grafikPerJenis}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={2}
                            cornerRadius={4}
                            dataKey="value"
                            nameKey="name"
                          >
                            {grafikPerJenis.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full sm:w-1/2">
                      <ChartLegend data={grafikPerJenis} total={totalPerJenis} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Volume Sampah per RT</CardTitle>
                <p className="text-xs text-muted-foreground">Periode {monthLabel} {year}</p>
              </CardHeader>
              <CardContent>
                {grafikPerRT.length === 0 ? (
                  <div className="h-72">
                    <EmptyChartState text="Belum ada data setor RT pada periode ini" />
                  </div>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={grafikPerRT} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={false}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                          interval={0}
                          angle={grafikPerRT.length > 6 ? -35 : 0}
                          textAnchor={grafikPerRT.length > 6 ? 'end' : 'middle'}
                          height={grafikPerRT.length > 6 ? 50 : 30}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={false}
                          axisLine={false}
                          width={44}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))' }} />
                        <Bar dataKey="value" name="Berat" fill="#2F9E6E" radius={[6, 6, 0, 0]} maxBarSize={48} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Volume Sampah Bulanan</CardTitle>
                <p className="text-xs text-muted-foreground">Tahun {year}</p>
              </CardHeader>
              <CardContent>
                {grafikBulanan.every((item) => item.value === 0) ? (
                  <div className="h-72">
                    <EmptyChartState text="Belum ada data sampah tahun ini" />
                  </div>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={grafikBulanan} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={false}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={false}
                          axisLine={false}
                          width={44}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))' }} />
                        <Bar dataKey="value" name="Berat" fill="#0B3D2E" radius={[6, 6, 0, 0]} maxBarSize={36} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Line Chart Perkembangan Setoran</CardTitle>
                <p className="text-xs text-muted-foreground">Tren setoran {trendLabel} dibanding bulan sebelumnya pada tahun {year}</p>
              </CardHeader>
              <CardContent>
                {grafikBulanan.every((item) => item.value === 0) ? (
                  <div className="h-72">
                    <EmptyChartState text="Belum ada data sampah tahun ini" />
                  </div>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={grafikBulanan} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={false}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={false}
                          axisLine={false}
                          width={44}
                          tickFormatter={(value) => formatWeight(value)}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          name="Berat"
                          stroke="#0B3D2E"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
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
