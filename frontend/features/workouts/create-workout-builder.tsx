"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ExerciseRow = {
  id: number;
  name: string;
  sets: string;
  reps: string;
  weight: string;
};

export function CreateWorkoutBuilder() {
  const [rows, setRows] = useState<ExerciseRow[]>([
    { id: 1, name: "Bench press", sets: "4", reps: "8", weight: "70" },
    { id: 2, name: "Dumbbell row", sets: "3", reps: "10", weight: "28" },
  ]);

  const updateRow = (id: number, key: keyof ExerciseRow, value: string) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: Date.now(), name: "", sets: "", reps: "", weight: "" },
    ]);
  };

  return (
    <Card>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Create workout</h3>
          <p className="mt-1 text-sm text-slate-400">Interactive builder for sets, reps, and weight.</p>
        </div>
        <Button variant="secondary" onClick={addRow}>
          Add exercise
        </Button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10">
        <div className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-3 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-500">
          <div>Exercise</div>
          <div>Sets</div>
          <div>Reps</div>
          <div>Weight</div>
        </div>
        <div className="divide-y divide-white/5">
          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-3 px-4 py-3">
              <Input value={row.name} onChange={(e) => updateRow(row.id, "name", e.target.value)} />
              <Input value={row.sets} onChange={(e) => updateRow(row.id, "sets", e.target.value)} />
              <Input value={row.reps} onChange={(e) => updateRow(row.id, "reps", e.target.value)} />
              <Input value={row.weight} onChange={(e) => updateRow(row.id, "weight", e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <Button variant="ghost">Cancel</Button>
        <Button>Save workout</Button>
      </div>
    </Card>
  );
}
