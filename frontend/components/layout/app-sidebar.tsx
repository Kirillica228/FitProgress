"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/heatmap", label: "Активность", icon: "АК" },
  { href: "/dashboard/workouts", label: "Тренировки", icon: "ТР" },
  { href: "/dashboard/nutrition", label: "Питание", icon: "ПТ" },
  { href: "/dashboard/progress", label: "Прогресс", icon: "ПГ" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/10 bg-slate-950/60 px-4 py-6 backdrop-blur xl:block">
        <div className="mb-8">
          <Link href="/" className="text-xl font-semibold tracking-tight text-white">
            FitProgress
          </Link>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard/heatmap" && pathname.startsWith(item.href));
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

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/90 backdrop-blur-xl xl:hidden">
        <div className="flex items-center justify-around px-2 py-1.5 safe-bottom">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard/heatmap" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 min-w-0 flex-1 transition",
                  active
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-300",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-semibold tracking-[0.12em]",
                    active ? "bg-white text-slate-950" : "bg-white/5",
                  )}
                >
                  {item.icon}
                </span>
                <span className="text-[10px] leading-tight truncate max-w-full text-center">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
