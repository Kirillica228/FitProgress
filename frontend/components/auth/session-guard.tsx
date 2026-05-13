"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { authApi } from "@/lib/api";

/**
 * Защищает страницы дашборда.
 * Вызывает /auth/me/ напрямую на бэкенд — бэкенд читает httpOnly cookie fp_access.
 * При 401 редиректит на /auth/login.
 */
export function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const { isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: authApi.me,
    retry: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (isError) {
      router.replace("/auth/login");
    }
  }, [isError, router]);

  if (isLoading || isError) return null;
  return <>{children}</>;
}
