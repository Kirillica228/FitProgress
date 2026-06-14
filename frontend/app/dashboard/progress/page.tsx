"use client";

import { useState } from "react";
import { LineChart } from "@/components/charts/line-chart";
import { ChartShell } from "@/components/ui/chart-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useProgressData } from "@/hooks/use-progress-data";
import type { BodyMeasurement } from "@/lib/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

type Period = "7d" | "30d" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "7 дн",
  "30d": "30 дн",
  all: "Всё",
};

function filterByPeriod(data: BodyMeasurement[], period: Period): BodyMeasurement[] {
  if (period === "all") return data;
  const days = period === "7d" ? 7 : 30;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return data.filter((m) => new Date(m.date) >= cutoff);
}

/** Каждый замер — отдельная точка на графике (без усреднения). */
function toChartData(
  items: BodyMeasurement[],
  key: "weight" | "chest" | "waist" | "hips",
): Array<{ label: string; value: number }> {
  return items
    .filter((m) => m[key] != null)
    .map((m) => ({
      label: new Date(m.date).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
      }),
      value: m[key] as number,
    }));
}

function PeriodButtons({
  period,
  onChange,
}: {
  period: Period;
  onChange: (p: Period) => void;
}) {
  return (
    <div className="flex gap-1">
      {(["7d", "30d", "all"] as Period[]).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={[
            "rounded-lg px-2.5 py-1 text-xs transition",
            period === p
              ? "bg-white text-slate-950 font-medium"
              : "text-slate-400 hover:text-white hover:bg-white/5",
          ].join(" ")}
        >
          {PERIOD_LABELS[p]}
        </button>
      ))}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: "up" | "down" | "neutral";
}) {
  const subColor =
    highlight === "up"
      ? "text-emerald-400"
      : highlight === "down"
        ? "text-rose-400"
        : "text-slate-400";

  return (
    <div className="rounded-2xl bg-white/[0.03] p-4">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-bold text-white">{value}</div>
      {sub && <div className={`mt-0.5 text-xs ${subColor}`}>{sub}</div>}
    </div>
  );
}

function MiniChart({
  title,
  allData,
  dataKey,
  unit,
}: {
  title: string;
  allData: BodyMeasurement[];
  dataKey: "chest" | "waist" | "hips";
  unit: string;
}) {
  const [period, setPeriod] = useState<Period>("7d");

  const allMetricData = toChartData(allData, dataKey);
  if (allMetricData.length === 0) return null;

  const filtered = filterByPeriod(allData, period);
  const periodData = toChartData(filtered, dataKey);
  // Если в выбранном периоде нет точек — показываем все данные по метрике
  const chartData = periodData.length > 0 ? periodData : allMetricData;
  const currentValue = chartData.at(-1)?.value ?? "—";

  return (
    <ChartShell
      title={title}
      subtitle={`${currentValue} ${unit}`}
      actions={<PeriodButtons period={period} onChange={setPeriod} />}
    >
      <LineChart data={chartData} unit={unit} />
    </ChartShell>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const { data, isLoading } = useProgressData();
  const [weightPeriod, setWeightPeriod] = useState<Period>("7d");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="Нет данных о замерах"
        description="Добавь замеры через бота — динамика веса и замеров появится здесь."
        actionLabel="Открыть бота"
      />
    );
  }

  // Сортируем по дате, при одинаковой дате — по id
  const sorted = [...data].sort((a, b) => {
    const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
    return dateDiff !== 0 ? dateDiff : a.id - b.id;
  });

  const filtered = filterByPeriod(sorted, weightPeriod);
  const weightDisplayData = filtered.length > 0 ? filtered : sorted;

  // KPI считаются по выбранному периоду (с fallback на все данные если пусто)
  const kpiData = weightDisplayData;
  const first = kpiData[0].weight;
  const last = kpiData[kpiData.length - 1].weight;
  const change = last - first;
  const changeLabel = change > 0 ? `+${change.toFixed(1)} кг` : `${change.toFixed(1)} кг`;
  const changeDir: "up" | "down" | "neutral" =
    change > 0 ? "down" : change < 0 ? "up" : "neutral";

  const weights = kpiData.map((m) => m.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);

  const latestChest = [...sorted].reverse().find((m) => m.chest != null)?.chest ?? null;
  const latestWaist = [...sorted].reverse().find((m) => m.waist != null)?.waist ?? null;
  const latestHips = [...sorted].reverse().find((m) => m.hips != null)?.hips ?? null;
  const hasBodyMetrics = latestChest !== null || latestWaist !== null || latestHips !== null;

  const weightChartData = toChartData(weightDisplayData, "weight");

  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Текущий вес" value={`${last} кг`} />
        <KpiCard
          label="Изменение"
          value={changeLabel}
          sub={`от ${first} кг`}
          highlight={changeDir}
        />
        <KpiCard label="Минимум" value={`${minWeight} кг`} />
        <KpiCard label="Максимум" value={`${maxWeight} кг`} />
      </div>

      {/* График веса с переключателем периода */}
      <ChartShell
        title="График веса"
        actions={<PeriodButtons period={weightPeriod} onChange={setWeightPeriod} />}
      >
        <LineChart data={weightChartData} unit="кг" />
      </ChartShell>

      {/* Замеры тела — текущие значения */}
      {hasBodyMetrics && (
        <div>
          <p className="mb-3 text-sm text-slate-400">Замеры тела (последние значения)</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/[0.03] p-4 text-center">
              <div className="text-xs text-slate-400">Грудь</div>
              <div className="mt-1 text-2xl font-bold text-white">
                {latestChest !== null ? `${latestChest} см` : "—"}
              </div>
            </div>
            <div className="rounded-2xl bg-white/[0.03] p-4 text-center">
              <div className="text-xs text-slate-400">Талия</div>
              <div className="mt-1 text-2xl font-bold text-white">
                {latestWaist !== null ? `${latestWaist} см` : "—"}
              </div>
            </div>
            <div className="rounded-2xl bg-white/[0.03] p-4 text-center">
              <div className="text-xs text-slate-400">Бёдра</div>
              <div className="mt-1 text-2xl font-bold text-white">
                {latestHips !== null ? `${latestHips} см` : "—"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Мини-графики замеров тела */}
      {hasBodyMetrics && (
        <div className="grid gap-4 sm:grid-cols-3">
          <MiniChart title="Динамика груди" allData={sorted} dataKey="chest" unit="см" />
          <MiniChart title="Динамика талии" allData={sorted} dataKey="waist" unit="см" />
          <MiniChart title="Динамика бёдер" allData={sorted} dataKey="hips" unit="см" />
        </div>
      )}
    </div>
  );
}
