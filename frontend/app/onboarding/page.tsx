import { redirect } from "next/navigation";

/** Онбординг убран — редиректим на дашборд */
export default function OnboardingPage() {
  redirect("/dashboard");
}
