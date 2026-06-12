"use client";

import { useEffect, useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";

const WEEKLY_GOAL_KEY = "fp_weekly_workout_goal";
const DEFAULT_GOAL = 4;

type Props = {
  calories: { current: number; goal: number };
  workoutStatus: { completed: number; total: number };
  weight: { current: number; delta: number };
  latestMeasurement: { chest: number | null; waist: number | null; hips: number | null } | null;
};

export function KpiCards({ calories, workoutStatus, weight, latestMeasurement }: Props) {
  const [weeklyGoal, setWeeklyGoal] = useState<number>(DEFAULT_GOAL);
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState<string>(String(DEFAULT_GOAL));
  const inputRef = useRef<HTMLInputElement>(null);

  // Загружаем из localStorage после монтирования
  useEffect(() => {
    const stored = localStorage.getItem(WEEKLY_GOAL_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed > 0) {
        setWeeklyGoal(parsed);
        setInputVal(String(parsed));
      }
    }
  }, []);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function saveGoal() {
    const parsed = parseInt(inputVal, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 14) {
      setWeeklyGoal(parsed);
      localStorage.setItem(WEEKLY_GOAL_KEY, String(parsed));
    } else {
      setInputVal(String(weeklyGoal));
    }
    setEditing(false);
  }

  const completed = workoutStatus.completed;
  const isGoalReached = completed >= weeklyGoal;

  const hasMeasurements =
    latestMeasurement &&
    (latestMeasurement.chest !== null ||
      latestMeasurement.waist !== null ||
      latestMeasurement.hips !== null);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Калории */}
        <Card>
          <p className="text-sm text-slate-400">Калории сегодня</p>
          <div className="mt-3 flex items-end justify-between">
            <div className="text-3xl font-semibold">{calories.current}</div>
            <div className="text-sm text-slate-500">/ {calories.goal} ккал</div>
          </div>
          <div className="mt-4">
            <ProgressBar
              value={Math.min((calories.current / calories.goal) * 100, 100)}
              color="bg-accent-orange"
            />
          </div>
        </Card>

        {/* Тренировки */}
        <Card>
          <div className="flex items-start justify-between">
            <p className="text-sm text-slate-400">Тренировки на неделе</p>
            <button
              onClick={() => {
                setEditing(true);
                setInputVal(String(weeklyGoal));
              }}
              className="text-xs text-slate-500 hover:text-slate-300 transition"
              title="Изменить цель"
            >
              ✎
            </button>
          </div>

          <div className="mt-3 flex items-end gap-2">
            <div className="text-3xl font-semibold">{completed}</div>
            <div className="mb-1 text-slate-400">/</div>
            {editing ? (
              <input
                ref={inputRef}
                type="number"
                min={1}
                max={14}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onBlur={saveGoal}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveGoal();
                  if (e.key === "Escape") {
                    setInputVal(String(weeklyGoal));
                    setEditing(false);
                  }
                }}
                className="mb-1 w-10 rounded-lg bg-white/10 px-1.5 py-0.5 text-center text-lg font-semibold text-white outline-none focus:ring-1 focus:ring-emerald-500"
              />
            ) : (
              <div className="mb-1 text-lg font-semibold text-slate-300">{weeklyGoal}</div>
            )}
          </div>

          <div className="mt-3">
            <ProgressBar
              value={Math.min((completed / weeklyGoal) * 100, 100)}
              color={isGoalReached ? "bg-emerald-500" : "bg-sky-500"}
            />
          </div>

          {isGoalReached ? (
            <p className="mt-2 text-xs text-emerald-400">
              🎉 Цель недели достигнута! Не забудь про восстановление.
            </p>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              Осталось {weeklyGoal - completed} тренировок до цели
            </p>
          )}
        </Card>

        {/* Вес */}
        <Card>
          <p className="text-sm text-slate-400">Текущий вес</p>
          <div className="mt-3 text-3xl font-semibold">
            {weight.current > 0 ? `${weight.current} кг` : "—"}
          </div>
          {weight.current > 0 && (
            <p
              className={`mt-2 text-sm ${
                weight.delta < 0
                  ? "text-emerald-400"
                  : weight.delta > 0
                    ? "text-red-400"
                    : "text-slate-500"
              }`}
            >
              {weight.delta > 0 ? `+${weight.delta.toFixed(1)}` : weight.delta.toFixed(1)} кг за
              последний замер
            </p>
          )}
        </Card>
      </div>

      {/* Замеры тела */}
      {hasMeasurements && (
        <Card>
          <p className="mb-3 text-sm text-slate-400">Последние замеры тела</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Грудь</p>
              <p className="mt-1 text-2xl font-semibold">
                {latestMeasurement!.chest !== null ? `${latestMeasurement!.chest} см` : "—"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Талия</p>
              <p className="mt-1 text-2xl font-semibold">
                {latestMeasurement!.waist !== null ? `${latestMeasurement!.waist} см` : "—"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Бёдра</p>
              <p className="mt-1 text-2xl font-semibold">
                {latestMeasurement!.hips !== null ? `${latestMeasurement!.hips} см` : "—"}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
