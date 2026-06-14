"use client";

import { useState } from "react";
import { useHeatmapData } from "@/hooks/use-heatmap-data";
import { WorkoutHeatmap } from "@/components/charts/workout-heatmap";
import { DonutChart } from "@/components/charts/donut-chart";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { HeatmapDay, WorkoutDayDetail } from "@/lib/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();

const MUSCLE_COLORS: Record<string, string> = {
  chest: "#ef4444",
  back: "#3b82f6",
  shoulders: "#8b5cf6",
  arms: "#f97316",
  forearms: "#f59e0b",
  legs: "#10b981",
  calves: "#14b8a6",
  biceps: "#ec4899",
  triceps: "#06b6d4",
  hamstrings: "#6366f1",
};

function getMuscleColor(muscle: string): string {
  const normalized = muscle.toLowerCase();
  return MUSCLE_COLORS[normalized] || "#6b7280";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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

function WorkoutDayPanel({ data }: { data: WorkoutDayDetail }) {
  const { summary, exercises, progress, muscle_load, records } = data;

  const maxMuscleLoad = muscle_load.length > 0 ? muscle_load[0].sets_count : 1;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          Сводка тренировки
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {summary.duration > 0 && (
            <div className="rounded-xl bg-white/[0.04] p-3 text-center">
              <p className="text-lg font-semibold text-white">{summary.duration}</p>
              <p className="text-[11px] text-slate-400">мин</p>
            </div>
          )}
          <div className="rounded-xl bg-white/[0.04] p-3 text-center">
            <p className="text-lg font-semibold text-white">{summary.exercises_count}</p>
            <p className="text-[11px] text-slate-400">упражнений</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] p-3 text-center">
            <p className="text-lg font-semibold text-white">{summary.total_sets}</p>
            <p className="text-[11px] text-slate-400">подходов</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] p-3 text-center">
            <p className="text-lg font-semibold text-white">{summary.total_reps}</p>
            <p className="text-[11px] text-slate-400">повторений</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] p-3 text-center">
            <p className="text-lg font-semibold text-white">
              {summary.total_tonnage >= 1000
                ? `${(summary.total_tonnage / 1000).toFixed(1)} т`
                : `${Math.round(summary.total_tonnage)} кг`}
            </p>
            <p className="text-[11px] text-slate-400">тоннаж</p>
          </div>
        </div>
      </div>

      {/* Muscle load distribution */}
      {muscle_load.length > 0 && (
        <div className="flex flex-col items-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-500">
            Распределение подходов по мышцам
          </p>
          <DonutChart
            segments={muscle_load.map((m) => ({
              value: m.sets_count,
              color: getMuscleColor(m.muscle),
              label: m.muscle,
            }))}
            size={130}
            strokeWidth={22}
            showLegend
          />
        </div>
      )}

      {/* Exercises + Progress side by side on wider screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            Выполненные упражнения
          </p>
          <div className="space-y-2">
            {exercises.map((ex, i) => (
              <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                <p className="text-sm font-medium text-white">{ex.exercise.name}</p>
                <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-slate-400">
                  <span>{ex.total_sets} подходов</span>
                  {ex.best_set && ex.best_set.weight && (
                    <span>Лучший: {ex.best_set.weight} x {ex.best_set.reps}</span>
                  )}
                  {ex.best_set && !ex.best_set.weight && (
                    <span>Всего повторений: {ex.sets.reduce((s, set) => s + set.reps, 0)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress */}
        {progress.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
              Прогресс относительно прошлого раза
            </p>
            <div className="space-y-2">
              {progress.map((p, i) => {
                if (!p.previous_best) return null;
                const hasWeightDelta = p.delta_weight !== 0;
                const hasRepsDelta = p.delta_reps !== 0;
                if (!hasWeightDelta && !hasRepsDelta) return null;

                return (
                  <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                    <p className="text-sm font-medium text-white">{p.exercise_name}</p>
                    <div className="mt-1 flex flex-wrap gap-x-3 text-xs">
                      {p.current_best.weight && (
                        <span className="text-slate-300">
                          {p.current_best.weight} x {p.current_best.reps}
                        </span>
                      )}
                      {hasWeightDelta && (
                        <span className={p.delta_weight > 0 ? "text-green-400" : "text-red-400"}>
                          {p.delta_weight > 0 ? "↑" : "↓"} {Math.abs(p.delta_weight)} кг
                        </span>
                      )}
                      {hasRepsDelta && (
                        <span className={p.delta_reps > 0 ? "text-green-400" : "text-red-400"}>
                          {p.delta_reps > 0 ? "↑" : "↓"} {Math.abs(p.delta_reps)} повтор.
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Muscle load + Records side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        {muscle_load.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
              Нагруженные мышцы
            </p>
            <div className="space-y-2">
              {muscle_load.map((m, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{m.muscle}</span>
                    <span className="text-slate-500">{m.sets_count} подх.</span>
                  </div>
                  <ProgressBar
                    value={(m.sets_count / maxMuscleLoad) * 100}
                    color="bg-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {records.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
              Рекорды дня
            </p>
            <div className="space-y-2">
              {records.map((r, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
                  <span className="text-lg">🏆</span>
                  <div>
                    <p className="text-sm font-medium text-white">{r.exercise_name}</p>
                    <p className="text-xs text-yellow-400">
                      {r.type === "weight"
                        ? `${r.value} кг x ${r.reps}`
                        : `${r.reps} повторений`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkoutsPage() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { data, isLoading } = useHeatmapData(year);

  const { data: dayDetail, isLoading: dayLoading } = useQuery({
    queryKey: ["workout-day", selectedDate],
    queryFn: () => api.getWorkoutDay(selectedDate!),
    enabled: !!selectedDate,
  });

  function handleDayClick(day: HeatmapDay | null) {
    if (!day || day.count === 0) {
      setSelectedDate(null);
      return;
    }
    setSelectedDate((prev) => (prev === day.date ? null : day.date));
  }

  const yearSwitcher = (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold text-white">Тренировки</h1>
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

  if (!data || data.length === 0) {
    return (
      <div className="space-y-6">
        {yearSwitcher}
        <EmptyState
          title="Нет данных о тренировках"
          description="Начни тренироваться, чтобы увидеть свою активность здесь."
        />
      </div>
    );
  }

  const totalSessions = data.reduce((s, d) => s + d.count, 0);
  const activeDays = data.filter((d) => d.count > 0).length;
  const maxInDay = Math.max(...data.map((d) => d.count));

  return (
    <div className="space-y-6">
      {yearSwitcher}

      {/* KPI */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Всего сессий" value={totalSessions} />
        <StatCard label="Активных дней" value={activeDays} />
        <StatCard label="Макс. в день" value={maxInDay} />
      </div>

      {/* Heatmap — full width on top */}
      <Card>
        <p className="mb-4 text-sm font-medium text-slate-300">
          Активность по дням
        </p>
        <WorkoutHeatmap
          data={data}
          year={year}
          selectedDate={selectedDate}
          onDayClick={handleDayClick}
        />
      </Card>

      {/* Day detail below */}
      {selectedDate && dayDetail ? (
        <Card>
          <p className="mb-4 text-sm font-semibold text-white">{formatDate(selectedDate)}</p>
          <WorkoutDayPanel data={dayDetail} />
        </Card>
      ) : selectedDate && dayLoading ? (
        <Card>
          <Skeleton className="h-32 w-full" />
        </Card>
      ) : (
        <Card>
          <p className="py-4 text-center text-sm text-slate-500">
            Нажми на день в календаре, чтобы увидеть статистику тренировки
          </p>
        </Card>
      )}
    </div>
  );
}
