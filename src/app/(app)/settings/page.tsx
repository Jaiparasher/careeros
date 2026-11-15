import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
          Account Settings
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Manage your career target roles, compensation preferences, and daily study capacity.
        </p>
      </div>

      <SettingsForm profile={profile} />
    </div>
  );
}
