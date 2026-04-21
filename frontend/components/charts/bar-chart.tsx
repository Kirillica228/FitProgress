export function BarChart({
  data,
}: {
  data: Array<{ label: string; value: number }>;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      <div className="flex h-56 items-end gap-3 rounded-3xl border border-white/5 bg-white/[0.02] p-4">
        {data.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
            <div
              className="w-full rounded-t-2xl bg-accent-green/80 transition-all duration-500"
              style={{ height: `${(item.value / max) * 100}%` }}
            />
            <span className="text-xs text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
