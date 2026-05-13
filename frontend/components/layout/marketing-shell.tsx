"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Button, buttonVariants } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useLogout } from "@/hooks/use-auth";

const navItems = [
  { href: "/", label: "О сервисе" },
  { href: "/articles", label: "Статьи" },
  { href: "/auth/login", label: "Войти" },
];

export function MarketingShell({
  children,
  accentLabel,
  title,
  description,
  actions,
  maxWidthClassName = "max-w-6xl",
}: {
  children: React.ReactNode;
  accentLabel?: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  maxWidthClassName?: string;
}) {

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: authApi.me,
    retry: false,
    staleTime: 60_000,
  });
  const logout = useLogout();
  const isLoggedIn = !!user;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className={cn("mx-auto", maxWidthClassName)}>
        <header className="rounded-[2rem] border border-white/10 bg-white/5 px-5 py-4 shadow-glow backdrop-blur sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link href="/" className="text-2xl font-semibold tracking-tight text-white">
                FitProgress
              </Link>
              <p className="mt-1 text-sm text-slate-400">
                Аналитика тренировок, питания и прогресса в одном месте.
              </p>
            </div>
            <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
              <Link
                href="/"
                className="rounded-2xl px-4 py-2 transition hover:bg-white/5 hover:text-white"
              >
                О сервисе
              </Link>
              <Link
                href="/articles"
                className="rounded-2xl px-4 py-2 transition hover:bg-white/5 hover:text-white"
              >
                Статьи
              </Link>

              {isLoggedIn ? (
                <>
                  <Link href="/dashboard" className={buttonVariants()}>
                  Личный кабинет
                  </Link>
                  <Button
                  variant="secondary"
                  className="text-black hover:text-red-300"
                  onClick={() => logout.mutate()}
                  disabled={logout.isPending}
                >
                  {logout.isPending ? "Выход..." : "Выйти"}
                </Button>
                </>
                
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="rounded-2xl px-4 py-2 transition hover:bg-white/5 hover:text-white"
                  >
                    Войти
                  </Link>
                  <Link href="/auth/register" className={buttonVariants()}>
                    Начать
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>

        {(accentLabel || title || description || actions) && (
          <section className="px-1 pb-2 pt-10 sm:px-2">
            {accentLabel ? (
              <p className="text-xs uppercase tracking-[0.3em] text-sky-300">{accentLabel}</p>
            ) : null}
            {title ? <h1 className="mt-3 max-w-4xl text-4xl font-semibold text-white sm:text-5xl">{title}</h1> : null}
            {description ? (
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">{description}</p>
            ) : null}
            {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
          </section>
        )}

        <div className="pb-12">{children}</div>
      </div>
    </main>
  );
}
