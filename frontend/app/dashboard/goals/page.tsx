"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { GoalsGrid } from "@/features/goals/goals-grid";
import { useGoalsData } from "@/hooks/use-goals-data";

export default function GoalsPage() {
  const { data, isLoading } = useGoalsData();

  if (isLoading) {
    return <Skeleton className="h-80" />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No active goals"
        description="Create a goal to start tracking progress against something meaningful."
        actionLabel="Create goal"
      />
    );
  }

  return <GoalsGrid items={data} />;
}
