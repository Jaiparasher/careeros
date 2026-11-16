"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mic,
  CheckCircle2,
  Save,
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  HelpCircle,
  Layers,
  Flame,
  Scale,
} from "lucide-react";
import { updateInterviewPrepAction } from "@/features/projects/actions";
import type { ProjectRecord } from "@/features/projects/service";

interface InterviewPrepTabProps {
  project: ProjectRecord;
}

export function InterviewPrepTab({ project }: InterviewPrepTabProps) {
  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState(false);

  const existingPrep = (project.interview_prep || {}) as {
    elevator_pitch_1min?: string;
    architecture_deep_dive_5min?: string;
    challenges_and_solutions?: string;
    tradeoffs_and_decisions?: string;
    interviewer_followups?: string[];
  };

  const [formData, setFormData] = useState({
    elevator_pitch_1min: existingPrep.elevator_pitch_1min || "",
    architecture_deep_dive_5min: existingPrep.architecture_deep_dive_5min || "",
    challenges_and_solutions:
      existingPrep.challenges_and_solutions || project.challenges || "",
    tradeoffs_and_decisions: existingPrep.tradeoffs_and_decisions || "",
    interviewer_followups: existingPrep.interviewer_followups || [],
  });

  const [newQuestion, setNewQuestion] = useState("");

  function handleAddFollowUp() {
    if (!newQuestion.trim()) return;
    setFormData((prev) => ({
      ...prev,
      interviewer_followups: [...prev.interviewer_followups, newQuestion.trim()],
    }));
    setNewQuestion("");
  }

  function handleRemoveFollowUp(index: number) {
    setFormData((prev) => ({
      ...prev,
      interviewer_followups: prev.interviewer_followups.filter((_, i) => i !== index),
    }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg(false);

    startTransition(async () => {
      const res = await updateInterviewPrepAction(project.id, formData);
      if (res.success) {
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 3000);
      }
    });
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
            <Mic className="h-4 w-4 text-emerald-400" />
            Interview Story & Technical Defense
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Prepare elevator pitches, 5-minute technical deep dives, and anticipated interviewer follow-up questions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {successMsg && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Saved!
            </span>
          )}
          <Button
            type="submit"
            disabled={isPending}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Interview Prep
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* 1-Minute Elevator Pitch */}
        <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2">
          <Label className="text-xs font-medium text-neutral-200 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            1-Minute Elevator Pitch
          </Label>
          <p className="text-[11px] text-neutral-400">
            Hook the interviewer: what problem does this solve, who uses it, your role, and key technologies.
          </p>
          <Textarea
            value={formData.elevator_pitch_1min}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, elevator_pitch_1min: e.target.value }))
            }
            rows={5}
            placeholder="e.g. Lovable is an autonomous full-stack software engineer agent built in Spring Boot and React..."
            className="bg-neutral-950 border-neutral-800 text-xs font-sans resize-y"
          />
        </div>

        {/* 5-Minute Architecture Deep Dive */}
        <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2">
          <Label className="text-xs font-medium text-neutral-200 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            5-Minute Architecture Deep Dive
          </Label>
          <p className="text-[11px] text-neutral-400">
            Explain the request lifecycle, decoupling, database interactions, async jobs, and state management.
          </p>
          <Textarea
            value={formData.architecture_deep_dive_5min}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                architecture_deep_dive_5min: e.target.value,
              }))
            }
            rows={5}
            placeholder="e.g. When a user submits a prompt, the orchestrator triggers an agentic pipeline with SSE streaming..."
            className="bg-neutral-950 border-neutral-800 text-xs font-sans resize-y"
          />
        </div>

        {/* Hardest Technical Challenges & Solutions */}
        <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2">
          <Label className="text-xs font-medium text-neutral-200 flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-rose-400" />
            Hardest Technical Challenges & Solutions (STAR method)
          </Label>
          <p className="text-[11px] text-neutral-400">
            Situation, Task, Action, and Measurable Result for 1–2 tough engineering hurdles.
          </p>
          <Textarea
            value={formData.challenges_and_solutions}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                challenges_and_solutions: e.target.value,
              }))
            }
            rows={5}
            placeholder="e.g. Handling large code diffs without exceeding token limits or breaking AST validation..."
            className="bg-neutral-950 border-neutral-800 text-xs font-sans resize-y"
          />
        </div>

        {/* Trade-offs & Key Decisions */}
        <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2">
          <Label className="text-xs font-medium text-neutral-200 flex items-center gap-1.5">
            <Scale className="h-3.5 w-3.5 text-purple-400" />
            Trade-offs & Key Architectural Decisions
          </Label>
          <p className="text-[11px] text-neutral-400">
            Why X over Y? (e.g. PostgreSQL pgvector vs Pinecone, SSE vs WebSockets, polling vs events).
          </p>
          <Textarea
            value={formData.tradeoffs_and_decisions}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                tradeoffs_and_decisions: e.target.value,
              }))
            }
            rows={5}
            placeholder="e.g. Chose PostgreSQL + pgvector to keep transactional data and vector embeddings in a single ACID store..."
            className="bg-neutral-950 border-neutral-800 text-xs font-sans resize-y"
          />
        </div>
      </div>

      {/* Anticipated Interviewer Follow-Up Questions */}
      <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 space-y-3">
        <div>
          <Label className="text-xs font-medium text-neutral-200 flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
            Anticipated Interviewer Follow-Up Questions
          </Label>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Collect tough questions interviewers are likely to ask during system design or project rounds.
          </p>
        </div>

        {/* Add question form */}
        <div className="flex gap-2">
          <Input
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddFollowUp();
              }
            }}
            placeholder="Add an interviewer question (e.g. 'How do you handle transactional rollback if file write fails?')"
            className="bg-neutral-950 border-neutral-800 text-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddFollowUp}
            className="border-neutral-700 text-xs shrink-0 gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>

        {/* List of questions */}
        <div className="space-y-2 mt-3">
          {formData.interviewer_followups.length === 0 ? (
            <p className="text-xs text-neutral-500 italic py-2">
              No follow-up questions added yet. Add common questions interviewers might ask about this project.
            </p>
          ) : (
            formData.interviewer_followups.map((q, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-3 p-2.5 rounded bg-neutral-950 border border-neutral-800/80 text-xs text-neutral-300"
              >
                <div className="flex items-start gap-2">
                  <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50 mt-0.5">
                    Q{idx + 1}
                  </span>
                  <span>{q}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFollowUp(idx)}
                  className="text-neutral-500 hover:text-rose-400 transition-colors p-1"
                  aria-label="Remove question"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </form>
  );
}
