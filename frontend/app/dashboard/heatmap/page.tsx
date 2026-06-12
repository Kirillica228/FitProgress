"use client";

import { useState, useMemo } from "react";
import { WorkoutHeatmap } from "@/components/charts/workout-heatmap";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useHeatmapData } from "@/hooks/use-heatmap-data";
import { useNutritionHeatmapData } from "@/hooks/use-nutrition-heatmap-data";
import { useNutritionData } from "@/hooks/use-nutrition-data";
import type { HeatmapDay, FoodEntry } from "@/lib/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function computeStreak(data: HeatmapDay[]): { current: number; best: number } {
  if (data.length === 0) return { current: 0, best: 0 };

  const dateSet = new Set(data.map((d) => d.date));
  const today = new Date().toISOString().slice(0, 10);

  let current = 0;
  const cur = new Date(today);
  while (dateSet.has(cur.toISOString().slice(0, 10))) {
    current++;
    cur.setDate(cur.getDate() - 1);
  }

  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  let best = 0;
  let streak = 0;
  let prev: Date | null = null;

  for (const day of sorted) {
    const d = new Date(day.date);
    if (prev) {
      const diff = (d.getTime() - prev.getTime()) / 86400000;
      streak = diff === 1 ? streak + 1 : 1;
    } else {
      streak = 1;
    }
    if (streak > best) best = streak;
    prev = d;
  }

  return { current, best };
}

function busyMonth(data: HeatmapDay[]): string {
  if (data.length === 0) return "—";
  const counts: Record<string, number> = {};
  for (const d of data) {
    const m = d.date.slice(0, 7);
    counts[m] = (counts[m] ?? 0) + d.count;
  }
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!best) return "—";
  return new Date(best[0] + "-01").toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] p-3 sm:p-4 text-center">
      <div className="text-xl sm:text-2xl font-bold text-white">{value}</div>
      <div className="mt-1 text-[10px] sm:text-xs text-slate-400">{label}</div>
    </div>
  );
}

function DayPanel({
  day,
  foodEntries,
}: {
  day: HeatmapDay;
  foodEntries: FoodEntry[];
}) {
  const totalCal = foodEntries.reduce((s, e) => s + (e.calories ?? 0), 0);

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-white">{formatDate(day.date)}</h3>

      {/* Тренировки */}
      {day.sessions.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            Тренировки
          </p>
          <div className="space-y-2">
            {day.sessions.map((s) => (
              <div key={s.id} className="rounded-xl bg-white/[0.04] p-3 text-sm">
                <div className="font-medium text-white">Тренировка</div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
                  {s.duration != null && (
                    <span>{s.duration} мин</span>
                  )}
                  {s.exercises_count > 0 && (
                    <span>{s.exercises_count} упражнений</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Тренировок нет</p>
      )}

      {/* Питание */}
      {foodEntries.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            Питание · {Math.round(totalCal).toLocaleString("ru-RU")} ккал
          </p>
          <div className="space-y-1.5">
            {foodEntries.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <span className="text-white truncate">{e.food_name}</span>
                  {e.meal_type && (
                    <span className="ml-2 text-xs text-slate-500">
                      {MEAL_LABELS[e.meal_type] ?? e.meal_type}
                    </span>
                  )}
                </div>
                <span className="ml-2 shrink-0 text-xs text-slate-400">
                  {Math.round(e.calories)} ккал
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Записей питания нет</p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HeatmapPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(null);

  const { data: workoutData, isLoading: workoutLoading } = useHeatmapData(year);
  const { data: nutritionData, isLoading: nutritionLoading } = useNutritionHeatmapData(year);
  const { data: allFoodEntries, isLoading: foodLoading } = useNutritionData();

  const isLoading = workoutLoading || nutritionLoading || foodLoading;

  const streak = useMemo(() => computeStreak(workoutData ?? []), [workoutData]);
  const totalSessions = useMemo(
    () => (workoutData ?? []).reduce((s, d) => s + d.count, 0),
    [workoutData],
  );
  const activeDays = useMemo(() => (workoutData ?? []).length, [workoutData]);
  const topMonth = useMemo(() => busyMonth(workoutData ?? []), [workoutData]);

  const totalNutritionDays = useMemo(
    () => (nutritionData ?? []).filter((d) => d.count > 0).length,
    [nutritionData],
  );
  const avgCalPerDay = useMemo(() => {
    const active = (nutritionData ?? []).filter((d) => d.count > 0);
    if (active.length === 0) return 0;
    return Math.round(active.reduce((s, d) => s + d.calories, 0) / active.length);
  }, [nutritionData]);

  const selectedFoodEntries = useMemo<FoodEntry[]>(() => {
    if (!selectedDay || !allFoodEntries) return [];
    return allFoodEntries.filter((e) => {
      if (!e.logged_at) return false;
      const d = new Date(e.logged_at);
      const entryDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return entryDate === selectedDay.date;
    });
  }, [selectedDay, allFoodEntries]);

  function handleDayClick(day: HeatmapDay | null) {
    setSelectedDay((prev) =>
      prev?.date === day?.date ? null : day,
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const hasWorkouts = workoutData && workoutData.length > 0;
  const hasNutrition = nutritionData && nutritionData.length > 0;

  return (
    <div className="space-y-6">
      {/* Заголовок + выбор года */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Активность</h1>
          <p className="mt-0.5 text-sm text-slate-400">
            Тренировки и питание за {year} год
          </p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => { setYear((y) => y - 1); setSelectedDay(null); }}
            className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10 transition-colors"
            aria-label="Предыдущий год"
          >
            ←
          </button>
          <span className="min-w-[3rem] text-center text-sm font-medium text-white">
            {year}
          </span>
          <button
            onClick={() => { setYear((y) => y + 1); setSelectedDay(null); }}
            disabled={year >= currentYear}
            className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Следующий год"
          >
            →
          </button>
        </div>
      </div>

      {/* KPI — тренировки */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          Тренировки
        </p>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
          <StatCard label="Сессий за год" value={totalSessions} />
          <StatCard label="Активных дней" value={activeDays} />
          <StatCard label="Текущая серия" value={`${streak.current} дн.`} />
          <StatCard label="Лучшая серия" value={`${streak.best} дн.`} />
        </div>
      </div>

      {/* KPI — питание */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          Питание
        </p>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
          <StatCard label="Дней с записями" value={totalNutritionDays} />
          <StatCard label="Ккал/день (ср.)" value={avgCalPerDay > 0 ? avgCalPerDay : "—"} />
        </div>
      </div>

      {/* Единый календарь + drill-down панель */}
      {!hasWorkouts && !hasNutrition ? (
        <EmptyState
          title="Нет данных за этот год"
          description="Начни тренироваться и записывать питание через бота — активность появится здесь."
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <p className="mb-3 text-sm font-medium text-slate-300">
              Календарь активности
            </p>
            {hasWorkouts ? (
              <>
                <WorkoutHeatmap
                  data={workoutData}
                  year={year}
                  selectedDate={selectedDay?.date ?? null}
                  onDayClick={handleDayClick}
                />
                <p className="mt-3 text-xs text-slate-500">
                  Самый активный месяц:{" "}
                  <span className="text-slate-300">{topMonth}</span>
                  <span className="hidden sm:inline">
                    {" · "}Нажми на день для деталей
                  </span>
                </p>
              </>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">
                Нет тренировок за {year} год
              </p>
            )}
          </Card>

          {/* Панель деталей дня */}
          <Card>
            {selectedDay ? (
              <DayPanel day={selectedDay} foodEntries={selectedFoodEntries} />
            ) : (
              <div className="flex h-full min-h-[120px] flex-col items-center justify-center gap-2 text-center">
                <p className="text-sm text-slate-500">
                  Нажми на день в календаре
                </p>
                <p className="text-xs text-slate-600">
                  Увидишь тренировки и питание за этот день
                </p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
