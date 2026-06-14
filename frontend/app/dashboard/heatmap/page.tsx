"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { DonutChart } from "@/components/charts/donut-chart";
import type { ActivityToday, ActivityTodayFoodEntry } from "@/lib/types";

// ─── Muscle colors ────────────────────────────────────────────────────────────

const MUSCLE_COLORS: Record<string, string> = {
  chest: "#ef4444", back: "#3b82f6", shoulders: "#8b5cf6",
  arms: "#f97316", forearms: "#f59e0b", legs: "#10b981",
  calves: "#14b8a6", biceps: "#ec4899", triceps: "#06b6d4",
  hamstrings: "#6366f1", abs: "#a855f7", glutes: "#84cc16",
  "грудь": "#ef4444", "грудные": "#ef4444",
  "спина": "#3b82f6", "широчайшие": "#3b82f6",
  "плечи": "#8b5cf6", "дельты": "#8b5cf6",
  "руки": "#f97316", "бицепс": "#ec4899", "бицепсы": "#ec4899",
  "трицепс": "#06b6d4", "трицепсы": "#06b6d4",
  "ноги": "#10b981", "квадрицепсы": "#10b981", "бёдра": "#10b981",
  "икры": "#14b8a6", "икроножная": "#14b8a6",
  "предплечья": "#f59e0b", "пресс": "#a855f7",
  "ягодицы": "#84cc16", "подколенные": "#6366f1",
};

const COLOR_PALETTE = [
  "#ef4444","#3b82f6","#8b5cf6","#f97316","#10b981",
  "#ec4899","#06b6d4","#f59e0b","#14b8a6","#a855f7","#84cc16",
];

function getMuscleColor(muscle: string): string {
  const normalized = muscle.toLowerCase();
  if (MUSCLE_COLORS[normalized]) return MUSCLE_COLORS[normalized];
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayLabel(): string {
  return new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
      {children}
    </p>
  );
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 py-6 text-center">
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  );
}

function WorkoutsSection({ data }: { data: ActivityToday["workouts"] }) {
  const { sessions, summary } = data;

  if (sessions.length === 0) {
    return <EmptyBlock text="Тренировок ещё нет — самое время!" />;
  }

  // Aggregate muscle groups across all sessions for the donut chart
  const muscleMap: Record<string, number> = {};
  sessions.forEach((session) => {
    session.exercises.forEach((ex) => {
      ex.muscle_groups.forEach((mg) => {
        muscleMap[mg] = (muscleMap[mg] || 0) + ex.total_sets;
      });
    });
  });
  const muscleSegments = Object.entries(muscleMap)
    .sort((a, b) => b[1] - a[1])
    .map(([muscle, sets]) => ({
      value: sets,
      color: getMuscleColor(muscle),
      label: muscle,
    }));

  return (
    <div className="space-y-3">
      {/* Summary row */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {summary.total_duration > 0 && (
          <div className="rounded-xl bg-white/[0.04] p-3 text-center">
            <p className="text-lg font-semibold text-white">{summary.total_duration}</p>
            <p className="text-[11px] text-slate-400">мин</p>
          </div>
        )}
        <div className="rounded-xl bg-white/[0.04] p-3 text-center">
          <p className="text-lg font-semibold text-white">{summary.total_exercises}</p>
          <p className="text-[11px] text-slate-400">упражнений</p>
        </div>
        <div className="rounded-xl bg-white/[0.04] p-3 text-center">
          <p className="text-lg font-semibold text-white">{summary.total_sets}</p>
          <p className="text-[11px] text-slate-400">подходов</p>
        </div>
        {summary.total_tonnage > 0 && (
          <div className="rounded-xl bg-white/[0.04] p-3 text-center">
            <p className="text-lg font-semibold text-white">
              {summary.total_tonnage >= 1000
                ? `${(summary.total_tonnage / 1000).toFixed(1)} т`
                : `${Math.round(summary.total_tonnage)} кг`}
            </p>
            <p className="text-[11px] text-slate-400">тоннаж</p>
          </div>
        )}
      </div>

      {/* Muscle distribution donut */}
      {muscleSegments.length > 0 && (
        <div className="flex flex-col items-center pt-2">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
            Распределение подходов по мышцам
          </p>
          <DonutChart
            segments={muscleSegments}
            size={130}
            strokeWidth={22}
            showLegend
          />
        </div>
      )}

      {/* Sessions */}
      {sessions.map((session) => (
        <div
          key={session.id}
          className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-3"
        >
          <p className="text-sm font-medium text-white">
            Тренировка {session.duration ? `· ${session.duration} мин` : ""}
          </p>

          <div className="space-y-1.5">
            {session.exercises.map((ex, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{ex.name}</p>
                  {ex.muscle_groups.length > 0 && (
                    <p className="text-[11px] text-slate-500">{ex.muscle_groups.join(", ")}</p>
                  )}
                </div>
                <span className="ml-3 shrink-0 text-xs text-slate-400">{ex.total_sets} подх.</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MealGroup({
  mealType,
  entries,
}: {
  mealType: string;
  entries: ActivityTodayFoodEntry[];
}) {
  if (entries.length === 0) return null;

  const total = entries.reduce((s, e) => s + e.calories, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-sm font-medium text-slate-200">
          {MEAL_EMOJI[mealType]} {MEAL_LABEL[mealType] ?? mealType}
        </p>
        <p className="text-xs text-slate-500">{Math.round(total)} ккал</p>
      </div>
      <div className="space-y-1">
        {entries.map((e) => (
          <div
            key={e.id}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2"
          >
            <div className="min-w-0">
              <p className="text-sm text-white truncate">{e.food_name}</p>
              <p className="text-[11px] text-slate-500">
                {e.grams} г &nbsp;·&nbsp;
                <span className="text-green-400">Б {Math.round(e.protein)}</span>
                &nbsp;
                <span className="text-orange-400">Ж {Math.round(e.fats)}</span>
                &nbsp;
                <span className="text-blue-400">У {Math.round(e.carbs)}</span>
              </p>
            </div>
            <p className="ml-3 shrink-0 text-sm font-medium text-orange-400">
              {Math.round(e.calories)} ккал
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NutritionSection({ data }: { data: ActivityToday["nutrition"] }) {
  const { totals, goals, entries_by_meal, has_entries } = data;

  if (!has_entries) {
    return <EmptyBlock text="Записей питания ещё нет" />;
  }

  const calPct = goals?.calories && goals.calories > 0
    ? Math.min((totals.calories / goals.calories) * 100, 100)
    : null;
  const calOver = goals?.calories != null && totals.calories > goals.calories;

  return (
    <div className="space-y-4">
      {/* Calories block */}
      <div className="rounded-2xl bg-white/[0.03] p-4">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className={`text-3xl font-bold ${calOver ? "text-red-400" : "text-white"}`}>
              {Math.round(totals.calories)}
            </p>
            <p className="text-xs text-slate-400">
              ккал{goals?.calories != null ? ` / ${goals.calories}` : ""}
            </p>
          </div>
          {calPct !== null && (
            <p className={`text-sm font-medium ${calOver ? "text-red-400" : "text-emerald-400"}`}>
              {Math.round(calPct)}%
            </p>
          )}
        </div>
        {calPct !== null && (
          <ProgressBar value={calPct} color={calOver ? "bg-red-500" : "bg-emerald-500"} />
        )}

        {/* Macros row */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { label: "Белки", value: totals.protein, goal: goals?.protein ?? null, color: "text-green-400", bar: "bg-green-500" },
            { label: "Жиры", value: totals.fats, goal: goals?.fats ?? null, color: "text-orange-400", bar: "bg-orange-500" },
            { label: "Углеводы", value: totals.carbs, goal: goals?.carbs ?? null, color: "text-blue-400", bar: "bg-blue-500" },
          ].map(({ label, value, goal, color, bar }) => {
            const pct = goal && goal > 0 ? Math.min((value / goal) * 100, 100) : null;
            return (
              <div key={label}>
                <p className={`text-sm font-semibold ${color}`}>{Math.round(value)} г</p>
                <p className="text-[10px] text-slate-500">{label}{goal ? ` / ${goal}` : ""}</p>
                {pct !== null && <ProgressBar value={pct} color={bar} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-3">
        {(["breakfast", "lunch", "dinner", "snack"] as const).map((mt) => (
          <MealGroup key={mt} mealType={mt} entries={entries_by_meal[mt]} />
        ))}
      </div>
    </div>
  );
}

function MeasurementSection({ data }: { data: NonNullable<ActivityToday["measurement"]> }) {
  const items = [
    { label: "Вес", value: data.weight, unit: "кг" },
    { label: "Грудь", value: data.chest, unit: "см" },
    { label: "Талия", value: data.waist, unit: "см" },
    { label: "Бёдра", value: data.hips, unit: "см" },
  ].filter((item) => item.value != null);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map(({ label, value, unit }) => (
        <div key={label} className="rounded-2xl bg-white/[0.03] p-3 text-center">
          <p className="text-lg font-semibold text-white">{value} {unit}</p>
          <p className="text-[11px] text-slate-400">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ActivityTodayPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["activity-today"],
    queryFn: () => api.getActivityToday(),
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white capitalize">{todayLabel()}</h1>
          <p className="mt-0.5 text-sm text-slate-400">Активность сегодня</p>
        </div>
        {data.streak > 0 && (
          <div className="flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5">
            <span className="text-base">🔥</span>
            <span className="text-sm font-medium text-orange-400">{data.streak} дн.</span>
          </div>
        )}
      </div>

      {/* Workouts */}
      <Card>
        <SectionTitle>Тренировки</SectionTitle>
        <div className="mt-3">
          <WorkoutsSection data={data.workouts} />
        </div>
      </Card>

      {/* Nutrition */}
      <Card>
        <SectionTitle>Питание</SectionTitle>
        <div className="mt-3">
          <NutritionSection data={data.nutrition} />
        </div>
      </Card>

      {/* Measurements (only if logged today) */}
      {data.measurement && (
        <Card>
          <SectionTitle>Замеры тела</SectionTitle>
          <div className="mt-3">
            <MeasurementSection data={data.measurement} />
          </div>
        </Card>
      )}
    </div>
  );
}
