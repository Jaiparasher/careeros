"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Star,
  Calendar,
  Save,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import type { QuestionBankItem } from "@/features/interview/service";
import { recordQuestionAnswerAction } from "@/features/interview/actions";

interface QuestionAnswerFormProps {
  question: QuestionBankItem;
}

export function QuestionAnswerForm({ question }: QuestionAnswerFormProps) {
  const [isPending, startTransition] = useTransition();

  const [status, setStatus] = useState(question.status);
  const [confidence, setConfidence] = useState<number>(question.confidence_score || 3);
  const [answerNotes, setAnswerNotes] = useState<string>(question.answer_notes || "");
  const [nextRevisionDays, setNextRevisionDays] = useState<number | undefined>(undefined);

  // Revealable sections state
  const [showRubric, setShowRubric] = useState(false);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [showFollowUps, setShowFollowUps] = useState(false);

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const diffColor =
    question.difficulty === "basic"
      ? "border-emerald-700/60 text-emerald-400"
      : question.difficulty === "intermediate"
      ? "border-amber-700/60 text-amber-400"
      : "border-rose-700/60 text-rose-400";

  const priorityColor =
    question.priority === "critical"
      ? "bg-red-950/80 text-red-300 border-red-800/80"
      : question.priority === "high"
      ? "bg-amber-950/80 text-amber-300 border-amber-800/80"
      : "bg-neutral-800 text-neutral-300 border-neutral-700";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const res = await recordQuestionAnswerAction({
        questionId: question.id,
        status,
        confidenceScore: confidence,
        answerNotes: answerNotes.trim() ? answerNotes.trim() : null,
        nextRevisionDays: nextRevisionDays || null,
      });

      if (res.success) {
        setFeedback({
          type: "success",
          message: "Progress recorded successfully! Revision date and confidence updated.",
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to record answer progress.",
        });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <Link
          href="/interview-questions"
          className="text-xs text-neutral-400 hover:text-neutral-200 inline-flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Question Bank
        </Link>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>Source: {question.source_name}</span>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-6 space-y-4">
        {/* Metadata badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-cyan-700/80 text-cyan-400 text-xs">
            {question.skill_name}
          </Badge>
          <span className="text-neutral-600 text-xs">•</span>
          <span className="text-xs font-medium text-neutral-300">{question.topic}</span>
          {question.subtopic && (
            <>
              <span className="text-neutral-600 text-xs">/</span>
              <span className="text-xs text-neutral-400">{question.subtopic}</span>
            </>
          )}
          <Badge variant="outline" className={`text-xs ${diffColor}`}>
            {question.difficulty}
          </Badge>
          <Badge variant="outline" className={`text-xs ${priorityColor}`}>
            {question.priority} priority
          </Badge>
          <div className="ml-auto flex items-center gap-1 text-xs text-neutral-400">
            <Clock className="h-3.5 w-3.5 text-neutral-500" />
            <span>{question.estimated_minutes} min target</span>
          </div>
        </div>

        {/* Title and Prompt */}
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-100 tracking-tight">
          {question.question_title}
        </h1>

        <div className="p-4 rounded-lg bg-neutral-950/80 border border-neutral-800 text-sm text-neutral-200 leading-relaxed whitespace-pre-line font-normal">
          {question.question_prompt}
        </div>
      </div>

      {/* Revealable Study Tools */}
      <div className="space-y-3">
        {/* Expected Answer Points (Rubric) */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowRubric(!showRubric)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-800/40 transition"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Expected Answer Rubric ({question.expected_answer_points.length} Key Evaluation Criteria)
            </div>
            {showRubric ? (
              <ChevronUp className="h-4 w-4 text-neutral-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            )}
          </button>

          {showRubric && (
            <div className="p-4 pt-0 border-t border-neutral-800/60 bg-neutral-950/40 space-y-2">
              <p className="text-xs text-neutral-400 mb-2">
                Evaluate your response against what top interviewers look for:
              </p>
              <ul className="space-y-2">
                {question.expected_answer_points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-neutral-300">
                    <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Concise Sample Answer */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSampleAnswer(!showSampleAnswer)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-800/40 transition"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
              <BookOpen className="h-4 w-4 text-cyan-400" />
              Concise Sample Answer & Key Explanation
            </div>
            {showSampleAnswer ? (
              <ChevronUp className="h-4 w-4 text-neutral-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            )}
          </button>

          {showSampleAnswer && (
            <div className="p-4 pt-0 border-t border-neutral-800/60 bg-neutral-950/40">
              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs sm:text-sm text-neutral-300 font-mono whitespace-pre-wrap leading-relaxed">
                {question.sample_answer || "No sample answer provided for this question."}
              </div>
            </div>
          )}
        </div>

        {/* Realistic Follow-up Questions */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowFollowUps(!showFollowUps)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-800/40 transition"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
              <MessageSquare className="h-4 w-4 text-amber-400" />
              Interviewer Follow-Up Questions ({question.follow_up_questions.length} Probable Probes)
            </div>
            {showFollowUps ? (
              <ChevronUp className="h-4 w-4 text-neutral-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            )}
          </button>

          {showFollowUps && (
            <div className="p-4 pt-0 border-t border-neutral-800/60 bg-neutral-950/40 space-y-2">
              <p className="text-xs text-neutral-400 mb-2">
                Be prepared to address these follow-ups when delivering your answer:
              </p>
              <ul className="space-y-2">
                {question.follow_up_questions.map((fu, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-amber-200/90">
                    <span className="text-amber-400 font-bold">?</span>
                    <span>{fu}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Answer & Self-Assessment Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-6 space-y-5"
      >
        <div className="border-b border-neutral-800 pb-3">
          <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            Self-Assessment & Spaced Revision
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Record your recall confidence and schedule your next revision review.
          </p>
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-lg text-xs font-medium border ${
              feedback.type === "success"
                ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                : "bg-rose-950/60 border-rose-800 text-rose-300"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Readiness Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300">Readiness Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as QuestionBankItem["status"])}
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-neutral-200 p-2.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="not_started">Not Started</option>
              <option value="learning">Learning / Researching</option>
              <option value="attempted">Attempted (Partially Recalled)</option>
              <option value="answered">Answered (Proficient)</option>
              <option value="needs_revision">Needs Revision (Forgot nuances)</option>
              <option value="strong">Strong (Mastered / Interview Ready)</option>
            </select>
          </div>

          {/* Confidence Rating (1-5) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300">
              Confidence Rating: <strong className="text-amber-400">{confidence}/5</strong>
            </label>
            <div className="flex items-center gap-2 pt-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setConfidence(star)}
                  className="p-1 text-neutral-600 hover:text-amber-400 transition"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= confidence
                        ? "fill-amber-400 text-amber-400"
                        : "text-neutral-700 hover:text-amber-400"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Spaced Revision Scheduling */}
        <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
          <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-cyan-400" />
            Schedule Spaced Revision
          </label>
          <p className="text-[11px] text-neutral-400 mb-2">
            Automatically surfaces this question in your Daily Planner when revision is due.
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "None", days: undefined },
              { label: "1 Day (Tomorrow)", days: 1 },
              { label: "3 Days", days: 3 },
              { label: "7 Days (1 Week)", days: 7 },
              { label: "14 Days (2 Weeks)", days: 14 },
              { label: "30 Days (1 Month)", days: 30 },
            ].map((opt) => {
              const isSelected = nextRevisionDays === opt.days;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setNextRevisionDays(opt.days)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                    isSelected
                      ? "border-cyan-500 bg-cyan-950/60 text-cyan-300 font-semibold"
                      : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {question.next_revision_at && (
            <p className="text-[11px] text-neutral-500 pt-1">
              Currently scheduled revision:{" "}
              <strong className="text-neutral-300">{question.next_revision_at}</strong>
            </p>
          )}
        </div>

        {/* Answer Notes / Personal Cheat Sheet */}
        <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
          <label className="text-xs font-medium text-neutral-300">
            Personal Notes, Mnemonics & Key Talking Points
          </label>
          <Textarea
            value={answerNotes}
            onChange={(e) => setAnswerNotes(e.target.value)}
            placeholder="Write your own explanation, key phrases, caveats, or trade-offs in your own words..."
            rows={5}
            className="bg-neutral-950 border-neutral-800 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-cyan-500"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-5 py-2 inline-flex items-center gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            {isPending ? "Saving..." : "Save Assessment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
