import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";

export function NutritionSummary({
  calories,
  protein,
  fat,
  carbs,
}: {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}) {
  return (
    <Card>
      <div className="grid gap-5 lg:grid-cols-4">
        <div>
          <p className="text-sm text-slate-400">Total calories</p>
          <div className="mt-2 text-3xl font-semibold">{calories}</div>
        </div>
        <div>
          <p className="text-sm text-slate-400">Protein</p>
          <div className="mt-2 text-xl font-semibold">{protein} g</div>
          <div className="mt-3"><ProgressBar value={(protein / 160) * 100} /></div>
        </div>
        <div>
          <p className="text-sm text-slate-400">Fat</p>
          <div className="mt-2 text-xl font-semibold">{fat} g</div>
          <div className="mt-3"><ProgressBar value={(fat / 70) * 100} color="bg-accent-orange" /></div>
        </div>
        <div>
          <p className="text-sm text-slate-400">Carbs</p>
          <div className="mt-2 text-xl font-semibold">{carbs} g</div>
          <div className="mt-3"><ProgressBar value={(carbs / 260) * 100} color="bg-accent-blue" /></div>
        </div>
      </div>
    </Card>
  );
}
