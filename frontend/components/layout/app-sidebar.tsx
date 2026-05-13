"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Дашборд", icon: "ДБ" },
  { href: "/dashboard/workouts", label: "Тренировки", icon: "ТР" },
  { href: "/dashboard/heatmap", label: "Активность", icon: "АК" },
  { href: "/dashboard/nutrition", label: "Питание", icon: "ПТ" },
  { href: "/dashboard/progress", label: "Прогресс", icon: "ПГ" },
  { href: "/articles", label: "Статьи", icon: "СТ" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/10 bg-slate-950/60 px-4 py-6 backdrop-blur xl:block">
      <div className="mb-8">
        <Link href="/" className="text-xl font-semibold tracking-tight text-white">
          FitProgress
        </Link>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                active
                  ? "bg-white text-slate-950"
                  : "text-slate-300 hover:bg-white/5 hover:text-white",
              )}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-[11px] font-semibold tracking-[0.16em]">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
