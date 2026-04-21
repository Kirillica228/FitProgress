"use client";

import { LineChart } from "@/components/charts/line-chart";
import { ChartShell } from "@/components/ui/chart-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Table } from "@/components/ui/table";
import { useProgressData } from "@/hooks/use-progress-data";

export default function ProgressPage() {
  const { data, isLoading } = useProgressData();

  if (isLoading) {
    return <Skeleton className="h-80" />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No body progress data yet"
        description="Add body measurements to unlock weight trend and change-over-time views."
        actionLabel="Add measurement"
      />
    );
  }

  const first = data[0].weight;
  const last = data[data.length - 1].weight;
  const change = (((last - first) / first) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <ChartShell title="Weight chart" subtitle={`Change over time: ${change}%`}>
        <LineChart data={data.map((item) => ({ label: item.date.slice(5), value: item.weight }))} />
      </ChartShell>

      <Table
        headers={["Date", "Weight", "Waist", "Chest"]}
        rows={data.map((item) => [item.date, `${item.weight} kg`, `${item.waist} cm`, `${item.chest} cm`])}
      />
    </div>
  );
}
