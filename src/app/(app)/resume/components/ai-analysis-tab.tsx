"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  History,
  Trash2,
} from "lucide-react";
import {
  type ResumeRow,
  type JobDescriptionRow,
} from "@/features/resumes/schema";
import {
  type AiResumeJdAnalysisReport,
} from "@/features/resumes/ai-analyzer-schema";
import {
  runAiResumeJdAnalysisAction,
  listAiResumeJdAnalysesAction,
  deleteAiAnalysisAction,
} from "@/features/resumes/ai-actions";
import { AiAnalysisReport } from "./ai-analysis-report";

interface ApplicationOption {
  id: string;
  company_name: string;
  role_title: string;
}

interface AiAnalysisTabProps {
  resumes: ResumeRow[];
  jobDescriptions: JobDescriptionRow[];
  applications: ApplicationOption[];
  initialResumeId?: string;
  initialJdId?: string;
}

export function AiAnalysisTab({
  resumes,
  jobDescriptions,
  applications,
  initialResumeId,
  initialJdId,
}: AiAnalysisTabProps) {
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
  const [customTargetRole, setCustomTargetRole] = useState<string>(
    defaultResume?.target_role || "Java Backend Engineer"
  );
  const [jdRawText, setJdRawText] = useState<string>(defaultJd?.raw_text || "");

  const [activeReport, setActiveReport] = useState<AiResumeJdAnalysisReport | null>(null);
  const [history, setHistory] = useState<AiResumeJdAnalysisReport[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await listAiResumeJdAnalysesAction();
        if (res.success && res.data) {
          setHistory(res.data);
          setActiveReport((prev) => (prev ? prev : res.data && res.data.length > 0 ? res.data[0] : null));
        }
      } catch {
        // history fetch error ignored gracefully
      }
    }
    loadHistory();
  }, []);

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
      setError("Please select a resume version.");
      return;
    }

    const selectedResume = resumes.find((r) => r.id === selectedResumeId);
    if (!selectedResume?.extracted_text?.trim()) {
      setError(
        "The selected resume has no extracted text. Please click 'View / Edit Text' in Resume Versions and save text before running AI analysis."
      );
      return;
    }

    if (selectedJdId === "custom" && (!jdRawText || jdRawText.trim().length < 10)) {
      setError("Please provide at least 10 characters of job description text.");
      return;
    }

    startTransition(async () => {
      const res = await runAiResumeJdAnalysisAction({
        resumeId: selectedResumeId,
        jobDescriptionId: selectedJdId === "custom" ? undefined : selectedJdId,
        customJdText: selectedJdId === "custom" ? jdRawText : undefined,
        customCompany: selectedJdId === "custom" ? customCompany : undefined,
        customRoleTitle: selectedJdId === "custom" ? customRole : undefined,
        targetRole: customTargetRole,
      });

      if (!res.success || !res.data) {
        setError(res.error || "AI analysis failed. Please try again.");
      } else {
        setActiveReport(res.data);
        setHistory((prev) => [res.data!, ...prev.filter((h) => h.id !== res.data!.id)]);
      }
    });
  }

  async function handleDeleteHistoryItem(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const res = await deleteAiAnalysisAction(id);
    if (res.success) {
      setHistory((prev) => prev.filter((h) => h.id !== id));
      if (activeReport?.id === id) {
        const remaining = history.filter((h) => h.id !== id);
        setActiveReport(remaining[0] || null);
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Configuration & Trigger Card */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>AI Resume vs. Job Description Intelligence</span>
          </div>
          <h2 className="text-lg font-bold text-neutral-100 mt-1">
            Compare Experience Against Role Requirements
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Powered by Google Gemini server-side. Evaluates true technical alignment, generates
            Google X-Y-Z bullet enhancements without fabricated metrics, and builds a targeted
            interview preparation set.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Resume Version Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs text-neutral-300">1. Select Resume Version</Label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              aria-label="Select Resume Version"
              className="w-full bg-neutral-950 border border-neutral-800 text-neutral-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-neutral-600"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.version_label} {r.is_primary ? "(Primary)" : ""} —{" "}
                  {r.extracted_text ? "Text Ready" : "No Text"}
                </option>
              ))}
            </select>
            {resumes.find((r) => r.id === selectedResumeId)?.extracted_text ? (
              <p className="text-[10px] text-emerald-400">
                Extracted text available ({resumes.find((r) => r.id === selectedResumeId)?.extracted_text?.length} chars)
              </p>
            ) : (
              <p className="text-[10px] text-amber-400">
                Warning: No text extracted. Please add text in Resume tab.
              </p>
            )}
          </div>

          {/* Job Description Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs text-neutral-300">2. Select Job Description</Label>
            <select
              value={selectedJdId}
              onChange={(e) => handleJdSelectionChange(e.target.value)}
              aria-label="Select Job Description"
              className="w-full bg-neutral-950 border border-neutral-800 text-neutral-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-neutral-600"
            >
              <option value="custom">-- Paste Custom Job Description Below --</option>
              {jobDescriptions.map((jd) => (
                <option key={jd.id} value={jd.id}>
                  {jd.company} — {jd.role_title}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-neutral-500">
              {jobDescriptions.length} saved job descriptions available
            </p>
          </div>

          {/* Target Role Context */}
          <div className="space-y-1.5">
            <Label className="text-xs text-neutral-300">3. Target Role Context (Optional)</Label>
            <input
              type="text"
              value={customTargetRole}
              onChange={(e) => setCustomTargetRole(e.target.value)}
              placeholder="e.g. SDE II (Java Backend)"
              className="w-full bg-neutral-950 border border-neutral-800 text-neutral-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-neutral-600"
            />
            <p className="text-[10px] text-neutral-500">Guides qualitative match evaluation</p>
          </div>
        </div>

        {/* Custom JD fields if selected */}
        {selectedJdId === "custom" && (
          <div className="space-y-3 pt-2 border-t border-neutral-800/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-neutral-300">Target Company (Optional)</Label>
                <input
                  type="text"
                  value={customCompany}
                  onChange={(e) => setCustomCompany(e.target.value)}
                  placeholder="e.g. Google, Amazon, Stripe"
                  className="w-full bg-neutral-950 border border-neutral-800 text-neutral-100 text-xs rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-neutral-600"
                />
              </div>
              <div>
                <Label className="text-xs text-neutral-300">Role Title (Optional)</Label>
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="e.g. Backend Software Engineer"
                  className="w-full bg-neutral-950 border border-neutral-800 text-neutral-100 text-xs rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-neutral-600"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-neutral-300">Job Description Text</Label>
              <Textarea
                rows={5}
                value={jdRawText}
                onChange={(e) => setJdRawText(e.target.value)}
                placeholder="Paste the full job description text here (responsibilities, required qualifications, tech stack)..."
                className="bg-neutral-950 border-neutral-800 text-xs text-neutral-100 mt-1 resize-y"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-rose-400 bg-rose-950/30 border border-rose-900/50 p-3 rounded-lg text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button
            onClick={handleRunAnalysis}
            disabled={isPending}
            className="bg-amber-600 hover:bg-amber-500 text-neutral-950 font-semibold text-xs px-5 py-2"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Analyzing with Gemini AI...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Run AI Match &amp; Intelligence Analysis
              </>
            )}
          </Button>

          {isPending && (
            <span className="text-xs text-neutral-400 italic">
              Evaluating resume bullets, matching taxonomy skills, and generating targeted prep set...
            </span>
          )}
        </div>
      </div>

      {/* History Ribbon (if analyses exist) */}
      {history.length > 0 && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-neutral-400" />
              Analysis History ({history.length})
            </span>
            <span className="text-[10px] text-neutral-500">Select any report to inspect</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {history.map((h) => {
              const isActive = activeReport?.id === h.id;
              return (
                <div
                  key={h.id}
                  onClick={() => setActiveReport(h)}
                  className={`cursor-pointer rounded-lg p-3 text-xs border shrink-0 min-w-[220px] max-w-[260px] transition ${
                    isActive
                      ? "bg-neutral-800/90 border-neutral-600 shadow"
                      : "bg-neutral-950/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-neutral-200 truncate max-w-[140px]">
                      {h.company}
                    </span>
                    <Badge variant="outline" className="text-[9px] py-0 border-neutral-700 text-neutral-400">
                      {h.readinessLevel}
                    </Badge>
                  </div>
                  <p className="text-neutral-400 text-[11px] truncate">{h.roleTitle}</p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-900 text-[10px] text-neutral-500">
                    <span>{new Date(h.analyzedAt).toLocaleDateString()}</span>
                    {h.id && (
                      <button
                        onClick={(e) => handleDeleteHistoryItem(h.id!, e)}
                        className="text-neutral-500 hover:text-rose-400 p-0.5"
                        title="Delete report"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Analysis Report */}
      {activeReport ? (
        <AiAnalysisReport
          report={activeReport}
          applications={applications}
          onRerun={handleRunAnalysis}
        />
      ) : (
        !isPending && (
          <div className="rounded-xl border border-dashed border-neutral-800 p-12 text-center space-y-3">
            <div className="mx-auto w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400">
              <Sparkles className="h-5 w-5 text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-200">No Analysis Run Yet</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Select a resume and job description above to generate an authentic qualitative
              readiness evaluation, Google X-Y-Z bullet rewrites, and JD-targeted interview questions.
            </p>
          </div>
        )
      )}
    </div>
  );
}
