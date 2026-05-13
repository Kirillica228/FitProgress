"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 mb-6 flex items-center justify-between gap-4 border-b border-white/10 bg-slatebg/80 px-1 py-4 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Дашборд</p>
        <h1 className="mt-1 text-2xl font-semibold">Обзор показателей</h1>
      </div>
      <div className="flex items-center gap-3">
        <Input placeholder="Поиск тренировок, приёмов пищи, инсайтов..." className="hidden w-80 md:block" />
        <Button variant="secondary">
          Добавить приём пищи
        </Button>
        <Button>Добавить тренировку</Button>
      </div>
    </header>
  );
}
