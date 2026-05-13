"use client";

import { useState } from "react";
import { useNutritionHeatmapData } from "@/hooks/use-nutrition-heatmap-data";
import { useNutritionData } from "@/hooks/use-nutrition-data";
import { WorkoutHeatmap } from "@/components/charts/workout-heatmap";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { NutritionHeatmapDay, FoodEntry, HeatmapDay } from "@/lib/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();

const MEAL_LABEL: Record<string, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
};

const MEAL_EMOJI: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snack: "🍎",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Конвертируем NutritionHeatmapDay[] в HeatmapDay[] для переиспользования WorkoutHeatmap */
function toHeatmapDays(data: NutritionHeatmapDay[]): HeatmapDay[] {
  return data.map((d) => ({
    date: d.date,
    count: d.count,
    volume: d.calories,   // используем calories как «объём» для интенсивности цвета
    sessions: [],
  }));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}

function DayPanel({
  date,
  entries,
}: {
  date: string;
  entries: FoodEntry[];
}) {
  const totalCal = entries.reduce((s, e) => s + e.calories, 0);

  return (
    <Card className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold text-white">{formatDate(date)}</p>
        <p className="text-xs text-slate-400">
          {entries.length} {entries.length === 1 ? "запись" : entries.length < 5 ? "записи" : "записей"}
          {" · "}
          <span className="text-orange-400">{Math.round(totalCal)} ккал</span>
        </p>
      </div>
      <div className="space-y-2">
        {entries.map((e) => (
          <div
            key={e.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {MEAL_EMOJI[e.meal_type] ?? "🍽"} {e.food_name}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {MEAL_LABEL[e.meal_type] ?? e.meal_type}
                {" · "}
                {formatTime(e.logged_at)}
              </p>
            </div>
            <span className="shrink-0 text-sm font-medium text-orange-400">
              {Math.round(e.calories)} ккал
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NutritionPage() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: heatmapData, isLoading: heatmapLoading } = useNutritionHeatmapData(year);
  const { data: allEntries, isLoading: entriesLoading } = useNutritionData();

  const isLoading = heatmapLoading || entriesLoading;

  function handleDayClick(day: HeatmapDay | null) {
    if (!day || day.count === 0) {
      setSelectedDate(null);
      return;
    }
    setSelectedDate((prev) => (prev === day.date ? null : day.date));
  }

  // Заголовок + переключатель года — всегда видны
  const yearSwitcher = (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold text-white">Питание</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setYear((y) => y - 1)}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-slate-300 hover:bg-white/[0.07] transition-colors"
        >
          ←
        </button>
        <span className="min-w-[3rem] text-center text-sm font-medium text-white">
          {year}
        </span>
        <button
          onClick={() => setYear((y) => y + 1)}
          disabled={year >= CURRENT_YEAR}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-slate-300 hover:bg-white/[0.07] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          →
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {yearSwitcher}
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!heatmapData || heatmapData.length === 0) {
    return (
      <div className="space-y-6">
        {yearSwitcher}
        <EmptyState
          title="Нет данных о питании"
          description="Добавляй приёмы пищи через бота, чтобы видеть статистику здесь."
        />
      </div>
    );
  }

  // Статистика
  const totalEntries = heatmapData.reduce((s, d) => s + d.count, 0);
  const activeDays = heatmapData.filter((d) => d.count > 0).length;
  const avgCalPerDay =
    activeDays > 0
      ? Math.round(
          heatmapData.reduce((s, d) => s + d.calories, 0) / activeDays,
        )
      : 0;

  // Записи выбранного дня
  const selectedEntries = selectedDate
    ? (allEntries ?? []).filter(
        (e) => e.logged_at.slice(0, 10) === selectedDate,
      )
    : [];

  const heatmapDays = toHeatmapDays(heatmapData);

  return (
    <div className="space-y-6">
      {yearSwitcher}

      {/* KPI */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Всего записей" value={totalEntries} />
        <StatCard label="Активных дней" value={activeDays} />
        <StatCard label="Ккал/день (ср.)" value={avgCalPerDay} />
      </div>

      {/* Heatmap + drill-down */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <p className="mb-4 text-sm font-medium text-slate-300">
            Активность питания по дням
          </p>
          <WorkoutHeatmap
            data={heatmapDays}
            year={year}
            selectedDate={selectedDate}
            onDayClick={handleDayClick}
          />
        </Card>

        <div>
          {selectedDate && selectedEntries.length > 0 ? (
            <DayPanel date={selectedDate} entries={selectedEntries} />
          ) : (
            <Card className="flex h-full items-center justify-center">
              <p className="text-center text-sm text-slate-500">
                Нажми на день,<br />чтобы увидеть приёмы пищи
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
