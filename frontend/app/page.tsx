import Link from "next/link";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LandingPage() {
  const features = [
    {
      icon: "📊",
      title: "Единый обзор прогресса",
      description:
        "Тренировки, питание, замеры тела и цели — всё в одном спокойном дашборде с чёткими сигналами.",
    },
    {
      icon: "📈",
      title: "Понятные тренды",
      description:
        "Видите, что улучшается неделя за неделей, а не гадаете по отдельным тренировкам или взвешиваниям.",
    },
    {
      icon: "🔄",
      title: "Структурированные привычки",
      description:
        "Выстраивайте повторяемый режим с помощью онбординга, сохранённых целей и простого ежедневного трекинга.",
    },
    {
      icon: "🎯",
      title: "Долгосрочные цели",
      description:
        "Ставьте цели по калориям и макронутриентам, отслеживайте прогресс и корректируйте план.",
    },
    {
      icon: "📱",
      title: "Чат-бот ВКонтакте",
      description:
        "Записывайте тренировки и питание прямо через удобного бота, не открывая сайт.",
    },
  ];

  return (
    <MarketingShell
      accentLabel="FitProgress"
      title="Дневник тренировок и питания — просто, наглядно, без лишнего."
      description="Записывайте тренировки и питание, следите за прогрессом и достигайте целей. Весь инструментарий в одном месте."
      actions={
        <>
          <Link href="/auth/register">
            <Button className="px-8 py-3 text-base">Попробовать бесплатно</Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="secondary" className="px-8 py-3 text-base">
              Войти
            </Button>
          </Link>
        </>
      }
      maxWidthClassName="max-w-7xl"
    >
      {/* Возможности */}
      <section className="pt-10">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
            Возможности
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            Всё, что нужно для осознанного фитнеса
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card
              key={f.title}
              className="group transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04]"
            >
              <div className="mb-4 text-3xl">{f.icon}</div>
              <h3 className="text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {f.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Как это работает */}
      <section className="pt-14">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
            Как это работает
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            Три простых шага
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Зарегистрируйтесь",
              desc: "Создайте аккаунт за минуту и настройте профиль под свои цели.",
            },
            {
              step: "02",
              title: "Записывайте данные",
              desc: "Вносите тренировки и питание через сайт или чат-бота ВКонтакте.",
            },
            {
              step: "03",
              title: "Анализируйте прогресс",
              desc: "Смотрите тепловые карты, тренды и статистику в удобных графиках.",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur"
            >
              <div className="text-5xl font-bold text-white/10">{s.step}</div>
              <h3 className="mt-3 text-xl font-semibold text-white">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pt-14">
        <Card className="overflow-hidden border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-0">
          <div className="px-6 py-10 text-center sm:px-12 sm:py-14">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Готовы начать?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-400">
              Регистрация занимает минуту. Онбординг разбит на короткие шаги —
              можно пройти сразу или вернуться позже.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/auth/register">
                <Button className="px-8 py-3 text-base">
                  Создать аккаунт
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </MarketingShell>
  );
}
