import Link from "next/link";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LandingPage() {
  const featureCards = [
    {
      title: "Unified progress view",
      description: "Training, nutrition, body metrics, and goals live in one calm dashboard with clear signals.",
    },
    {
      title: "Actionable trends",
      description: "See what is improving week to week instead of guessing from isolated workouts or weigh-ins.",
    },
    {
      title: "Structured habits",
      description: "Build a repeatable routine with guided onboarding, saved goals, and simple daily tracking.",
    },
  ];

  const userResults = [
    "More stable weight and body-composition tracking",
    "Better visibility into workout consistency and recovery",
    "Clearer nutrition habits without cluttered spreadsheets",
  ];

  return (
    <MarketingShell
      accentLabel="About Fitprogress"
      title="A clean personal fitness workspace built for consistency, not noise."
      description="Fitprogress helps people train with more clarity, understand their progress, and turn health goals into a steady system."
      actions={
        <>
          <Link href="/auth/register">
            <Button className="px-6 py-3">Register</Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="secondary" className="px-6 py-3">
              Start now
            </Button>
          </Link>
        </>
      }
      maxWidthClassName="max-w-7xl"
    >
      <section className="grid gap-6 pt-2 lg:grid-cols-[1.15fr,0.85fr]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-white/10 bg-white/5 px-6 py-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Mission</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">We make progress visible and manageable.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              The product brings workouts, nutrition, body metrics, and long-term goals into one minimal interface so users can make calmer, better decisions.
            </p>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-3">
            <div className="rounded-3xl bg-accent-blue/10 p-5">
              <div className="text-sm text-slate-300">Weekly check-ins</div>
              <div className="mt-3 text-3xl font-semibold">Fast</div>
            </div>
            <div className="rounded-3xl bg-accent-green/10 p-5">
              <div className="text-sm text-slate-300">Data clarity</div>
              <div className="mt-3 text-3xl font-semibold">High</div>
            </div>
            <div className="rounded-3xl bg-white/5 p-5">
              <div className="text-sm text-slate-300">Habit friction</div>
              <div className="mt-3 text-3xl font-semibold">Low</div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6">
          <Card>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Who we are</p>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              We are building a calm digital companion for people who want to improve fitness and health with structure, not overwhelm.
            </p>
          </Card>
          <Card>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">What we do</p>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              We help users collect the right data, understand trends, and stay aligned with their current goal through a guided, modern flow.
            </p>
          </Card>
        </div>
      </section>

      <section className="pt-8">
        <div className="mb-5 px-1">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Advantages</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Designed as one unified system</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((feature) => (
            <Card key={feature.title}>
              <div className="inline-flex rounded-2xl bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.22em] text-sky-300">
                Feature
              </div>
              <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 pt-8 lg:grid-cols-[0.9fr,1.1fr]">
        <Card>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Results</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">What users can actually improve</h2>
          <div className="mt-5 space-y-3">
            {userResults.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </Card>
        <Card className="overflow-hidden p-0">
          <div className="border-b border-white/10 px-6 py-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Get started</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Start with a simple account, then personalize your profile.</h2>
          </div>
          <div className="space-y-4 p-6">
            <p className="text-sm leading-7 text-slate-400">
              Registration takes a moment. Onboarding is split into short steps and can be skipped or finished later in the dashboard.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/auth/register">
                <Button className="px-6 py-3">Create account</Button>
              </Link>
              <Link href="/articles">
                <Button variant="secondary" className="px-6 py-3">
                  Explore articles
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </MarketingShell>
  );
}
