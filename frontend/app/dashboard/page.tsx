"use client";

import { KpiCards } from "@/features/dashboard/kpi-cards";
import { RecentList } from "@/features/dashboard/recent-list";
import { useDashboardData } from "@/hooks/use-dashboard-data";
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

      <div className="grid gap-6 xl:grid-cols-2">
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
      </div>
    </div>
  );
}
