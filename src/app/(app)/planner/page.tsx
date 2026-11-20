import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  getActivePlan,
  getDayAgenda,
  getPlanOverallStats,
  getUserStudyCapacity,
} from "@/features/planner/service";
import { DailyAgenda } from "./components/daily-agenda";

interface PlannerPageProps {
  searchParams: Promise<{
    date?: string;
  }>;
}

export default async function PlannerPage({ searchParams }: PlannerPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const activePlan = await getActivePlan(supabase, user.id);
  const { dailyAvailableMinutes } = await getUserStudyCapacity(supabase, user.id);

  if (!activePlan) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100 flex items-center gap-2">
                <CalendarCheck2 className="h-6 w-6 text-amber-400" />
                Study Planner & Daily Agenda
              </h1>
              <Badge variant="outline" className="border-amber-700/80 text-amber-300 text-xs">
                Phase 2
              </Badge>
            </div>
            <p className="text-sm text-neutral-400 mt-1">
              Deterministic, capacity-aware task agenda respecting your {dailyAvailableMinutes} min daily budget.
            </p>
          </div>
        </div>

        {/* Empty state / Prompt to preview sprint */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-8 sm:p-10 text-center space-y-5">
          <div className="h-12 w-12 rounded-2xl bg-amber-950/60 border border-amber-800/80 flex items-center justify-center mx-auto text-amber-400">
            <Sparkles className="h-6 w-6" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-neutral-100">
              No Active Interview Sprint
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Launch your structured preparation plan. Preview the curriculum, verify your daily study capacity, and schedule all 75 Grind 75 Core problems with spaced revision checkpoints.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left pt-2">
            <div className="rounded-lg bg-neutral-950 p-3.5 border border-neutral-800 text-xs space-y-1">
              <strong className="text-neutral-200 block">75 Grind 75 Core</strong>
              <p className="text-neutral-400">
                Scheduled in official Tech Interview Handbook order without duplicate items.
              </p>
            </div>
            <div className="rounded-lg bg-neutral-950 p-3.5 border border-neutral-800 text-xs space-y-1">
              <strong className="text-neutral-200 block">Capacity-Aware</strong>
              <p className="text-neutral-400">
                Never claims an overloaded plan fits; offers 45-day and 60-day alternatives.
              </p>
            </div>
            <div className="rounded-lg bg-neutral-950 p-3.5 border border-neutral-800 text-xs space-y-1">
              <strong className="text-neutral-200 block">Preview Before Accept</strong>
              <p className="text-neutral-400">
                Inspect every single day before saving tasks to your database.
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/planner/sprint"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition"
            >
              Preview & Configure Sprint <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/planner/recommendations"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-sm transition"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              AI Study Advisor
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const todayStr = new Date().toISOString().slice(0, 10);
  const selectedDate = params.date || todayStr;

  const agenda = await getDayAgenda(supabase, user.id, selectedDate, activePlan.id);
  const stats = await getPlanOverallStats(supabase, user.id, activePlan);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100 flex items-center gap-2">
              <CalendarCheck2 className="h-6 w-6 text-amber-400" />
              Daily Study Agenda
            </h1>
            <Badge variant="outline" className="border-amber-700/80 text-amber-300 text-xs">
              Sprint Active
            </Badge>
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            Capacity-controlled daily tasks respecting your {dailyAvailableMinutes} min daily budget.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/planner/recommendations"
            className="text-xs text-amber-300 hover:text-amber-200 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-800/80 hover:bg-amber-900/60 transition flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            AI Advisor
          </Link>
          <Link
            href="/planner/sprint"
            className="text-xs text-neutral-400 hover:text-neutral-200 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition"
          >
            Switch / Configure Plan
          </Link>
        </div>
      </div>

      <DailyAgenda plan={activePlan} agenda={agenda} stats={stats} />
    </div>
  );
}
