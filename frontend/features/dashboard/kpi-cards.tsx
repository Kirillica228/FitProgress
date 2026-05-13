import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatPercent } from "@/lib/utils";

type Props = {
  calories: { current: number; goal: number };
  workoutStatus: { completed: number; total: number };
  weight: { current: number; delta: number };
  goalProgress: number;
};

export function KpiCards({ calories, workoutStatus, weight, goalProgress }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <p className="text-sm text-slate-400">Калории</p>
        <div className="mt-3 flex items-end justify-between">
          <div className="text-3xl font-semibold">{calories.current}</div>
          <div className="text-sm text-slate-500">/ {calories.goal} ккал</div>
        </div>
        <div className="mt-4">
          <ProgressBar value={(calories.current / calories.goal) * 100} color="bg-accent-orange" />
        </div>
      </Card>
      <Card>
        <p className="text-sm text-slate-400">Тренировки</p>
        <div className="mt-3 text-3xl font-semibold">
          {workoutStatus.completed}/{workoutStatus.total}
        </div>
        <p className="mt-2 text-sm text-slate-500">Сессий завершено на этой неделе</p>
      </Card>
      <Card>
        <p className="text-sm text-slate-400">Вес</p>
        <div className="mt-3 text-3xl font-semibold">{weight.current} кг</div>
        <p className="mt-2 text-sm text-accent-green">
          {weight.delta > 0 ? `+${weight.delta}` : weight.delta} кг за последний месяц
        </p>
      </Card>
      <Card>
        <p className="text-sm text-slate-400">Прогресс цели</p>
        <div className="mt-3 text-3xl font-semibold">{formatPercent(goalProgress)}</div>
        <div className="mt-4">
          <ProgressBar value={goalProgress} color="bg-accent-green" />
        </div>
      </Card>
    </div>
  );
}
