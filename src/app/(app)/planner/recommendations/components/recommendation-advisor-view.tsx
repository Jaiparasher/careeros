"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  X,
  Target,
  Layers,
  Code2,
  BookOpen,
  CalendarCheck2,
  Check,
  Info,
  Sliders,
} from "lucide-react";
import type {
  StudyRecommendation,
  RecommendationSessionResult,
} from "@/features/planner/recommendation-schema";
import {
  generateStudyRecommendationsAction,
  acceptStudyRecommendationAction,
  acceptAllStudyRecommendationsAction,
} from "@/features/planner/recommendation-actions";

interface RecommendationAdvisorViewProps {
  initialResult?: RecommendationSessionResult | null;
  dailyAvailableMinutes: number;
  currentPlannedMinutes: number;
  targetRoles: string[];
}

export function RecommendationAdvisorView({
  initialResult,
  dailyAvailableMinutes: initialDaily,
  currentPlannedMinutes: initialPlanned,
  targetRoles: initialRoles,
}: RecommendationAdvisorViewProps) {
  const router = useRouter();
  const [isGenerating, startGenerateTransition] = useTransition();
  const [isAccepting, startAcceptTransition] = useTransition();

  const [sessionResult, setSessionResult] = useState<RecommendationSessionResult | null>(
    initialResult || null
  );
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>(
    initialResult?.recommendations || []
  );
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const dailyMinutes = sessionResult?.dailyAvailableMinutes ?? initialDaily;
  const currentPlanned = sessionResult?.currentPlannedMinutes ?? initialPlanned;

  // Active (not dismissed) recommendations
  const activeRecommendations = recommendations.filter((r) => !dismissedIds.has(r.id));
  const pendingRecommendations = activeRecommendations.filter((r) => !acceptedIds.has(r.id));

  // Calculate capacity impact of pending items
  const newlyAcceptedMinutes = activeRecommendations
    .filter((r) => acceptedIds.has(r.id))
    .reduce((sum, r) => sum + r.estimatedMinutes, 0);

  const pendingMinutes = pendingRecommendations.reduce((sum, r) => sum + r.estimatedMinutes, 0);
  const totalProjectedMinutes = currentPlanned + newlyAcceptedMinutes + pendingMinutes;

  function handleGenerate() {
    setError(null);
    setSuccessMessage(null);
    startGenerateTransition(async () => {
      const res = await generateStudyRecommendationsAction();
      if (res.success) {
        setSessionResult(res.data);
        setRecommendations(res.data.recommendations);
        setAcceptedIds(new Set());
        setDismissedIds(new Set());
      } else {
        setError(res.error || "Failed to generate study recommendations.");
      }
    });
  }

  function handleAcceptSingle(rec: StudyRecommendation) {
    if (acceptedIds.has(rec.id) || isAccepting) return;
    setError(null);
    setSuccessMessage(null);

    startAcceptTransition(async () => {
      const res = await acceptStudyRecommendationAction({
        candidateId: rec.candidateId,
        type: rec.type,
        title: rec.title,
        category: rec.category,
        entityId: rec.entityId,
        priority: rec.priority === "high" ? "high" : rec.priority === "low" ? "low" : "normal",
        estimatedMinutes: rec.estimatedMinutes,
        reason: rec.reason,
        expectedOutcome: rec.expectedOutcome,
        idempotencyKey: `rec:${rec.type}:${rec.entityId || rec.title}:${new Date().toISOString().slice(0, 10)}`,
      });

      if (res.success) {
        setAcceptedIds((prev) => new Set([...prev, rec.id]));
        setSuccessMessage(`Added "${rec.title}" to today's study plan.`);
        router.refresh();
      } else {
        setError(res.error || "Failed to accept recommendation.");
      }
    });
  }

  function handleDismiss(recId: string) {
    setDismissedIds((prev) => new Set([...prev, recId]));
  }

  function handleAcceptAllPending() {
    if (pendingRecommendations.length === 0 || isAccepting) return;
    setError(null);
    setSuccessMessage(null);

    startAcceptTransition(async () => {
      const payload = pendingRecommendations.map((r) => ({
        candidateId: r.candidateId,
        type: r.type,
        title: r.title,
        category: r.category,
        entityId: r.entityId,
        priority: (r.priority === "high" ? "high" : r.priority === "low" ? "low" : "normal") as "high" | "low" | "normal",
        estimatedMinutes: r.estimatedMinutes,
        reason: r.reason,
        expectedOutcome: r.expectedOutcome,
        idempotencyKey: `rec:${r.type}:${r.entityId || r.title}:${new Date().toISOString().slice(0, 10)}`,
      }));

      const res = await acceptAllStudyRecommendationsAction({ recommendations: payload });

      if (res.success) {
        setAcceptedIds((prev) => new Set([...prev, ...pendingRecommendations.map((r) => r.id)]));
        setSuccessMessage(`Successfully scheduled ${res.data.length} recommendations into today's agenda.`);
        router.refresh();
      } else {
        setError(res.error || "Failed to accept recommendations.");
      }
    });
  }

  function getTypeIcon(type: StudyRecommendation["type"]) {
    switch (type) {
      case "dsa_revision":
        return <Code2 className="h-4 w-4 text-amber-400" />;
      case "weak_topic":
        return <Target className="h-4 w-4 text-rose-400" />;
      case "incomplete_module":
        return <Layers className="h-4 w-4 text-blue-400" />;
      case "interview_question":
        return <BookOpen className="h-4 w-4 text-emerald-400" />;
    }
  }

  function getTypeBadge(type: StudyRecommendation["type"]) {
    switch (type) {
      case "dsa_revision":
        return <Badge className="bg-amber-950/70 border-amber-800 text-amber-300 text-[10px]">DSA Revision</Badge>;
      case "weak_topic":
        return <Badge className="bg-rose-950/70 border-rose-800 text-rose-300 text-[10px]">Concept Gap</Badge>;
      case "incomplete_module":
        return <Badge className="bg-blue-950/70 border-blue-800 text-blue-300 text-[10px]">Course Progress</Badge>;
      case "interview_question":
        return <Badge className="bg-emerald-950/70 border-emerald-800 text-emerald-300 text-[10px]">Interview Defense</Badge>;
    }
  }

  function getPriorityBadge(priority: StudyRecommendation["priority"]) {
    switch (priority) {
      case "high":
        return <Badge variant="outline" className="border-rose-700/80 text-rose-400 text-[10px]">High Priority</Badge>;
      case "medium":
        return <Badge variant="outline" className="border-amber-700/80 text-amber-400 text-[10px]">Medium Priority</Badge>;
      case "low":
        return <Badge variant="outline" className="border-neutral-700 text-neutral-400 text-[10px]">Low Priority</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      {/* Capacity & Control Header Card */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-200 text-base">Adaptive Study Advisor</span>
              <Badge variant="outline" className="border-amber-700/80 text-amber-300 text-[10px]">
                Deterministic Capacity
              </Badge>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Target Roles: <strong className="text-neutral-200">{(sessionResult?.targetRoles || initialRoles).join(", ")}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs gap-1.5 h-8 px-3"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Analyzing Learning Gaps...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  {sessionResult ? "Refresh Advisor" : "Generate Recommendations"}
                </>
              )}
            </Button>

            <Link
              href="/planner"
              className="text-xs text-neutral-400 hover:text-neutral-200 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition"
            >
              Back to Agenda
            </Link>
          </div>
        </div>

        {/* Capacity Preview Meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-neutral-500" />
              Daily Study Capacity Impact:
            </span>
            <span className="font-mono text-neutral-300">
              {currentPlanned + newlyAcceptedMinutes}m planned
              {pendingMinutes > 0 && (
                <span className="text-amber-400 font-semibold"> + {pendingMinutes}m recommended</span>
              )}{" "}
              / {dailyMinutes}m budget
            </span>
          </div>

          {/* Dual-tone Progress Bar */}
          <div className="w-full h-2 rounded-full bg-neutral-950 overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{
                width: `${Math.min(100, ((currentPlanned + newlyAcceptedMinutes) / dailyMinutes) * 100)}%`,
              }}
              title="Currently Planned Tasks"
            />
            {pendingMinutes > 0 && (
              <div
                className={`h-full transition-all duration-300 ${
                  totalProjectedMinutes > dailyMinutes ? "bg-rose-500" : "bg-amber-500/80"
                }`}
                style={{
                  width: `${Math.min(
                    100 - Math.min(100, ((currentPlanned + newlyAcceptedMinutes) / dailyMinutes) * 100),
                    (pendingMinutes / dailyMinutes) * 100
                  )}%`,
                }}
                title="Projected Recommended Tasks"
              />
            )}
          </div>

          {totalProjectedMinutes > dailyMinutes && (
            <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              Accepting all recommendations would exceed your {dailyMinutes} min daily budget by {totalProjectedMinutes - dailyMinutes} mins.
            </p>
          )}
        </div>
      </div>

      {/* Deterministic Fallback Notice */}
      {sessionResult?.generationSource === "deterministic_fallback" && (
        <div className="rounded-lg border border-amber-800/80 bg-amber-950/30 p-3.5 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Info className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">Deterministic Fallback Active</p>
              <p className="text-amber-200/80 text-[11px] mt-0.5">
                AI advisor was temporarily unavailable ({sessionResult.fallbackReason || "connection issue"}). Showing your priority study actions deterministically based on spaced repetition urgency and syllabus gaps.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="border-amber-700/80 text-amber-300 hover:bg-amber-900/50 text-[11px] h-7 shrink-0 gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${isGenerating ? "animate-spin" : ""}`} />
            Retry AI Analysis
          </Button>
        </div>
      )}

      {/* Notifications */}
      {error && (
        <div className="rounded-lg border border-rose-800/80 bg-rose-950/40 p-3.5 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-emerald-800/80 bg-emerald-950/40 p-3.5 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <Link
            href="/planner"
            className="text-[11px] underline text-emerald-200 hover:text-white flex items-center gap-1"
          >
            View on Agenda <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Recommendations Cards Header */}
      {activeRecommendations.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {sessionResult?.generationSource === "deterministic_fallback" ? (
              <Sliders className="h-4 w-4 text-neutral-400" />
            ) : (
              <Sparkles className="h-4 w-4 text-amber-400" />
            )}
            <h2 className="text-sm font-semibold text-neutral-200">
              {sessionResult?.advisorHeadline || "Top Recommended Actions"}
            </h2>
            <Badge
              variant="outline"
              className={`text-[10px] ${
                sessionResult?.generationSource === "deterministic_fallback"
                  ? "text-neutral-400 border-neutral-700"
                  : "text-amber-300 border-amber-700/80"
              }`}
            >
              {sessionResult?.generationSource === "deterministic_fallback"
                ? "Deterministic Priority Plan"
                : "AI-Ranked Plan"}
            </Badge>
            <Badge variant="outline" className="text-[10px] text-neutral-400 border-neutral-700">
              {pendingRecommendations.length} pending
            </Badge>
          </div>

          {pendingRecommendations.length > 1 && (
            <Button
              onClick={handleAcceptAllPending}
              disabled={isAccepting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 h-8 px-3"
            >
              {isAccepting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Accept All Pending ({pendingRecommendations.length})
            </Button>
          )}
        </div>
      )}

      {/* Recommendation Cards List */}
      {activeRecommendations.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {activeRecommendations.map((rec) => {
            const isAccepted = acceptedIds.has(rec.id);

            return (
              <div
                key={rec.id}
                className={`rounded-xl border p-5 transition-all space-y-4 ${
                  isAccepted
                    ? "border-emerald-800/60 bg-emerald-950/20 opacity-90"
                    : "border-neutral-800 bg-neutral-900/90 hover:border-neutral-700"
                }`}
              >
                {/* Top Row: Type, Title, Priority, Duration */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        {getTypeIcon(rec.type)}
                        {getTypeBadge(rec.type)}
                      </div>
                      {getPriorityBadge(rec.priority)}
                      {rec.source === "deterministic_fallback" && (
                        <Badge variant="outline" className="text-[10px] text-neutral-400 border-neutral-800 bg-neutral-950/50">
                          Deterministic
                        </Badge>
                      )}
                      <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-neutral-500" />
                        {rec.estimatedMinutes} mins
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
                      {rec.title}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {isAccepted ? (
                      <Badge className="bg-emerald-900/80 border-emerald-700 text-emerald-300 text-xs py-1 px-2.5 gap-1">
                        <Check className="h-3.5 w-3.5" /> Scheduled
                      </Badge>
                    ) : (
                      <>
                        <Button
                          onClick={() => handleAcceptSingle(rec)}
                          disabled={isAccepting}
                          className="bg-amber-600 hover:bg-amber-500 text-white text-xs h-8 px-3 gap-1.5"
                        >
                          {isAccepting ? <Loader2 className="h-3 w-3 animate-spin" /> : <CalendarCheck2 className="h-3.5 w-3.5" />}
                          Accept & Schedule
                        </Button>

                        <button
                          onClick={() => handleDismiss(rec.id)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-300 rounded-lg hover:bg-neutral-800 transition"
                          title="Dismiss recommendation"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Details Grid: Why this matters & Expected Outcome */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-neutral-800/80">
                  <div className="rounded-lg bg-neutral-950 p-3 space-y-1 border border-neutral-850">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-400/90 block">
                      Why This Matters Today
                    </span>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {rec.reason}
                    </p>
                  </div>

                  <div className="rounded-lg bg-neutral-950 p-3 space-y-1 border border-neutral-850">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400/90 block">
                      Expected Readiness Milestone
                    </span>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {rec.expectedOutcome}
                    </p>
                  </div>
                </div>

                {/* Context Tag / Footnote */}
                {rec.context && (
                  <p className="text-[11px] text-neutral-500 italic">
                    Source evidence: {rec.context}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        !isGenerating && (
          <div className="rounded-xl border border-dashed border-neutral-800 p-12 text-center space-y-3">
            <div className="mx-auto w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400">
              <Sparkles className="h-5 w-5 text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-200">
              {sessionResult ? "No Eligible Action Gaps Found" : "No Recommendations Generated Yet"}
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
              {sessionResult
                ? "All your scheduled DSA revisions, learning modules, and interview preparation items are currently up to date. You can review your daily agenda or solve fresh problems."
                : "Click \"Generate Recommendations\" above to analyze your overdue DSA revisions, weak topics, and incomplete learning modules against your daily study capacity."}
            </p>
            {!sessionResult && (
              <div className="pt-2">
                <Button
                  onClick={handleGenerate}
                  className="bg-amber-600 hover:bg-amber-500 text-white text-xs gap-1.5 h-8 px-4"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Analyze Study Gaps Now
                </Button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
