import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  color = "bg-accent-green",
}: {
  value: number;
  color?: string;
}) {
  return (
    <div className="h-2 rounded-full bg-white/5">
      <div
        className={cn("h-2 rounded-full transition-all duration-500", color)}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}
