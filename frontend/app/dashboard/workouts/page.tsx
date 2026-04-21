"use client";

import { BarChart } from "@/components/charts/bar-chart";
import { EmptyState } from "@/components/ui/empty-state";
import { ChartShell } from "@/components/ui/chart-shell";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateWorkoutBuilder } from "@/features/workouts/create-workout-builder";
import { useWorkoutsData } from "@/hooks/use-workouts-data";

export default function WorkoutsPage() {
  const { data, isLoading } = useWorkoutsData();

  if (isLoading) {
    return <Skeleton className="h-80" />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No workouts yet"
        description="Start with your first session and Fitprogress will build your history here."
        actionLabel="Create workout"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {data.map((workout) => (
          <Card key={workout.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{workout.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{workout.date}</p>
              </div>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{workout.type}</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl bg-white/[0.03] p-4">
                <div className="text-slate-400">Exercises</div>
                <div className="mt-2 text-xl font-semibold">{workout.exercises}</div>
              </div>
              <div className="rounded-2xl bg-white/[0.03] p-4">
                <div className="text-slate-400">Total volume</div>
                <div className="mt-2 text-xl font-semibold">{workout.volume}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <CreateWorkoutBuilder />

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartShell title="Progress per exercise" subtitle="Example progression snapshot">
          <BarChart
            data={[
              { label: "Bench", value: 74 },
              { label: "Squat", value: 82 },
              { label: "Row", value: 65 },
              { label: "Deadlift", value: 78 },
            ]}
          />
        </ChartShell>
        <ChartShell title="Workout frequency" subtitle="Sessions per week">
          <BarChart
            data={[
              { label: "W1", value: 3 },
              { label: "W2", value: 4 },
              { label: "W3", value: 4 },
              { label: "W4", value: 5 },
            ]}
          />
        </ChartShell>
      </div>
    </div>
  );
}
