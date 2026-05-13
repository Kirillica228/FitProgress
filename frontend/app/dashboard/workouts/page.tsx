"use client";

import { useState } from "react";
import { useHeatmapData } from "@/hooks/use-heatmap-data";
import { WorkoutHeatmap } from "@/components/charts/workout-heatmap";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { HeatmapDay, HeatmapSession } from "@/lib/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();

const TYPE_LABEL: Record<string, string> = {
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}

function SessionRow({ session }: { session: HeatmapSession }) {
  const isCardio = session.workout_type === "cardio";
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">
          {session.workout_name}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          {TYPE_LABEL[session.workout_type] ?? session.workout_type}
          {isCardio && session.duration != null && (
            <> · {session.duration} мин</>
          )}
        </p>
      </div>
    </div>
  );
}

function DayPanel({ day }: { day: HeatmapDay }) {
  return (
    <Card className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold text-white">{formatDate(day.date)}</p>
        <p className="text-xs text-slate-400">
          {day.count} {day.count === 1 ? "тренировка" : day.count < 5 ? "тренировки" : "тренировок"}
        </p>
      </div>
      <div className="space-y-2">
        {day.sessions.map((s) => (
          <SessionRow key={s.id} session={s} />
        ))}
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkoutsPage() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(null);
  const { data, isLoading } = useHeatmapData(year);

  function handleDayClick(day: HeatmapDay | null) {
    if (!day || day.count === 0) {
      setSelectedDay(null);
      return;
    }
    setSelectedDay((prev) => (prev?.date === day.date ? null : day));
  }

  // Заголовок + переключатель года — всегда видны
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

  // Статистика
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

      {/* Heatmap + drill-down */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <p className="mb-4 text-sm font-medium text-slate-300">
            Активность по дням
          </p>
          <WorkoutHeatmap
            data={data}
            year={year}
            selectedDate={selectedDay?.date ?? null}
            onDayClick={handleDayClick}
          />
        </Card>

        <div>
          {selectedDay ? (
            <DayPanel day={selectedDay} />
          ) : (
            <Card className="flex h-full items-center justify-center">
              <p className="text-center text-sm text-slate-500">
                Нажми на день,<br />чтобы увидеть тренировки
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
