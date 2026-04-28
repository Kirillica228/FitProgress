import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "About" },
  { href: "/articles", label: "Articles" },
  { href: "/auth/login", label: "Login" },
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
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className={cn("mx-auto", maxWidthClassName)}>
        <header className="rounded-[2rem] border border-white/10 bg-white/5 px-5 py-4 shadow-glow backdrop-blur sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link href="/" className="text-2xl font-semibold tracking-tight text-white">
                Fitprogress
              </Link>
              <p className="mt-1 text-sm text-slate-400">
                Clean analytics and guided progress for training, nutrition, and recovery.
              </p>
            </div>
            <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl px-4 py-2 transition hover:bg-white/5 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/auth/register" className={buttonClassName()}>
                Start now
              </Link>
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
