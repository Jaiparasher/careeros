"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  Plus,
  X,
  Loader2,
  Trash2,
  Edit3,
  Clock,
  User,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  createInterviewRoundAction,
  updateInterviewRoundAction,
  deleteInterviewRoundAction,
} from "@/features/applications/actions";
import {
  type InterviewResult,
} from "@/features/applications/schema";
import type { InterviewRoundRecord } from "@/features/applications/service";

interface InterviewRoundsTabProps {
  applicationId: string;
  rounds: InterviewRoundRecord[];
}

const resultStyles: Record<InterviewResult, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-neutral-800 text-neutral-300 border-neutral-700",
  },
  passed: {
    label: "Passed",
    className: "bg-emerald-950/70 text-emerald-300 border-emerald-800",
  },
  failed: {
    label: "Failed",
    className: "bg-rose-950/70 text-rose-300 border-rose-800",
  },
  rescheduled: {
    label: "Rescheduled",
    className: "bg-amber-950/70 text-amber-300 border-amber-800",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-neutral-900 text-neutral-500 border-neutral-800",
  },
};

export function InterviewRoundsTab({
  applicationId,
  rounds,
}: InterviewRoundsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRound, setEditingRound] = useState<InterviewRoundRecord | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    round_number: rounds.length + 1,
    round_name: "",
    interview_at: "",
    interviewer_name: "",
    interviewer_title: "",
    topics: "",
    questions_asked: "",
    performance_notes: "",
    result: "pending" as InterviewResult,
    follow_up_notes: "",
  });

  function openCreateModal() {
    setEditingRound(null);
    setFormData({
      round_number: rounds.length + 1,
      round_name: `Round ${rounds.length + 1}`,
      interview_at: "",
      interviewer_name: "",
      interviewer_title: "",
      topics: "",
      questions_asked: "",
      performance_notes: "",
      result: "pending",
      follow_up_notes: "",
    });
    setError(null);
    setIsModalOpen(true);
  }

  function openEditModal(round: InterviewRoundRecord) {
    setEditingRound(round);
    setFormData({
      round_number: round.round_number,
      round_name: round.round_name,
      interview_at: round.interview_at
        ? new Date(round.interview_at).toISOString().slice(0, 16)
        : "",
      interviewer_name: round.interviewer_name || "",
      interviewer_title: round.interviewer_title || "",
      topics: (round.topics || []).join(", "),
      questions_asked: (round.questions_asked || []).join("\n"),
      performance_notes: round.performance_notes || "",
      result: round.result,
      follow_up_notes: round.follow_up_notes || "",
    });
    setError(null);
    setIsModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const topicsArray = formData.topics
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const questionsArray = formData.questions_asked
      .split("\n")
      .map((q) => q.trim())
      .filter(Boolean);

    startTransition(async () => {
      let res;
      if (editingRound) {
        res = await updateInterviewRoundAction(applicationId, editingRound.id, {
          round_number: formData.round_number,
          round_name: formData.round_name,
          interview_at: formData.interview_at ? new Date(formData.interview_at).toISOString() : null,
          interviewer_name: formData.interviewer_name,
          interviewer_title: formData.interviewer_title,
          topics: topicsArray,
          questions_asked: questionsArray,
          performance_notes: formData.performance_notes,
          result: formData.result,
          follow_up_notes: formData.follow_up_notes,
        });
      } else {
        res = await createInterviewRoundAction(applicationId, {
          round_number: formData.round_number,
          round_name: formData.round_name,
          interview_at: formData.interview_at ? new Date(formData.interview_at).toISOString() : null,
          interviewer_name: formData.interviewer_name,
          interviewer_title: formData.interviewer_title,
          topics: topicsArray,
          questions_asked: questionsArray,
          performance_notes: formData.performance_notes,
          result: formData.result,
          follow_up_notes: formData.follow_up_notes,
        });
      }

      if (!res.success) {
        setError(res.error || "Failed to save interview round");
      } else {
        setIsModalOpen(false);
        router.refresh();
      }
    });
  }

  function handleDelete(roundId: string) {
    if (!confirm("Are you sure you want to delete this interview round?")) return;
    startTransition(async () => {
      await deleteInterviewRoundAction(applicationId, roundId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-emerald-400" />
            Interview Rounds & Feedback
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Log technical topics, questions asked, self-assessment notes, and round outcomes.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Interview Round
        </Button>
      </div>

      {/* Rounds List */}
      {rounds.length === 0 ? (
        <div className="p-8 text-center text-xs text-neutral-500 rounded-lg bg-neutral-900/40 border border-neutral-800 space-y-2">
          <CalendarCheck className="h-6 w-6 text-neutral-600 mx-auto" />
          <p>No interview rounds logged yet for this application.</p>
          <p className="text-[11px] text-neutral-600">
            Click &quot;Add Interview Round&quot; when a recruiter screening or technical discussion is scheduled.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rounds.map((round) => {
            const resultConfig = resultStyles[round.result] || resultStyles.pending;

            return (
              <div
                key={round.id}
                className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3"
              >
                {/* Round header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        Round {round.round_number}:
                      </span>
                      <span className="text-sm font-semibold text-neutral-100">
                        {round.round_name}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${resultConfig.className}`}
                      >
                        {resultConfig.label}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                      {round.interview_at && (
                        <span className="flex items-center gap-1 text-cyan-400">
                          <Clock className="h-3 w-3" />
                          {new Date(round.interview_at).toLocaleString()}
                        </span>
                      )}
                      {round.interviewer_name && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {round.interviewer_name}
                          {round.interviewer_title && ` (${round.interviewer_title})`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(round)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-200 transition rounded"
                      title="Edit Round"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(round.id)}
                      className="p-1.5 text-neutral-500 hover:text-rose-400 transition rounded"
                      title="Delete Round"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Topics Covered */}
                {round.topics && round.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {round.topics.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded bg-neutral-950 text-neutral-300 border border-neutral-800"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Questions Asked */}
                {round.questions_asked && round.questions_asked.length > 0 && (
                  <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800/80 space-y-1.5">
                    <span className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5">
                      <HelpCircle className="h-3 w-3 text-cyan-400" />
                      Questions Asked
                    </span>
                    <ul className="space-y-1 text-xs text-neutral-300 list-disc list-inside">
                      {round.questions_asked.map((q, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Performance Notes */}
                {round.performance_notes && (
                  <div className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/40 p-2.5 rounded border border-neutral-850">
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase block mb-1">
                      Self-Reflection & Notes
                    </span>
                    {round.performance_notes}
                  </div>
                )}

                {/* Follow-up notes */}
                {round.follow_up_notes && (
                  <div className="text-xs text-amber-300/90 leading-relaxed bg-amber-950/10 p-2.5 rounded border border-amber-900/30">
                    <span className="text-[10px] font-semibold text-amber-500 uppercase block mb-0.5">
                      Follow-Up Action Items
                    </span>
                    {round.follow_up_notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h2 className="text-sm font-semibold text-neutral-100">
                {editingRound ? "Edit Interview Round" : "Add Interview Round"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-200 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 text-xs flex-1">
              {error && (
                <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-neutral-300">Round #</Label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={formData.round_number}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, round_number: Number(e.target.value) }))
                    }
                    className="bg-neutral-950 border-neutral-800 text-xs h-8"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <Label className="text-neutral-300">Round Name *</Label>
                  <Input
                    required
                    placeholder="e.g. Technical Round 1 - DSA & Java"
                    value={formData.round_name}
                    onChange={(e) => setFormData((p) => ({ ...p, round_name: e.target.value }))}
                    className="bg-neutral-950 border-neutral-800 text-xs h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-neutral-300">Interview Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.interview_at}
                    onChange={(e) => setFormData((p) => ({ ...p, interview_at: e.target.value }))}
                    className="bg-neutral-950 border-neutral-800 text-xs h-8"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-neutral-300">Outcome / Result</Label>
                  <select
                    value={formData.result}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, result: e.target.value as InterviewResult }))
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1 text-xs text-neutral-200 h-8"
                  >
                    <option value="pending">Pending</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                    <option value="rescheduled">Rescheduled</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-neutral-300">Interviewer Name</Label>
                  <Input
                    placeholder="e.g. S. Sen"
                    value={formData.interviewer_name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, interviewer_name: e.target.value }))
                    }
                    className="bg-neutral-950 border-neutral-800 text-xs h-8"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-neutral-300">Interviewer Title</Label>
                  <Input
                    placeholder="e.g. Staff Engineer"
                    value={formData.interviewer_title}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, interviewer_title: e.target.value }))
                    }
                    className="bg-neutral-950 border-neutral-800 text-xs h-8"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-neutral-300">Topics Covered (comma-separated)</Label>
                <Input
                  placeholder="e.g. Multithreading, Spring Boot, LRU Cache, REST idempotency"
                  value={formData.topics}
                  onChange={(e) => setFormData((p) => ({ ...p, topics: e.target.value }))}
                  className="bg-neutral-950 border-neutral-800 text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-neutral-300">Questions Asked (one per line)</Label>
                <Textarea
                  rows={3}
                  placeholder="e.g.
1. Implement a thread-safe singleton in Java
2. Explain difference between Optimistic vs Pessimistic locking in Hibernate"
                  value={formData.questions_asked}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, questions_asked: e.target.value }))
                  }
                  className="bg-neutral-950 border-neutral-800 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-neutral-300">Performance Notes & Feedback</Label>
                <Textarea
                  rows={2}
                  placeholder="How did you perform? What went well and what felt weak?"
                  value={formData.performance_notes}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, performance_notes: e.target.value }))
                  }
                  className="bg-neutral-950 border-neutral-800 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-neutral-300">Follow-up Action Notes</Label>
                <Input
                  placeholder="e.g. Send thank you note; revise Kafka partition rebalancing"
                  value={formData.follow_up_notes}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, follow_up_notes: e.target.value }))
                  }
                  className="bg-neutral-950 border-neutral-800 text-xs h-8"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs text-neutral-400"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1"
                >
                  {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                  {editingRound ? "Save Changes" : "Create Round"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
