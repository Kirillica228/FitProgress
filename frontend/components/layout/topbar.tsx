"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { useLogout } from "@/hooks/use-auth";

function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: authApi.me,
    staleTime: 60_000,
  });
}

export function Topbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { data: user } = useMe();
  const logout = useLogout();

  const displayName = user?.username ?? "Пользователь";
  const initials = displayName.slice(0, 2).toUpperCase();
  const vkConnected = user?.vk_id != null;
  const vkStatus = vkConnected ? "Подключён" : "Не подключён";

  return (
    <div className="mt-4 sm:mt-6 xl:mt-8 mb-4 sm:mb-6 xl:mb-8 rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.03] p-3 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        {/* Аватар + имя */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-10 w-10 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-500/15 text-base sm:text-lg font-bold text-emerald-400">
            {initials || "?"}
          </div>
          <div>
            <p className="text-base sm:text-lg font-semibold text-white leading-tight">
              {displayName}
            </p>
            {user?.email && (
              <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">
                {user.email}
              </p>
            )}
          </div>
        </div>

        {/* Инфо + кнопки */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* VK BOT статус — только на десктопе */}
          <div className="hidden sm:block rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <p className="text-xs text-slate-400">VK BOT</p>
            <p
              className={`text-sm font-semibold ${
                vkConnected ? "text-emerald-400" : "text-slate-500"
              }`}
            >
              {vkStatus}
            </p>
          </div>

          {/* На главную — только на десктопе */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex border border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08] hover:text-white hover:border-white/20 transition-colors"
            onClick={() => router.push("/")}
          >
            На главную
          </Button>

          {/* Выйти — всегда видна */}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs sm:text-sm border border-white/10 bg-white/[0.05] text-slate-300 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-colors"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            {logout.isPending ? "Выход..." : "Выйти"}
          </Button>

          {/* Бургер — только на мобилке */}
          <button
            className="sm:hidden flex items-center justify-center h-9 w-9 rounded-xl border border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
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
      </div>

      {/* Мобильное выпадающее меню */}
      {isMenuOpen && (
        <div className="sm:hidden mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
            <p className="text-xs text-slate-400">VK BOT</p>
            <p
              className={`text-sm font-semibold ${
                vkConnected ? "text-emerald-400" : "text-slate-500"
              }`}
            >
              {vkStatus}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start border border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08] hover:text-white hover:border-white/20 transition-colors"
            onClick={() => {
              router.push("/");
              setIsMenuOpen(false);
            }}
          >
            На главную
          </Button>
        </div>
      )}
    </div>
  );
}
