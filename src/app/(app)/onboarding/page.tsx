import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSeedProfileDefaults } from "@/features/profile/service";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // If user already has a profile, redirect to dashboard
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (existingProfile) {
    redirect("/dashboard");
  }

  const initialDefaults = getSeedProfileDefaults();

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-100">
          Welcome to CareerOS
        </h1>
        <p className="text-neutral-400">
          Review your baseline profile and learning history before setting up your daily preparation dashboard.
        </p>
      </div>

      <OnboardingForm initialDefaults={initialDefaults} />
    </div>
  );
}
