"use client";

type Segment = {
  value: number;
  color: string;
  label: string;
};

type Props = {
  segments: Segment[];
  size?: number;
  strokeWidth?: number;
  showLegend?: boolean;
};

export function DonutChart({ segments, size = 160, strokeWidth = 24, showLegend = false }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
      </svg>
    );
  }

  let offset = 0;
  const arcs = segments.map((seg) => {
    const pct = seg.value / total;
    const dashArray = `${circumference * pct} ${circumference * (1 - pct)}`;
    const dashOffset = -offset;
    offset += circumference * pct;
    return { ...seg, dashArray, dashOffset, pct };
  });

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeDasharray={arc.dashArray}
            strokeDashoffset={arc.dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            className="transition-all duration-500"
          />
        ))}
      </svg>

      {showLegend && (
        <div className="flex flex-col gap-2 text-sm">
          {arcs.map((arc, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 shrink-0 rounded-sm"
                style={{ backgroundColor: arc.color }}
              />
              <span className="text-slate-300">{arc.label}</span>
              <span className="text-slate-500">{Math.round(arc.pct * 100)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
