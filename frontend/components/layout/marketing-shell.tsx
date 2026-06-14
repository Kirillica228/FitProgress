"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button, buttonVariants } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useLogout } from "@/hooks/use-auth";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: authApi.me,
    retry: false,
    staleTime: 60_000,
  });
  const logout = useLogout();
  const isLoggedIn = !!user;

  const closeMenu = () => setIsMenuOpen(false);

  const renderNavLinks = () =>
    isLoggedIn ? (
      <>
        <Link
          href="/"
          onClick={closeMenu}
          className="rounded-2xl px-3 py-2 transition hover:bg-white/5 hover:text-white"
        >
          О сервисе
        </Link>
        <Link
          href="/dashboard"
          onClick={closeMenu}
          className={cn(buttonVariants(), "text-xs sm:text-sm")}
        >
          Личный кабинет
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs sm:text-sm border border-white/10 bg-white/[0.05] text-slate-300 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-colors"
          onClick={() => {
            logout.mutate();
            closeMenu();
          }}
          disabled={logout.isPending}
        >
          {logout.isPending ? "Выход..." : "Выйти"}
        </Button>
      </>
    ) : (
      <>
        <Link
          href="/"
          onClick={closeMenu}
          className="rounded-2xl px-3 py-2 transition hover:bg-white/5 hover:text-white"
        >
          О сервисе
        </Link>
        <Link
          href="/auth/login"
          onClick={closeMenu}
          className={cn(buttonVariants(), "text-xs sm:text-sm")}
        >
          Войти
        </Link>
        <Link
          href="/auth/register"
          onClick={closeMenu}
          className={cn(buttonVariants(), "text-xs sm:text-sm")}
        >
          Начать
        </Link>
      </>
    );

  return (
    <main className="min-h-screen px-3 py-4 sm:px-6 sm:py-8">
      <div className={cn("mx-auto", maxWidthClassName)}>
        <header className="rounded-2xl sm:rounded-[2rem] border border-white/10 bg-white/5 px-4 py-3 sm:px-6 sm:py-4 shadow-glow backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            {/* Логотип */}
            <div>
              <Link
                href="/"
                className="text-xl sm:text-2xl font-semibold tracking-tight text-white"
              >
                FitProgress
              </Link>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-400 hidden sm:block">
                Аналитика тренировок, питания и прогресса в одном месте.
              </p>
            </div>

            {/* Десктопная навигация */}
            <nav className="hidden lg:flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-300">
              {renderNavLinks()}
            </nav>

            {/* Бургер — только на мобилке */}
            <button
              className="lg:hidden flex items-center justify-center h-9 w-9 rounded-xl border border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
              onClick={() => setIsMenuOpen((o) => !o)}
              aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Мобильное выпадающее меню */}
          {isMenuOpen && (
            <nav className="lg:hidden mt-3 flex flex-col gap-1 border-t border-white/10 pt-3 text-sm text-slate-300">
              {renderNavLinks()}
            </nav>
          )}
        </header>

        {(accentLabel || title || description || actions) && (
          <section className="px-1 pb-2 pt-6 sm:pt-10 sm:px-2">
            {accentLabel ? (
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.3em] text-sky-300">
                {accentLabel}
              </p>
            ) : null}
            {title ? (
              <h1 className="mt-3 max-w-4xl text-2xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight">
                {title}
              </h1>
            ) : null}
            {description ? (
              <p className="mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base md:text-lg leading-7 text-slate-400">
                {description}
              </p>
            ) : null}
            {actions ? (
              <div className="mt-5 sm:mt-6 flex flex-wrap gap-3">{actions}</div>
            ) : null}
          </section>
        )}

        <div className="pb-12">{children}</div>
      </div>
    </main>
  );
}
