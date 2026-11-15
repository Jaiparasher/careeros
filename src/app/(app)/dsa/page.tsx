import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import {
  Code2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ListChecks,
  Layers,
} from "lucide-react";
import { DSATable } from "./components/dsa-table";
import { RevisionBanner } from "./components/revision-banner";
import { DSAHeaderActions } from "./components/dsa-header-actions";
import {
  getDSAStats,
  getQuestions,
  getDueRevisions,
  type GetQuestionsOptions,
} from "@/features/dsa/service";

interface SearchParams {
  tab?: string;
  status?: string;
  difficulty?: string;
  pattern?: string;
  page?: string;
  q?: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  highlight?: "green" | "orange" | "blue" | "red";
}) {
  const colorMap = {
    green: "text-green-400",
    orange: "text-orange-400",
    blue: "text-blue-400",
    red: "text-red-400",
  };
  const valueClass = highlight ? colorMap[highlight] : "text-neutral-100";

  return (
    <Card className="border-neutral-800 bg-neutral-900 flex flex-col items-center justify-center p-4 text-center gap-1">
      <Icon className="h-4 w-4 text-neutral-500 mb-1" />
      <span className={`text-2xl font-bold font-mono ${valueClass}`}>{value}</span>
      <span className="text-xs text-neutral-500">{label}</span>
    </Card>
  );
}

export default async function DSAPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const sp = await searchParams;
  const tab = sp.tab ?? "all";
  const page = Number(sp.page ?? 1);
  const difficulty = sp.difficulty;
  const status = sp.status;
  const pattern = sp.pattern;
  const search = sp.q;

  const today = new Date().toISOString().slice(0, 10);

  const queryOpts: GetQuestionsOptions = {
    page,
    pageSize: 25,
    difficulty: difficulty || undefined,
    status: status || undefined,
    pattern: pattern || undefined,
    search: search || undefined,
    collection: tab === "grind75" ? "grind75" : undefined,
  };

  const [stats, questionsResult, dueRevisions] = await Promise.all([
    getDSAStats(supabase, user.id).catch(() => ({
      total: 0,
      not_started: 0,
      attempted: 0,
      solved: 0,
      needs_revision: 0,
      grind75_linked: 0,
      grind75_solved: 0,
      overdue_revisions: 0,
    })),
    getQuestions(supabase, user.id, queryOpts).catch(() => ({
      data: [],
      count: 0,
    })),
    getDueRevisions(supabase, user.id, today).catch(() => []),
  ]);

  const tabs = [
    { key: "all", label: "All Questions" },
    { key: "grind75", label: "Grind 75" },
    { key: "due", label: "Due Today" },
  ];

  function tabHref(key: string) {
    const params = new URLSearchParams();
    params.set("tab", key);
    return `/dsa?${params.toString()}`;
  }

  // If "due" tab is selected, we map the questions from dueRevisions
  let displayQuestions = questionsResult.data;
  let displayTotal = questionsResult.count;

  if (tab === "due") {
    // Show due revision items mapped to question structure
    displayQuestions = dueRevisions.map((r) => ({
      id: r.question.id,
      user_id: user.id,
      title: r.question.title,
      normalized_url: null,
      url: null,
      difficulty: r.question.difficulty,
      patterns: r.question.patterns,
      source: null,
      status: "needs_revision" as const,
      notes: null,
      optimal_time_complexity: null,
      optimal_space_complexity: null,
      archived_at: null,
      collection_tags: [],
      collection_order: null,
      external_problem_slug: null,
      source_snapshot_date: null,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
    displayTotal = dueRevisions.length;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100 flex items-center gap-2">
            <Code2 className="h-6 w-6 text-blue-400" />
            DSA Practice
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Track attempts, spaced revisions, and Grind 75 Core 75 progress.
          </p>
        </div>

        {/* Action buttons (Add, Sync Grind 75, Import CSV, Export CSV) */}
        <DSAHeaderActions />
      </div>

      {/* Revision Banner */}
      {(dueRevisions.length > 0 || stats.overdue_revisions > 0) && (
        <RevisionBanner
          dueCount={dueRevisions.length}
          overdueCount={stats.overdue_revisions}
        />
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard icon={Layers} label="Total Questions" value={stats.total} />
        <StatCard icon={CheckCircle2} label="Solved" value={stats.solved} highlight="green" />
        <StatCard
          icon={AlertCircle}
          label="Needs Revision"
          value={stats.needs_revision}
          highlight="orange"
        />
        <StatCard icon={Clock} label="Due Today" value={dueRevisions.length} highlight="blue" />
        <StatCard
          icon={ListChecks}
          label="Grind 75"
          value={`${stats.grind75_solved}/${stats.grind75_linked || 75}`}
          highlight="blue"
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-neutral-800">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={tabHref(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              tab === t.key
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            {t.label}
            {t.key === "due" && dueRevisions.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-orange-500/20 text-orange-400 text-xs px-1.5 py-0.5 font-mono">
                {dueRevisions.length}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Filter Row */}
      <form method="GET" action="/dsa" className="flex flex-wrap gap-2 items-center">
        <input type="hidden" name="tab" value={tab} />
        <input
          name="q"
          defaultValue={search}
          placeholder="Search questions..."
          className="flex-1 min-w-48 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-blue-600 focus:outline-none"
        />
        <select
          name="difficulty"
          defaultValue={difficulty ?? ""}
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-300 focus:border-blue-600 focus:outline-none"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-300 focus:border-blue-600 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="not_started">Not Started</option>
          <option value="attempted">Attempted</option>
          <option value="solved">Solved</option>
          <option value="needs_revision">Needs Revision</option>
        </select>
        <input
          name="pattern"
          defaultValue={pattern}
          placeholder="Topic/Pattern..."
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-blue-600 focus:outline-none w-36"
        />
        <button
          type="submit"
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 transition-colors"
        >
          Filter
        </button>
        <Link
          href={`/dsa?tab=${tab}`}
          className="text-xs text-neutral-500 hover:text-neutral-300 px-2 py-2"
        >
          Reset
        </Link>
      </form>

      {/* Question Table */}
      <Suspense
        fallback={
          <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-12 text-center text-neutral-500">
            Loading questions...
          </div>
        }
      >
        <DSATable questions={displayQuestions} total={displayTotal} page={page} />
      </Suspense>
    </div>
  );
}
