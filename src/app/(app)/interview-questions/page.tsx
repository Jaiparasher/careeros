import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import {
  seedQuestionBankIfEmpty,
  getQuestions,
  getQuestionBankStats,
} from "@/features/interview/service";
import { SkillCoverageMap } from "./components/skill-coverage-map";
import { QuestionList } from "./components/question-list";

interface InterviewQuestionsPageProps {
  searchParams: Promise<{
    category?: string;
    skill?: string;
    topic?: string;
    difficulty?: "basic" | "intermediate" | "advanced";
    priority?: "critical" | "high" | "medium" | "low";
    status?: "not_started" | "learning" | "attempted" | "answered" | "needs_revision" | "strong";
    search?: string;
    mode?: "skill" | "topic";
    page?: string;
    pageSize?: string;
  }>;
}

export default async function InterviewQuestionsPage({
  searchParams,
}: InterviewQuestionsPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Idempotently ensure the 376 question bank items exist for this user
  await seedQuestionBankIfEmpty(supabase, user.id);

  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const pageSize = parseInt(params.pageSize || "15", 10);

  const stats = await getQuestionBankStats(supabase, user.id);

  const { questions, totalCount } = await getQuestions(supabase, user.id, {
    category: params.category,
    skill: params.skill,
    topic: params.topic,
    difficulty: params.difficulty,
    priority: params.priority,
    status: params.status,
    search: params.search,
    mode: params.mode || "skill",
    page,
    pageSize,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100 flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-cyan-400" />
              Interview Question Bank
            </h1>
            <Badge variant="outline" className="border-cyan-700/80 text-cyan-300 text-xs">
              Phase 2
            </Badge>
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            Curated technical interview question bank covering all 42 resume skills across 11 categories.
          </p>
        </div>

        {/* Quick summary stats pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 flex items-center gap-1.5">
            <span className="text-neutral-500">Bank:</span>
            <strong className="text-neutral-100 font-mono">{stats.total}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-neutral-500">Prepared:</span>
            <strong className="text-emerald-400 font-mono">{stats.answered}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-neutral-500">Strong:</span>
            <strong className="text-amber-400 font-mono">{stats.strong}</strong>
          </div>
          {stats.needsRevision > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
              <span className="text-neutral-500">Revision Due:</span>
              <strong className="text-rose-400 font-mono">{stats.needsRevision}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Skill Taxonomy & Readiness Coverage Matrix */}
      <SkillCoverageMap categoryStats={stats.categoryStats} />

      {/* Question List and Filters */}
      <QuestionList
        questions={questions}
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
      />
    </div>
  );
}
