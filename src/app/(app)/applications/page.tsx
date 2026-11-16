import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Briefcase } from "lucide-react";
import {
  getApplications,
  getApplicationsSummaryStats,
} from "@/features/applications/service";
import { CreateApplicationModal } from "./components/create-application-modal";
import { ApplicationsViewContainer } from "./components/applications-view-container";

interface ApplicationsPageProps {
  searchParams: Promise<{
    stage?: string;
    work_mode?: string;
    q?: string;
    filter?: string;
    sort?: string;
  }>;
}

export default async function ApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const stageFilter = resolvedParams.stage;
  const workModeFilter = resolvedParams.work_mode;
  const searchQuery = (resolvedParams.q || "").toLowerCase().trim();
  const alertFilter = resolvedParams.filter;
  const sortOption = resolvedParams.sort || "recent";

  const [allApplications, stats] = await Promise.all([
    getApplications(supabase, user.id, {
      stage: stageFilter,
      work_mode: workModeFilter,
      search: searchQuery,
    }),
    getApplicationsSummaryStats(supabase, user.id),
  ]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  // Apply alert filters if active
  let filtered = allApplications;
  if (alertFilter === "due_today") {
    filtered = filtered.filter(
      (a) =>
        a.next_follow_up_at === todayStr &&
        a.stage !== "offer" &&
        a.stage !== "rejected"
    );
  } else if (alertFilter === "overdue") {
    filtered = filtered.filter(
      (a) =>
        a.next_follow_up_at &&
        a.next_follow_up_at < todayStr &&
        a.stage !== "offer" &&
        a.stage !== "rejected"
    );
  } else if (alertFilter === "interviews") {
    filtered = filtered.filter(
      (a) => a.interview_date && new Date(a.interview_date) >= new Date()
    );
  } else if (alertFilter === "awaiting") {
    filtered = filtered.filter(
      (a) =>
        a.stage === "applied" &&
        a.application_date &&
        a.application_date <= sevenDaysAgo
    );
  }

  // Sort applications
  filtered = [...filtered].sort((a, b) => {
    if (sortOption === "followup") {
      if (!a.next_follow_up_at) return 1;
      if (!b.next_follow_up_at) return -1;
      return a.next_follow_up_at.localeCompare(b.next_follow_up_at);
    }
    if (sortOption === "applied_date") {
      if (!a.application_date) return 1;
      if (!b.application_date) return -1;
      return b.application_date.localeCompare(a.application_date);
    }
    if (sortOption === "salary") {
      const aSal = a.salary_max_lpa || a.expected_ctc_lpa || 0;
      const bSal = b.salary_max_lpa || b.expected_ctc_lpa || 0;
      return bSal - aSal;
    }
    if (sortOption === "company") {
      return a.company.localeCompare(b.company);
    }
    // Default: recent (updated_at desc)
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
              <Briefcase className="h-5 w-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100">
              Job Application Tracker
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
            Track job applications across all 11 stages, manage interview rounds, schedule follow-ups, and review chronological activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CreateApplicationModal />
        </div>
      </div>

      {/* Main Content View Container */}
      <ApplicationsViewContainer applications={filtered} stats={stats} />
    </div>
  );
}
