"use client";

import { BarChart } from "@/components/charts/bar-chart";
import { LineChart } from "@/components/charts/line-chart";
import { ChartShell } from "@/components/ui/chart-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { KpiCards } from "@/features/dashboard/kpi-cards";
import { QuickActionsPanel } from "@/features/dashboard/quick-actions";
import { RecentList } from "@/features/dashboard/recent-list";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  const { data, isLoading } = useDashboardData();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
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
        goalProgress={data.goalProgress}
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr,0.9fr]">
        <div className="space-y-6">
          <ChartShell title="Weight trend" subtitle="Daily body-weight movement over the last 7 days">
            <LineChart data={data.weightChart} />
          </ChartShell>
          <ChartShell title="Workout activity" subtitle="Sessions completed this week">
            <BarChart data={data.workoutActivity} />
          </ChartShell>
        </div>

        <div className="space-y-6">
          <Card>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Insight</p>
            <p className="mt-3 text-lg font-medium text-white">{data.insight}</p>
          </Card>
          <RecentList
            title="Recent workouts"
            items={data.recentWorkouts.map((item) => ({
              id: item.id,
              title: item.title,
              subtitle: `${item.date} · ${item.exercises} exercises`,
              value: item.volume,
            }))}
          />
          <RecentList
            title="Recent meals"
            items={data.recentMeals.map((item) => ({
              id: item.id,
              title: item.name,
              subtitle: `${item.protein}P / ${item.fat}F / ${item.carbs}C`,
              value: `${item.calories} kcal`,
            }))}
          />
          <QuickActionsPanel />
        </div>
      </div>
    </div>
  );
}
