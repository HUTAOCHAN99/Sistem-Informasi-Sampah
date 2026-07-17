import { GrafikData } from '@/types';
import { formatWeight } from '@/lib/utils';
import { PackageOpen } from 'lucide-react';

// Palet warna diselaraskan dengan warna brand (hijau tua #0B3D2E) agar terasa satu kesatuan
export const CHART_COLORS = ['#0B3D2E', '#2F9E6E', '#5DBE8A', '#F4B942', '#3B82F6', '#A855F7'];

export function CustomTooltip({ active, payload, label }: any) {
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

export function EmptyChartState({ text }: { text: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
      <PackageOpen className="h-9 w-9 opacity-40" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

export function ChartLegend({ data, total }: { data: GrafikData[]; total: number }) {
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

export function ChartCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
      </div>
      <div className="p-6 pt-0">
        <div className="h-72 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
