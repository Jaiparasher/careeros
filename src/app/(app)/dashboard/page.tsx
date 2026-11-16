import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateCourseProgress } from "@/lib/domain/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Code2,
  Clock,
  Sparkles,
  Building2,
  Target,
  CalendarCheck2,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { getActivePlan, getDayAgenda, getPlanOverallStats } from "@/features/planner/service";
import { getQuestionBankStats, type QuestionBankStats } from "@/features/interview/service";
import { getDSAStats } from "@/features/dsa/service";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const dailyBudget = profile.daily_available_minutes || 120;

  // 2. Fetch learning modules
  const { data: rawModules } = await supabase
    .from("learning_modules")
    .select("module_number, title, completion_percent, status")
    .eq("user_id", user.id)
    .order("module_number", { ascending: true });

  const modules = rawModules || [];
  const aggregateProgress = calculateCourseProgress(modules);
  const completedCount = modules.filter((m) => Number(m.completion_percent) === 100).length;
  const inProgressModule = modules.find(
    (m) => Number(m.completion_percent) > 0 && Number(m.completion_percent) < 100
  );

  // 3. Fetch active study plan and today's agenda
  const activePlan = await getActivePlan(supabase, user.id);
  const planAgenda = activePlan
    ? await getDayAgenda(supabase, user.id, todayStr, activePlan.id)
    : null;
  const planStats = activePlan
    ? await getPlanOverallStats(supabase, user.id, activePlan)
    : null;

  // 4. Fetch live DSA statistics
  let dsaStats = {
    total: 0,
    not_started: 0,
    attempted: 0,
    solved: 0,
    needs_revision: 0,
    grind75_linked: 0,
    grind75_solved: 0,
    overdue_revisions: 0,
  };
  try {
    dsaStats = await getDSAStats(supabase, user.id);
  } catch (err) {
    console.error("Failed to fetch DSA stats:", err);
  }

  // Also query if any Grind 75 / DSA task was completed in the Daily Planner (study_tasks)
  const { data: completedDsaTasks } = await supabase
    .from("study_tasks")
    .select("question_id")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .not("question_id", "is", null);

  const completedTaskQuestionIds = new Set(
    (completedDsaTasks || []).map((t) => t.question_id).filter(Boolean)
  );

  // Check Grind 75 questions unioning DSA table status and completed planner tasks
  const { data: grindQuestions } = await supabase
    .from("dsa_questions")
    .select("id, status")
    .eq("user_id", user.id)
    .is("archived_at", null)
    .contains("collection_tags", ["grind75"]);

  const effectiveGrind75Solved = (grindQuestions || []).filter(
    (q) => q.status === "solved" || completedTaskQuestionIds.has(q.id)
  ).length;

  const totalDsaTracked = dsaStats.total;
  const dsaSolved = Math.max(dsaStats.solved, effectiveGrind75Solved);
  const grind75Solved = Math.max(dsaStats.grind75_solved, effectiveGrind75Solved);

  const { data: dueDsaRevs } = await supabase
    .from("revision_schedules")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .lte("scheduled_for", todayStr);

  const dueDsaCount = Math.max((dueDsaRevs || []).length, dsaStats.overdue_revisions);

  // 5. Fetch live Interview Question Bank statistics
  let qbStats: QuestionBankStats = { total: 0, answered: 0, strong: 0, needsRevision: 0, categoryStats: [] };
  try {
    qbStats = await getQuestionBankStats(supabase, user.id);
  } catch {
    // If table not yet queried or empty
  }

  // 6. Build Top 3 Focus Actions for Today
  const focusActions = [];

  // Focus 1: Due revisions if any
  if (dueDsaCount > 0) {
    focusActions.push({
      title: `DSA Spaced Revision Due (${dueDsaCount} problem${dueDsaCount > 1 ? "s" : ""})`,
      category: "dsa",
      badge: "Spaced Revision",
      description: "Reinforce optimal time complexity and pattern recognition before memory fades.",
      href: "/dsa",
      btnText: "Review DSA",
    });
  }

  // Focus 2: Today's pending sprint tasks
  if (planAgenda && planAgenda.tasks.length > 0) {
    const pendingTasks = planAgenda.tasks.filter((t) => t.status !== "completed");
    if (pendingTasks.length > 0) {
      const topTask = pendingTasks[0]!;
      focusActions.push({
        title: topTask.title,
        category: topTask.category,
        badge: "Sprint Agenda",
        description: topTask.description || `Estimated ${topTask.estimated_minutes} minutes today.`,
        href: topTask.interview_question_id
          ? `/interview-questions/${topTask.interview_question_id}`
          : topTask.question_id
          ? "/dsa"
          : "/planner",
        btnText: "Open Task",
      });
    }
  }

  // Focus 3: Question bank or in-progress module
  if (inProgressModule) {
    focusActions.push({
      title: `Module ${inProgressModule.module_number}: ${inProgressModule.title}`,
      category: "learning",
      badge: `In Progress (${inProgressModule.completion_percent}%)`,
      description: "Advance your structured Spring Boot cohort roadmap towards 100%.",
      href: "/learning",
      btnText: "Continue Course",
    });
  } else {
    focusActions.push({
      title: "Core Java & Spring Boot Interview Questions",
      category: "interview",
      badge: "Question Bank",
      description: "Practice key technical questions with revealable evaluation rubrics.",
      href: "/interview-questions",
      btnText: "Practice Questions",
    });
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
            Welcome back, {profile.display_name || "Engineer"}
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Personal interview preparation workspace • Target:{" "}
            {profile.target_roles?.slice(0, 2).join(", ") || "SDE"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>Daily Budget:</span>
            <strong className="text-neutral-100 font-mono">{dailyBudget} min</strong>
          </div>
          <Link
            href="/settings"
            className="text-xs text-neutral-400 hover:text-neutral-200 px-2 py-1 rounded hover:bg-neutral-900 transition-colors"
          >
            Settings
          </Link>
        </div>
      </div>

      {/* Today's Focus Action Card (Phase 2 Daily Engine) */}
      <Card className="border-cyan-800/60 bg-gradient-to-r from-neutral-900 via-neutral-900 to-cyan-950/20 text-neutral-100 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              Today&apos;s Priority Focus
            </CardTitle>
            <span className="text-xs text-neutral-400">{todayStr}</span>
          </div>
          <CardDescription className="text-neutral-400 text-xs">
            Direct next actions driven by your active sprint agenda and spaced revisions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {focusActions.slice(0, 3).map((action, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <Badge variant="outline" className="border-neutral-700 text-neutral-300 text-[10px]">
                    {action.badge}
                  </Badge>
                  <h4 className="text-sm font-semibold text-neutral-100 line-clamp-1">
                    {action.title}
                  </h4>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {action.description}
                  </p>
                </div>

                <Link
                  href={action.href}
                  className="inline-flex items-center justify-between text-xs font-medium text-cyan-400 hover:text-cyan-300 pt-1 group"
                >
                  <span>{action.btnText}</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition" />
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grid: 4 Core Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pillar 1: Study Sprint & Daily Workload */}
        <Card className="border-neutral-800 bg-neutral-900/90 text-neutral-100 flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CalendarCheck2 className="h-4 w-4 text-amber-400" />
                Study Sprint & Daily Agenda
              </CardTitle>
              {activePlan ? (
                <Badge variant="outline" className="border-emerald-700 text-emerald-400 text-xs">
                  Day {planStats?.currentDayNumber} of {planStats?.totalDays}
                </Badge>
              ) : (
                <Badge variant="outline" className="border-neutral-700 text-neutral-400 text-xs">
                  Not Started
                </Badge>
              )}
            </div>
            <CardDescription className="text-neutral-400 text-xs">
              Deterministic capacity-aware daily study engine
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {activePlan && planAgenda ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-xs text-neutral-400">Today&apos;s Workload:</span>
                  <span className="font-mono text-sm font-semibold text-neutral-100">
                    {planAgenda.totalPlannedMinutes} min planned / {dailyBudget} min budget
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Sprint Completion:</span>
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    {planStats?.percentCompleted}% ({planStats?.completedTasks}/{planStats?.totalTasks} tasks)
                  </span>
                </div>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${planStats?.percentCompleted || 0}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-400">
                No active sprint. Configure your daily budget and preview all 75 Grind 75 Core problems.
              </p>
            )}

            <div className="pt-2 border-t border-neutral-800 flex justify-end">
              <Link
                href="/planner"
                className="text-xs text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 font-medium"
              >
                {activePlan ? "View Today's Agenda →" : "Configure & Start Sprint →"}
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Pillar 2: DSA Tracker & Grind 75 Core */}
        <Card className="border-neutral-800 bg-neutral-900/90 text-neutral-100 flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Code2 className="h-4 w-4 text-blue-400" />
                DSA Practice & Grind 75
              </CardTitle>
              {dueDsaCount > 0 ? (
                <Badge variant="outline" className="border-rose-700 text-rose-400 text-xs">
                  {dueDsaCount} Due Today
                </Badge>
              ) : (
                <Badge variant="outline" className="border-neutral-700 text-neutral-400 text-xs">
                  Up to Date
                </Badge>
              )}
            </div>
            <CardDescription className="text-neutral-400 text-xs">
              Dedicated Grind 75 Core 75 collection & spaced revisions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg bg-neutral-950 p-2.5 border border-neutral-800">
                <span className="text-[11px] text-neutral-500 block">Grind 75 Solved</span>
                <strong className="text-lg font-bold text-blue-400 font-mono">
                  {grind75Solved} / 75
                </strong>
              </div>
              <div className="rounded-lg bg-neutral-950 p-2.5 border border-neutral-800">
                <span className="text-[11px] text-neutral-500 block">All Tracked Solved</span>
                <strong className="text-lg font-bold text-neutral-200 font-mono">
                  {dsaSolved} / {totalDsaTracked}
                </strong>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Revision intervals: 1 → 3 → 7 → 14 → 30 days based on independent vs hint-assisted mastery.
            </p>

            <div className="pt-2 border-t border-neutral-800 flex justify-end">
              <Link
                href="/dsa"
                className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-medium"
              >
                Open DSA Tracker →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Pillar 3: Technical Interview Question Bank */}
        <Card className="border-neutral-800 bg-neutral-900/90 text-neutral-100 flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-cyan-400" />
                Interview Question Bank
              </CardTitle>
              <Badge variant="outline" className="border-cyan-700/80 text-cyan-400 text-xs">
                376 Questions
              </Badge>
            </div>
            <CardDescription className="text-neutral-400 text-xs">
              Resume-wide coverage across 42 skills and 11 categories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-neutral-950 p-2.5 border border-neutral-800">
                <span className="text-[11px] text-neutral-500 block">Prepared</span>
                <strong className="text-base font-bold text-cyan-400 font-mono">
                  {qbStats.answered}
                </strong>
              </div>
              <div className="rounded-lg bg-neutral-950 p-2.5 border border-neutral-800">
                <span className="text-[11px] text-neutral-500 block">Strong</span>
                <strong className="text-base font-bold text-emerald-400 font-mono">
                  {qbStats.strong}
                </strong>
              </div>
              <div className="rounded-lg bg-neutral-950 p-2.5 border border-neutral-800">
                <span className="text-[11px] text-neutral-500 block">Needs Work</span>
                <strong className="text-base font-bold text-amber-400 font-mono">
                  {qbStats.needsRevision}
                </strong>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Every question includes evaluation rubrics, sample answers, and realistic follow-ups.
            </p>

            <div className="pt-2 border-t border-neutral-800 flex justify-end">
              <Link
                href="/interview-questions"
                className="text-xs text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 font-medium"
              >
                Browse Question Bank →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Pillar 4: Course Learning Modules */}
        <Card className="border-neutral-800 bg-neutral-900/90 text-neutral-100 flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-emerald-400" />
                Course Modules (Spring Boot 0 to 100)
              </CardTitle>
              <Badge variant="outline" className="border-emerald-700/80 text-emerald-400 text-xs font-mono">
                {aggregateProgress.toFixed(2)}%
              </Badge>
            </div>
            <CardDescription className="text-neutral-400 text-xs">
              20 modules • Arithmetic mean calculation across all module percentages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, aggregateProgress)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>{completedCount} of 20 modules completed (100%)</span>
              {inProgressModule && (
                <span className="text-amber-400">
                  Mod {inProgressModule.module_number}: {inProgressModule.completion_percent}%
                </span>
              )}
            </div>

            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Tracked alongside the decoupled Topic Confidence Matrix for interview readiness.
            </p>

            <div className="pt-2 border-t border-neutral-800 flex justify-end">
              <Link
                href="/learning"
                className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-medium"
              >
                Open Learning Roadmap →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Target Role & Career Baseline Snapshot */}
      <Card className="border-neutral-800 bg-neutral-900/70 text-neutral-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-400" />
            Target Role & Switch Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-neutral-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-neutral-500 shrink-0" />
              <span>
                <strong>{profile.current_title || "Associate System Engineer"}</strong> at{" "}
                {profile.current_employer || "Tata Consultancy Services"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-neutral-500">Target LPA:</span>
              <strong className="text-neutral-100">
                {profile.target_salary_min_lpa || 10} - {profile.target_salary_max_lpa || 15} LPA
              </strong>
              <span className="text-neutral-500">•</span>
              <span className="text-neutral-500">Horizon:</span>
              <strong className="text-neutral-100">
                {profile.preparation_horizon_months_min || 3} -{" "}
                {profile.preparation_horizon_months_max || 6} months
              </strong>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
