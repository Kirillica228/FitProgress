"use client";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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
        title="Дневник питания пуст"
        description="Добавьте первый приём пищи через бота — данные появятся здесь."
        actionLabel="Открыть бота"
      />
    );
  }

  const totals = data.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      fat: acc.fat + item.fats,
      carbs: acc.carbs + item.carbs,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 },
  );

  // Group entries by date
  const grouped = data.reduce<Record<string, typeof data>>((acc, item) => {
    const date = item.logged_at.slice(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      <NutritionSummary {...totals} />

      <div className="grid gap-6 xl:grid-cols-3">
        {sortedDates.map((date) => (
          <Card key={date}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {new Date(date).toLocaleDateString("ru", {
                  day: "numeric",
                  month: "long",
                })}
              </h3>
              <span className="text-sm text-slate-400">{grouped[date].length} записей</span>
            </div>
            <div className="space-y-3">
              {grouped[date].map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/5 bg-white/[0.03] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{item.food_name}</span>
                    <span className="text-sm text-slate-300">{item.calories} ккал</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    {item.grams} г · {item.protein}Б / {item.fats}Ж / {item.carbs}У
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
