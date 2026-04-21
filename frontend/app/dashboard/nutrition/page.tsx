"use client";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { NutritionSummary } from "@/features/nutrition/nutrition-summary";
import { useNutritionData } from "@/hooks/use-nutrition-data";

export default function NutritionPage() {
  const { data, isLoading } = useNutritionData();

  if (isLoading) {
    return <Skeleton className="h-80" />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="Your nutrition diary is empty"
        description="Add your first meal to start tracking calories and macronutrients."
        actionLabel="Add meal"
      />
    );
  }

  const totals = data.flatMap((group) => group.items).reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      fat: acc.fat + item.fat,
      carbs: acc.carbs + item.carbs,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 },
  );

  return (
    <div className="space-y-6">
      <NutritionSummary {...totals} />

      <Card>
        <div className="grid gap-4 md:grid-cols-[1.5fr,1fr,1fr]">
          <Input placeholder="Search foods..." />
          <Input placeholder="Quick add item" />
          <Input placeholder="Manual calories entry" />
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        {data.map((group) => (
          <Card key={group.title}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{group.title}</h3>
              <span className="text-sm text-slate-400">{group.items.length} items</span>
            </div>
            <div className="space-y-3">
              {group.items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-slate-300">{item.calories} kcal</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    {item.protein}P / {item.fat}F / {item.carbs}C
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
