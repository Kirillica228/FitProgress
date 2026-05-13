import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Goal } from "@/lib/types";

export function GoalsGrid({ items }: { items: Goal[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {items.map((goal) => (
        <Card key={goal.id}>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold">{goal.title}</h3>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">
              {goal.progress}%
            </span>
          </div>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Цель</span>
              <span className="text-white">{goal.target}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Сейчас</span>
              <span className="text-white">{goal.current}</span>
            </div>
          </div>
          <div className="mt-5">
            <ProgressBar value={goal.progress} />
          </div>
        </Card>
      ))}
    </div>
  );
}
