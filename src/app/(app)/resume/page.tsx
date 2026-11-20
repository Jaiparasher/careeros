import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AlertCircle, FileText } from "lucide-react";
import {
  ResumeService,
  getResumeApplicationOptions,
} from "@/features/resumes/service";
import { ResumeViewContainer } from "./components/resume-view-container";

export const metadata = {
  title: "Resume & Job Description Manager | CareerOS",
  description:
    "Upload resume versions, manage private document storage, track target job descriptions, and evaluate deterministic skill alignment.",
};

export default async function ResumePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resumeService = new ResumeService(supabase);

  // Fetch resumes, saved job descriptions, and user job applications in parallel
  const [resumes, jobDescriptions, applicationsResult] = await Promise.all([
    resumeService.getResumes(user.id),
    resumeService.getJobDescriptions(user.id),
    getResumeApplicationOptions(supabase, user.id),
  ]);

  const { applications: applicationOptions, error: applicationsError } =
    applicationsResult;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <FileText className="h-4 w-4" />
          <span>Phase 3 • Career Management</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-100 mt-1">
          Resume &amp; Job Description Manager
        </h1>
        <p className="text-sm text-neutral-400 mt-1 max-w-3xl">
          Manage private resume versions, review extracted text, store target job postings,
          and run deterministic skill alignment analysis without external AI.
        </p>
      </div>

      {applicationsError && (
        <div className="rounded-lg border border-amber-800/80 bg-amber-950/30 p-3.5 text-xs text-amber-200 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
          <span>{applicationsError}</span>
        </div>
      )}

      <ResumeViewContainer
        resumes={resumes}
        jobDescriptions={jobDescriptions}
        applications={applicationOptions}
      />
    </div>
  );
}
