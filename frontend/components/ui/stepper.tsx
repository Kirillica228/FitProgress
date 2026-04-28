import { cn } from "@/lib/utils";

type Step = {
  key: string;
  label: string;
};

export function Stepper({
  steps,
  currentStep,
}: {
  steps: Step[];
  currentStep: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div
            key={step.key}
            className={cn(
              "rounded-2xl border px-4 py-3 transition",
              isActive
                ? "border-sky-400/60 bg-sky-400/10"
                : isCompleted
                  ? "border-emerald-400/30 bg-emerald-400/10"
                  : "border-white/10 bg-white/5",
            )}
          >
            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Step {index + 1}</div>
            <div className="mt-2 text-sm font-medium text-white">{step.label}</div>
          </div>
        );
      })}
    </div>
  );
}
