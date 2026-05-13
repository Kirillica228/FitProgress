"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { useLogout } from "@/hooks/use-auth";

/** Хук для получения текущего пользователя через GET /auth/me/ */
function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: authApi.me,
    staleTime: 60_000,
  });
}

export function Topbar() {
  const router = useRouter();
  const { data: user } = useMe();
  const logout = useLogout();

  const displayName = user?.username ?? "Пользователь";

  const initials = displayName
    .slice(0, 2)
    .toUpperCase();

  const vkConnected = user?.vk_id != null;
  const vkStatus = vkConnected ? "Подключён" : "Не подключён";

  return (
    <div className="mt-8 mb-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Аватар + имя */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-lg font-bold text-emerald-400">
            {initials || "?"}
          </div>
          <div>
            <p className="text-lg font-semibold text-white leading-tight">{displayName}</p>
            {user?.email && (
              <p className="text-sm text-slate-400">{user.email}</p>
            )}
          </div>
        </div>

        {/* Инфо + кнопки */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Username */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <p className="text-xs text-slate-400">Username</p>
            <p className="text-sm font-semibold text-white">{user?.username ?? "—"}</p>
          </div>

          {/* VK BOT статус */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <p className="text-xs text-slate-400">VK BOT</p>
            <p className={`text-sm font-semibold ${vkConnected ? "text-emerald-400" : "text-slate-500"}`}>
              {vkStatus}
            </p>
          </div>

          {/* Кнопки */}
          <Button
            variant="secondary"
            onClick={() => router.push("/")}
          >
            На главную
          </Button>
          <Button
            variant="secondary"
            className="text-black hover:text-red-300"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            {logout.isPending ? "Выход..." : "Выйти"}
          </Button>
        </div>
      </div>
    </div>
  );
}
