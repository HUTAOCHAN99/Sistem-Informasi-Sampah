'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatistikService } from '@/services/statistik.service';
import { Statistik, GrafikData } from '@/types';
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
} from 'recharts';
import { Trash2, CalendarClock, CheckCircle2, XCircle, PackageOpen } from 'lucide-react';

// Palet warna diselaraskan dengan warna brand (hijau tua #0B3D2E) agar terasa satu kesatuan
const CHART_COLORS = ['#0B3D2E', '#2F9E6E', '#5DBE8A', '#F4B942', '#3B82F6', '#A855F7'];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-md">
      {label && <p className="mb-0.5 text-xs font-medium text-muted-foreground">{label}</p>}
      {payload.map((item: any, i: number) => (
        <p key={i} className="text-sm font-semibold text-foreground">
          {item.name ? `${item.name}: ` : ''}
          {formatWeight(item.value)}
        </p>
      ))}
    </div>
  );
}

function EmptyChartState({ text }: { text: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
      <PackageOpen className="h-9 w-9 opacity-40" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

function ChartLegend({ data, total }: { data: GrafikData[]; total: number }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {data.map((item, index) => {
        const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
        return (
          <li key={item.name} className="flex items-center gap-2.5 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
            />
            <span className="flex-1 truncate text-foreground">{item.name}</span>
            <span className="shrink-0 text-muted-foreground">{percent}%</span>
          </li>
        );
      })}
    </ul>
  );
}

function ChartCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-72 animate-pulse rounded-lg bg-muted" />
      </CardContent>
    </Card>
  );
}

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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
