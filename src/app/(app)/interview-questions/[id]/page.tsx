import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getQuestionById } from "@/features/interview/service";
import { QuestionAnswerForm } from "../components/question-answer-form";
import { ArrowLeft, HelpCircle } from "lucide-react";

interface QuestionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const question = await getQuestionById(supabase, user.id, id);

  if (!question) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-4">
        <HelpCircle className="h-10 w-10 text-neutral-500 mx-auto" />
        <h1 className="text-xl font-bold text-neutral-100">Question Not Found</h1>
        <p className="text-sm text-neutral-400">
          The requested interview question could not be found or does not belong to your account.
        </p>
        <div className="pt-2">
          <Link
            href="/interview-questions"
            className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-neutral-800 text-neutral-200 hover:bg-neutral-700 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Question Bank
          </Link>
        </div>
      </div>
    );
  }

  return <QuestionAnswerForm question={question} />;
}
