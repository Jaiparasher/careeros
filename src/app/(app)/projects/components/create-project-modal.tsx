"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, X, Loader2 } from "lucide-react";
import { createProjectAction } from "@/features/projects/actions";

export function CreateProjectModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    project_type: "Web Application",
    summary: "",
    status: "in_progress" as const,
    repository_url: "",
    demo_url: "",
    technologies: "",
    objectives: "",
    key_achievements: "",
    started_on: "",
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
      const res = await createProjectAction({
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
        setError(res.error || "Failed to create project");
      } else {
        setIsOpen(false);
        setFormData({
          name: "",
          project_type: "Web Application",
          summary: "",
          status: "in_progress",
          repository_url: "",
          demo_url: "",
          technologies: "",
          objectives: "",
          key_achievements: "",
          started_on: "",
        });
        router.refresh();
      }
    });
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 shadow-sm text-sm"
      >
        <Plus className="h-4 w-4" /> New Project
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl text-neutral-100 my-8">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-lg font-semibold">Create New Project</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-neutral-400 hover:text-neutral-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-950/80 border border-red-800 p-3 text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <Label htmlFor="name" className="text-neutral-300">
              Project Name *
            </Label>
            <Input
              id="name"
              required
              placeholder="e.g. Distributed Task Orchestrator"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 bg-neutral-950 border-neutral-800 text-neutral-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="project_type" className="text-neutral-300">
                Category / Type
              </Label>
              <Input
                id="project_type"
                placeholder="e.g. AI-powered system, Microservices, Full-Stack"
                value={formData.project_type}
                onChange={(e) =>
                  setFormData({ ...formData, project_type: e.target.value })
                }
                className="mt-1 bg-neutral-950 border-neutral-800 text-neutral-100"
              />
            </div>

            <div>
              <Label htmlFor="status" className="text-neutral-300">
                Initial Status
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
                className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="in_progress">In Progress</option>
                <option value="planned">Planning / Scoping</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="summary" className="text-neutral-300">
              Summary / Overview
            </Label>
            <Textarea
              id="summary"
              rows={2}
              placeholder="Concise overview of what this application accomplishes..."
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="mt-1 bg-neutral-950 border-neutral-800 text-neutral-100 resize-none"
            />
          </div>

          <div>
            <Label htmlFor="technologies" className="text-neutral-300">
              Technologies (comma-separated)
            </Label>
            <Input
              id="technologies"
              placeholder="e.g. Java, Spring Boot, PostgreSQL, Kafka, Docker, React"
              value={formData.technologies}
              onChange={(e) =>
                setFormData({ ...formData, technologies: e.target.value })
              }
              className="mt-1 bg-neutral-950 border-neutral-800 text-neutral-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="repository_url" className="text-neutral-300">
                GitHub Repository URL (optional)
              </Label>
              <Input
                id="repository_url"
                type="url"
                placeholder="https://github.com/..."
                value={formData.repository_url}
                onChange={(e) =>
                  setFormData({ ...formData, repository_url: e.target.value })
                }
                className="mt-1 bg-neutral-950 border-neutral-800 text-neutral-100"
              />
            </div>

            <div>
              <Label htmlFor="demo_url" className="text-neutral-300">
                Live Deployment URL (optional)
              </Label>
              <Input
                id="demo_url"
                type="url"
                placeholder="https://..."
                value={formData.demo_url}
                onChange={(e) =>
                  setFormData({ ...formData, demo_url: e.target.value })
                }
                className="mt-1 bg-neutral-950 border-neutral-800 text-neutral-100"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="objectives" className="text-neutral-300">
              Objectives (one per line)
            </Label>
            <Textarea
              id="objectives"
              rows={2}
              placeholder="Demonstrate distributed transaction handling&#10;Implement resilient caching with Redis"
              value={formData.objectives}
              onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
              className="mt-1 bg-neutral-950 border-neutral-800 text-neutral-100 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
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
              Save Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
