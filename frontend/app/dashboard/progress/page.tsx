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

function filterByPeriod(data: BodyMeasurement[], period: Period): BodyMeasurement[] {
  if (period === "all") return data;
  const days = period === "7d" ? 7 : 30;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return data.filter((m) => new Date(m.date) >= cutoff);
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
  data,
  unit,
}: {
  title: string;
  data: Array<{ label: string; value: number }>;
  unit: string;
}) {
  if (data.length < 2) return null;
  return (
    <ChartShell title={title} subtitle={`${data.at(-1)?.value ?? "—"} ${unit}`}>
      <LineChart data={data} />
    </ChartShell>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "7 дней",
  "30d": "30 дней",
  all: "Всё время",
};

export default function ProgressPage() {
  const { data, isLoading } = useProgressData();
  const [period, setPeriod] = useState<Period>("30d");

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
        title="Нет данных о прогрессе"
        description="Добавь замеры через бота — динамика веса и замеров появится здесь."
        actionLabel="Открыть бота"
      />
    );
  }

  const sorted = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const filtered = filterByPeriod(sorted, period);
  const displayData = filtered.length > 0 ? filtered : sorted;

  const first = sorted[0].weight;
  const last = sorted[sorted.length - 1].weight;
  const change = last - first;
  const changeLabel = change > 0 ? `+${change.toFixed(1)} кг` : `${change.toFixed(1)} кг`;
  const changeDir: "up" | "down" | "neutral" =
    change > 0 ? "up" : change < 0 ? "down" : "neutral";

  const weights = sorted.map((m) => m.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);

  function toChartData(
    items: BodyMeasurement[],
    key: keyof BodyMeasurement,
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

  const weightChartData = toChartData(displayData, "weight");
  const chestChartData = toChartData(sorted, "chest");
  const waistChartData = toChartData(sorted, "waist");
  const hipsChartData = toChartData(sorted, "hips");

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

      {/* Переключатель периода + график веса */}
      <ChartShell
        title="График веса"
        subtitle={
          <div className="flex gap-1">
            {(["7d", "30d", "all"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
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
        }
      >
        <LineChart data={weightChartData} />
      </ChartShell>

      {/* Мини-графики замеров тела */}
      {(chestChartData.length >= 2 ||
        waistChartData.length >= 2 ||
        hipsChartData.length >= 2) && (
        <div className="grid gap-4 sm:grid-cols-3">
          <MiniChart title="Грудь" data={chestChartData} unit="см" />
          <MiniChart title="Талия" data={waistChartData} unit="см" />
          <MiniChart title="Бёдра" data={hipsChartData} unit="см" />
        </div>
      )}
    </div>
  );
}
