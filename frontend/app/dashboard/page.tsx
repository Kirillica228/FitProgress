"use client";

import { BarChart } from "@/components/charts/bar-chart";
import { LineChart } from "@/components/charts/line-chart";
import { KpiCards } from "@/features/dashboard/kpi-cards";
import { QuickActionsPanel } from "@/features/dashboard/quick-actions";
import { RecentList } from "@/features/dashboard/recent-list";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { Card } from "@/components/ui/card";
import { ChartShell } from "@/components/ui/chart-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data, isLoading } = useDashboardData();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.5fr,0.9fr]">
          <Skeleton className="h-[22rem]" />
          <Skeleton className="h-[22rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <KpiCards
        calories={data.calories}
        workoutStatus={data.workoutStatus}
        weight={data.weight}
        latestMeasurement={data.latestMeasurement}
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr,0.9fr]">
        {/* <div className="space-y-6">
          <ChartShell title="Динамика веса" subtitle="Изменение веса за последние 7 замеров">
            <LineChart data={data.weightChart} />
          </ChartShell>
          <ChartShell title="Активность тренировок" subtitle="Сессии за последние 7 дней">
            <BarChart data={data.workoutActivity} />
          </ChartShell>
        </div> */}

        {/* <div className="space-y-6"> */}
          <Card>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Инсайт</p>
            <p className="mt-3 text-lg font-medium text-white">{data.insight}</p>
          </Card>
          <RecentList
            title="Последние тренировки"
            items={data.recentWorkouts.map((item) => ({
              id: String(item.id),
              title: item.workout.title,
              subtitle: `${new Date(item.started_at).toLocaleDateString("ru")} · ${item.workout.exercises.length} упр.`,
              value: item.workout.type,
            }))}
          />
          <RecentList
            title="Последние приёмы пищи"
            items={data.recentMeals.map((item) => ({
              id: String(item.id),
              title: item.food_name,
              subtitle: item.meal_type === "breakfast" ? "Завтрак"
                : item.meal_type === "lunch" ? "Обед"
                : item.meal_type === "dinner" ? "Ужин"
                : "Перекус",
              value: `${Math.round(item.calories)} ккал`,
            }))}
          />
          
        {/* </div> */}
      </div>
    </div>
  );
}
