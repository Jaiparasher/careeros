import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowLeft } from "lucide-react";
import {
  getActivePlan,
  getDayAgenda,
  getUserStudyCapacity,
} from "@/features/planner/service";
import { RecommendationAdvisorView } from "./components/recommendation-advisor-view";

export default async function PlannerRecommendationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { dailyAvailableMinutes, targetRoles } = await getUserStudyCapacity(supabase, user.id);
  const activePlan = await getActivePlan(supabase, user.id);
  const todayStr = new Date().toISOString().slice(0, 10);
  const agenda = await getDayAgenda(supabase, user.id, todayStr, activePlan?.id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/planner"
              className="text-neutral-400 hover:text-neutral-200 transition p-1 -ml-1 rounded-md hover:bg-neutral-800"
              title="Back to Study Planner"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-amber-400" />
              AI Study Recommendations & Revision Advisor
            </h1>
            <Badge variant="outline" className="border-amber-700/80 text-amber-300 text-xs">
              Phase 4
            </Badge>
          </div>
          <p className="text-sm text-neutral-400">
            Capacity-aware AI advisor ranking your overdue DSA revisions, weak topics, and incomplete modules.
          </p>
        </div>
      </div>

      <RecommendationAdvisorView
        dailyAvailableMinutes={dailyAvailableMinutes}
        currentPlannedMinutes={agenda.totalPlannedMinutes}
        targetRoles={targetRoles}
      />
    </div>
  );
}
