import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="mt-2 text-sm text-slate-400">Start tracking workouts, meals, goals, and progress.</p>
        <div className="mt-6 space-y-4">
          <Input placeholder="Full name" />
          <Input placeholder="Email" type="email" />
          <Input placeholder="Password" type="password" />
          <Link href="/dashboard" className="block">
            <Button className="w-full">Register</Button>
          </Link>
        </div>
        <p className="mt-5 text-sm text-slate-400">
          Already registered?{" "}
          <Link href="/auth/login" className="text-sky-300">
            Login
          </Link>
        </p>
      </Card>
    </main>
  );
}
