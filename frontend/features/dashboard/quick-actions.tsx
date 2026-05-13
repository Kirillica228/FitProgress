"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";


export function QuickActionsPanel() {
  return (
    <>
      <Card className="sticky top-28">
        <h3 className="text-lg font-semibold">Быстрые действия</h3>
        <p className="mt-1 text-sm text-slate-400">Не покидайте дашборд, чтобы продолжить тренировки.</p>
        <div className="mt-5 grid gap-3">
          <Button className="w-full justify-start">
            Добавить тренировку
          </Button>
          <Button className="w-full justify-start">
            Добавить приём пищи
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost">
          Отмена
        </Button>
        <Button>Сохранить черновик</Button>
      </div>
    </>
  );
}
