import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ResumeJdAnalysisService } from "@/features/resumes/ai-analysis-service";
import { getResumeApplicationOptions } from "@/features/resumes/service";
import { AiAnalysisReport } from "../../components/ai-analysis-report";
import { AlertCircle, ArrowLeft, Sparkles } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResumeAnalysisDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const service = new ResumeJdAnalysisService(supabase);
  const [report, applicationsResult] = await Promise.all([
    service.getAnalysis(user.id, id),
    getResumeApplicationOptions(supabase, user.id),
  ]);

  if (!report) {
    notFound();
  }

  const { applications, error: applicationsError } = applicationsResult;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div>
        <Link
          href="/resume"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 transition mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Resume &amp; JD Manager</span>
        </Link>

        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="h-4 w-4" />
          <span>AI Resume &amp; Job Description Intelligence</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-100 mt-1">
          {report.company} — {report.roleTitle}
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Analyzed on {new Date(report.analyzedAt).toLocaleDateString()} against resume {report.resumeVersion}
        </p>
      </div>

      {applicationsError && (
        <div className="rounded-lg border border-amber-800/80 bg-amber-950/30 p-3.5 text-xs text-amber-200 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
          <span>{applicationsError}</span>
        </div>
      )}

      <AiAnalysisReport report={report} applications={applications} />
    </div>
  );
}
