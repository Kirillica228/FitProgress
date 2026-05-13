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
        title="Нет активных целей"
        description="Создайте цель через бота, чтобы отслеживать прогресс."
        actionLabel="Открыть бота"
      />
    );
  }

  return <GoalsGrid items={data} />;
}
