"use client";

import { useState, useMemo } from "react";
import { WorkoutHeatmap } from "@/components/charts/workout-heatmap";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useHeatmapData } from "@/hooks/use-heatmap-data";
import type { HeatmapDay } from "@/lib/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  strength: "Силовая",
  cardio: "Кардио",
  home: "Домашняя",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Считает текущую серию (streak) — дней подряд с тренировками до сегодня */
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

  // Лучшая серия за весь период
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

/** Самый активный месяц */
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
    <div className="rounded-2xl bg-white/[0.03] p-4 text-center">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs text-slate-400">{label}</div>
    </div>
  );
}

function DayPanel({ day }: { day: HeatmapDay }) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-white">{formatDate(day.date)}</h3>
      <p className="text-sm text-slate-400">
        {day.count} {day.count === 1 ? "тренировка" : day.count < 5 ? "тренировки" : "тренировок"}
        {day.volume > 0 && (
          <> · объём {Math.round(day.volume).toLocaleString("ru-RU")}</>
        )}
      </p>
      <div className="space-y-2">
        {day.sessions.map((s) => (
          <div
            key={s.id}
            className="rounded-xl bg-white/[0.04] p-3 text-sm"
          >
            <div className="font-medium text-white">{s.workout_name}</div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
              {s.workout_type && (
                <span>{TYPE_LABELS[s.workout_type] ?? s.workout_type}</span>
              )}
              {s.duration != null && <span>{s.duration} мин</span>}
              {s.exercises_count > 0 && (
                <span>{s.exercises_count} упражнений</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HeatmapPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(null);

  const { data, isLoading } = useHeatmapData(year);

  const streak = useMemo(() => computeStreak(data ?? []), [data]);
  const totalSessions = useMemo(
    () => (data ?? []).reduce((s, d) => s + d.count, 0),
    [data],
  );
  const activeDays = useMemo(() => (data ?? []).length, [data]);
  const topMonth = useMemo(() => busyMonth(data ?? []), [data]);

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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок + выбор года */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Активность</h1>
          <p className="mt-0.5 text-sm text-slate-400">
            Тренировки за {year} год
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Тренировок за год" value={totalSessions} />
        <StatCard label="Активных дней" value={activeDays} />
        <StatCard label="Текущая серия" value={`${streak.current} дн.`} />
        <StatCard label="Лучшая серия" value={`${streak.best} дн.`} />
      </div>

      {/* Heatmap + drill-down */}
      {!data || data.length === 0 ? (
        <EmptyState
          title="Нет тренировок за этот год"
          description="Начни тренироваться через бота — активность появится здесь."
          actionLabel="Открыть бота"
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          {/* Календарь */}
          <Card className="xl:col-span-2">
            <WorkoutHeatmap
              data={data}
              year={year}
              selectedDate={selectedDay?.date ?? null}
              onDayClick={handleDayClick}
            />
            <p className="mt-3 text-xs text-slate-500">
              Самый активный месяц: <span className="text-slate-300">{topMonth}</span>
            </p>
          </Card>

          {/* Панель деталей */}
          <Card>
            {selectedDay ? (
              <DayPanel day={selectedDay} />
            ) : (
              <div className="flex h-full min-h-[120px] items-center justify-center text-sm text-slate-500">
                Нажми на день, чтобы увидеть тренировки
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
