import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  ExternalLink,
  ArrowLeft,
  Clock,
  Calendar,
  Code2,
  Tag,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getQuestion, type DSAAttemptRow, type DSAQuestionRow } from "@/features/dsa/service";
import { RecordAttemptModal } from "../components/record-attempt-modal";
import { RevisionCardActions } from "./revision-card-actions";
import { QuestionNotesForm } from "./question-notes-form";

function DifficultyBadge({ difficulty }: { difficulty: DSAQuestionRow["difficulty"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        difficulty === "easy" && "bg-green-400/10 text-green-400",
        difficulty === "medium" && "bg-yellow-400/10 text-yellow-400",
        difficulty === "hard" && "bg-red-400/10 text-red-400"
      )}
    >
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </span>
  );
}

function StatusBadge({ status }: { status: DSAQuestionRow["status"] }) {
  const labels: Record<DSAQuestionRow["status"], string> = {
    not_started: "Not Started",
    attempted: "Attempted",
    solved: "Solved",
    needs_revision: "Needs Revision",
    archived: "Archived",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === "not_started" && "bg-neutral-800 text-neutral-400",
        status === "attempted" && "bg-blue-400/10 text-blue-400",
        status === "solved" && "bg-green-400/10 text-green-400",
        status === "needs_revision" && "bg-orange-400/10 text-orange-400",
        status === "archived" && "bg-neutral-800 text-neutral-500"
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}

function OutcomeBadge({ outcome }: { outcome: DSAAttemptRow["outcome"] }) {
  const config: Record<DSAAttemptRow["outcome"], { label: string; classes: string }> = {
    solved_independently: { label: "Solved ✓", classes: "bg-green-400/10 text-green-400" },
    solved_with_hint: { label: "Solved w/ Hint", classes: "bg-yellow-400/10 text-yellow-400" },
    unable_to_solve: { label: "Unable to Solve", classes: "bg-red-400/10 text-red-400" },
    revisited: { label: "Revisited", classes: "bg-blue-400/10 text-blue-400" },
  };
  const item = config[outcome] ?? { label: outcome, classes: "bg-neutral-700 text-neutral-300" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", item.classes)}>
      {item.label}
    </span>
  );
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function DSADetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { id } = await params;

  const { question, attempts, revisions } = await getQuestion(supabase, user.id, id);

  if (!question) notFound();

  const pendingRevision = revisions.find((r) => r.status === "pending");
  const today = new Date().toISOString().slice(0, 10);
  const revisionDue = pendingRevision && pendingRevision.scheduled_for <= today;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back nav */}
      <Link
        href="/dsa"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to DSA Practice
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-neutral-800 pb-5">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-100 mr-1">{question.title}</h1>
            <DifficultyBadge difficulty={question.difficulty} />
            <StatusBadge status={question.status} />
            {question.collection_order && (
              <Badge variant="outline" className="border-blue-700/50 text-blue-400 text-xs">
                Grind 75 #{question.collection_order}
              </Badge>
            )}
          </div>
          {question.url && (
            <a
              href={question.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View on LeetCode
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <RecordAttemptModal questionId={question.id} questionTitle={question.title} />
        </div>
      </div>

      {/* Revision Due Banner */}
      {revisionDue && pendingRevision && (
        <div className="rounded-lg border border-orange-800/60 bg-orange-950/30 px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-orange-300">
              <Clock className="h-4 w-4 text-orange-400 shrink-0" />
              <div>
                <span className="font-medium">Due for revision</span>
                <span className="ml-2 text-sm text-orange-400/70">
                  ({pendingRevision.interval_days}-day interval)
                </span>
                <div className="text-xs text-orange-400/60 mt-0.5">
                  Scheduled for: {formatDate(pendingRevision.scheduled_for)}
                </div>
              </div>
            </div>
            <RevisionCardActions revision={pendingRevision} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column: Metadata + Notes */}
        <div className="lg:col-span-2 space-y-5">
          {/* Metadata */}
          <Card className="border-neutral-800 bg-neutral-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
                <FileText className="h-4 w-4 text-neutral-500" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {(question.patterns ?? []).length > 0 && (
                <div className="flex items-start gap-3">
                  <Tag className="h-4 w-4 text-neutral-500 mt-0.5 shrink-0" />
                  <div className="flex flex-wrap gap-1.5">
                    {question.patterns.map((t) => (
                      <Badge
                        key={t}
                        variant="outline"
                        className="text-xs border-neutral-700 text-neutral-300"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-xs text-neutral-400 pt-1 border-t border-neutral-800">
                <div>
                  <span className="text-neutral-500 block mb-0.5">Source</span>
                  <span className="text-neutral-300">{question.source ?? "Personal"}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block mb-0.5">Added</span>
                  <span className="text-neutral-300">{formatDate(question.created_at)}</span>
                </div>
                {question.optimal_time_complexity && (
                  <div>
                    <span className="text-neutral-500 block mb-0.5">Optimal Time</span>
                    <span className="text-neutral-300 font-mono">
                      {question.optimal_time_complexity}
                    </span>
                  </div>
                )}
                {question.optimal_space_complexity && (
                  <div>
                    <span className="text-neutral-500 block mb-0.5">Optimal Space</span>
                    <span className="text-neutral-300 font-mono">
                      {question.optimal_space_complexity}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-neutral-800 bg-neutral-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
                <FileText className="h-4 w-4 text-neutral-500" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionNotesForm questionId={question.id} initialNotes={question.notes} />
            </CardContent>
          </Card>

          {/* Attempt History */}
          <Card className="border-neutral-800 bg-neutral-900">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-neutral-500" />
                  Attempt History
                </CardTitle>
                <span className="text-xs text-neutral-500">{attempts.length} total</span>
              </div>
            </CardHeader>
            <CardContent>
              {attempts.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-6">
                  No attempts yet. Log your first attempt to start tracking revisions.
                </p>
              ) : (
                <div className="space-y-3">
                  {attempts.map((attempt, idx) => (
                    <div
                      key={attempt.id}
                      className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-500 font-mono">
                            #{attempts.length - idx}
                          </span>
                          <OutcomeBadge outcome={attempt.outcome} />
                          {attempt.hint_used && (
                            <span className="text-xs text-yellow-500/80 italic">hint used</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-neutral-500">
                          {attempt.code_language && (
                            <span className="font-mono">{attempt.code_language}</span>
                          )}
                          {attempt.duration_minutes && (
                            <span>{attempt.duration_minutes} min</span>
                          )}
                          <span>{formatDateTime(attempt.attempted_at)}</span>
                        </div>
                      </div>

                      {(attempt.time_complexity || attempt.space_complexity) && (
                        <div className="flex gap-4 text-xs text-neutral-400">
                          {attempt.time_complexity && (
                            <span>
                              Time:{" "}
                              <span className="font-mono text-neutral-300">
                                {attempt.time_complexity}
                              </span>
                            </span>
                          )}
                          {attempt.space_complexity && (
                            <span>
                              Space:{" "}
                              <span className="font-mono text-neutral-300">
                                {attempt.space_complexity}
                              </span>
                            </span>
                          )}
                        </div>
                      )}

                      {attempt.approach_notes && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-neutral-500 hover:text-neutral-300">
                            Approach Notes
                          </summary>
                          <p className="mt-1.5 text-neutral-400 pl-2 border-l border-neutral-700 whitespace-pre-wrap">
                            {attempt.approach_notes}
                          </p>
                        </details>
                      )}

                      {attempt.mistake_notes && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-orange-500/70 hover:text-orange-400">
                            Mistake Notes
                          </summary>
                          <p className="mt-1.5 text-orange-400/70 pl-2 border-l border-orange-800/40 whitespace-pre-wrap">
                            {attempt.mistake_notes}
                          </p>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Revision card */}
        <div className="space-y-5">
          <Card className="border-neutral-800 bg-neutral-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-neutral-500" />
                Spaced Revision
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-lg bg-neutral-950/60 border border-neutral-800 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Pending Revision</span>
                  <span className="text-xs font-mono text-neutral-300">
                    {pendingRevision
                      ? `${pendingRevision.interval_days}-day interval`
                      : "None"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Scheduled For</span>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      revisionDue ? "text-orange-400" : "text-neutral-300"
                    )}
                  >
                    {pendingRevision
                      ? formatDate(pendingRevision.scheduled_for)
                      : "—"}
                  </span>
                </div>
              </div>

              {pendingRevision && (
                <div className="pt-2 border-t border-neutral-800">
                  <RevisionCardActions revision={pendingRevision} />
                </div>
              )}

              <div className="text-xs text-neutral-500 space-y-1">
                <p className="font-medium text-neutral-400">Revision Intervals (Independent)</p>
                {[1, 3, 7, 14, 30].map((d) => {
                  const currentActive = pendingRevision?.interval_days === d;
                  return (
                    <div
                      key={d}
                      className={cn(
                        "flex items-center gap-1.5",
                        currentActive ? "text-blue-400 font-medium" : "text-neutral-500"
                      )}
                    >
                      <div
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          currentActive ? "bg-blue-400" : "bg-neutral-700"
                        )}
                      />
                      {d === 1 ? "1 day" : d === 30 ? "30 days (mastered)" : `${d} days`}
                    </div>
                  );
                })}
              </div>

              <div className="text-xs text-neutral-500 pt-2 border-t border-neutral-800">
                Hint-assisted solves follow shorter intervals [1, 1, 3, 7, 14] and require independent solving to master.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
