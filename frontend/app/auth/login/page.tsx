"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email");
      return;
    }

    if (!password.trim()) {
      setError("Enter your password");
      return;
    }

    router.push("/onboarding");
  }

  return (
    
      <MarketingShell maxWidthClassName="max-w-4xl">
        <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
          <Card className="w-full max-w-md">
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-400">Sign in to continue working with your training and progress data.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <FormField label="Email" error={error.includes("email") ? error : undefined}>
                <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" />
              </FormField>
              <FormField label="Password" error={error.includes("password") ? error : undefined}>
                <Input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" type="password" />
              </FormField>
              {error && !error.includes("email") && !error.includes("password") ? (
                <p className="text-sm text-rose-300">{error}</p>
              ) : null}
              <Button className="w-full" type="submit">
                Login
              </Button>
            </form>
            <p className="mt-5 text-sm text-slate-400">
              Need an account?{" "}
              <Link href="/auth/register" className="text-sky-300">
                Register
              </Link>
            </p>
          </Card>
        </div>
      </MarketingShell>
   
  );
}
