export function LineChart({
  data,
}: {
  data: Array<{ label: string; value: number }>;
}) {
  const values = data.map((item) => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = data
    .map((item, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * 100;
      const y = 100 - ((item.value - min) / Math.max(max - min, 1)) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-4">
      <div className="h-56 rounded-3xl border border-white/5 bg-white/[0.02] p-4">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
          <polyline
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            points={points}
          />
        </svg>
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}
