import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles, History, Clock, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MockInterviewService } from "@/features/interview/mock-interview-service";
import { MockInterviewSetupForm } from "./components/setup-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Mock Interview | CareerOS",
  description: "AI-coached technical mock interviews evaluated against interview rubrics.",
};

export default async function MockInterviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const service = new MockInterviewService(supabase);
  const previousSessions = await service.listSessions(user.id);

  // Question bank statistics check
  const { count: bankCount } = await supabase
    .from("interview_question_bank")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Phase 4 AI Assistant
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Technical Mock Interview & Answer Coach
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Simulate realistic SDE interview loops using your {bankCount || 376}-question bank. Answers are evaluated objectively by Google Gemini for technical depth, correctness, and actionable follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/interview-questions">
            <Button variant="outline" size="sm" className="text-xs">
              Browse Question Bank ({bankCount || 376})
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid: Setup Form + History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Setup Form */}
        <div className="lg:col-span-2">
          <MockInterviewSetupForm />
        </div>

        {/* Right Col: Past Interview Sessions */}
        <div className="space-y-4">
          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-500" />
                  Interview History
                </CardTitle>
                <Badge variant="secondary" className="text-[11px]">
                  {previousSessions.length} {previousSessions.length === 1 ? "Session" : "Sessions"}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Track your progress, scores, and past evaluation summaries.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {previousSessions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="text-xs">No mock interviews completed yet.</p>
                  <p className="text-[11px] text-slate-400">
                    Configure your first session on the left to start practicing!
                  </p>
                </div>
              ) : (
                previousSessions.map((s) => {
                  const isCompleted = s.status === "completed";
                  const score = s.overall_score ?? (s.summary_json?.overallPercentage ? (s.summary_json.overallPercentage / 10).toFixed(1) : null);
                  const formattedDate = new Date(s.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <div
                      key={s.id}
                      className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 transition-all flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                              {s.category}
                            </span>
                            <span className="text-[10px] text-slate-400">• {formattedDate}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 capitalize block">
                            {s.difficulty} difficulty • {s.total_questions || 5} questions
                          </span>
                        </div>

                        <div>
                          {isCompleted ? (
                            score ? (
                              <Badge
                                className={`text-[10px] font-semibold px-2 py-0.5 ${
                                  Number(score) >= 7.0
                                    ? "bg-emerald-600 text-white"
                                    : Number(score) >= 5.0
                                    ? "bg-amber-600 text-white"
                                    : "bg-rose-600 text-white"
                                }`}
                              >
                                {score}/10
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300">
                                Completed
                              </Badge>
                            )
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 animate-pulse">
                              In Progress
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          {isCompleted ? "Reviewed" : "Resume session"}
                        </span>
                        <Link href={`/interview/${s.id}`}>
                          <Button size="sm" variant="ghost" className="h-7 text-xs px-2 text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                            {isCompleted ? "View Results" : "Continue"}
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
