"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowRight,
  BookmarkPlus,
  BookOpen,
  Briefcase,
  Layers,
  Link2,
  Loader2,
  RotateCw,
  Target,
  ExternalLink,
} from "lucide-react";
import {
  type AiResumeJdAnalysisReport,
  type TargetedInterviewQuestion,
} from "@/features/resumes/ai-analyzer-schema";
import {
  connectAnalysisToApplicationAction,
  saveGeneratedQuestionToBankAction,
} from "@/features/resumes/ai-actions";

interface ApplicationOption {
  id: string;
  company_name: string;
  role_title: string;
}

interface AiAnalysisReportProps {
  report: AiResumeJdAnalysisReport;
  applications: ApplicationOption[];
  onRerun?: () => void;
}

export function AiAnalysisReport({
  report,
  applications,
  onRerun,
}: AiAnalysisReportProps) {
  const [selectedAppId, setSelectedAppId] = useState<string>(
    report.applicationId || ""
  );
  const [isLinking, startLinkTransition] = useTransition();
  const [linkSuccess, setLinkSuccess] = useState<boolean>(false);
  const [savedQuestionIds, setSavedQuestionIds] = useState<Set<string>>(
    new Set(
      report.targetedInterviewQuestions
        .filter((q) => q.isSaved)
        .map((q) => q.id)
    )
  );
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);

  const readinessColor = {
    "Strong Match": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "Moderate Match": "bg-sky-500/10 text-sky-400 border-sky-500/20",
    "Growth Match": "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "Low Match": "bg-rose-500/10 text-rose-400 border-rose-500/20",
  }[report.readinessLevel] || "bg-neutral-800 text-neutral-300 border-neutral-700";

  function handleConnectApp(appId: string) {
    setSelectedAppId(appId);
    if (!report.id) return;
    startLinkTransition(async () => {
      const res = await connectAnalysisToApplicationAction(
        report.id!,
        appId || null
      );
      if (res.success) {
        setLinkSuccess(true);
        setTimeout(() => setLinkSuccess(false), 3000);
      }
    });
  }

  async function handleSaveQuestionToBank(q: TargetedInterviewQuestion) {
    if (!report.id || savedQuestionIds.has(q.id)) return;
    setSavingQuestionId(q.id);
    try {
      const res = await saveGeneratedQuestionToBankAction(q);
      if (res.success) {
        setSavedQuestionIds((prev) => new Set(prev).add(q.id));
      }
    } finally {
      setSavingQuestionId(null);
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header & Qualitative Match Assessment Banner */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-6 backdrop-blur space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                {report.company} • {report.roleTitle}
              </span>
              {report.targetRole && (
                <Badge variant="outline" className="text-[10px] border-neutral-800 text-neutral-400">
                  {report.targetRole}
                </Badge>
              )}
            </div>
            <h2 className="text-xl font-bold text-neutral-100">{report.headline}</h2>
            <p className="text-xs text-neutral-400">
              Evaluated against Resume Version:{" "}
              <span className="text-neutral-200 font-medium">{report.resumeVersion}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge className={`text-sm px-3 py-1 font-semibold border ${readinessColor}`}>
              {report.readinessLevel}
            </Badge>

            {onRerun && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRerun}
                className="border-neutral-700 text-neutral-300 hover:text-neutral-100"
              >
                <RotateCw className="h-3.5 w-3.5 mr-1.5" />
                Rerun
              </Button>
            )}
          </div>
        </div>

        {/* Executive Summary */}
        <p className="text-sm text-neutral-300 leading-relaxed bg-neutral-950/50 p-4 rounded-lg border border-neutral-800/80">
          {report.executiveSummary}
        </p>

        {/* Quick Highlights: Strengths vs Gaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="rounded-lg border border-emerald-900/30 bg-emerald-950/10 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Core Strengths &amp; Validated Assets</span>
            </div>
            <ul className="text-xs text-neutral-300 space-y-1 list-disc list-inside">
              {report.keyStrengthsSummary.map((s, idx) => (
                <li key={idx} className="leading-relaxed">{s}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-amber-900/30 bg-amber-950/10 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <span>Critical Gaps &amp; Target Areas</span>
            </div>
            <ul className="text-xs text-neutral-300 space-y-1 list-disc list-inside">
              {report.criticalGapsSummary.map((g, idx) => (
                <li key={idx} className="leading-relaxed">{g}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Connect to Job Application Bar */}
        <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Link2 className="h-3.5 w-3.5 text-neutral-500" />
            <span>Connect this analysis to an active job application:</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedAppId}
              onChange={(e) => handleConnectApp(e.target.value)}
              disabled={isLinking}
              aria-label="Connect analysis to job application"
              className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-md px-3 py-1.5 focus:outline-none focus:border-neutral-600"
            >
              <option value="">-- Standalone (No Linked Application) --</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.company_name} — {app.role_title}
                </option>
              ))}
            </select>
            {isLinking && <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />}
            {linkSuccess && (
              <span className="text-[11px] text-emerald-400 font-medium">Linked!</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Technical Skills Breakdown (Demonstrated vs Mentioned vs Missing vs Partial) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-400" />
          <h3 className="text-base font-bold text-neutral-100">
            Technical Skill Alignment Breakdown
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Demonstrated Skills */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Demonstrated in Experience ({report.matchingSkills.length})
              </span>
              <span className="text-[10px] text-neutral-500">Evidence verified in bullets</span>
            </div>
            {report.matchingSkills.length === 0 ? (
              <p className="text-xs text-neutral-500 italic">No explicit matching skills found.</p>
            ) : (
              <div className="space-y-2">
                {report.matchingSkills.map((s, idx) => (
                  <div key={idx} className="rounded-lg bg-neutral-950 p-2.5 border border-neutral-800/60 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-neutral-200">{s.name}</span>
                      <Badge variant="outline" className="text-[10px] border-emerald-900/40 text-emerald-400 py-0">
                        {s.category}
                      </Badge>
                    </div>
                    <p className="text-neutral-400 text-[11px]">{s.evidenceFromResume}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mentioned but Not Demonstrated */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5" />
                Mentioned, Not Demonstrated ({report.mentionedNotDemonstrated.length})
              </span>
              <span className="text-[10px] text-neutral-500">Only listed in skills list</span>
            </div>
            {report.mentionedNotDemonstrated.length === 0 ? (
              <p className="text-xs text-neutral-500 italic">No surface-level mentions found.</p>
            ) : (
              <div className="space-y-2">
                {report.mentionedNotDemonstrated.map((s, idx) => (
                  <div key={idx} className="rounded-lg bg-neutral-950 p-2.5 border border-neutral-800/60 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-neutral-200">{s.name}</span>
                      <span className="text-[10px] text-sky-400/80">{s.category}</span>
                    </div>
                    <p className="text-neutral-400 text-[11px]">
                      <span className="text-neutral-500">Missing evidence:</span> {s.missingEvidence}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Missing Skills */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5" />
                Missing from Resume ({report.missingSkills.length})
              </span>
              <span className="text-[10px] text-neutral-500">Required by JD</span>
            </div>
            {report.missingSkills.length === 0 ? (
              <p className="text-xs text-neutral-500 italic">No missing critical skills.</p>
            ) : (
              <div className="space-y-2">
                {report.missingSkills.map((s, idx) => (
                  <div key={idx} className="rounded-lg bg-neutral-950 p-2.5 border border-neutral-800/60 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-neutral-200">{s.name}</span>
                      <Badge variant="outline" className="text-[10px] border-rose-900/40 text-rose-400 py-0">
                        {s.importanceInJd}
                      </Badge>
                    </div>
                    <p className="text-neutral-400 text-[11px]">
                      <span className="text-neutral-500">Action:</span> {s.suggestedAction}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Partially Matching or Related */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Partially Matching / Related ({report.partiallyMatchingOrRelated.length})
              </span>
              <span className="text-[10px] text-neutral-500">Adjacent competencies</span>
            </div>
            {report.partiallyMatchingOrRelated.length === 0 ? (
              <p className="text-xs text-neutral-500 italic">No partial matches noted.</p>
            ) : (
              <div className="space-y-2">
                {report.partiallyMatchingOrRelated.map((s, idx) => (
                  <div key={idx} className="rounded-lg bg-neutral-950 p-2.5 border border-neutral-800/60 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-neutral-200">{s.name}</span>
                      <span className="text-[10px] text-neutral-500">{s.category}</span>
                    </div>
                    <p className="text-neutral-400 text-[11px] mb-1">
                      <span className="text-neutral-500">Found:</span> {s.relatedExperienceFound}
                    </p>
                    <p className="text-amber-400/90 text-[11px]">
                      <span className="text-neutral-500">Gap:</span> {s.missingAspects}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Resume Bullet Improvements (Google X-Y-Z formula without metric fabrication) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <h3 className="text-base font-bold text-neutral-100">
              Resume Bullet Improvement Suggestions
            </h3>
          </div>
          <span className="text-xs text-neutral-400 font-mono">Google X-Y-Z Formula</span>
        </div>

        <div className="space-y-4">
          {report.bulletImprovements.map((b, idx) => (
            <div key={idx} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-3">
              {/* Original Bullet */}
              <div>
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Original Bullet from Resume:
                </span>
                <p className="text-xs text-neutral-300 mt-1 italic pl-3 border-l-2 border-neutral-700 bg-neutral-950/40 py-1.5">
                  &ldquo;{b.originalBullet}&rdquo;
                </p>
              </div>

              {/* Proposed Bullet */}
              <div>
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                  Proposed Stronger Bullet:
                </span>
                <p className="text-xs text-neutral-100 mt-1 font-medium pl-3 border-l-2 border-emerald-500 bg-emerald-950/20 py-2 rounded-r">
                  {b.proposedBullet}
                </p>
              </div>

              {/* Rationale & Required User Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="text-neutral-400 text-[11px]">
                  <span className="font-semibold text-neutral-300">Why It&apos;s Stronger:</span>{" "}
                  {b.whyStronger}
                </div>

                <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800/80">
                  <span className="text-[11px] font-semibold text-amber-400 block mb-1">
                    Metrics You Must Supply (No Fabrication):
                  </span>
                  <ul className="list-disc list-inside text-[11px] text-neutral-300 space-y-0.5">
                    {b.metricsOrDetailsUserMustSupply.map((m, mIdx) => (
                      <li key={mIdx}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Experience Highlights & Undemonstrated Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Demonstrated Experience */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-200">
            <Briefcase className="h-4 w-4 text-emerald-400" />
            <h4>High-Impact Relevant Experience</h4>
          </div>
          <div className="space-y-2.5">
            {report.demonstratedExperience.map((exp, idx) => (
              <div key={idx} className="p-3 bg-neutral-950 rounded-lg border border-neutral-800/80 text-xs space-y-1">
                <p className="font-semibold text-neutral-200">{exp.highlight}</p>
                <p className="text-neutral-400 text-[11px]">{exp.relevanceToJd}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Undemonstrated Requirements & Interview Strategy */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-200">
            <Target className="h-4 w-4 text-amber-400" />
            <h4>Unmet Requirements &amp; Interview Defense</h4>
          </div>
          <div className="space-y-2.5">
            {report.undemonstratedRequirements.map((req, idx) => (
              <div key={idx} className="p-3 bg-neutral-950 rounded-lg border border-neutral-800/80 text-xs space-y-1">
                <p className="font-semibold text-rose-300">{req.requirement}</p>
                <p className="text-neutral-400 text-[11px]">{req.explanation}</p>
                <p className="text-amber-400/90 text-[11px] pt-1 border-t border-neutral-900">
                  <span className="font-semibold text-neutral-300">How to address:</span>{" "}
                  {req.howToAddressInInterview}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Recruiter Screening Questions & Technical Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recruiter Screening Questions */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-200">
            <HelpCircle className="h-4 w-4 text-sky-400" />
            <h4>Likely Recruiter Screening Questions</h4>
          </div>
          <div className="space-y-3">
            {report.screeningQuestions.map((sq, idx) => (
              <div key={idx} className="p-3 bg-neutral-950 rounded-lg border border-neutral-800/80 text-xs space-y-1.5">
                <p className="font-semibold text-neutral-100">&ldquo;{sq.question}&rdquo;</p>
                <p className="text-[11px] text-neutral-400">
                  <span className="text-neutral-500">Why they ask:</span> {sq.rationale}
                </p>
                <div className="pt-1">
                  <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider block mb-1">
                    Recommended Talking Points:
                  </span>
                  <ul className="list-disc list-inside text-[11px] text-neutral-300 space-y-0.5">
                    {sq.recommendedTalkingPoints.map((tp, tpIdx) => (
                      <li key={tpIdx}>{tp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Topics Likely Tested */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-200">
            <BookOpen className="h-4 w-4 text-emerald-400" />
            <h4>Technical Topics Likely Tested</h4>
          </div>
          <div className="space-y-2.5">
            {report.technicalInterviewTopics.map((topic, idx) => (
              <div key={idx} className="p-3 bg-neutral-950 rounded-lg border border-neutral-800/80 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-200">{topic.topic}</span>
                  <Badge variant="outline" className="text-[10px] border-neutral-800 text-neutral-400">
                    {topic.skill}
                  </Badge>
                </div>
                <p className="text-neutral-400 text-[11px]">
                  <span className="text-neutral-500">Focus:</span> {topic.focusArea}
                </p>
                <Link
                  href={`/interview-questions?skill=${encodeURIComponent(topic.skill)}`}
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline pt-1"
                >
                  <span>Practice questions on {topic.skill}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Targeted Interview Preparation Set (Bank First + Generated Niche) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-sky-400" />
            <h3 className="text-base font-bold text-neutral-100">
              Targeted Interview Questions for this Opportunity
            </h3>
          </div>
          <Link
            href="/interview"
            className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Launch Mock Interview Simulator</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {report.targetedInterviewQuestions.map((q) => {
            const isSaved = savedQuestionIds.has(q.id);
            const isSaving = savingQuestionId === q.id;

            return (
              <div
                key={q.id}
                className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3 text-xs"
              >
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] border-neutral-700 text-neutral-300">
                      {q.skill}
                    </Badge>
                    <span className="text-neutral-400">•</span>
                    <span className="text-neutral-300 font-medium">{q.topic}</span>
                    <Badge
                      className={`text-[10px] py-0 ${
                        q.difficulty === "advanced" || q.difficulty === "hard"
                          ? "bg-rose-950 text-rose-300 border-rose-800"
                          : q.difficulty === "intermediate" || q.difficulty === "medium"
                          ? "bg-amber-950 text-amber-300 border-amber-800"
                          : "bg-emerald-950 text-emerald-300 border-emerald-800"
                      }`}
                    >
                      {q.difficulty}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    {q.source === "question_bank" ? (
                      <Badge variant="outline" className="text-[10px] border-emerald-900 text-emerald-400">
                        In Question Bank
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveQuestionToBank(q)}
                        disabled={isSaved || isSaving}
                        className="h-6 text-[10px] border-neutral-700 text-neutral-300 hover:text-neutral-100"
                      >
                        {isSaving ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <BookmarkPlus className="h-3 w-3 mr-1 text-sky-400" />
                        )}
                        {isSaved ? "Saved to Bank" : "Save to Question Bank"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <p className="text-sm font-semibold text-neutral-100 whitespace-pre-line">
                  {q.questionText}
                </p>

                {/* Relevance to JD */}
                <p className="text-[11px] text-neutral-400 italic">
                  <span className="text-neutral-500 font-normal">Relevance:</span> {q.relevanceToJd}
                </p>

                {/* Expected Points & Follow-ups */}
                {q.expectedAnswerPoints && q.expectedAnswerPoints.length > 0 && (
                  <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800/80 space-y-1">
                    <span className="text-[10px] font-semibold text-neutral-300 uppercase tracking-wider block">
                      Expected Core Concepts:
                    </span>
                    <ul className="list-disc list-inside text-[11px] text-neutral-300 space-y-0.5">
                      {q.expectedAnswerPoints.map((pt, pIdx) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
