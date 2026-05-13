"use client";

import { BarChart } from "@/components/charts/bar-chart";
import { EmptyState } from "@/components/ui/empty-state";
import { ChartShell } from "@/components/ui/chart-shell";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkoutsData } from "@/hooks/use-workouts-data";

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "Начинающий",
  intermediate: "Средний",
  advanced: "Продвинутый",
};

const TYPE_LABELS: Record<string, string> = {
  strength: "Силовая",
  cardio: "Кардио",
  home: "Дома",
};

export default function WorkoutsPage() {
  const { data, isLoading } = useWorkoutsData();

  if (isLoading) {
    return <Skeleton className="h-80" />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="Тренировок пока нет"
        description="Начните первую сессию через бота — история появится здесь."
        actionLabel="Открыть бота"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {data.map((session) => (
          <Card key={session.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{session.workout.title}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {new Date(session.started_at).toLocaleDateString("ru", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {TYPE_LABELS[session.workout.type] ?? session.workout.type}
                </span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">
                  {DIFFICULTY_LABELS[session.workout.difficulty] ?? session.workout.difficulty}
                </span>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl bg-white/[0.03] p-4">
                <div className="text-slate-400">Упражнений</div>
                <div className="mt-2 text-xl font-semibold">
                  {session.workout.exercises.length}
                </div>
              </div>
              <div className="rounded-2xl bg-white/[0.03] p-4">
                <div className="text-slate-400">Длительность</div>
                <div className="mt-2 text-xl font-semibold">
                  {session.finished_at
                    ? `${Math.round(
                        (new Date(session.finished_at).getTime() -
                          new Date(session.started_at).getTime()) /
                          60000,
                      )} мин`
                    : "—"}
                </div>
              </div>
            </div>
            {session.workout.exercises.length > 0 && (
              <div className="mt-4 space-y-1">
                {session.workout.exercises.slice(0, 3).map((we) => (
                  <p key={we.id} className="text-sm text-slate-400">
                    {we.exercise.name} — {we.sets}×{we.reps}
                  </p>
                ))}
                {session.workout.exercises.length > 3 && (
                  <p className="text-sm text-slate-500">
                    +{session.workout.exercises.length - 3} ещё
                  </p>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartShell title="Частота тренировок" subtitle="Сессий по неделям">
          <BarChart
            data={Array.from({ length: 4 }, (_, i) => ({
              label: `Нед ${i + 1}`,
              value: data.filter((s) => {
                const d = new Date(s.started_at);
                const weekStart = new Date(Date.now() - (3 - i) * 7 * 24 * 60 * 60 * 1000);
                const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
                return d >= weekStart && d < weekEnd;
              }).length,
            }))}
          />
        </ChartShell>
        <ChartShell title="Типы тренировок" subtitle="Распределение по типу">
          <BarChart
            data={Object.entries(
              data.reduce<Record<string, number>>((acc, s) => {
                const t = TYPE_LABELS[s.workout.type] ?? s.workout.type;
                acc[t] = (acc[t] ?? 0) + 1;
                return acc;
              }, {}),
            ).map(([label, value]) => ({ label, value }))}
          />
        </ChartShell>
      </div>
    </div>
  );
}
