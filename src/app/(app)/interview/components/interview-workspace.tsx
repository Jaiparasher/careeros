"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  type MockInterviewSession,
  type MockInterviewQuestion,
} from "@/features/interview/mock-interview-schema";
import {
  submitAnswerAction,
  retryEvaluationAction,
  finishInterviewAction,
} from "@/features/interview/mock-actions";

interface Props {
  session: MockInterviewSession;
}

export function InterviewWorkspace({ session: initialSession }: Props) {
  const router = useRouter();
  const [session, setSession] = useState<MockInterviewSession>(initialSession);
  const [isPending, startTransition] = useTransition();
  const [activeError, setActiveError] = useState<string | null>(null);

  const questions = session.questions || [];
  const totalCount = questions.length;

  // Determine current active question: first question that hasn't been evaluated or skipped
  const firstUnansweredIdx = questions.findIndex(
    (q) => !q.evaluation_status || q.evaluation_status === "pending" || q.evaluation_status === "evaluating" || q.evaluation_status === "failed"
  );

  const [currentIndex, setCurrentIndex] = useState<number>(
    firstUnansweredIdx !== -1 ? firstUnansweredIdx : Math.max(0, totalCount - 1)
  );

  const currentQuestion: MockInterviewQuestion | undefined = questions[currentIndex];

  // Local answer text state
  const [answerText, setAnswerText] = useState<string>(
    currentQuestion?.user_answer && currentQuestion.user_answer !== "[Skipped by candidate]"
      ? currentQuestion.user_answer
      : ""
  );

  // Synchronize answer text when switching questions
  React.useEffect(() => {
    if (currentQuestion) {
      setAnswerText(
        currentQuestion.user_answer && currentQuestion.user_answer !== "[Skipped by candidate]"
          ? currentQuestion.user_answer
          : ""
      );
    }
  }, [currentIndex, currentQuestion]);

  // Accordion states for feedback cards
  const [showIdealAnswer, setShowIdealAnswer] = useState<boolean>(true);
  const [showFollowUps, setShowFollowUps] = useState<boolean>(true);

  if (!currentQuestion) {
    return (
      <div className="p-8 text-center text-slate-500">
        No questions loaded for this session.
      </div>
    );
  }

  const isEvaluated = currentQuestion.evaluation_status === "evaluated";
  const isSkipped = currentQuestion.evaluation_status === "skipped" || currentQuestion.user_answer === "[Skipped by candidate]";
  const isFailed = currentQuestion.evaluation_status === "failed";
  const isAnswered = isEvaluated || isSkipped;
  const isLastQuestion = currentIndex === totalCount - 1;

  // Progress metrics
  const answeredCount = questions.filter(
    (q) => q.evaluation_status === "evaluated" || q.evaluation_status === "skipped"
  ).length;
  const progressPercentage = Math.round((answeredCount / totalCount) * 100);

  function handleSubmitAnswer(skip = false) {
    if (!skip && (!answerText || answerText.trim().length === 0)) {
      setActiveError("Please type an answer or click Skip.");
      return;
    }

    setActiveError(null);
    startTransition(async () => {
      const res = await submitAnswerAction({
        sessionId: session.id,
        questionId: currentQuestion!.id,
        answer: answerText,
        skip,
      });

      if (!res.success) {
        setActiveError(res.error || "Failed to evaluate answer.");
      } else if (res.session) {
        setSession(res.session);
        // If all questions are done, refresh or let user click View Results
        if (res.session.status === "completed") {
          router.refresh();
        }
      }
    });
  }

  function handleRetry() {
    setActiveError(null);
    startTransition(async () => {
      const res = await retryEvaluationAction({
        sessionId: session.id,
        questionId: currentQuestion!.id,
      });

      if (!res.success) {
        setActiveError(res.error || "Retry failed.");
      } else if (res.session) {
        setSession(res.session);
      }
    });
  }

  function handleEndInterview() {
    if (confirm("Are you sure you want to end this interview early? Your answered questions will be scored.")) {
      startTransition(async () => {
        const res = await finishInterviewAction(session.id);
        if (res.success) {
          router.refresh();
        } else {
          setActiveError(res.error || "Failed to finish interview.");
        }
      });
    }
  }

  function goToNext() {
    if (currentIndex < totalCount - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Last question completed, finalize session
      startTransition(async () => {
        await finishInterviewAction(session.id);
        router.refresh();
      });
    }
  }

  function getScoreBadge(score: number | null | undefined) {
    if (typeof score !== "number") return null;
    const num = Number(score.toFixed(1));
    if (num >= 7.5) {
      return (
        <Badge className="bg-emerald-600 text-white font-semibold text-xs px-2.5 py-0.5">
          {num} / 10 • Strong
        </Badge>
      );
    }
    if (num >= 5.0) {
      return (
        <Badge className="bg-amber-600 text-white font-semibold text-xs px-2.5 py-0.5">
          {num} / 10 • Progressing
        </Badge>
      );
    }
    return (
      <Badge className="bg-rose-600 text-white font-semibold text-xs px-2.5 py-0.5">
        {num} / 10 • Needs Work
      </Badge>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header & Session Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {session.category || "Technical Interview"}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500 capitalize">
              {session.difficulty} difficulty
            </span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Question {currentIndex + 1} of {totalCount}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Question Sequence Navigator Pills */}
          <div className="flex items-center gap-1">
            {questions.map((q, idx) => {
              const qDone = q.evaluation_status === "evaluated";
              const qSkip = q.evaluation_status === "skipped" || q.user_answer === "[Skipped by candidate]";
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-7 h-7 rounded-md text-xs font-medium transition-all ${
                    isCurrent
                      ? "ring-2 ring-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
                      : qDone
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : qSkip
                      ? "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800/40 hover:bg-slate-200"
                  }`}
                  title={`Question ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleEndInterview}
            className="text-xs text-slate-500 hover:text-red-600"
          >
            End Interview
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Error Banner */}
      {activeError && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md dark:bg-red-950/40 dark:text-red-300 dark:border-red-900 flex items-center justify-between">
          <span>{activeError}</span>
          {isFailed && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              disabled={isPending}
              className="text-xs ml-3"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Retry
            </Button>
          )}
        </div>
      )}

      {/* Question Card */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {currentQuestion.skill_name || "Technical"}
              </Badge>
              {currentQuestion.topic && (
                <span className="text-xs text-slate-500">• {currentQuestion.topic}</span>
              )}
            </div>
            {isEvaluated && getScoreBadge(currentQuestion.score)}
            {isSkipped && (
              <Badge variant="secondary" className="text-xs text-slate-500">
                Skipped
              </Badge>
            )}
          </div>
          <CardTitle className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
            {currentQuestion.question_text}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isAnswered ? (
            /* Input View for Answering */
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Your Answer (Explain clearly, mention tradeoffs, and provide practical examples):
              </label>
              <Textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Type your structured answer here. Speak as if talking directly to a senior interviewer..."
                rows={8}
                maxLength={5000}
                disabled={isPending}
                className="font-mono text-sm leading-relaxed p-3.5 resize-y focus:ring-indigo-500"
              />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Aim for 2–4 concise paragraphs covering core principles and examples.</span>
                <span>{answerText.length} / 5,000 characters</span>
              </div>
            </div>
          ) : (
            /* Answered View - Show User's Submitted Answer */
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Your Submitted Answer:
              </span>
              <p className="whitespace-pre-wrap text-slate-800 dark:text-slate-200 font-mono text-xs sm:text-sm">
                {currentQuestion.user_answer}
              </p>
            </div>
          )}

          {/* Evaluating State Loader */}
          {isPending && (
            <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
              <div>
                <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                  Google Gemini Evaluating Answer...
                </p>
                <p className="text-xs text-indigo-700 dark:text-indigo-400">
                  Assessing technical accuracy, depth, completeness, and clarity against interview rubric.
                </p>
              </div>
            </div>
          )}

          {/* Feedback Card (Shown once evaluated) */}
          {isEvaluated && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              {/* Strengths & Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {currentQuestion.strengths && (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Correct Concepts Identified:
                    </span>
                    <p className="text-emerald-900 dark:text-emerald-200">
                      {currentQuestion.strengths}
                    </p>
                  </div>
                )}

                {currentQuestion.gaps && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                    <span className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Missing / Clarification Needed:
                    </span>
                    <p className="text-amber-900 dark:text-amber-200">
                      {currentQuestion.gaps}
                    </p>
                  </div>
                )}
              </div>

              {/* Actionable Advice */}
              {currentQuestion.improvement_advice && (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">
                    Coach Recommendation:
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    {currentQuestion.improvement_advice}
                  </p>
                </div>
              )}

              {/* Ideal Reference Answer Accordion */}
              {currentQuestion.improved_answer && (
                <div className="border border-indigo-100 dark:border-indigo-950 rounded-lg overflow-hidden bg-indigo-50/30 dark:bg-indigo-950/10">
                  <button
                    type="button"
                    onClick={() => setShowIdealAnswer(!showIdealAnswer)}
                    className="flex items-center justify-between w-full p-2.5 text-xs font-semibold text-indigo-900 dark:text-indigo-300 hover:bg-indigo-50/60"
                  >
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      Ideal Interview-Quality Answer
                    </span>
                    {showIdealAnswer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showIdealAnswer && (
                    <div className="p-3 text-xs leading-relaxed text-slate-800 dark:text-slate-200 bg-white/70 dark:bg-slate-900/60 border-t border-indigo-100 dark:border-indigo-950 whitespace-pre-wrap">
                      {currentQuestion.improved_answer}
                    </div>
                  )}
                </div>
              )}

              {/* Follow-Up Questions Accordion */}
              {currentQuestion.follow_up_question && (
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowFollowUps(!showFollowUps)}
                    className="flex items-center justify-between w-full p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                      Expected Follow-Up Questions to Anticipate
                    </span>
                    {showFollowUps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showFollowUps && (
                    <div className="p-3 text-xs text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 space-y-1">
                      <p>• {currentQuestion.follow_up_question}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {!isAnswered ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSubmitAnswer(true)}
                disabled={isPending}
                className="text-xs text-slate-600"
              >
                Skip Question
              </Button>

              <Button
                type="button"
                onClick={() => handleSubmitAnswer(false)}
                disabled={isPending || answerText.trim().length === 0}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-5"
              >
                {isPending ? "Evaluating..." : "Submit Answer & Evaluate"}
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500">
                {isSkipped ? "Question skipped." : "Answer evaluated by Gemini."}
              </span>

              <Button
                type="button"
                onClick={goToNext}
                disabled={isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-5 flex items-center gap-1.5"
              >
                {isLastQuestion ? "Finish & View Results" : "Next Question"}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
