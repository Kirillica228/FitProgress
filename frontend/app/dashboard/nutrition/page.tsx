"use client";

import { useState } from "react";
import { useNutritionHeatmapData } from "@/hooks/use-nutrition-heatmap-data";
import { useProfile } from "@/hooks/use-profile";
import { WorkoutHeatmap } from "@/components/charts/workout-heatmap";
import { DonutChart } from "@/components/charts/donut-chart";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { NutritionHeatmapDay, NutritionDayDetail, HeatmapDay } from "@/lib/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();

const MEAL_LABEL: Record<string, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
};

const MEAL_EMOJI: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snack: "🍎",
};

const MACRO_COLORS = { protein: "#22c55e", fats: "#f97316", carbs: "#3b82f6" };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toHeatmapDays(data: NutritionHeatmapDay[]): HeatmapDay[] {
  return data.map((d) => ({
    date: d.date,
    count: d.count,
    volume: d.calories,
    sessions: [],
  }));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}

function MacroRow({
  label,
  value,
  goal,
  color,
}: {
  label: string;
  value: number;
  goal: number | null;
  color: string;
}) {
  const pct = goal && goal > 0 ? (value / goal) * 100 : 0;
  const isOver = goal != null && value > goal;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className={isOver ? "text-red-400 font-medium" : "text-white font-medium"}>
          {Math.round(value)} г
          {goal != null && goal > 0 && <span className="text-slate-500"> / {goal} г</span>}
        </span>
      </div>
      {goal != null && goal > 0 && (
        <ProgressBar value={pct} color={isOver ? "bg-red-500" : color} />
      )}
    </div>
  );
}

function clampInput(val: string): string {
  if (val === "") return "";
  const n = parseFloat(val);
  return isNaN(n) || n < 0 ? "0" : val;
}

function toGoal(s: string): number | null {
  const n = Number(s);
  return s !== "" && n > 0 ? n : null;
}

function GoalsEditor({
  currentGoals,
}: {
  currentGoals: { calories: number | null; protein: number | null; fats: number | null; carbs: number | null };
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [calories, setCalories] = useState(currentGoals.calories ? String(currentGoals.calories) : "");
  const [protein, setProtein] = useState(currentGoals.protein ? String(currentGoals.protein) : "");
  const [fats, setFats] = useState(currentGoals.fats ? String(currentGoals.fats) : "");
  const [carbs, setCarbs] = useState(currentGoals.carbs ? String(currentGoals.carbs) : "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await api.updateProfile({
        calorie_goal: toGoal(calories),
        protein_goal: toGoal(protein),
        fat_goal: toGoal(fats),
        carbs_goal: toGoal(carbs),
      });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["nutrition-day"] });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    const hasGoals =
      currentGoals.calories || currentGoals.protein || currentGoals.fats || currentGoals.carbs;
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-slate-300">Дневные лимиты КБЖУ</p>
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
          >
            {hasGoals ? "Изменить" : "Задать лимиты"}
          </button>
        </div>
        {hasGoals ? (
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="rounded-xl bg-white/[0.04] p-3">
              <p className="text-xl font-semibold text-white">{currentGoals.calories ?? "—"}</p>
              <p className="text-[11px] text-slate-500 mt-1">ккал</p>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-3">
              <p className="text-xl font-semibold text-green-400">{currentGoals.protein ?? "—"}</p>
              <p className="text-[11px] text-slate-500 mt-1">белки г</p>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-3">
              <p className="text-xl font-semibold text-orange-400">{currentGoals.fats ?? "—"}</p>
              <p className="text-[11px] text-slate-500 mt-1">жиры г</p>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-3">
              <p className="text-xl font-semibold text-blue-400">{currentGoals.carbs ?? "—"}</p>
              <p className="text-[11px] text-slate-500 mt-1">углеводы г</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Задайте дневные лимиты, чтобы отслеживать прогресс по питанию.
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-medium text-slate-300 mb-4">Дневные лимиты КБЖУ</p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-[11px] text-slate-400 mb-1 block">Калории (ккал)</label>
          <Input value={calories} onChange={(e) => setCalories(clampInput(e.target.value))} type="number" min="0" />
        </div>
        <div>
          <label className="text-[11px] text-slate-400 mb-1 block">Белки (г)</label>
          <Input value={protein} onChange={(e) => setProtein(clampInput(e.target.value))} type="number" min="0" />
        </div>
        <div>
          <label className="text-[11px] text-slate-400 mb-1 block">Жиры (г)</label>
          <Input value={fats} onChange={(e) => setFats(clampInput(e.target.value))} type="number" min="0" />
        </div>
        <div>
          <label className="text-[11px] text-slate-400 mb-1 block">Углеводы (г)</label>
          <Input value={carbs} onChange={(e) => setCarbs(clampInput(e.target.value))} type="number" min="0" />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => setEditing(false)}>
          Отмена
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>
    </div>
  );
}

function NutritionDayPanel({ data }: { data: NutritionDayDetail }) {
  const { totals, goals, entries } = data;
  const calOver = goals?.calories != null && totals.calories > goals.calories;

  return (
    <div className="space-y-6">
      {/* Calories block */}
      <div className="text-center">
        <p className={`text-4xl font-bold ${calOver ? "text-red-400" : "text-white"}`}>
          {Math.round(totals.calories)}
        </p>
        <p className="mt-1 text-sm text-slate-400">
          ккал
          {goals?.calories != null && goals.calories > 0 && (
            <span> / {goals.calories} ккал</span>
          )}
        </p>
        {goals?.calories != null && goals.calories > 0 && (
          <div className="mt-2 mx-auto max-w-[200px]">
            <ProgressBar
              value={(totals.calories / goals.calories) * 100}
              color={calOver ? "bg-red-500" : "bg-accent-green"}
            />
          </div>
        )}
      </div>

      {/* Donut + macros with legend */}
      <div className="flex flex-col items-center gap-4">
        <DonutChart
          segments={[
            { value: totals.protein * 4, color: MACRO_COLORS.protein, label: "Белки" },
            { value: totals.fats * 9, color: MACRO_COLORS.fats, label: "Жиры" },
            { value: totals.carbs * 4, color: MACRO_COLORS.carbs, label: "Углеводы" },
          ]}
          size={130}
          strokeWidth={22}
          showLegend
        />
        <div className="w-full space-y-3">
          <MacroRow label="Белки" value={totals.protein} goal={goals?.protein ?? null} color="bg-green-500" />
          <MacroRow label="Жиры" value={totals.fats} goal={goals?.fats ?? null} color="bg-orange-500" />
          <MacroRow label="Углеводы" value={totals.carbs} goal={goals?.carbs ?? null} color="bg-blue-500" />
        </div>
      </div>

      {/* Food entries — grouped by meal type */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
          Приёмы пищи
        </p>
        <div className="space-y-4">
          {(["breakfast", "lunch", "dinner", "snack"] as const).map((mealType) => {
            const mealEntries = entries.filter((e) => e.meal_type === mealType);
            if (mealEntries.length === 0) return null;

            const mealTotal = mealEntries.reduce(
              (acc, e) => ({
                calories: acc.calories + e.calories,
                protein: acc.protein + e.protein,
                fats: acc.fats + e.fats,
                carbs: acc.carbs + e.carbs,
              }),
              { calories: 0, protein: 0, fats: 0, carbs: 0 }
            );

            return (
              <div key={mealType}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-200">
                    {MEAL_EMOJI[mealType]} {MEAL_LABEL[mealType]}
                  </p>
                  <p className="text-xs text-slate-500">
                    {Math.round(mealTotal.calories)} ккал
                  </p>
                </div>
                <div className="space-y-1.5">
                  {mealEntries.map((e) => (
                    <div
                      key={e.id}
                      className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white">{e.food_name}</p>
                        <p className="text-sm font-medium text-orange-400">
                          {Math.round(e.calories)} ккал
                        </p>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span>{e.grams} г</span>
                        <span className="text-green-400">Б: {Math.round(e.protein)}г</span>
                        <span className="text-orange-400">Ж: {Math.round(e.fats)}г</span>
                        <span className="text-blue-400">У: {Math.round(e.carbs)}г</span>
                        <span className="text-slate-500">{formatTime(e.logged_at)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3 px-4 text-xs text-slate-500">
                    <span className="text-green-400">Б: {Math.round(mealTotal.protein)}г</span>
                    <span className="text-orange-400">Ж: {Math.round(mealTotal.fats)}г</span>
                    <span className="text-blue-400">У: {Math.round(mealTotal.carbs)}г</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────���──────────────────────

export default function NutritionPage() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: heatmapData, isLoading: heatmapLoading } = useNutritionHeatmapData(year);
  const { data: profile } = useProfile();

  const { data: dayDetail, isLoading: dayLoading } = useQuery({
    queryKey: ["nutrition-day", selectedDate],
    queryFn: () => api.getNutritionDay(selectedDate!),
    enabled: !!selectedDate,
  });

  const isLoading = heatmapLoading;

  function handleDayClick(day: HeatmapDay | null) {
    if (!day || day.count === 0) {
      setSelectedDate(null);
      return;
    }
    setSelectedDate((prev) => (prev === day.date ? null : day.date));
  }

  const yearSwitcher = (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold text-white">Питание</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setYear((y) => y - 1)}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-slate-300 hover:bg-white/[0.07] transition-colors"
        >
          ←
        </button>
        <span className="min-w-[3rem] text-center text-sm font-medium text-white">
          {year}
        </span>
        <button
          onClick={() => setYear((y) => y + 1)}
          disabled={year >= CURRENT_YEAR}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-slate-300 hover:bg-white/[0.07] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          →
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {yearSwitcher}
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!heatmapData || heatmapData.length === 0) {
    return (
      <div className="space-y-6">
        {yearSwitcher}
        <EmptyState
          title="Нет данных о питании"
          description="Добавляй приёмы пищи через бота, чтобы видеть статистику здесь."
        />
        <Card>
          <GoalsEditor
            currentGoals={{
              calories: profile?.calorie_goal ?? null,
              protein: profile?.protein_goal ?? null,
              fats: profile?.fat_goal ?? null,
              carbs: profile?.carbs_goal ?? null,
            }}
          />
        </Card>
      </div>
    );
  }

  const totalEntries = heatmapData.reduce((s, d) => s + d.count, 0);
  const activeDays = heatmapData.filter((d) => d.count > 0).length;
  const avgCalPerDay =
    activeDays > 0
      ? Math.round(heatmapData.reduce((s, d) => s + d.calories, 0) / activeDays)
      : 0;

  const heatmapDays = toHeatmapDays(heatmapData);

  return (
    <div className="space-y-6">
      {yearSwitcher}

      {/* KPI */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Всего записей" value={totalEntries} />
        <StatCard label="Активных дней" value={activeDays} />
        <StatCard label="Ккал/день (ср.)" value={avgCalPerDay} />
      </div>

      {/* Heatmap — full width on top */}
      <Card>
        <p className="mb-4 text-sm font-medium text-slate-300">
          Активность питания по дням
        </p>
        <WorkoutHeatmap
          data={heatmapDays}
          year={year}
          selectedDate={selectedDate}
          onDayClick={handleDayClick}
        />
      </Card>

      {/* Goals — отдельный блок */}
      <Card>
        <GoalsEditor
          currentGoals={{
            calories: profile?.calorie_goal ?? null,
            protein: profile?.protein_goal ?? null,
            fats: profile?.fat_goal ?? null,
            carbs: profile?.carbs_goal ?? null,
          }}
        />
      </Card>

      {/* Day detail below */}
      {selectedDate && dayDetail ? (
        <Card>
          <p className="mb-4 text-sm font-semibold text-white">{formatDate(selectedDate)}</p>
          <NutritionDayPanel data={dayDetail} />
        </Card>
      ) : selectedDate && dayLoading ? (
        <Card>
          <Skeleton className="h-32 w-full" />
        </Card>
      ) : (
        <Card>
          <p className="py-4 text-center text-sm text-slate-500">
            Нажми на день в календаре, чтобы увидеть статистику питания
          </p>
        </Card>
      )}
    </div>
  );
}
