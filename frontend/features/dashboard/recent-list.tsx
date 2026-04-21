import { Card } from "@/components/ui/card";

export function RecentList({
  title,
  items,
}: {
  title: string;
  items: Array<{ id: string; title: string; subtitle: string; value: string }>;
}) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button className="text-sm text-sky-300">View all</button>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-slate-400">{item.subtitle}</p>
              </div>
              <span className="text-sm text-slate-300">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
