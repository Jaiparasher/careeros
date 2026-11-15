"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import type { QuestionBankItem } from "@/features/interview/service";
import { INTERVIEW_TAXONOMY, getAllSkills } from "@/features/interview/taxonomy";

interface QuestionListProps {
  questions: QuestionBankItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

export function QuestionList({
  questions,
  totalCount,
  currentPage,
  pageSize,
}: QuestionListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentSkill = searchParams.get("skill") || "";
  const currentDifficulty = searchParams.get("difficulty") || "";
  const currentPriority = searchParams.get("priority") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentMode = searchParams.get("mode") || "skill";

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  function updateQuery(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "" || val === undefined) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    // Reset to page 1 if changing filters (unless specifically changing page)
    if (!("page" in updates)) {
      params.set("page", "1");
    }
    router.push(`/interview-questions?${params.toString()}`);
  }

  const availableSkills = currentCategory
    ? INTERVIEW_TAXONOMY.find((c) => c.id === currentCategory)?.skills || []
    : getAllSkills();

  return (
    <div className="space-y-4">
      {/* Search and Filter Toolbar */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
            <Input
              type="text"
              placeholder="Search questions or keywords (e.g. Garbage Collection, Redux Thunk, Kafka, Indexing)..."
              defaultValue={currentSearch}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateQuery({ search: (e.target as HTMLInputElement).value });
                }
              }}
              className="pl-9 bg-neutral-950 border-neutral-800 text-sm text-neutral-100 placeholder:text-neutral-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Mode switch */}
            <div className="flex items-center rounded-lg bg-neutral-950 p-1 border border-neutral-800 text-xs">
              <button
                type="button"
                onClick={() => updateQuery({ mode: "skill" })}
                className={`px-2.5 py-1 rounded transition ${
                  currentMode === "skill"
                    ? "bg-neutral-800 text-neutral-100 font-medium"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Skill View
              </button>
              <button
                type="button"
                onClick={() => updateQuery({ mode: "topic" })}
                className={`px-2.5 py-1 rounded transition ${
                  currentMode === "topic"
                    ? "bg-neutral-800 text-neutral-100 font-medium"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Topic View
              </button>
            </div>

            {(currentCategory ||
              currentSkill ||
              currentDifficulty ||
              currentPriority ||
              currentStatus ||
              currentSearch) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/interview-questions")}
                className="text-xs text-neutral-400 hover:text-neutral-200"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 border-t border-neutral-800/80 text-xs">
          {/* Category */}
          <select
            value={currentCategory}
            onChange={(e) => updateQuery({ category: e.target.value, skill: "" })}
            className="rounded bg-neutral-950 border border-neutral-800 text-neutral-300 p-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Categories ({INTERVIEW_TAXONOMY.length})</option>
            {INTERVIEW_TAXONOMY.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Skill */}
          <select
            value={currentSkill}
            onChange={(e) => updateQuery({ skill: e.target.value })}
            className="rounded bg-neutral-950 border border-neutral-800 text-neutral-300 p-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Skills ({availableSkills.length})</option>
            {availableSkills.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Difficulty */}
          <select
            value={currentDifficulty}
            onChange={(e) => updateQuery({ difficulty: e.target.value })}
            className="rounded bg-neutral-950 border border-neutral-800 text-neutral-300 p-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Difficulties</option>
            <option value="basic">Basic</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* Priority */}
          <select
            value={currentPriority}
            onChange={(e) => updateQuery({ priority: e.target.value })}
            className="rounded bg-neutral-950 border border-neutral-800 text-neutral-300 p-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical (Resume Core)</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status */}
          <select
            value={currentStatus}
            onChange={(e) => updateQuery({ status: e.target.value })}
            className="rounded bg-neutral-950 border border-neutral-800 text-neutral-300 p-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Statuses</option>
            <option value="not_started">Not Started</option>
            <option value="learning">Learning</option>
            <option value="attempted">Attempted</option>
            <option value="answered">Answered</option>
            <option value="needs_revision">Needs Revision</option>
            <option value="strong">Strong (Mastered)</option>
          </select>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs text-neutral-400">
        <div>
          Showing{" "}
          <strong className="text-neutral-200">
            {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{" "}
            {Math.min(currentPage * pageSize, totalCount)}
          </strong>{" "}
          of <strong className="text-neutral-200">{totalCount}</strong> questions
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <span>Page {currentPage} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => updateQuery({ page: String(currentPage - 1) })}
              className="h-7 w-7 p-0 border-neutral-800 text-neutral-300 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => updateQuery({ page: String(currentPage + 1) })}
              className="h-7 w-7 p-0 border-neutral-800 text-neutral-300 disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Questions Cards List */}
      {questions.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-10 text-center space-y-3">
          <HelpCircle className="h-8 w-8 text-neutral-500 mx-auto" />
          <h3 className="text-base font-semibold text-neutral-200">No questions found</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Try adjusting your category, skill, difficulty, or search query.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => {
            const diffColor =
              q.difficulty === "basic"
                ? "border-emerald-700/60 text-emerald-400"
                : q.difficulty === "intermediate"
                ? "border-amber-700/60 text-amber-400"
                : "border-rose-700/60 text-rose-400";

            const priorityColor =
              q.priority === "critical"
                ? "bg-red-950/80 text-red-300 border-red-800/80"
                : q.priority === "high"
                ? "bg-amber-950/80 text-amber-300 border-amber-800/80"
                : "bg-neutral-800 text-neutral-300 border-neutral-700";

            const statusBadge =
              q.status === "strong" ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Strong
                </span>
              ) : q.status === "answered" ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-cyan-400 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Answered
                </span>
              ) : q.status === "needs_revision" ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                  <AlertCircle className="h-3.5 w-3.5" /> Needs Revision
                </span>
              ) : q.status === "learning" ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-blue-400 font-medium">
                  Learning
                </span>
              ) : (
                <span className="text-[11px] text-neutral-500">Not Started</span>
              );

            return (
              <div
                key={q.id}
                className="rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-900 hover:border-neutral-700 transition p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="border-neutral-700 text-neutral-300 text-[10px]">
                      {q.skill_name}
                    </Badge>
                    <span className="text-neutral-600 text-xs">•</span>
                    <span className="text-xs text-neutral-400">{q.topic}</span>
                    <Badge variant="outline" className={`text-[10px] ${diffColor}`}>
                      {q.difficulty}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] ${priorityColor}`}>
                      {q.priority}
                    </Badge>
                    {statusBadge}
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-neutral-100 group">
                    <Link
                      href={`/interview-questions/${q.id}`}
                      className="hover:text-cyan-400 transition"
                    >
                      {q.question_title}
                    </Link>
                  </h3>

                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {q.question_prompt}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {q.estimated_minutes} min
                    </span>
                    <span>•</span>
                    <span>{q.expected_answer_points?.length || 0} rubric criteria</span>
                    <span>•</span>
                    <span>{q.follow_up_questions?.length || 0} follow-up questions</span>
                    {q.confidence_score && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400 font-medium">
                          Confidence: {q.confidence_score}/5
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 border-neutral-800 pt-3 sm:pt-0">
                  <Link
                    href={`/interview-questions/${q.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition"
                  >
                    Practice & Rubric <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs text-neutral-400">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => updateQuery({ page: String(currentPage - 1) })}
              className="border-neutral-800 text-neutral-300 text-xs disabled:opacity-40"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => updateQuery({ page: String(currentPage + 1) })}
              className="border-neutral-800 text-neutral-300 text-xs disabled:opacity-40"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
