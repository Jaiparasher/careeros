import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ResumeJdAnalysisService } from "@/features/resumes/ai-analysis-service";
import { AiAnalysisReport } from "../../components/ai-analysis-report";
import { ArrowLeft, Sparkles } from "lucide-react";

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
  const [report, applicationsRes] = await Promise.all([
    service.getAnalysis(user.id, id),
    supabase
      .from("job_applications")
      .select("id, company_name, role_title")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  if (!report) {
    notFound();
  }

  const applications = (applicationsRes.data || []).map((app) => ({
    id: app.id,
    company_name: app.company_name,
    role_title: app.role_title,
  }));

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

      <AiAnalysisReport report={report} applications={applications} />
    </div>
  );
}
