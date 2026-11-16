"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Settings, X, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { updateProjectAction, deleteProjectAction } from "@/features/projects/actions";
import type { ProjectRecord } from "@/features/projects/service";

interface EditProjectModalProps {
  project: ProjectRecord;
}

export function EditProjectModal({ project }: EditProjectModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: project.name || "",
    project_type: project.project_type || "Web Application",
    summary: project.summary || "",
    status: (project.status || "in_progress") as
      | "planned"
      | "in_progress"
      | "completed"
      | "on_hold"
      | "blocked"
      | "archived",
    repository_url: project.repository_url || "",
    demo_url: project.demo_url || "",
    technologies: (project.technologies || []).join(", "),
    objectives: (project.objectives || []).join("\n"),
    key_achievements: (project.key_achievements || []).join("\n"),
    started_on: project.started_on ? project.started_on.substring(0, 10) : "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const techArray = formData.technologies
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const objArray = formData.objectives
      .split("\n")
      .map((o) => o.trim())
      .filter(Boolean);

    const achArray = formData.key_achievements
      .split("\n")
      .map((a) => a.trim())
      .filter(Boolean);

    startTransition(async () => {
      const res = await updateProjectAction(project.id, {
        name: formData.name,
        project_type: formData.project_type,
        summary: formData.summary,
        status: formData.status,
        repository_url: formData.repository_url || null,
        demo_url: formData.demo_url || null,
        technologies: techArray,
        objectives: objArray,
        key_achievements: achArray,
        started_on: formData.started_on || null,
      });

      if (!res.success) {
        setError(res.error || "Failed to update project");
      } else {
        setIsOpen(false);
        router.refresh();
      }
    });
  }

  function handleDelete() {
    setIsDeleting(true);
    startTransition(async () => {
      const res = await deleteProjectAction(project.id);
      if (!res.success) {
        setError(res.error || "Failed to delete project");
        setIsDeleting(false);
      } else {
        router.push("/projects");
        router.refresh();
      }
    });
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setIsOpen(true);
          setConfirmDelete(false);
          setError(null);
        }}
        className="border-neutral-700 hover:bg-neutral-800 text-xs gap-1.5"
      >
        <Settings className="h-3.5 w-3.5 text-neutral-400" />
        Settings
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-800">
              <div>
                <h2 className="text-base font-semibold text-neutral-100">
                  Edit Project Settings
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Update project metadata, links, objectives, and tech stack.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-neutral-200 p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              {error && (
                <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-name" className="text-xs font-medium text-neutral-300">
                    Project Name *
                  </Label>
                  <Input
                    id="edit-name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    className="bg-neutral-950 border-neutral-800 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-type" className="text-xs font-medium text-neutral-300">
                    Category / Type
                  </Label>
                  <Input
                    id="edit-type"
                    value={formData.project_type}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, project_type: e.target.value }))
                    }
                    className="bg-neutral-950 border-neutral-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-status" className="text-xs font-medium text-neutral-300">
                    Status
                  </Label>
                  <select
                    id="edit-status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        status: e.target.value as typeof formData.status,
                      }))
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="in_progress">In Progress</option>
                    <option value="planned">Planning</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="blocked">Blocked</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-started" className="text-xs font-medium text-neutral-300">
                    Start Date
                  </Label>
                  <Input
                    id="edit-started"
                    type="date"
                    value={formData.started_on}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, started_on: e.target.value }))
                    }
                    className="bg-neutral-950 border-neutral-800 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-summary" className="text-xs font-medium text-neutral-300">
                  Summary / Elevator Description
                </Label>
                <Textarea
                  id="edit-summary"
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData((p) => ({ ...p, summary: e.target.value }))}
                  className="bg-neutral-950 border-neutral-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-repo" className="text-xs font-medium text-neutral-300">
                    GitHub Repository URL
                  </Label>
                  <Input
                    id="edit-repo"
                    type="url"
                    placeholder="https://github.com/..."
                    value={formData.repository_url}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, repository_url: e.target.value }))
                    }
                    className="bg-neutral-950 border-neutral-800 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-demo" className="text-xs font-medium text-neutral-300">
                    Live Demo / Deployment URL
                  </Label>
                  <Input
                    id="edit-demo"
                    type="url"
                    placeholder="https://..."
                    value={formData.demo_url}
                    onChange={(e) => setFormData((p) => ({ ...p, demo_url: e.target.value }))}
                    className="bg-neutral-950 border-neutral-800 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-tech" className="text-xs font-medium text-neutral-300">
                  Technologies (comma-separated)
                </Label>
                <Input
                  id="edit-tech"
                  value={formData.technologies}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, technologies: e.target.value }))
                  }
                  className="bg-neutral-950 border-neutral-800 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-obj" className="text-xs font-medium text-neutral-300">
                  Project Objectives (one per line)
                </Label>
                <Textarea
                  id="edit-obj"
                  rows={2}
                  value={formData.objectives}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, objectives: e.target.value }))
                  }
                  className="bg-neutral-950 border-neutral-800 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-ach" className="text-xs font-medium text-neutral-300">
                  Key Achievements / Impact (one per line)
                </Label>
                <Textarea
                  id="edit-ach"
                  rows={2}
                  value={formData.key_achievements}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, key_achievements: e.target.value }))
                  }
                  className="bg-neutral-950 border-neutral-800 text-xs"
                />
              </div>

              {/* Danger Zone: Delete project */}
              <div className="pt-4 border-t border-neutral-800/80">
                {!confirmDelete ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(true)}
                    className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete this project...
                  </Button>
                ) : (
                  <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/50 space-y-2">
                    <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                      Permanently delete this project?
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      This will delete all features, bugs, architecture notes, and interview prep associated with this project. This action cannot be undone.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        disabled={isDeleting}
                        onClick={handleDelete}
                        className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-7 gap-1"
                      >
                        {isDeleting && <Loader2 className="h-3 w-3 animate-spin" />}
                        Yes, Delete Project
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isDeleting}
                        onClick={() => setConfirmDelete(false)}
                        className="text-xs h-7 text-neutral-400 hover:text-neutral-200"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-neutral-400 hover:text-neutral-200 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5"
                >
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
