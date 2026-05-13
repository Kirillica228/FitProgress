import Link from "next/link";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LandingPage() {
  const featureCards = [
    {
      title: "Единый обзор прогресса",
      description: "Тренировки, питание, замеры тела и цели — всё в одном спокойном дашборде с чёткими сигналами.",
    },
    {
      title: "Понятные тренды",
      description: "Видите, что улучшается неделя за неделей, а не гадаете по отдельным тренировкам или взвешиваниям.",
    },
    {
      title: "Структурированные привычки",
      description: "Выстраивайте повторяемый режим с помощью онбординга, сохранённых целей и простого ежедневного трекинга.",
    },
  ];

  const userResults = [
    "Более стабильный контроль веса и состава тела",
    "Лучшая видимость регулярности тренировок и восстановления",
    "Чёткие привычки питания без громоздких таблиц",
  ];

  return (
    <MarketingShell
      accentLabel="О FitProgress"
      title="Чистое персональное фитнес-пространство, созданное для постоянства, а не шума."
      description="FitProgress помогает тренироваться осознаннее, понимать свой прогресс и превращать цели в здоровье в устойчивую систему."
      actions={
        <>
          <Link href="/auth/register">
            <Button className="px-6 py-3">Зарегистрироваться</Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="secondary" className="px-6 py-3">
              Начать сейчас
            </Button>
          </Link>
        </>
      }
      maxWidthClassName="max-w-7xl"
    >
      <section className="grid gap-6 pt-2 lg:grid-cols-[1.15fr,0.85fr]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-white/10 bg-white/5 px-6 py-6">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Миссия</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Мы делаем прогресс видимым и управляемым.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              Продукт объединяет тренировки, питание, замеры тела и долгосрочные цели в одном минималистичном интерфейсе, чтобы пользователи принимали более взвешенные решения.
            </p>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-3">
            <div className="rounded-3xl bg-accent-blue/10 p-5">
              <div className="text-sm text-slate-300">Еженедельные чек-ины</div>
              <div className="mt-3 text-3xl font-semibold">Быстро</div>
            </div>
            <div className="rounded-3xl bg-accent-green/10 p-5">
              <div className="text-sm text-slate-300">Ясность данных</div>
              <div className="mt-3 text-3xl font-semibold">Высокая</div>
            </div>
            <div className="rounded-3xl bg-white/5 p-5">
              <div className="text-sm text-slate-300">Трение привычек</div>
              <div className="mt-3 text-3xl font-semibold">Низкое</div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6">
          <Card>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Кто мы</p>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              Мы создаём спокойного цифрового помощника для людей, которые хотят улучшить физическую форму и здоровье со структурой, а не хаосом.
            </p>
          </Card>
          <Card>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Что мы делаем</p>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              Помогаем пользователям собирать нужные данные, понимать тренды и оставаться в соответствии со своей текущей целью через современный и понятный интерфейс.
            </p>
          </Card>
        </div>
      </section>

      <section className="pt-8">
        <div className="mb-5 px-1">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Преимущества</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Спроектировано как единая система</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((feature) => (
            <Card key={feature.title}>
              <div className="inline-flex rounded-2xl bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.22em] text-sky-300">
                Функция
              </div>
              <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 pt-8 lg:grid-cols-[0.9fr,1.1fr]">
        <Card>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Результаты</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Что пользователи могут реально улучшить</h2>
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
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Начать</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Начните с простого аккаунта, затем персонализируйте профиль.</h2>
          </div>
          <div className="space-y-4 p-6">
            <p className="text-sm leading-7 text-slate-400">
              Регистрация занимает минуту. Онбординг разбит на короткие шаги и может быть пропущен или завершён позже в дашборде.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/auth/register">
                <Button className="px-6 py-3">Создать аккаунт</Button>
              </Link>
              <Link href="/articles">
                <Button variant="secondary" className="px-6 py-3">
                  Читать статьи
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </MarketingShell>
  );
}
