import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FileText } from "lucide-react";
import { ResumeService } from "@/features/resumes/service";
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

  // Fetch resumes and saved job descriptions in parallel
  const [resumes, jobDescriptions, applicationsRes] = await Promise.all([
    resumeService.getResumes(user.id),
    resumeService.getJobDescriptions(user.id),
    supabase
      .from("job_applications")
      .select("id, company_name, role_title")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  const applicationOptions = (applicationsRes.data || []).map((app) => ({
    id: app.id,
    company_name: app.company_name,
    role_title: app.role_title,
  }));

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

      <ResumeViewContainer
        resumes={resumes}
        jobDescriptions={jobDescriptions}
        applications={applicationOptions}
      />
    </div>
  );
}
