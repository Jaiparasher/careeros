"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  AlertTriangle,
  Search,
  Star,
  ShieldCheck,
  Save,
} from "lucide-react";
import {
  updateTopicAssessmentAction,
  seedDefaultTopicsAction,
} from "@/features/learning/actions";
import type { LearningTopic } from "@/features/learning/service";

interface TopicMatrixProps {
  initialTopics: LearningTopic[];
}

export function TopicMatrix({ initialTopics }: TopicMatrixProps) {
  const [topics, setTopics] = useState<LearningTopic[]>(initialTopics);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editConfidence, setEditConfidence] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<LearningTopic["assessment_status"]>("not_assessed");
  const [editReady, setEditReady] = useState<boolean>(false);
  const [editNotes, setEditNotes] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories = Array.from(new Set(topics.map((t) => t.category))).sort();

  const filtered = topics.filter((t) => {
    if (selectedCategory !== "all" && t.category !== selectedCategory) return false;
    if (
      searchQuery.trim() &&
      !t.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    ) {
      return false;
    }
    return true;
  });

  const assessedCount = topics.filter((t) => t.assessment_status !== "not_assessed").length;
  const readyCount = topics.filter((t) => Boolean(t.interview_ready)).length;

  function handleStartEdit(topic: LearningTopic) {
    setEditingId(topic.id);
    setEditConfidence(topic.confidence_score ?? null);
    setEditStatus(topic.assessment_status);
    setEditReady(Boolean(topic.interview_ready));
    setEditNotes(topic.evidence_notes ?? "");
    setErrorMsg(null);
  }

  function handleSave(topicId: string) {
    startTransition(async () => {
      setErrorMsg(null);
      const res = await updateTopicAssessmentAction({
        topicId,
        confidenceScore: editConfidence,
        assessmentStatus: editStatus,
        interviewReady: editReady,
        evidenceNotes: editNotes || null,
      });

      if (!res.success) {
        setErrorMsg(res.error);
        return;
      }

      setTopics((prev) =>
        prev.map((t) =>
          t.id === topicId
            ? {
                ...t,
                confidence_score: editConfidence,
                assessment_status: editStatus,
                interview_ready: editReady,
                evidence_notes: editNotes || null,
              }
            : t
        )
      );
      setEditingId(null);
    });
  }

  function handleSeedDefault() {
    startTransition(async () => {
      setErrorMsg(null);
      const res = await seedDefaultTopicsAction();
      if (!res.success) {
        setErrorMsg(res.error);
        return;
      }
      window.location.reload();
    });
  }

  if (topics.length === 0) {
    return (
      <Card className="border-neutral-800 bg-neutral-900 text-neutral-100 p-8 text-center space-y-4">
        <Sparkles className="h-8 w-8 text-amber-400 mx-auto" />
        <div>
          <h3 className="text-base font-semibold text-neutral-100">
            No Topics Seeded Yet
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1">
            Initialize the topic confidence matrix from your confirmed resume skill
            catalog to track interview readiness separately from course completion (Rule 8).
          </p>
        </div>
        <Button
          onClick={handleSeedDefault}
          disabled={isPending}
          className="bg-amber-600 hover:bg-amber-500 text-neutral-900 font-semibold"
        >
          {isPending ? "Seeding..." : "Seed Topics from Resume Catalog"}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Rule 8 Compliance Callout Banner */}
      <div className="bg-amber-950/30 border border-amber-900/60 rounded-lg p-3 text-xs text-amber-300 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-200">
            Rule 8: Course Completion ≠ Interview Readiness.
          </span>{" "}
          Topic assessment is strictly decoupled from course progress. Achieving 100% on a
          Coding Shuttle module does not mark topics interview-ready until verified by your
          own confidence score and mock interview evidence.
        </div>
      </div>

      {/* Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Total Inventory
          </span>
          <div className="text-xl font-bold text-neutral-100">{topics.length} Topics</div>
          <span className="text-[10px] text-neutral-400">Across {categories.length} skill domains</span>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Assessed Topics
          </span>
          <div className="text-xl font-bold text-amber-400">
            {assessedCount} / {topics.length}
          </div>
          <span className="text-[10px] text-neutral-400">
            {Math.round((assessedCount / (topics.length || 1)) * 100)}% evaluated
          </span>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Interview Ready
          </span>
          <div className="text-xl font-bold text-emerald-400">
            {readyCount} Topics
          </div>
          <span className="text-[10px] text-neutral-400">Validated for technical interviews</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-500" />
          <Input
            type="text"
            placeholder="Search topics (e.g. 'Garbage Collection', 'AOP')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-neutral-900 border-neutral-800 text-neutral-200"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-8 text-xs bg-neutral-900 border border-neutral-800 rounded-md px-2 text-neutral-200"
        >
          <option value="all">All Domains ({topics.length})</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c} ({topics.filter((t) => t.category === c).length})
            </option>
          ))}
        </select>
      </div>

      {errorMsg && (
        <div className="bg-red-950/40 border border-red-800 text-red-300 px-3 py-2 rounded text-xs">
          {errorMsg}
        </div>
      )}

      {/* Topics List */}
      <div className="space-y-2">
        {filtered.map((topic) => {
          const isEditing = editingId === topic.id;

          return (
            <Card
              key={topic.id}
              className="border-neutral-800 bg-neutral-900 text-neutral-100"
            >
              <CardContent className="p-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-neutral-200">
                        {topic.name}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] border-neutral-700 text-neutral-400"
                      >
                        {topic.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          topic.priority === "high"
                            ? "border-red-900 text-red-400 bg-red-950/20"
                            : topic.priority === "low"
                            ? "border-neutral-800 text-neutral-500"
                            : "border-amber-900 text-amber-400 bg-amber-950/20"
                        }`}
                      >
                        {topic.priority} priority
                      </Badge>
                    </div>

                    {topic.evidence_notes && !isEditing && (
                      <p className="text-xs text-neutral-400 italic">
                        Evidence: {topic.evidence_notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {!isEditing ? (
                      <>
                        <div className="flex items-center gap-1 text-xs">
                          {topic.confidence_score ? (
                            <span className="flex items-center text-amber-400 font-mono font-bold">
                              {topic.confidence_score}
                              <Star className="h-3 w-3 fill-amber-400 ml-0.5" />
                            </span>
                          ) : (
                            <span className="text-neutral-500 text-[10px]">Unrated</span>
                          )}
                        </div>

                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            topic.assessment_status === "strong"
                              ? "border-emerald-700 text-emerald-400 bg-emerald-950/20"
                              : topic.assessment_status === "progressing"
                              ? "border-cyan-700 text-cyan-400 bg-cyan-950/20"
                              : topic.assessment_status === "needs_work"
                              ? "border-amber-700 text-amber-400 bg-amber-950/20"
                              : "border-neutral-800 text-neutral-500"
                          }`}
                        >
                          {topic.assessment_status.replace("_", " ")}
                        </Badge>

                        {topic.interview_ready && (
                          <Badge className="bg-emerald-900/60 text-emerald-300 border border-emerald-700 text-[10px] flex items-center gap-0.5">
                            <ShieldCheck className="h-3 w-3" /> Ready
                          </Badge>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(topic)}
                          className="h-6 text-xs text-neutral-400 hover:text-neutral-200 px-2"
                        >
                          Assess
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSave(topic.id)}
                          disabled={isPending}
                          className="h-6 text-xs bg-amber-600 hover:bg-amber-500 text-neutral-900 font-semibold flex items-center gap-1"
                        >
                          <Save className="h-3 w-3" /> Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(null)}
                          disabled={isPending}
                          className="h-6 text-xs text-neutral-400 hover:text-neutral-200"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-3 pt-3 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-neutral-400 block mb-1">
                        Confidence Score (1-5):
                      </label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setEditConfidence(val)}
                            className={`p-1 rounded ${
                              (editConfidence ?? 0) >= val
                                ? "text-amber-400"
                                : "text-neutral-600 hover:text-neutral-400"
                            }`}
                          >
                            <Star
                              className={`h-4 w-4 ${
                                (editConfidence ?? 0) >= val ? "fill-amber-400" : ""
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-neutral-400 block mb-1">
                        Assessment Status:
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) =>
                          setEditStatus(e.target.value as LearningTopic["assessment_status"])
                        }
                        className="h-7 w-full text-xs bg-neutral-800 border border-neutral-700 rounded px-2 text-neutral-200"
                      >
                        <option value="not_assessed">Not Assessed</option>
                        <option value="needs_work">Needs Work</option>
                        <option value="progressing">Progressing</option>
                        <option value="strong">Strong</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <input
                        type="checkbox"
                        id={`ready-${topic.id}`}
                        checked={editReady}
                        onChange={(e) => setEditReady(e.target.checked)}
                        className="accent-emerald-500 rounded"
                      />
                      <label
                        htmlFor={`ready-${topic.id}`}
                        className="text-neutral-200 font-medium cursor-pointer"
                      >
                        Interview Ready
                      </label>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-neutral-400 block mb-1">
                        Evidence / Notes (e.g. solved questions, mock interview results):
                      </label>
                      <Input
                        type="text"
                        placeholder="Add assessment evidence..."
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="h-7 text-xs bg-neutral-800 border-neutral-700 text-neutral-200"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
