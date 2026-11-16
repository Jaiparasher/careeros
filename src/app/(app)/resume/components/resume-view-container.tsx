"use client";

import { useState } from "react";
import { ResumeRow, JobDescriptionRow } from "@/features/resumes/schema";
import { ResumeVersionCard } from "./resume-version-card";
import { ResumeUploadModal } from "./resume-upload-modal";
import { JdManager } from "./jd-manager";
import { JdAnalysisView } from "./jd-analysis-view";
import { FileText, FileCode, Sparkles, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ApplicationOption {
  id: string;
  company_name: string;
  role_title: string;
}

interface ResumeViewContainerProps {
  resumes: ResumeRow[];
  jobDescriptions: JobDescriptionRow[];
  applications: ApplicationOption[];
}

export function ResumeViewContainer({
  resumes,
  jobDescriptions,
  applications,
}: ResumeViewContainerProps) {
  const [activeTab, setActiveTab] = useState<"resumes" | "jds" | "analysis">("resumes");
  const [targetResumeId, setTargetResumeId] = useState<string | undefined>(
    resumes.find((r) => r.is_primary)?.id || resumes[0]?.id
  );
  const [targetJdId, setTargetJdId] = useState<string | undefined>(
    jobDescriptions[0]?.id
  );

  const hasPrimaryResume = resumes.some((r) => r.is_primary);

  function handleSelectResumeForAnalysis(resume: ResumeRow) {
    setTargetResumeId(resume.id);
    setActiveTab("analysis");
  }

  function handleSelectJdForAnalysis(jd: JobDescriptionRow) {
    setTargetJdId(jd.id);
    setActiveTab("analysis");
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("resumes")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "resumes"
                ? "bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <FileText className="h-4 w-4 text-emerald-400" />
            <span>Resume Versions</span>
            <Badge
              variant="outline"
              className="bg-neutral-950 text-neutral-300 border-neutral-800 text-[10px] px-1.5 py-0"
            >
              {resumes.length}
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab("jds")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "jds"
                ? "bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <FileCode className="h-4 w-4 text-sky-400" />
            <span>Job Descriptions</span>
            <Badge
              variant="outline"
              className="bg-neutral-950 text-neutral-300 border-neutral-800 text-[10px] px-1.5 py-0"
            >
              {jobDescriptions.length}
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab("analysis")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "analysis"
                ? "bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Skill Alignment</span>
          </button>
        </div>

        {activeTab === "resumes" && (
          <ResumeUploadModal
            hasPrimaryResume={hasPrimaryResume}
            versionCount={resumes.length}
          />
        )}
      </div>

      {/* Tab 1: Resumes */}
      {activeTab === "resumes" && (
        <div className="space-y-4">
          {resumes.length === 0 ? (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-10 text-center">
              <UploadCloud className="h-12 w-12 text-neutral-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-neutral-200">
                No Resumes Uploaded Yet
              </h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1 mb-5">
                Upload your resume in PDF or DOCX format. CareerOS will automatically extract its
                text, allow you to designate a primary version, and run deterministic skill alignment
                against job postings.
              </p>
              <ResumeUploadModal
                hasPrimaryResume={hasPrimaryResume}
                versionCount={0}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resumes.map((resume) => (
                <ResumeVersionCard
                  key={resume.id}
                  resume={resume}
                  onSelectForAnalysis={handleSelectResumeForAnalysis}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved JDs */}
      {activeTab === "jds" && (
        <JdManager
          jobDescriptions={jobDescriptions}
          applications={applications}
          onSelectForAnalysis={handleSelectJdForAnalysis}
        />
      )}

      {/* Tab 3: Alignment Analysis */}
      {activeTab === "analysis" && (
        <JdAnalysisView
          resumes={resumes}
          jobDescriptions={jobDescriptions}
          initialResumeId={targetResumeId}
          initialJdId={targetJdId}
        />
      )}
    </div>
  );
}
