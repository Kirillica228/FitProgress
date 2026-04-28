"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { SessionGuard } from "@/components/auth/session-guard";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: typeof errors = {};
    const normalizedEmail = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email";
    }

    if (password.trim().length < 6) {
      nextErrors.password = "At least 6 characters";
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords must match";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    router.push("/onboarding");
  }

  return (

      <MarketingShell maxWidthClassName="max-w-4xl">
        <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
          <Card className="w-full max-w-md">
            <h1 className="text-2xl font-semibold">Create account</h1>
            <p className="mt-2 text-sm text-slate-400">Start with your email and continue to a short onboarding flow.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <FormField label="Email" error={errors.email}>
                <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" />
              </FormField>
              <FormField label="Password" error={errors.password}>
                <Input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create password" type="password" />
              </FormField>
              <FormField label="Repeat password" error={errors.confirmPassword}>
                <Input
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat password"
                  type="password"
                />
              </FormField>
              <Button className="w-full" type="submit">
                Register
              </Button>
            </form>
            <p className="mt-5 text-sm text-slate-400">
              Already registered?{" "}
              <Link href="/auth/login" className="text-sky-300">
                Login
              </Link>
            </p>
          </Card>
        </div>
      </MarketingShell>
  );
}
