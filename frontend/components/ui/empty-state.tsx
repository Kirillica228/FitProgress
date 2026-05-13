import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  actionLabel,
}: {
  title: string;
  description: string;
  actionLabel?: string;
}) {
  return (
    <Card className="flex min-h-56 flex-col items-start justify-center gap-4">
      <div className="rounded-2xl bg-white/5 p-3 text-sm text-slate-300">Здесь пока ничего нет</div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 max-w-md text-sm text-slate-400">{description}</p>
      </div>
      {actionLabel ? <Button variant="secondary">{actionLabel}</Button> : null}
    </Card>
  );
}
