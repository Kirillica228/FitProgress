"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "DB" },
  { href: "/dashboard/workouts", label: "Workouts", icon: "WO" },
  { href: "/dashboard/nutrition", label: "Nutrition", icon: "NU" },
  { href: "/dashboard/progress", label: "Progress", icon: "PR" },
  { href: "/dashboard/goals", label: "Goals", icon: "GL" },
  { href: "/articles", label: "Articles", icon: "AR" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  // const { email, profile, logout, onboardingComplete } = useSessionStore((state) => ({
  //   email: state.email,
  //   profile: state.profile,
  //   logout: state.logout,
  //   onboardingComplete: state.onboardingComplete,
  // }));
  // const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  // const primaryGoal =
  //   profile.primaryGoal === "gain"
  //     ? "Lean bulk"
  //     : profile.primaryGoal === "cut"
  //       ? "Cut"
  //       : profile.primaryGoal === "maintain"
  //         ? "Maintain"
  //         : "Set your goal";

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
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-[11px] font-semibold tracking-[0.16em]">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex h-[calc(100vh-29rem)] flex-col justify-end">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-medium">"New athlete"</div>
          <div className="mt-1 text-xs text-slate-400">"Create an account to save your profile"</div>
          <div className="mt-4 rounded-2xl bg-white/5 px-3 py-2 text-xs text-slate-300">
            goal
          </div>
          <Button
            variant="secondary"
            className="mt-4 w-full"
            onClick={() => {
              
              router.push("/");
            }}
          >
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
