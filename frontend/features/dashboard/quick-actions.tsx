"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useUiStore } from "@/store/ui-store";

export function QuickActionsPanel() {
  const quickAction = useUiStore((state) => state.quickAction);
  const openQuickAction = useUiStore((state) => state.openQuickAction);
  const closeQuickAction = useUiStore((state) => state.closeQuickAction);

  return (
    <>
      <Card className="sticky top-28">
        <h3 className="text-lg font-semibold">Quick actions</h3>
        <p className="mt-1 text-sm text-slate-400">Keep your routine moving without leaving the dashboard.</p>
        <div className="mt-5 grid gap-3">
          <Button onClick={() => openQuickAction("workout")} className="w-full justify-start">
            Add workout
          </Button>
          <Button variant="secondary" onClick={() => openQuickAction("meal")} className="w-full justify-start">
            Add meal
          </Button>
        </div>
      </Card>

      <Modal
        open={quickAction !== null}
        title={quickAction === "workout" ? "Quick add workout" : "Quick add meal"}
        description="This is wired for mock data now and ready to be connected to your backend API."
        onClose={closeQuickAction}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder={quickAction === "workout" ? "Workout title" : "Meal name"} />
          <Input placeholder={quickAction === "workout" ? "Date" : "Calories"} />
          <Input placeholder={quickAction === "workout" ? "Exercises count" : "Protein"} />
          <Input placeholder={quickAction === "workout" ? "Total volume" : "Carbs"} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={closeQuickAction}>
            Cancel
          </Button>
          <Button onClick={closeQuickAction}>Save draft</Button>
        </div>
      </Modal>
    </>
  );
}
