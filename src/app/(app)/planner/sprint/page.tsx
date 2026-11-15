import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActivePlan, getUserStudyCapacity } from "@/features/planner/service";
import { SprintPreview } from "../components/sprint-preview";

export default async function SprintPreviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const activePlan = await getActivePlan(supabase, user.id);
  const { dailyAvailableMinutes } = await getUserStudyCapacity(supabase, user.id);

  return (
    <SprintPreview
      dailyAvailableMinutes={dailyAvailableMinutes}
      existingActivePlanName={activePlan?.name}
    />
  );
}
