"use client";

import { useMemo } from "react";
import type { HeatmapDay } from "@/lib/types";

// ─── Types ───────────────────────────────────────────────────────────────────

type Props = {
  data: HeatmapDay[];
  year: number;
  selectedDate: string | null;
  onDayClick: (day: HeatmapDay | null) => void;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTH_LABELS = [
  "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
  "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек",
];

const DAY_LABELS = ["Пн", "", "Ср", "", "Пт", "", ""];

/** Возвращает ISO-строку даты без времени: "2025-03-15" */
function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Строит массив всех дней года, выровненных по неделям (Пн = 0) */
function buildCalendar(year: number): Array<{ date: string; weekIndex: number; dayOfWeek: number }> {
  const result: Array<{ date: string; weekIndex: number; dayOfWeek: number }> = [];

  // Первый день года
  const start = new Date(year, 0, 1);
  // Сдвигаем к ближайшему понедельнику (или раньше)
  const startDow = (start.getDay() + 6) % 7; // 0=Пн
  const gridStart = new Date(start);
  gridStart.setDate(gridStart.getDate() - startDow);

  // Последний день года
  const end = new Date(year, 11, 31);
  const endDow = (end.getDay() + 6) % 7;
  const gridEnd = new Date(end);
  gridEnd.setDate(gridEnd.getDate() + (6 - endDow));

  let weekIndex = 0;
  const cur = new Date(gridStart);

  while (cur <= gridEnd) {
    const dow = (cur.getDay() + 6) % 7;
    result.push({
      date: toDateStr(cur),
      weekIndex,
      dayOfWeek: dow,
    });
    if (dow === 6) weekIndex++;
    cur.setDate(cur.getDate() + 1);
  }

  return result;
}

/** Вычисляет пороги интенсивности (p25, p50, p75) из ненулевых значений */
function computeThresholds(data: HeatmapDay[]): [number, number, number] {
  const volumes = data.map((d) => d.volume).filter((v) => v > 0).sort((a, b) => a - b);
  if (volumes.length === 0) return [1, 2, 3];
  const p = (pct: number) => volumes[Math.floor((volumes.length - 1) * pct)];
  return [p(0.25), p(0.5), p(0.75)];
}

/** Возвращает Tailwind-класс цвета ячейки по объёму */
function cellColor(
  count: number,
  volume: number,
  thresholds: [number, number, number],
  isSelected: boolean,
): string {
  if (isSelected) return "bg-emerald-300 ring-2 ring-emerald-200";
  if (count === 0) return "bg-white/5 hover:bg-white/10";
  const [p25, p50, p75] = thresholds;
  if (volume <= p25) return "bg-emerald-950 hover:bg-emerald-900";
  if (volume <= p50) return "bg-emerald-800 hover:bg-emerald-700";
  if (volume <= p75) return "bg-emerald-600 hover:bg-emerald-500";
  return "bg-emerald-400 hover:bg-emerald-300";
}

/** Позиции меток месяцев: первая неделя каждого месяца */
function buildMonthLabels(
  cells: Array<{ date: string; weekIndex: number; dayOfWeek: number }>,
  year: number,
): Array<{ label: string; weekIndex: number }> {
  const seen = new Set<number>();
  const labels: Array<{ label: string; weekIndex: number }> = [];

  for (const cell of cells) {
    if (!cell.date.startsWith(String(year))) continue;
    const month = parseInt(cell.date.slice(5, 7), 10) - 1;
    if (!seen.has(month)) {
      seen.add(month);
      labels.push({ label: MONTH_LABELS[month], weekIndex: cell.weekIndex });
    }
  }
  return labels;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function WorkoutHeatmap({ data, year, selectedDate, onDayClick }: Props) {
  const dayMap = useMemo(
    () => new Map(data.map((d) => [d.date, d])),
    [data],
  );

  const cells = useMemo(() => buildCalendar(year), [year]);
  const thresholds = useMemo(() => computeThresholds(data), [data]);
  const monthLabels = useMemo(() => buildMonthLabels(cells, year), [cells, year]);

  // Количество колонок (недель)
  const totalWeeks = cells.length > 0 ? cells[cells.length - 1].weekIndex + 1 : 53;

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-block min-w-max">
        {/* Метки месяцев */}
        <div
          className="mb-1 flex text-xs text-slate-500"
          style={{ paddingLeft: "2rem" /* отступ под метки дней */ }}
        >
          {Array.from({ length: totalWeeks }, (_, wi) => {
            const label = monthLabels.find((m) => m.weekIndex === wi);
            return (
              <div key={wi} className="w-[14px] mr-[2px] shrink-0 text-center">
                {label ? label.label : ""}
              </div>
            );
          })}
        </div>

        <div className="flex gap-0">
          {/* Метки дней недели */}
          <div className="flex flex-col gap-[2px] mr-1 w-7 shrink-0">
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                className="h-[14px] text-[10px] text-slate-500 leading-[14px] text-right pr-1"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Сетка */}
          <div
            className="grid gap-[2px]"
            style={{
              gridTemplateColumns: `repeat(${totalWeeks}, 14px)`,
              gridTemplateRows: "repeat(7, 14px)",
            }}
          >
            {cells.map((cell) => {
              const day = dayMap.get(cell.date);
              const count = day?.count ?? 0;
              const volume = day?.volume ?? 0;
              const isSelected = cell.date === selectedDate;
              const isCurrentYear = cell.date >= `${year}-01-01` && cell.date <= `${year}-12-31`;

              return (
                <button
                  key={cell.date}
                  title={
                    count > 0
                      ? `${cell.date}: ${count} тренировок, объём ${Math.round(volume)}`
                      : cell.date
                  }
                  aria-label={
                    count > 0
                      ? `${cell.date}: ${count} тренировок`
                      : `${cell.date}: нет тренировок`
                  }
                  onClick={() => onDayClick(day ?? null)}
                  className={[
                    "w-[14px] h-[14px] rounded-[2px] transition-colors cursor-pointer",
                    isCurrentYear
                      ? cellColor(count, volume, thresholds, isSelected)
                      : "bg-transparent",
                  ].join(" ")}
                  style={{
                    gridColumn: cell.weekIndex + 1,
                    gridRow: cell.dayOfWeek + 1,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Легенда */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 justify-end">
          <span>Меньше</span>
          {["bg-white/5", "bg-emerald-950", "bg-emerald-800", "bg-emerald-600", "bg-emerald-400"].map(
            (cls, i) => (
              <div key={i} className={`w-[14px] h-[14px] rounded-[2px] ${cls}`} />
            ),
          )}
          <span>Больше</span>
        </div>
      </div>
    </div>
  );
}
