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
        <p className="text-sm text-slate-400">Calories</p>
        <div className="mt-3 flex items-end justify-between">
          <div className="text-3xl font-semibold">{calories.current}</div>
          <div className="text-sm text-slate-500">/ {calories.goal} kcal</div>
        </div>
        <div className="mt-4">
          <ProgressBar value={(calories.current / calories.goal) * 100} color="bg-accent-orange" />
        </div>
      </Card>
      <Card>
        <p className="text-sm text-slate-400">Workout status</p>
        <div className="mt-3 text-3xl font-semibold">
          {workoutStatus.completed}/{workoutStatus.total}
        </div>
        <p className="mt-2 text-sm text-slate-500">Sessions completed this week</p>
      </Card>
      <Card>
        <p className="text-sm text-slate-400">Weight</p>
        <div className="mt-3 text-3xl font-semibold">{weight.current} kg</div>
        <p className="mt-2 text-sm text-accent-green">{weight.delta} kg vs last month</p>
      </Card>
      <Card>
        <p className="text-sm text-slate-400">Goal progress</p>
        <div className="mt-3 text-3xl font-semibold">{formatPercent(goalProgress)}</div>
        <div className="mt-4">
          <ProgressBar value={goalProgress} color="bg-accent-green" />
        </div>
      </Card>
    </div>
  );
}
