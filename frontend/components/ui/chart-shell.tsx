import { Card } from "@/components/ui/card";

export function ChartShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  /** Строка или произвольный React-узел (например, текущее значение) */
  subtitle?: React.ReactNode;
  /** Контент в правой части заголовка (например, переключатель периода) */
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle ? (
            typeof subtitle === "string" ? (
              <p className="text-sm text-slate-400">{subtitle}</p>
            ) : (
              subtitle
            )
          ) : null}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {children}
    </Card>
  );
}
