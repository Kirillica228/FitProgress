import { cn } from "@/lib/utils";

export function Table({
  headers,
  rows,
  className,
}: {
  headers: string[];
  rows: Array<Array<string | number>>;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-3xl border border-white/10", className)}>
      <table className="min-w-full divide-y divide-white/10 text-left text-sm">
        <thead className="bg-white/5 text-slate-400">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 bg-card/60">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-white/[0.03]">
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-3 text-slate-200">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
