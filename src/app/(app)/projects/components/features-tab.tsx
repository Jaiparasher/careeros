"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, X, Trash2, Edit3, Loader2 } from "lucide-react";
import {
  createFeatureAction,
  updateFeatureAction,
  deleteFeatureAction,
} from "@/features/projects/actions";
import type { ProjectFeatureRecord } from "@/features/projects/service";

interface FeaturesTabProps {
  projectId: string;
  features: ProjectFeatureRecord[];
}

export function FeaturesTab({ projectId, features }: FeaturesTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<ProjectFeatureRecord | null>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "planned" as "planned" | "in_progress" | "implemented" | "blocked" | "done",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    category: "feature" as "feature" | "bug" | "improvement" | "infrastructure",
    tech_used: "",
    notes: "",
    estimated_completion_date: "",
    actual_completion_date: "",
  });

  function openCreateModal() {
    setEditingFeature(null);
    setFormData({
      title: "",
      description: "",
      status: "planned",
      priority: "medium",
      category: "feature",
      tech_used: "",
      notes: "",
      estimated_completion_date: "",
      actual_completion_date: "",
    });
    setIsModalOpen(true);
  }

  function openEditModal(f: ProjectFeatureRecord) {
    setEditingFeature(f);
    setFormData({
      title: f.title,
      description: f.description || "",
      status: f.status,
      priority: f.priority,
      category: f.category,
      tech_used: (f.tech_used || []).join(", "),
      notes: f.notes || "",
      estimated_completion_date: f.estimated_completion_date || "",
      actual_completion_date: f.actual_completion_date || "",
    });
    setIsModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const techArray = formData.tech_used
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    startTransition(async () => {
      if (editingFeature) {
        await updateFeatureAction(projectId, editingFeature.id, {
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          category: formData.category,
          tech_used: techArray,
          notes: formData.notes,
          estimated_completion_date: formData.estimated_completion_date || null,
          actual_completion_date: formData.actual_completion_date || null,
        });
      } else {
        await createFeatureAction(projectId, {
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          category: formData.category,
          tech_used: techArray,
          notes: formData.notes,
          estimated_completion_date: formData.estimated_completion_date || null,
          actual_completion_date: formData.actual_completion_date || null,
        });
      }
      setIsModalOpen(false);
    });
  }

  function handleDelete(featureId: string) {
    if (confirm("Are you sure you want to delete this feature?")) {
      startTransition(async () => {
        await deleteFeatureAction(projectId, featureId);
      });
    }
  }

  function handleQuickStatusChange(
    featureId: string,
    newStatus: "planned" | "in_progress" | "implemented" | "blocked" | "done"
  ) {
    startTransition(async () => {
      await updateFeatureAction(projectId, featureId, { status: newStatus });
    });
  }

  const statusBadges: Record<string, { label: string; className: string }> = {
    planned: { label: "Planned", className: "bg-neutral-800 text-neutral-300 border-neutral-700" },
    in_progress: { label: "In Progress", className: "bg-blue-950/80 text-blue-300 border-blue-800" },
    implemented: { label: "Implemented", className: "bg-purple-950/80 text-purple-300 border-purple-800" },
    done: { label: "Done", className: "bg-emerald-950/80 text-emerald-300 border-emerald-800" },
    blocked: { label: "Blocked", className: "bg-red-950/80 text-red-300 border-red-800" },
  };

  const priorityBadges: Record<string, { label: string; className: string }> = {
    low: { label: "Low", className: "text-neutral-400" },
    medium: { label: "Medium", className: "text-blue-400" },
    high: { label: "High", className: "text-amber-400 font-semibold" },
    critical: { label: "Critical", className: "text-red-400 font-bold" },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-100">Project Features ({features.length})</h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Track planned, active, implemented, and completed modules for this application.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" /> Add Feature
        </Button>
      </div>

      {features.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-800 p-8 text-center space-y-3">
          <p className="text-xs text-neutral-400">No features tracked yet for this project.</p>
          <Button onClick={openCreateModal} size="sm" variant="outline" className="text-xs border-neutral-700">
            Add First Feature
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {features.map((f) => {
            const st = statusBadges[f.status] || { label: f.status, className: "bg-neutral-800" };
            const pr = priorityBadges[f.priority] || { label: f.priority, className: "" };

            return (
              <div
                key={f.id}
                className="rounded-lg border border-neutral-800 bg-neutral-900/80 p-3.5 hover:border-neutral-700 transition space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-neutral-100">{f.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${st.className}`}>
                      {st.label}
                    </span>
                    <span className={`text-[10px] uppercase tracking-wider ${pr.className}`}>
                      {pr.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    {/* Status quick select */}
                    <select
                      value={f.status}
                      onChange={(e) =>
                        handleQuickStatusChange(
                          f.id,
                          e.target.value as "planned" | "in_progress" | "implemented" | "blocked" | "done"
                        )
                      }
                      className="rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-[11px] text-neutral-200 focus:outline-none"
                    >
                      <option value="planned">Planned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="implemented">Implemented</option>
                      <option value="done">Done</option>
                      <option value="blocked">Blocked</option>
                    </select>

                    <button
                      onClick={() => openEditModal(f)}
                      className="text-neutral-400 hover:text-neutral-200 p-1 transition"
                      title="Edit feature"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="text-neutral-400 hover:text-red-400 p-1 transition"
                      title="Delete feature"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {f.description && (
                  <p className="text-xs text-neutral-400 leading-relaxed">{f.description}</p>
                )}

                {f.tech_used && f.tech_used.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {f.tech_used.map((tech) => (
                      <span
                        key={tech}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {f.notes && (
                  <div className="rounded bg-neutral-950/60 p-2 text-[11px] text-neutral-300 border border-neutral-800/80">
                    <span className="text-neutral-500 font-medium mr-1.5">Notes:</span>
                    {f.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Feature Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl text-neutral-100 my-8">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-semibold">
                {editingFeature ? "Edit Feature" : "Add Project Feature"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <Label htmlFor="title" className="text-neutral-300">
                  Feature Name *
                </Label>
                <Input
                  id="title"
                  required
                  placeholder="e.g. Distributed Lock Mechanism"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 bg-neutral-950 border-neutral-800 text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="status" className="text-neutral-300">
                    Status
                  </Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as typeof formData.status,
                      })
                    }
                    className="mt-1 w-full rounded border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-none"
                  >
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="implemented">Implemented</option>
                    <option value="done">Done</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="priority" className="text-neutral-300">
                    Priority
                  </Label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as typeof formData.priority,
                      })
                    }
                    className="mt-1 w-full rounded border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-neutral-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  rows={2}
                  placeholder="What functionality or capability this feature introduces..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-1 bg-neutral-950 border-neutral-800 text-neutral-100 resize-none"
                />
              </div>

              <div>
                <Label htmlFor="tech_used" className="text-neutral-300">
                  Technologies Used (comma-separated)
                </Label>
                <Input
                  id="tech_used"
                  placeholder="e.g. Redis, Redisson, Java"
                  value={formData.tech_used}
                  onChange={(e) =>
                    setFormData({ ...formData, tech_used: e.target.value })
                  }
                  className="mt-1 bg-neutral-950 border-neutral-800 text-neutral-100"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-neutral-300">
                  Implementation Notes & Trade-offs
                </Label>
                <Textarea
                  id="notes"
                  rows={2}
                  placeholder="Key decisions or challenges encountered during implementation..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1 bg-neutral-950 border-neutral-800 text-neutral-100 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5"
                >
                  {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                  {editingFeature ? "Save Changes" : "Create Feature"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
