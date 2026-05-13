"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stepper } from "@/components/ui/stepper";
import { useCreateProfile } from "@/hooks/use-profile";

// ─── Steps config ─────────────────────────────────────────────────────────────

const steps = [
  { key: "name", label: "Личные данные" },
  { key: "metrics", label: "Параметры" },
  { key: "goal", label: "Основная цель" },
  { key: "extra", label: "Дополнительная цель" },
] as const;

// ─── Zod schemas per step ─────────────────────────────────────────────────────

const nameSchema = z.object({
  first_name: z.string().min(1, "Введите имя"),
  last_name: z.string().optional(),
});

type NameValues = z.infer<typeof nameSchema>;

// ─── Goal options ─────────────────────────────────────────────────────────────

const primaryGoalOptions = [
  { value: "gain", label: "Набор массы", description: "Для тех, кто хочет нарастить мышцы и силу." },
  { value: "cut", label: "Сушка", description: "Для тех, кто хочет снизить жировую массу." },
  { value: "maintain", label: "Поддержание формы", description: "Стабильный вес и производительность." },
] as const;

const extraGoalOptions = [
  { value: "endurance", label: "Выносливость", description: "Улучшить кардио и общую выносливость." },
  { value: "flexibility", label: "Гибкость", description: "Растяжка и подвижность суставов." },
  { value: "none", label: "Без дополнительной цели", description: "Основной цели достаточно." },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const createProfile = useCreateProfile();
  const [currentStep, setCurrentStep] = useState(0);

  // Accumulated form data across steps
  const [formData, setFormData] = useState<{
    first_name: string;
    last_name: string;
    height: string;
    weight: string;
    goal: string;
    extra_goal: string;
  }>({
    first_name: "",
    last_name: "",
    height: "",
    weight: "",
    goal: "",
    extra_goal: "",
  });

  // ── Step 0: name ──────────────────────────────────────────────────────────

  const nameForm = useForm<NameValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: { first_name: formData.first_name, last_name: formData.last_name },
  });

  // ── Navigation ────────────────────────────────────────────────────────────

  async function handleNameNext(values: NameValues) {
    setFormData((prev) => ({ ...prev, ...values, last_name: values.last_name ?? "" }));
    setCurrentStep(1);
  }

  function handleMetricsNext() {
    setCurrentStep(2);
  }

  function handleGoalSelect(value: string) {
    setFormData((prev) => ({ ...prev, goal: value }));
    setCurrentStep(3);
  }

  function handleExtraGoalSelect(value: string) {
    const final = { ...formData, extra_goal: value };
    setFormData(final);
    submitProfile(final);
  }

  function submitProfile(data: typeof formData) {
    createProfile.mutate(
      {
        first_name: data.first_name,
        last_name: data.last_name,
        height: data.height ? Number(data.height) : undefined,
        weight: data.weight ? Number(data.weight) : undefined,
        goal: data.goal,
        extra_goal: data.extra_goal,
      },
      {
        onError: () => toast.error("Не удалось сохранить профиль. Попробуйте позже."),
      },
    );
  }

  function skipToEnd() {
    router.push("/dashboard");
  }

  // ── Step content ──────────────────────────────────────────────────────────

  let stepContent: React.ReactNode;
  let onContinue: (() => void) | undefined;

  switch (currentStep) {
    case 0:
      stepContent = (
        <form
          id="step-form"
          onSubmit={nameForm.handleSubmit(handleNameNext)}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="space-y-2">
            <Label htmlFor="first_name">Имя</Label>
            <Input id="first_name" placeholder="Иван" {...nameForm.register("first_name")} />
            {nameForm.formState.errors.first_name && (
              <p className="text-sm text-rose-400">{nameForm.formState.errors.first_name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Фамилия</Label>
            <Input id="last_name" placeholder="Иванов" {...nameForm.register("last_name")} />
          </div>
        </form>
      );
      break;

    case 1:
      stepContent = (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="height">Рост (см)</Label>
            <Input
              id="height"
              inputMode="decimal"
              placeholder="178"
              value={formData.height}
              onChange={(e) => setFormData((p) => ({ ...p, height: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Вес (кг)</Label>
            <Input
              id="weight"
              inputMode="decimal"
              placeholder="76"
              value={formData.weight}
              onChange={(e) => setFormData((p) => ({ ...p, weight: e.target.value }))}
            />
          </div>
        </div>
      );
      onContinue = handleMetricsNext;
      break;

    case 2:
      stepContent = (
        <div className="grid gap-4">
          {primaryGoalOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleGoalSelect(option.value)}
              className={`rounded-3xl border p-5 text-left transition hover:border-sky-400 ${
                formData.goal === option.value ? "border-sky-400 bg-sky-400/10" : "border-white/10"
              }`}
            >
              <div className="text-lg font-medium text-white">{option.label}</div>
              <div className="mt-2 text-sm leading-7 text-slate-400">{option.description}</div>
            </button>
          ))}
        </div>
      );
      break;

    case 3:
      stepContent = (
        <div className="grid gap-4">
          {extraGoalOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleExtraGoalSelect(option.value)}
              disabled={createProfile.isPending}
              className={`rounded-3xl border p-5 text-left transition hover:border-sky-400 disabled:opacity-50 ${
                formData.extra_goal === option.value ? "border-sky-400 bg-sky-400/10" : "border-white/10"
              }`}
            >
              <div className="text-lg font-medium text-white">{option.label}</div>
              <div className="mt-2 text-sm leading-7 text-slate-400">{option.description}</div>
            </button>
          ))}
        </div>
      );
      break;
  }

  return (
    <MarketingShell
      accentLabel="Онбординг"
      title="Заполните профиль за несколько шагов"
      description="Любой шаг можно пропустить и вернуться позже из личного кабинета."
      maxWidthClassName="max-w-5xl"
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <Card className="space-y-6">
          <Stepper
            steps={steps.map((s) => ({ key: s.key, label: s.label }))}
            currentStep={currentStep}
          />
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Текущий шаг</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">{steps[currentStep].label}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Заполните только то, что актуально сейчас. Всё можно изменить позже.
            </p>
          </div>

          {stepContent}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentStep((s) => s - 1)}
              >
                Назад
              </Button>
            )}

            {/* Steps 0 submits via form, steps 1 uses onContinue, steps 2-3 use card clicks */}
            {currentStep === 0 && (
              <Button type="submit" form="step-form">
                Продолжить
              </Button>
            )}
            {currentStep === 1 && (
              <Button type="button" onClick={onContinue}>
                Продолжить
              </Button>
            )}

            <Button type="button" variant="ghost" onClick={skipToEnd}>
              {currentStep === steps.length - 1 ? "Завершить позже" : "Пропустить шаг"}
            </Button>
          </div>
        </Card>

        {/* Preview panel */}
        <Card>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Предпросмотр профиля</p>
          <div className="mt-5 space-y-4 text-sm text-slate-300">
            <div className="rounded-2xl bg-white/5 px-4 py-3">
              Имя: {formData.first_name} {formData.last_name}
            </div>
            <div className="rounded-2xl bg-white/5 px-4 py-3">
              Рост / Вес:{" "}
              {formData.height ? `${formData.height} см` : "—"} /{" "}
              {formData.weight ? `${formData.weight} кг` : "—"}
            </div>
            <div className="rounded-2xl bg-white/5 px-4 py-3">
              Основная цель:{" "}
              {primaryGoalOptions.find((o) => o.value === formData.goal)?.label ?? "—"}
            </div>
            <div className="rounded-2xl bg-white/5 px-4 py-3">
              Доп. цель:{" "}
              {extraGoalOptions.find((o) => o.value === formData.extra_goal)?.label ?? "—"}
            </div>
          </div>
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm leading-7 text-slate-400">
              После завершения профиль будет создан и дашборд начнёт использовать ваши данные.
            </p>
          </div>
          <Link href="/dashboard" className="mt-6 inline-flex text-sm text-sky-300">
            Продолжить позже в дашборде
          </Link>
        </Card>
      </div>
    </MarketingShell>
  );
}
