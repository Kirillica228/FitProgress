import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-16">
      <div className="grid items-center gap-10 lg:grid-cols-[1.2fr,0.8fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Fitprogress</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight text-white md:text-7xl">
            The analytics dashboard for training, nutrition, and body progress.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-400">
            A production-ready SPA foundation built for workouts, goals, meals, and measurable progress.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/dashboard">
              <Button className="px-6 py-3">Open dashboard</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="secondary" className="px-6 py-3">
                Create account
              </Button>
            </Link>
          </div>
        </div>
        <Card className="overflow-hidden p-0">
          <div className="border-b border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Live snapshot</p>
            <h2 className="mt-2 text-2xl font-semibold">Weekly momentum is strong</h2>
          </div>
          <div className="grid gap-4 p-5">
            <div className="rounded-3xl bg-accent-green/10 p-5">
              <div className="text-sm text-slate-300">Goal progress</div>
              <div className="mt-2 text-4xl font-semibold">68%</div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-accent-orange/10 p-5">
                <div className="text-sm text-slate-300">Calories</div>
                <div className="mt-2 text-2xl font-semibold">1840 / 2200</div>
              </div>
              <div className="rounded-3xl bg-accent-blue/10 p-5">
                <div className="text-sm text-slate-300">Weight trend</div>
                <div className="mt-2 text-2xl font-semibold">-1.2 kg</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
