"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RecordAttemptModal } from "./record-attempt-modal";
import type { DSAQuestionRow } from "@/features/dsa/service";

interface DSATableProps {
  questions: DSAQuestionRow[];
  total: number;
  page: number;
}

const PAGE_SIZE = 25;

function DifficultyBadge({ difficulty }: { difficulty: DSAQuestionRow["difficulty"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        difficulty === "easy" && "bg-green-400/10 text-green-400",
        difficulty === "medium" && "bg-yellow-400/10 text-yellow-400",
        difficulty === "hard" && "bg-red-400/10 text-red-400"
      )}
    >
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </span>
  );
}

function StatusBadge({ status }: { status: DSAQuestionRow["status"] }) {
  const labels: Record<DSAQuestionRow["status"], string> = {
    not_started: "Not Started",
    attempted: "Attempted",
    solved: "Solved",
    needs_revision: "Needs Revision",
    archived: "Archived",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        status === "not_started" && "bg-neutral-800 text-neutral-400",
        status === "attempted" && "bg-blue-400/10 text-blue-400",
        status === "solved" && "bg-green-400/10 text-green-400",
        status === "needs_revision" && "bg-orange-400/10 text-orange-400",
        status === "archived" && "bg-neutral-800 text-neutral-500"
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function DSATable({ questions, total, page }: DSATableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-12 text-center">
        <p className="text-neutral-400">No questions found.</p>
        <p className="mt-1 text-sm text-neutral-500">
          Add your first problem or Sync Grind 75 to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Table — desktop */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-900/80">
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-12">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-24">
                Difficulty
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Topics / Patterns
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-32">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-28">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider w-28">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {questions.map((q, idx) => {
              const rowNum = q.collection_order ?? (page - 1) * PAGE_SIZE + idx + 1;
              const patterns = q.patterns ?? [];
              return (
                <tr
                  key={q.id}
                  className="bg-neutral-950/40 hover:bg-neutral-900/60 transition-colors"
                >
                  <td className="px-4 py-3 text-xs text-neutral-500 font-mono">{rowNum}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dsa/${q.id}`}
                        className="font-medium text-neutral-100 hover:text-white hover:underline"
                      >
                        {q.title}
                      </Link>
                      {q.url && (
                        <a
                          href={q.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neutral-500 hover:text-neutral-300"
                          title="Open on LeetCode"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <DifficultyBadge difficulty={q.difficulty} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {patterns.slice(0, 3).map((t) => (
                        <Badge
                          key={t}
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 border-neutral-700 text-neutral-400"
                        >
                          {t}
                        </Badge>
                      ))}
                      {patterns.length > 3 && (
                        <span className="text-[10px] text-neutral-500">
                          +{patterns.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={q.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-400">
                    {formatDate(q.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RecordAttemptModal questionId={q.id} questionTitle={q.title} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-2">
        {questions.map((q, idx) => {
          const rowNum = q.collection_order ?? (page - 1) * PAGE_SIZE + idx + 1;
          const patterns = q.patterns ?? [];
          return (
            <div
              key={q.id}
              className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs text-neutral-500 font-mono shrink-0">{rowNum}.</span>
                  <Link
                    href={`/dsa/${q.id}`}
                    className="font-medium text-neutral-100 hover:underline truncate"
                  >
                    {q.title}
                  </Link>
                  {q.url && (
                    <a
                      href={q.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-500 hover:text-neutral-300 shrink-0"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                <DifficultyBadge difficulty={q.difficulty} />
              </div>
              <div className="flex flex-wrap gap-1">
                {patterns.slice(0, 4).map((t) => (
                  <Badge
                    key={t}
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 border-neutral-700 text-neutral-400"
                  >
                    {t}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  <StatusBadge status={q.status} />
                  <span>{formatDate(q.created_at)}</span>
                </div>
                <RecordAttemptModal questionId={q.id} questionTitle={q.title} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-neutral-500">
            Page {page} of {totalPages} &bull; {total} questions
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </button>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
