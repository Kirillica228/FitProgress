"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "◫" },
  { href: "/dashboard/workouts", label: "Workouts", icon: "◧" },
  { href: "/dashboard/nutrition", label: "Nutrition", icon: "◨" },
  { href: "/dashboard/progress", label: "Progress", icon: "◎" },
  { href: "/dashboard/goals", label: "Goals", icon: "◈" },
  { href: "/articles", label: "Articles", icon: "◌" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/10 bg-slate-950/60 px-5 py-6 backdrop-blur xl:block">
      <div className="mb-10">
        <Link href="/" className="text-2xl font-semibold tracking-tight text-white">
          Fitprogress
        </Link>
        <p className="mt-2 text-sm text-slate-400">Training, nutrition, body progress, and goals in one place.</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                active ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/5 hover:text-white",
              )}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex h-[calc(100vh-29rem)] flex-col justify-end">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-medium">Alex Mercer</div>
          <div className="mt-1 text-xs text-slate-400">Goal: Lean bulk, 5 sessions / week</div>
          <Button variant="secondary" className="mt-4 w-full">
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
