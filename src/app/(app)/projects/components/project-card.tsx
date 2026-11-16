"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  ExternalLink,
  GitBranch,
  Layers,
  Bug,
  ArrowRight,
} from "lucide-react";
import type { ProjectRecord } from "@/features/projects/service";

interface ProjectCardProps {
  project: ProjectRecord;
  featureCount?: number;
  bugCount?: number;
}

export function ProjectCard({ project, featureCount = 0, bugCount = 0 }: ProjectCardProps) {
  const statusStyles: Record<string, { label: string; className: string }> = {
    in_progress: {
      label: "In Progress",
      className: "bg-blue-950/70 text-blue-300 border-blue-800",
    },
    planned: {
      label: "Planning",
      className: "bg-amber-950/70 text-amber-300 border-amber-800",
    },
    completed: {
      label: "Completed",
      className: "bg-emerald-950/70 text-emerald-300 border-emerald-800",
    },
    on_hold: {
      label: "On Hold",
      className: "bg-neutral-800 text-neutral-300 border-neutral-700",
    },
    blocked: {
      label: "Blocked",
      className: "bg-red-950/70 text-red-300 border-red-800",
    },
    archived: {
      label: "Archived",
      className: "bg-neutral-800 text-neutral-400 border-neutral-700",
    },
  };

  const statusInfo = statusStyles[project.status] || {
    label: project.status,
    className: "bg-neutral-800 text-neutral-300",
  };

  return (
    <Card className="border-neutral-800 bg-neutral-900/90 hover:border-neutral-700 transition flex flex-col justify-between group">
      <CardHeader className="p-4 sm:p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
                {project.project_type || "Software Project"}
              </span>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusInfo.className}`}
              >
                {statusInfo.label}
              </span>
            </div>
            <CardTitle className="text-base font-bold text-neutral-100 truncate group-hover:text-emerald-400 transition">
              <Link href={`/projects/${project.id}`}>{project.name}</Link>
            </CardTitle>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {project.repository_url && (
              <a
                href={project.repository_url}
                target="_blank"
                rel="noreferrer"
                className="text-neutral-400 hover:text-neutral-200 transition p-1"
                title="View Git Repository"
              >
                <GitBranch className="h-4 w-4" />
              </a>
            )}
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noreferrer"
                className="text-neutral-400 hover:text-neutral-200 transition p-1"
                title="View Live Demo"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {project.summary && (
          <CardDescription className="text-xs text-neutral-400 line-clamp-2 mt-2 leading-relaxed">
            {project.summary}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-0 space-y-3.5">
        {/* Technologies badges */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.technologies.slice(0, 6).map((tech) => (
              <span
                key={tech}
                className="text-[10px] font-medium px-2 py-0.5 rounded bg-neutral-950 text-neutral-300 border border-neutral-800"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 6 && (
              <span className="text-[10px] text-neutral-500 font-medium px-1.5 py-0.5">
                +{project.technologies.length - 6} more
              </span>
            )}
          </div>
        )}

        {/* Feature & Bug Counts / Dates */}
        <div className="flex items-center justify-between border-t border-neutral-800/80 pt-3 text-[11px] text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-neutral-300" title="Tracked Features">
              <Layers className="h-3.5 w-3.5 text-neutral-400" />
              {featureCount} {featureCount === 1 ? "feature" : "features"}
            </span>

            {bugCount > 0 && (
              <span className="flex items-center gap-1 text-amber-400" title="Active Bugs">
                <Bug className="h-3.5 w-3.5 text-amber-400" />
                {bugCount} active
              </span>
            )}
          </div>

          <Link
            href={`/projects/${project.id}`}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition"
          >
            Workspace <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
