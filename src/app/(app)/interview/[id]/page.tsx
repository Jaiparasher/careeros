import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MockInterviewService } from "@/features/interview/mock-interview-service";
import { InterviewWorkspace } from "../components/interview-workspace";
import { InterviewResultsView } from "../components/interview-results-view";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Mock Interview Workspace | CareerOS`,
    description: `Active technical interview evaluation session ${id}`,
  };
}

export default async function MockInterviewSessionPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const service = new MockInterviewService(supabase);
  const session = await service.getSession(user.id, id);

  if (!session) {
    notFound();
  }

  const isCompleted = session.status === "completed";

  return (
    <div className="space-y-6">
      {/* Back button navigation */}
      <div className="flex items-center justify-between pb-2">
        <Link href="/interview">
          <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Interview Setup
          </Button>
        </Link>
      </div>

      {isCompleted ? (
        <InterviewResultsView session={session} />
      ) : (
        <InterviewWorkspace session={session} />
      )}
    </div>
  );
}
