"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Stepper } from "@/components/ui/stepper";

const steps = [
  { key: "name", label: "Identity" },
  { key: "metrics", label: "Metrics" },
  { key: "goal", label: "Primary goal" },
  { key: "extra", label: "Extra goal" },
] as const;

const primaryGoalOptions = [
  { value: "gain", label: "Mass gain", description: "For users focused on building muscle and strength." },
  { value: "cut", label: "Cut", description: "For users who want to reduce body fat while staying structured." },
  { value: "maintain", label: "Maintain", description: "For users who want stable performance and body weight." },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  

  const currentStep = Math.min(1, steps.length - 1);

  let stepContent: React.ReactNode;

  switch (currentStep) {
    case 0:
      stepContent = (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="First name" hint="You can update this later in the dashboard.">
            <Input
              
              placeholder="First name"
            />
          </FormField>
          <FormField label="Last name">
            <Input
              
              placeholder="Last name"
            />
          </FormField>
        </div>
      );
      break;
    case 1:
      stepContent = (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Height" hint="cm">
            <Input
              
              placeholder="178"
              inputMode="decimal"
            />
          </FormField>
          <FormField label="Weight" hint="kg">
            <Input
             
              placeholder="76"
              inputMode="decimal"
            />
          </FormField>
        </div>
      );
      break;
    case 2:
      stepContent = (
        <div className="grid gap-4">
          {primaryGoalOptions.map((option) => {
            return (
              <button
                key={option.value}
                type="button"
            
                className={`rounded-3xl border p-5 text-left transition`}
              >
                <div className="text-lg font-medium text-white">{option.label}</div>
                <div className="mt-2 text-sm leading-7 text-slate-400">{option.description}</div>
              </button>
            );
          })}
        </div>
      );
      break;
    default:
      stepContent = (
        <div className="grid gap-4">
          <button
            type="button"
            
            className={`rounded-3xl border p-5 text-left transition`}
          >
            <div className="text-lg font-medium text-white">Weight loss</div>
            <div className="mt-2 text-sm leading-7 text-slate-400">
              Optional extra focus. Leave it empty if the main goal is enough for now.
            </div>
          </button>
        </div>
      );
  }

  function goNext() {
    if (currentStep === steps.length - 1) {
      router.push("/dashboard");
      return;
    }


  }

  function goBack() {
   
  }

  function skipStep() {
    if (currentStep === steps.length - 1) {
      
      router.push("/dashboard");
      return;
    }

    
  }

  return (
    
      <MarketingShell
        accentLabel="Onboarding"
        title="Build your profile in a few short steps"
        description="You can skip any step, save partial progress automatically, and return later from your account."
        maxWidthClassName="max-w-5xl"
      >
        <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <Card className="space-y-6">
            <Stepper steps={steps.map((step) => ({ key: step.key, label: step.label }))} currentStep={currentStep} />
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Current step</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">{steps[currentStep].label}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Fill only what is useful right now. Every field can be revisited later.
              </p>
            </div>
            {stepContent}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={goBack} disabled={currentStep === 0}>
                Back
              </Button>
              <Button type="button" onClick={goNext}>
                {currentStep === steps.length - 1 ? "Finish" : "Continue"}
              </Button>
              <Button type="button" variant="ghost" onClick={skipStep}>
                {currentStep === steps.length - 1 ? "Finish later" : "Skip step"}
              </Button>
            </div>
          </Card>

          <Card>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Profile preview</p>
            <div className="mt-5 space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                Name: 
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                Height / Weight: 
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                Main goal: 
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                Extra goal: 
              </div>
            </div>
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm leading-7 text-slate-400">
                After finishing, the profile is considered created and the dashboard can use these values for a more personal experience.
              </p>
            </div>
            <Link href="/dashboard" className="mt-6 inline-flex text-sm text-sky-300">
              Continue later in dashboard
            </Link>
          </Card>
        </div>
      </MarketingShell>
  );
}
