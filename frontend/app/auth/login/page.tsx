"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/use-auth";

const schema = z.object({
  username: z.string().min(1, "Введите имя пользователя"),
  password: z.string().min(1, "Введите пароль"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    login.mutate(
      { username: values.username, password: values.password },
      {
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Ошибка входа"),
      },
    );
  }

  return (
    <MarketingShell maxWidthClassName="max-w-4xl">
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
        <Card className="w-full max-w-md">
          <h1 className="text-2xl font-semibold">Добро пожаловать</h1>
          <p className="mt-2 text-sm text-slate-400">
            Войдите, чтобы продолжить работу с тренировками и прогрессом.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Логин</Label>
              <Input
                id="username"
                placeholder="Ваш логин"
                autoComplete="username"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-sm text-rose-400">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-rose-400">{errors.password.message}</p>
              )}
            </div>

            <Button className="w-full" type="submit" disabled={login.isPending}>
              {login.isPending ? "Вход…" : "Войти"}
            </Button>
          </form>
          <p className="mt-5 text-sm text-slate-400">
            Нет аккаунта?{" "}
            <Link href="/auth/register" className="text-sky-300">
              Зарегистрироваться
            </Link>
          </p>
        </Card>
      </div>
    </MarketingShell>
  );
}
