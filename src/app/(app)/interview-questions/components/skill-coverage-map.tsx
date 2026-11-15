"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Layers } from "lucide-react";
import { INTERVIEW_TAXONOMY } from "@/features/interview/taxonomy";

interface SkillCoverageMapProps {
  categoryStats: {
    categoryId: string;
    categoryName: string;
    total: number;
    answered: number;
  }[];
}

export function SkillCoverageMap({ categoryStats }: SkillCoverageMapProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedCategory = searchParams.get("category") || "";
  const selectedSkill = searchParams.get("skill") || "";

  const totalQuestions = categoryStats.reduce((sum, c) => sum + c.total, 0);
  const totalAnswered = categoryStats.reduce((sum, c) => sum + c.answered, 0);
  const overallPercent = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  function updateQuery(category?: string, skill?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }

    if (skill) {
      params.set("skill", skill);
    } else {
      params.delete("skill");
    }

    params.set("page", "1");
    router.push(`/interview-questions?${params.toString()}`);
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            Resume Skill Taxonomy & Readiness Coverage
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            42 skills across 11 technical categories • Tracked independently from course completion
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-neutral-400">Total Prepared:</span>{" "}
            <span className="font-mono text-sm font-bold text-emerald-400">
              {totalAnswered} / {totalQuestions}
            </span>{" "}
            <span className="text-xs text-neutral-500">({overallPercent}%)</span>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded bg-neutral-800/80 hover:bg-neutral-800 transition"
          >
            {isExpanded ? (
              <>
                Collapse <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                All Skills ({42}) <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Category Pills & Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {categoryStats.map((cat) => {
          const isSelected = selectedCategory === cat.categoryId;
          const percent = cat.total > 0 ? Math.round((cat.answered / cat.total) * 100) : 0;
          const taxCat = INTERVIEW_TAXONOMY.find((t) => t.id === cat.categoryId);

          return (
            <div
              key={cat.categoryId}
              className={`rounded-lg p-2.5 border transition cursor-pointer ${
                isSelected
                  ? "border-cyan-500/80 bg-neutral-800/90 ring-1 ring-cyan-500/50"
                  : "border-neutral-800/80 bg-neutral-950/60 hover:border-neutral-700"
              }`}
              onClick={() => {
                if (isSelected) {
                  updateQuery(undefined, undefined);
                } else {
                  updateQuery(cat.categoryId, undefined);
                }
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-medium text-neutral-200 truncate">
                  {cat.categoryName}
                </span>
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] px-1.5 py-0 border-neutral-700 text-neutral-400"
                >
                  {cat.answered}/{cat.total}
                </Badge>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Expanded Skills under this Category */}
              {isExpanded && taxCat && (
                <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-neutral-800/60">
                  {taxCat.skills.map((s) => {
                    const isSkillSelected = selectedSkill === s.slug;
                    return (
                      <button
                        key={s.slug}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isSkillSelected) {
                            updateQuery(cat.categoryId, undefined);
                          } else {
                            updateQuery(cat.categoryId, s.slug);
                          }
                        }}
                        className={`text-[10px] px-1.5 py-0.5 rounded transition ${
                          isSkillSelected
                            ? "bg-cyan-600 text-white font-medium"
                            : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                        }`}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
