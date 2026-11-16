"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
  ArrowRight,
  BookOpen,
  FileCheck2,
  Target,
  Loader2,
  HelpCircle,
} from "lucide-react";
import {
  ResumeRow,
  JobDescriptionRow,
  ResumeJdAnalysis,
} from "@/features/resumes/schema";
import { analyzeResumeJdAction } from "@/features/resumes/actions";

interface JdAnalysisViewProps {
  resumes: ResumeRow[];
  jobDescriptions: JobDescriptionRow[];
  initialResumeId?: string;
  initialJdId?: string;
}

export function JdAnalysisView({
  resumes,
  jobDescriptions,
  initialResumeId,
  initialJdId,
}: JdAnalysisViewProps) {
  // Pick primary resume by default, or first available
  const defaultResume =
    resumes.find((r) => r.id === initialResumeId) ||
    resumes.find((r) => r.is_primary) ||
    resumes[0];

  const defaultJd =
    jobDescriptions.find((j) => j.id === initialJdId) || jobDescriptions[0];

  const [selectedResumeId, setSelectedResumeId] = useState<string>(
    defaultResume?.id || ""
  );
  const [selectedJdId, setSelectedJdId] = useState<string>(
    defaultJd?.id || "custom"
  );
  const [customCompany, setCustomCompany] = useState<string>(
    defaultJd?.company || ""
  );
  const [customRole, setCustomRole] = useState<string>(
    defaultJd?.role_title || ""
  );
  const [jdRawText, setJdRawText] = useState<string>(defaultJd?.raw_text || "");

  const [analysisResult, setAnalysisResult] = useState<ResumeJdAnalysis | null>(
    null
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleJdSelectionChange(id: string) {
    setSelectedJdId(id);
    if (id === "custom") {
      setCustomCompany("");
      setCustomRole("");
      setJdRawText("");
    } else {
      const found = jobDescriptions.find((j) => j.id === id);
      if (found) {
        setCustomCompany(found.company);
        setCustomRole(found.role_title);
        setJdRawText(found.raw_text);
      }
    }
  }

  function handleRunAnalysis() {
    setError(null);

    if (!selectedResumeId) {
      setError("Please select a resume version to compare.");
      return;
    }

    const selectedResume = resumes.find((r) => r.id === selectedResumeId);
    if (!selectedResume?.extracted_text?.trim()) {
      setError(
        "The selected resume has no extracted text. Please click 'View / Edit Text' in Resume Versions and save text before analyzing."
      );
      return;
    }

    if (!jdRawText.trim() || jdRawText.trim().length < 10) {
      setError("Please provide a job description of at least 10 characters.");
      return;
    }

    startTransition(async () => {
      const res = await analyzeResumeJdAction(selectedResumeId, {
        raw_text: jdRawText,
        company: customCompany.trim() || "Target Company",
        role_title: customRole.trim() || "Target Role",
        jdId: selectedJdId !== "custom" ? selectedJdId : undefined,
      });

      if (!res.success || !res.data) {
        setError(res.error || "Analysis failed.");
      } else {
        setAnalysisResult(res.data);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      <div className="rounded-xl border border-sky-800/80 bg-sky-950/40 p-4 text-xs text-sky-200 flex items-start gap-3 shadow-sm">
        <Info className="h-5 w-5 shrink-0 text-sky-400 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <p className="font-semibold text-sky-100">
            Deterministic Skill & Keyword Alignment (Non-AI)
          </p>
          <p className="text-sky-300/80 text-[11px]">
            This tool performs deterministic matching against CareerOS&apos;s 42-skill resume taxonomy
            and domain technical keywords. It is an objective skill gap analysis tool, not an
            official proprietary ATS score or pass/fail predictor.
          </p>
        </div>
      </div>

      {/* Inputs Card */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Resume Version Picker */}
          <div>
            <Label className="text-xs text-neutral-400 font-medium">
              1. Select Resume Version <span className="text-rose-400">*</span>
            </Label>
            {resumes.length === 0 ? (
              <p className="mt-1.5 text-xs text-amber-400">
                No resumes uploaded yet. Please upload a resume first.
              </p>
            ) : (
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.version_label} {r.is_primary ? "(Primary)" : ""} • {r.file_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Saved JD Picker */}
          <div>
            <Label className="text-xs text-neutral-400 font-medium">
              2. Job Description Source
            </Label>
            <select
              value={selectedJdId}
              onChange={(e) => handleJdSelectionChange(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="custom">Paste / Custom Job Description</option>
              {jobDescriptions.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.company} - {j.role_title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Company and Role (if custom or editing) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-neutral-400">Company (Optional)</Label>
            <input
              type="text"
              value={customCompany}
              onChange={(e) => setCustomCompany(e.target.value)}
              placeholder="e.g. Amazon, Google, Startup"
              className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <Label className="text-xs text-neutral-400">Role Title (Optional)</Label>
            <input
              type="text"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="e.g. SDE II (Backend)"
              className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Raw JD Text */}
        <div>
          <Label className="text-xs text-neutral-400">
            Job Description Content <span className="text-rose-400">*</span>
          </Label>
          <Textarea
            value={jdRawText}
            onChange={(e) => setJdRawText(e.target.value)}
            placeholder="Paste the job description text here..."
            rows={5}
            className="mt-1 font-mono text-xs bg-neutral-950 border-neutral-800 text-neutral-200"
          />
        </div>

        {error && (
          <div className="rounded bg-red-950/80 border border-red-800 p-2.5 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-neutral-500">
            Evaluates against 42 resume skills, frameworks, and architecture patterns.
          </span>
          <Button
            type="button"
            onClick={handleRunAnalysis}
            disabled={isPending || resumes.length === 0}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Analyzing Match...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Run Alignment Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Analysis Results View */}
      {analysisResult && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-6 shadow-md space-y-6">
          {/* Header & Score Gauge */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Alignment Report
              </span>
              <h3 className="text-lg font-bold text-neutral-100 mt-0.5">
                {analysisResult.company} — {analysisResult.roleTitle}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Compared with resume:{" "}
                <span className="text-neutral-200 font-medium">
                  {analysisResult.resumeVersion}
                </span>{" "}
                • {analysisResult.totalSkillsEvaluated} JD skills evaluated
              </p>
            </div>

            {/* Score pill */}
            <div className="flex items-center gap-3 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              <div
                className={`text-3xl font-black ${
                  analysisResult.matchPercentage >= 75
                    ? "text-emerald-400"
                    : analysisResult.matchPercentage >= 50
                    ? "text-amber-400"
                    : "text-rose-400"
                }`}
              >
                {analysisResult.matchPercentage}%
              </div>
              <div>
                <span className="text-xs font-semibold text-neutral-200 block">
                  {analysisResult.matchPercentage >= 75
                    ? "Strong Skill Alignment"
                    : analysisResult.matchPercentage >= 50
                    ? "Moderate Alignment"
                    : "Notable Skill Gaps"}
                </span>
                <span className="text-[10px] text-neutral-500">
                  Deterministic taxonomy score
                </span>
              </div>
            </div>
          </div>

          {/* 3-Column Skills Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Explicitly Matching */}
            <div className="rounded-lg border border-emerald-950 bg-emerald-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Explicitly Matching
                </span>
                <Badge className="bg-emerald-900/60 text-emerald-300 border-emerald-700/60 text-[10px]">
                  {analysisResult.explicitSkills.length}
                </Badge>
              </div>

              {analysisResult.explicitSkills.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">No exact skill matches detected.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.explicitSkills.map((s) => (
                    <span
                      key={s.slug}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-medium"
                    >
                      ✓ {s.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Partially Demonstrated */}
            <div className="rounded-lg border border-amber-950 bg-amber-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" /> Partially Demonstrated
                </span>
                <Badge className="bg-amber-900/60 text-amber-300 border-amber-700/60 text-[10px]">
                  {analysisResult.partialSkills.length}
                </Badge>
              </div>

              {analysisResult.partialSkills.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">No partial matches.</p>
              ) : (
                <div className="space-y-2">
                  {analysisResult.partialSkills.map((s) => (
                    <div
                      key={s.slug}
                      className="p-2 rounded bg-amber-950/60 border border-amber-800/80 text-xs"
                    >
                      <div className="font-semibold text-amber-200">{s.name}</div>
                      {s.explanation && (
                        <p className="text-[11px] text-amber-300/80 mt-0.5 leading-snug">
                          {s.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Missing Skills */}
            <div className="rounded-lg border border-rose-950 bg-rose-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                  <XCircle className="h-4 w-4" /> Missing from Resume
                </span>
                <Badge className="bg-rose-900/60 text-rose-300 border-rose-700/60 text-[10px]">
                  {analysisResult.missingSkills.length}
                </Badge>
              </div>

              {analysisResult.missingSkills.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">No critical missing skills!</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.missingSkills.map((s) => (
                    <span
                      key={s.slug}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-medium"
                    >
                      ✕ {s.name}
                      <span className="text-[10px] text-rose-400/80 ml-0.5 uppercase">
                        ({s.priority})
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Missing Technical Keywords */}
          {analysisResult.missingKeywords.length > 0 && (
            <div className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-4 space-y-2">
              <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-neutral-400" />
                Missing Technical Keywords ({analysisResult.missingKeywords.length})
              </span>
              <p className="text-[11px] text-neutral-400">
                These domain keywords appear in the job description but are absent in your resume:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {analysisResult.missingKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 text-xs border border-neutral-700 font-mono"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Resume Bullet Improvement Suggestions */}
          <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-4 space-y-2.5">
            <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
              <FileCheck2 className="h-4 w-4 text-emerald-400" />
              Actionable Resume Bullet Improvements
            </span>
            <ul className="space-y-1.5 pt-1">
              {analysisResult.bulletSuggestions.map((tip, idx) => (
                <li
                  key={idx}
                  className="text-xs text-neutral-300 flex items-start gap-2 leading-relaxed"
                >
                  <span className="font-semibold text-emerald-400 shrink-0">{idx + 1}.</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Interview Question Bank Topics */}
          {analysisResult.recommendedInterviewTopics.length > 0 && (
            <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-sky-400" />
                  Recommended Question Bank Preparation
                </span>
                <span className="text-[11px] text-neutral-500">
                  Targeted questions from CareerOS Bank
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Prepare for likely interview questions based on the skills requested in this job
                description:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {analysisResult.recommendedInterviewTopics.map((topic, i) => (
                  <Link
                    key={i}
                    href={topic.interviewBankUrl}
                    className="group rounded-md border border-neutral-800 bg-neutral-900 p-3 hover:border-emerald-600 transition flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-neutral-100 group-hover:text-emerald-400 transition flex items-center gap-1.5">
                        <HelpCircle className="h-3.5 w-3.5 text-neutral-400 group-hover:text-emerald-400" />
                        {topic.topicName}
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
                        {topic.reason}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-500 group-hover:text-emerald-400 transition ml-2 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
