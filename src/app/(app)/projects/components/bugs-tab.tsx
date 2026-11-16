"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Bug, X, Trash2, Edit3, Loader2 } from "lucide-react";
import {
  createBugAction,
  updateBugAction,
  deleteBugAction,
} from "@/features/projects/actions";
import type { ProjectBugRecord, ProjectFeatureRecord } from "@/features/projects/service";

interface BugsTabProps {
  projectId: string;
  bugs: ProjectBugRecord[];
  features: ProjectFeatureRecord[];
}

export function BugsTab({ projectId, bugs, features }: BugsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBug, setEditingBug] = useState<ProjectBugRecord | null>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "medium" as "low" | "medium" | "high" | "critical",
    status: "open" as "open" | "investigating" | "fixed" | "closed",
    feature_id: "",
    resolution_notes: "",
  });

  function openCreateModal() {
    setEditingBug(null);
    setFormData({
      title: "",
      description: "",
      severity: "medium",
      status: "open",
      feature_id: "",
      resolution_notes: "",
    });
    setIsModalOpen(true);
  }

  function openEditModal(b: ProjectBugRecord) {
    setEditingBug(b);
    setFormData({
      title: b.title,
      description: b.description || "",
      severity: b.severity,
      status: b.status,
      feature_id: b.feature_id || "",
      resolution_notes: b.resolution_notes || "",
    });
    setIsModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      if (editingBug) {
        await updateBugAction(projectId, editingBug.id, {
          title: formData.title,
          description: formData.description,
          severity: formData.severity,
          status: formData.status,
          feature_id: formData.feature_id || null,
          resolution_notes: formData.resolution_notes,
        });
      } else {
        await createBugAction(projectId, {
          title: formData.title,
          description: formData.description,
          severity: formData.severity,
          status: formData.status,
          feature_id: formData.feature_id || null,
          resolution_notes: formData.resolution_notes,
        });
      }
      setIsModalOpen(false);
    });
  }

  function handleDelete(bugId: string) {
    if (confirm("Are you sure you want to delete this bug record?")) {
      startTransition(async () => {
        await deleteBugAction(projectId, bugId);
      });
    }
  }

  function handleQuickStatusChange(
    bugId: string,
    newStatus: "open" | "investigating" | "fixed" | "closed"
  ) {
    startTransition(async () => {
      await updateBugAction(projectId, bugId, { status: newStatus });
    });
  }

  const severityBadges: Record<string, { label: string; className: string }> = {
    low: { label: "Low", className: "text-neutral-400 bg-neutral-800" },
    medium: { label: "Medium", className: "text-blue-400 bg-blue-950/60 border-blue-900" },
    high: { label: "High", className: "text-amber-400 bg-amber-950/60 border-amber-900" },
    critical: { label: "Critical", className: "text-red-400 bg-red-950/80 border-red-800 font-bold" },
  };

  const statusBadges: Record<string, { label: string; className: string }> = {
    open: { label: "Open", className: "bg-red-950/60 text-red-300 border-red-800" },
    investigating: { label: "Investigating", className: "bg-amber-950/60 text-amber-300 border-amber-800" },
    fixed: { label: "Fixed", className: "bg-emerald-950/60 text-emerald-300 border-emerald-800" },
    closed: { label: "Closed", className: "bg-neutral-800 text-neutral-400 border-neutral-700" },
  };

  const activeBugsCount = bugs.filter((b) => b.status === "open" || b.status === "investigating").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
            <Bug className="h-4 w-4 text-amber-400" />
            Project Bugs & Defects ({bugs.length})
            {activeBugsCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                {activeBugsCount} active
              </span>
            )}
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Log edge cases, concurrency glitches, query bottlenecks and defect resolutions.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          size="sm"
          className="bg-amber-600 hover:bg-amber-500 text-white text-xs gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" /> Record Bug
        </Button>
      </div>

      {bugs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-800 p-8 text-center space-y-3">
          <p className="text-xs text-neutral-400">Zero open defects logged for this project.</p>
          <Button onClick={openCreateModal} size="sm" variant="outline" className="text-xs border-neutral-700">
            Log Defect or Technical Issue
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {bugs.map((b) => {
            const sev = severityBadges[b.severity] || { label: b.severity, className: "" };
            const st = statusBadges[b.status] || { label: b.status, className: "" };
            const relatedFeature = features.find((f) => f.id === b.feature_id);

            return (
              <div
                key={b.id}
                className="rounded-lg border border-neutral-800 bg-neutral-900/80 p-3.5 hover:border-neutral-700 transition space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-neutral-100">{b.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${sev.className}`}>
                      {sev.label}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${st.className}`}>
                      {st.label}
                    </span>
                    {relatedFeature && (
                      <span className="text-[10px] text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                        Module: {relatedFeature.title}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    <select
                      value={b.status}
                      onChange={(e) =>
                        handleQuickStatusChange(
                          b.id,
                          e.target.value as "open" | "investigating" | "fixed" | "closed"
                        )
                      }
                      className="rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-[11px] text-neutral-200 focus:outline-none"
                    >
                      <option value="open">Open</option>
                      <option value="investigating">Investigating</option>
                      <option value="fixed">Fixed</option>
                      <option value="closed">Closed</option>
                    </select>

                    <button
                      onClick={() => openEditModal(b)}
                      className="text-neutral-400 hover:text-neutral-200 p-1 transition"
                      title="Edit bug"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="text-neutral-400 hover:text-red-400 p-1 transition"
                      title="Delete bug"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {b.description && (
                  <p className="text-xs text-neutral-400 leading-relaxed">{b.description}</p>
                )}

                {b.resolution_notes && (
                  <div className="rounded bg-neutral-950/70 p-2 text-[11px] text-emerald-300 border border-emerald-900/40">
                    <span className="text-emerald-500 font-semibold mr-1.5">Root Cause & Resolution:</span>
                    {b.resolution_notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bug Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl text-neutral-100 my-8">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-semibold">
                {editingBug ? "Edit Defect" : "Record Technical Issue / Bug"}
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
                <Label htmlFor="bug_title" className="text-neutral-300">
                  Defect Title *
                </Label>
                <Input
                  id="bug_title"
                  required
                  placeholder="e.g. Race condition on concurrent payment confirmation"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 bg-neutral-950 border-neutral-800 text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="severity" className="text-neutral-300">
                    Severity
                  </Label>
                  <select
                    id="severity"
                    value={formData.severity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        severity: e.target.value as typeof formData.severity,
                      })
                    }
                    className="mt-1 w-full rounded border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-none"
                  >
                    <option value="low">Low (minor cosmetic/annoyance)</option>
                    <option value="medium">Medium (standard defect)</option>
                    <option value="high">High (major flow impaired)</option>
                    <option value="critical">Critical (data loss / system crash)</option>
                  </select>
                </div>

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
                    <option value="open">Open</option>
                    <option value="investigating">Investigating</option>
                    <option value="fixed">Fixed</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {features.length > 0 && (
                <div>
                  <Label htmlFor="feature_id" className="text-neutral-300">
                    Related Feature / Module (optional)
                  </Label>
                  <select
                    id="feature_id"
                    value={formData.feature_id}
                    onChange={(e) => setFormData({ ...formData, feature_id: e.target.value })}
                    className="mt-1 w-full rounded border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-none"
                  >
                    <option value="">None / System-wide</option>
                    {features.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <Label htmlFor="bug_desc" className="text-neutral-300">
                  Symptoms & Steps to Reproduce
                </Label>
                <Textarea
                  id="bug_desc"
                  rows={2}
                  placeholder="Observed behavior, stack trace or error payload..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 bg-neutral-950 border-neutral-800 text-neutral-100 resize-none"
                />
              </div>

              <div>
                <Label htmlFor="resolution_notes" className="text-neutral-300">
                  Resolution Notes & Technical Fix
                </Label>
                <Textarea
                  id="resolution_notes"
                  rows={2}
                  placeholder="Root cause identified and fix applied (e.g. switched to pessimistic lock / redisson)..."
                  value={formData.resolution_notes}
                  onChange={(e) =>
                    setFormData({ ...formData, resolution_notes: e.target.value })
                  }
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
                  className="bg-amber-600 hover:bg-amber-500 text-white text-xs gap-1.5"
                >
                  {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                  {editingBug ? "Update Bug" : "Save Bug"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
