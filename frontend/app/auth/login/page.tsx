import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-400">Sign in to your Fitprogress dashboard.</p>
        <div className="mt-6 space-y-4">
          <Input placeholder="Email" type="email" />
          <Input placeholder="Password" type="password" />
          <Link href="/dashboard" className="block">
            <Button className="w-full">Login</Button>
          </Link>
        </div>
        <p className="mt-5 text-sm text-slate-400">
          Need an account?{" "}
          <Link href="/auth/register" className="text-sky-300">
            Register
          </Link>
        </p>
      </Card>
    </main>
  );
}
