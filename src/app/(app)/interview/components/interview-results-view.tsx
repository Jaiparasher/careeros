"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  BookOpen,
  HelpCircle,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { type MockInterviewSession } from "@/features/interview/mock-interview-schema";

interface Props {
  session: MockInterviewSession;
}

export function InterviewResultsView({ session }: Props) {
  const summary = session.summary_json;
  const questions = session.questions || [];

  const overallScore = session.overall_score ?? (summary?.overallPercentage ? summary.overallPercentage / 10 : 0);
  const overallPercentage = summary?.overallPercentage ?? Math.round((Number(overallScore) / 10) * 100);

  const attemptedCount = summary?.attemptedCount ?? questions.filter((q) => q.user_answer && q.user_answer !== "[Skipped by candidate]").length;
  const skippedCount = summary?.skippedCount ?? questions.filter((q) => q.user_answer === "[Skipped by candidate]" || q.evaluation_status === "skipped").length;
  const strongAreas = summary?.strongAreas || [];
  const weakAreas = summary?.weakAreas || [];
  const skillBreakdown = summary?.skillBreakdown || [];
  const recommendedRevisions = summary?.recommendedRevisions || [];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Banner: Overall Score & Completion */}
      <Card className="border border-indigo-100 dark:border-indigo-950 bg-gradient-to-br from-indigo-50/60 via-white to-slate-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 shadow-sm overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-600 text-white font-medium text-xs px-2.5 py-0.5">
                  Interview Completed
                </Badge>
                <span className="text-xs text-slate-500">
                  {session.category} • {session.difficulty}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                Evaluation Summary & Feedback
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
                {session.overall_feedback || "Review your technical answers, identified gaps, and recommended revision topics."}
              </p>
            </div>

            {/* Score Ring / Pill */}
            <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-indigo-100 dark:border-indigo-900/60 shadow-xs text-center min-w-[140px]">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                Score
              </span>
              <div className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {overallScore}
                <span className="text-base text-slate-400">/10</span>
              </div>
              <span className="text-xs font-medium text-slate-500 mt-1">
                {overallPercentage}% Mastery
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-200/70 dark:border-slate-800">
            <div className="text-center sm:text-left">
              <span className="text-xs text-slate-500 block">Attempted</span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                {attemptedCount} / {questions.length}
              </span>
            </div>
            <div className="text-center sm:text-left">
              <span className="text-xs text-slate-500 block">Skipped</span>
              <span className="text-base font-bold text-slate-600 dark:text-slate-400">
                {skippedCount}
              </span>
            </div>
            <div className="text-center sm:text-left">
              <span className="text-xs text-slate-500 block">Target Duration</span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                ~{session.duration_target_minutes || questions.length * 3} mins
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skill Performance & Revision Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skill Breakdown */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Skill-Wise Performance
            </CardTitle>
            <CardDescription className="text-xs">
              Average score across assessed question domains
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {skillBreakdown.length > 0 ? (
              skillBreakdown.map((item) => {
                const percentage = Math.round((item.averageScore / 10) * 100);
                const isStrong = item.averageScore >= 7.0;
                return (
                  <div key={item.skill} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.skill}
                      </span>
                      <span className={`font-mono font-medium ${isStrong ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {item.averageScore}/10 ({item.questionCount} {item.questionCount === 1 ? "q" : "qs"})
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isStrong ? "bg-emerald-500" : "bg-amber-500"}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500">Skill breakdown details pending.</p>
            )}

            {/* Strong & Weak Badges */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              {strongAreas.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mr-1">
                    Strong:
                  </span>
                  {strongAreas.map((s) => (
                    <Badge key={s} variant="outline" className="text-xs bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300">
                      {s}
                    </Badge>
                  ))}
                </div>
              )}
              {weakAreas.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold mr-1">
                    Focus Areas:
                  </span>
                  {weakAreas.map((w) => (
                    <Badge key={w} variant="outline" className="text-xs bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300">
                      {w}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Revisions with Deep Links */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Recommended Revisions
            </CardTitle>
            <CardDescription className="text-xs">
              Targeted concepts to review based on your interview answers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendedRevisions.length > 0 ? (
              recommendedRevisions.map((rev, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs flex flex-col justify-between gap-1.5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {rev.skill} • {rev.topic}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                      {rev.reason}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-1 text-[11px]">
                    <Link
                      href={`/interview-questions?skill=${encodeURIComponent(rev.skill)}`}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                    >
                      Question Bank <ExternalLink className="w-3 h-3" />
                    </Link>
                    <Link
                      href="/learning"
                      className="text-slate-600 dark:text-slate-400 hover:underline flex items-center gap-0.5"
                    >
                      Learning Roadmap <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                Great job! No major gaps detected across the evaluated questions.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Individual Question Review List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-500" />
            Detailed Question Breakdown
          </h2>
          <Link href="/interview">
            <Button size="sm" variant="outline" className="text-xs">
              Start Another Mock Interview
            </Button>
          </Link>
        </div>

        {questions.map((q, idx) => {
          const isSkipped = q.evaluation_status === "skipped" || q.user_answer === "[Skipped by candidate]";
          const qScore = typeof q.score === "number" ? q.score : q.technical_correctness ? q.technical_correctness * 2 : 0;
          return (
            <Card key={q.id} className="border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">
                      Q{idx + 1}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {q.skill_name || "Technical"}
                    </Badge>
                    {q.topic && <span className="text-xs text-slate-500">• {q.topic}</span>}
                  </div>
                  <div>
                    {isSkipped ? (
                      <Badge variant="secondary" className="text-xs text-slate-500">
                        Skipped
                      </Badge>
                    ) : (
                      <Badge
                        className={`text-xs font-semibold px-2 py-0.5 ${
                          qScore >= 7
                            ? "bg-emerald-600 text-white"
                            : qScore >= 5
                            ? "bg-amber-600 text-white"
                            : "bg-rose-600 text-white"
                        }`}
                      >
                        {qScore}/10 Score
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug whitespace-pre-wrap">
                  {q.question_text}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 pt-0 text-xs sm:text-sm">
                {/* User Answer */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Your Response:
                  </span>
                  <p className="font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                    {q.user_answer || "No response provided."}
                  </p>
                </div>

                {/* Rubric Feedback */}
                {!isSkipped && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.strengths && (
                      <div className="p-2.5 rounded-md bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 text-emerald-900 dark:text-emerald-300">
                        <strong className="block text-emerald-800 dark:text-emerald-400 mb-0.5">
                          ✓ Identified Concepts:
                        </strong>
                        {q.strengths}
                      </div>
                    )}
                    {q.gaps && (
                      <div className="p-2.5 rounded-md bg-amber-50/70 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 text-amber-900 dark:text-amber-300">
                        <strong className="block text-amber-800 dark:text-amber-400 mb-0.5">
                          ⚠ Areas to Refine:
                        </strong>
                        {q.gaps}
                      </div>
                    )}
                  </div>
                )}

                {/* Ideal Answer */}
                {q.improved_answer && (
                  <div className="p-3 rounded-lg bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 text-xs">
                    <span className="font-semibold text-indigo-900 dark:text-indigo-300 block mb-1">
                      Ideal Reference Answer:
                    </span>
                    <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                      {q.improved_answer}
                    </p>
                  </div>
                )}

                {/* Follow-up question */}
                {q.follow_up_question && (
                  <div className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5 pt-1">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Anticipate this follow-up:</strong> {q.follow_up_question}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="flex items-center justify-center gap-4 pt-4 pb-8">
        <Link href="/interview">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6">
            Configure New Mock Interview
          </Button>
        </Link>
        <Link href="/interview-questions">
          <Button variant="outline">
            Browse Question Bank
          </Button>
        </Link>
      </div>
    </div>
  );
}
