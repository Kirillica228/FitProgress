"use client";

import { useRef, useState } from "react";

const PAD_X = 5;
const PAD_Y = 10;

export function LineChart({
  data,
  unit = "",
}: {
  data: Array<{ label: string; value: number }>;
  unit?: string;
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (data.length === 0) return null;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const getX = (i: number) =>
    data.length === 1 ? 50 : PAD_X + (i / (data.length - 1)) * (100 - PAD_X * 2);
  const getY = (v: number) =>
    PAD_Y + (1 - (v - min) / range) * (100 - PAD_Y * 2);

  const svgPoints = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(" ");
  const active = activeIdx !== null ? data[activeIdx] : null;
  const tooltipAbove = active ? getY(active.value) > 30 : true;

  // Pointer Events унифицирует мышь, тач и стилус
  const findNearest = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = ((clientX - rect.left) / rect.width) * 100;
    let nearest = 0;
    let minDist = Infinity;
    data.forEach((_, i) => {
      const dist = Math.abs(getX(i) - xPct);
      if (dist < minDist) {
        minDist = dist;
        nearest = i;
      }
    });
    setActiveIdx(nearest);
  };

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        // touch-action: none — браузер не скроллит страницу пока палец на графике
        className="relative h-56 rounded-3xl border border-white/5 bg-white/[0.02]"
        style={{ touchAction: "none" }}
        onPointerMove={(e) => findNearest(e.clientX)}
        onPointerLeave={() => setActiveIdx(null)}
      >
        {/* Линия + вертикальный курсор через SVG */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          {/* Пунктирная вертикаль на активной точке */}
          {activeIdx !== null && (
            <line
              x1={getX(activeIdx)}
              y1={PAD_Y}
              x2={getX(activeIdx)}
              y2={100 - PAD_Y}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
          )}
          {data.length > 1 && (
            <polyline
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              points={svgPoints}
            />
          )}
        </svg>

        {/* Точки — DOM div, всегда идеально круглые */}
        {data.map((d, i) => (
          <div
            key={i}
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-sky-400 transition-[width,height,background-color] duration-100"
            style={{
              left: `${getX(i)}%`,
              top: `${getY(d.value)}%`,
              width: activeIdx === i ? 14 : 8,
              height: activeIdx === i ? 14 : 8,
              backgroundColor: activeIdx === i ? "#38bdf8" : "#1e293b",
            }}
          />
        ))}

        {/* Тултип */}
        {activeIdx !== null && active && (
          <div
            className="pointer-events-none absolute z-20 whitespace-nowrap rounded-lg border border-white/10 bg-slate-800 px-2.5 py-1.5 text-xs text-white shadow-lg"
            style={{
              left: `${getX(activeIdx)}%`,
              top: `${getY(active.value)}%`,
              transform: `translateX(-50%) translateY(${
                tooltipAbove ? "calc(-100% - 8px)" : "8px"
              })`,
            }}
          >
            <div className="font-semibold">
              {active.value}
              {unit && ` ${unit}`}
            </div>
            <div className="text-slate-400">{active.label}</div>
          </div>
        )}
      </div>

      {/* Подписи оси X — дубли дат скрываем */}
      <div className="flex justify-between px-1 text-xs text-slate-500">
        {data.length <= 10 ? (
          data.map((d, i) => (
            <span key={i}>
              {i === 0 || d.label !== data[i - 1].label ? d.label : ""}
            </span>
          ))
        ) : (
          <>
            <span>{data[0].label}</span>
            <span>{data[Math.floor(data.length / 2)].label}</span>
            <span>{data[data.length - 1].label}</span>
          </>
        )}
      </div>
    </div>
  );
}
