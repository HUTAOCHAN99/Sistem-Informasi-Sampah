'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatistikService } from '@/services/statistik.service';
import { Statistik } from '@/types';
import { formatWeight } from '@/lib/utils';
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
import { Trash2, CalendarClock, CheckCircle2, XCircle } from 'lucide-react';
import {
  CHART_COLORS,
  CustomTooltip,
  EmptyChartState,
  ChartLegend,
  ChartCardSkeleton,
} from '@/components/charts/chart-helpers';

export default function DashboardPage() {
  const [data, setData] = useState<Statistik | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await StatistikService.getDashboardData();
      setData(result);
    } catch (error) {
      console.error('Gagal memuat dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const perJenis = data?.grafik_per_jenis || [];
  const perRT = data?.grafik_per_rt || [];
  const bulanan = data?.grafik_bulanan || [];
  const totalPerJenis = perJenis.reduce((sum, item) => sum + item.value, 0);

  const totalRT = (data?.rt_sudah_setor || 0) + (data?.rt_belum_setor || 0);
  const persenSetor = totalRT > 0 ? Math.round(((data?.rt_sudah_setor || 0) / totalRT) * 100) : 0;
  const trendLabel = bulanan.length > 1
    ? (() => {
        const latest = bulanan[bulanan.length - 1]?.value || 0;
        const previous = bulanan[bulanan.length - 2]?.value || 0;
        if (latest > previous) return 'naik';
        if (latest < previous) return 'turun';
        return 'stabil';
      })()
    : 'tersedia';

  const stats = [
    {
      title: 'Sampah Hari Ini',
      value: formatWeight(data?.total_sampah_hari || 0),
      icon: Trash2,
    },
    {
      title: 'Sampah Bulan Ini',
      value: formatWeight(data?.total_sampah_bulan || 0),
      icon: CalendarClock,
    },
    {
      title: 'RT Sudah Setor',
      value: data?.rt_sudah_setor || 0,
      icon: CheckCircle2,
      tone: 'positive' as const,
    },
    {
      title: 'RT Belum Setor',
      value: data?.rt_belum_setor || 0,
      icon: XCircle,
      tone: 'negative' as const,
    },
  ];

  return (
    <div className="min-h-screen flex bg-secondary/40">
      <Navbar />

      <div className="flex-1 lg:ml-64 mt-16 lg:mt-0 p-4 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Ringkasan pengelolaan sampah desa</p>
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <div className="h-16 animate-pulse rounded-lg bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ChartCardSkeleton />
              <ChartCardSkeleton />
              <div className="lg:col-span-2">
                <ChartCardSkeleton />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              {stats.map((stat, index) => (
                <Card key={index} className="border-border/70">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {stat.title}
                        </p>
                        <p
                          className={`mt-1.5 text-2xl font-bold truncate ${
                            stat.tone === 'positive'
                              ? 'text-emerald-600'
                              : stat.tone === 'negative'
                              ? 'text-red-600'
                              : 'text-foreground'
                          }`}
                        >
                          {stat.value}
                        </p>
                      </div>
                      <div
                        className={`shrink-0 rounded-full p-2.5 ${
                          stat.tone === 'positive'
                            ? 'bg-emerald-50'
                            : stat.tone === 'negative'
                            ? 'bg-red-50'
                            : 'bg-primary/10'
                        }`}
                      >
                        <stat.icon
                          className={`h-5 w-5 ${
                            stat.tone === 'positive'
                              ? 'text-emerald-600'
                              : stat.tone === 'negative'
                              ? 'text-red-600'
                              : 'text-primary'
                          }`}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Progress setor RT */}
            {totalRT > 0 && (
              <Card className="border-border/70 mb-6">
                <CardContent className="p-5">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">Progres Setor RT Hari Ini</span>
                    <span className="text-muted-foreground">
                      {data?.rt_sudah_setor || 0} dari {totalRT} RT ({persenSetor}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${persenSetor}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card className="border-border/70">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Volume Sampah per Jenis</CardTitle>
                  <p className="text-xs text-muted-foreground">Periode bulan berjalan</p>
                </CardHeader>
                <CardContent>
                  {perJenis.length === 0 ? (
                    <div className="h-72">
                      <EmptyChartState text="Belum ada data sampah bulan ini" />
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="h-64 w-full sm:w-1/2">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={perJenis}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={85}
                              paddingAngle={2}
                              cornerRadius={4}
                              dataKey="value"
                              nameKey="name"
                            >
                              {perJenis.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-full sm:w-1/2">
                        <ChartLegend data={perJenis} total={totalPerJenis} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/70">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Volume Sampah per RT</CardTitle>
                  <p className="text-xs text-muted-foreground">Periode bulan berjalan</p>
                </CardHeader>
                <CardContent>
                  {perRT.length === 0 ? (
                    <div className="h-72">
                      <EmptyChartState text="Belum ada data setor RT bulan ini" />
                    </div>
                  ) : (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={perRT} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            tickLine={false}
                            axisLine={{ stroke: 'hsl(var(--border))' }}
                            interval={0}
                            angle={perRT.length > 6 ? -35 : 0}
                            textAnchor={perRT.length > 6 ? 'end' : 'middle'}
                            height={perRT.length > 6 ? 50 : 30}
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
                  <p className="text-xs text-muted-foreground">Tahun berjalan</p>
                </CardHeader>
                <CardContent>
                  {bulanan.every((item) => item.value === 0) ? (
                    <div className="h-72">
                      <EmptyChartState text="Belum ada data sampah tahun ini" />
                    </div>
                  ) : (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={bulanan} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
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
                  <p className="text-xs text-muted-foreground">Tren setoran {trendLabel} dibanding bulan sebelumnya</p>
                </CardHeader>
                <CardContent>
                  {bulanan.every((item) => item.value === 0) ? (
                    <div className="h-72">
                      <EmptyChartState text="Belum ada data sampah tahun ini" />
                    </div>
                  ) : (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={bulanan} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
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
                            stroke="#2F9E6E"
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
          </>
        )}
      </div>
    </div>
  );
}
