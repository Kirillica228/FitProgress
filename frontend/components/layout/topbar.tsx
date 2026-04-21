"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUiStore } from "@/store/ui-store";

export function Topbar() {
  const openQuickAction = useUiStore((state) => state.openQuickAction);

  return (
    <header className="sticky top-0 z-20 mb-6 flex items-center justify-between gap-4 border-b border-white/10 bg-slatebg/80 px-1 py-4 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Dashboard</p>
        <h1 className="mt-1 text-2xl font-semibold">Performance overview</h1>
      </div>
      <div className="flex items-center gap-3">
        <Input placeholder="Search workouts, meals, insights..." className="hidden w-80 md:block" />
        <Button variant="secondary" onClick={() => openQuickAction("meal")}>
          Add meal
        </Button>
        <Button onClick={() => openQuickAction("workout")}>Add workout</Button>
      </div>
    </header>
  );
}
