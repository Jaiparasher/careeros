"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  GitBranch,
  ExternalLink,
  Layers,
  ListTodo,
  Bug,
  Cpu,
  Mic,
  Calendar,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FeaturesTab } from "./features-tab";
import { BugsTab } from "./bugs-tab";
import { ArchitectureTab } from "./architecture-tab";
import { InterviewPrepTab } from "./interview-prep-tab";
import { EditProjectModal } from "./edit-project-modal";
import type {
  ProjectRecord,
  ProjectFeatureRecord,
  ProjectBugRecord,
} from "@/features/projects/service";

interface ProjectWorkspaceProps {
  project: ProjectRecord;
  features: ProjectFeatureRecord[];
  bugs: ProjectBugRecord[];
  initialTab?: string;
}

const statusBadgeStyles: Record<string, { label: string; className: string }> = {
  planned: {
    label: "Planning",
    className: "bg-neutral-800/80 text-neutral-300 border-neutral-700",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-950/70 text-blue-300 border-blue-800/60",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-950/70 text-emerald-300 border-emerald-800/60",
  },
  on_hold: {
    label: "On Hold",
    className: "bg-amber-950/70 text-amber-300 border-amber-800/60",
  },
  blocked: {
    label: "Blocked",
    className: "bg-rose-950/70 text-rose-300 border-rose-800/60",
  },
  archived: {
    label: "Archived",
    className: "bg-neutral-900 text-neutral-500 border-neutral-800",
  },
};

export function ProjectWorkspace({
  project,
  features,
  bugs,
  initialTab = "overview",
}: ProjectWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "features" | "bugs" | "architecture" | "interview"
  >(
    (initialTab as "overview" | "features" | "bugs" | "architecture" | "interview") ||
      "overview"
  );

  const statusConfig = statusBadgeStyles[project.status] || {
    label: project.status,
    className: "bg-neutral-800 text-neutral-300 border-neutral-700",
  };

  const doneFeaturesCount = features.filter(
    (f) => f.status === "implemented" || f.status === "done"
  ).length;

  const featurePercent =
    features.length > 0 ? Math.round((doneFeaturesCount / features.length) * 100) : 0;

  const openBugsCount = bugs.filter(
    (b) => b.status === "open" || b.status === "investigating"
  ).length;

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl animate-in fade-in duration-200">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/projects"
          className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Projects
        </Link>
      </div>

      {/* Main Project Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 shadow-sm">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100">
              {project.name}
            </h1>
            <Badge variant="outline" className={`text-xs ${statusConfig.className}`}>
              {statusConfig.label}
            </Badge>
            {project.project_type && (
              <Badge
                variant="outline"
                className="bg-neutral-950 text-neutral-400 border-neutral-800 text-xs"
              >
                {project.project_type}
              </Badge>
            )}
          </div>

          {project.summary && (
            <p className="text-xs sm:text-sm text-neutral-300 max-w-3xl leading-relaxed">
              {project.summary}
            </p>
          )}

          {/* Quick links & metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 pt-1">
            {project.repository_url ? (
              <a
                href={project.repository_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-neutral-300 hover:text-white transition-colors"
              >
                <GitBranch className="h-3.5 w-3.5 text-neutral-400" />
                Repository
              </a>
            ) : (
              <span className="flex items-center gap-1.5 text-neutral-500 italic">
                <GitBranch className="h-3.5 w-3.5 text-neutral-600" />
                Repo unlinked
              </span>
            )}

            {project.demo_url ? (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Live Demo
              </a>
            ) : (
              <span className="flex items-center gap-1.5 text-neutral-500 italic">
                <ExternalLink className="h-3.5 w-3.5 text-neutral-600" />
                Demo unlinked
              </span>
            )}

            {project.started_on && (
              <span className="flex items-center gap-1.5 text-neutral-400">
                <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                Started: {new Date(project.started_on).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 self-start lg:self-center">
          <EditProjectModal project={project} />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-neutral-800 gap-1 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "overview"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <Layers className="h-4 w-4" />
          Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("features")}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "features"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <ListTodo className="h-4 w-4" />
          Features & Roadmap
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-800 text-neutral-300">
            {features.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bugs")}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "bugs"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <Bug className="h-4 w-4" />
          Bugs & Issues
          {openBugsCount > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-950 text-rose-300 border border-rose-800/50">
              {openBugsCount}
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-800 text-neutral-400">
              {bugs.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("architecture")}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "architecture"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <Cpu className="h-4 w-4" />
          Architecture & System Design
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("interview")}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "interview"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <Mic className="h-4 w-4" />
          Interview Prep & Defense
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-neutral-800 bg-neutral-900/60 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Feature Completion</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {doneFeaturesCount} / {features.length} ({featurePercent}%)
                </span>
              </div>
              <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden border border-neutral-800">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${featurePercent}%` }}
                />
              </div>
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/60 p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-400">Active Defects</span>
                <div className="text-xl font-bold font-mono text-neutral-200 mt-1">
                  {openBugsCount}{" "}
                  <span className="text-xs font-normal text-neutral-500">
                    of {bugs.length} logged
                  </span>
                </div>
              </div>
              <Bug
                className={`h-5 w-5 ${
                  openBugsCount > 0 ? "text-rose-400" : "text-neutral-500"
                }`}
              />
            </Card>

            <Card className="border-neutral-800 bg-neutral-900/60 p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-400">Technologies Used</span>
                <div className="text-xl font-bold font-mono text-neutral-200 mt-1">
                  {(project.technologies || []).length}
                </div>
              </div>
              <Sparkles className="h-5 w-5 text-cyan-400" />
            </Card>
          </div>

          {/* Technologies */}
          <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Technology Stack
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {(project.technologies || []).length === 0 ? (
                <span className="text-xs text-neutral-500 italic">
                  No technologies recorded yet. Edit project settings to add tags.
                </span>
              ) : (
                project.technologies.map((tech) => (
                  <Badge
                    key={tech}
                    variant="outline"
                    className="bg-neutral-950 text-neutral-300 border-neutral-800 text-xs px-2.5 py-0.5"
                  >
                    {tech}
                  </Badge>
                ))
              )}
            </div>
          </div>

          {/* Objectives and Key Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Objectives */}
            <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
              <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                <Target className="h-4 w-4 text-cyan-400" />
                Project Objectives
              </h3>
              {(project.objectives || []).length === 0 ? (
                <p className="text-xs text-neutral-500 italic">
                  No specific objectives documented. Add measurable goals in Settings.
                </p>
              ) : (
                <ul className="space-y-2 text-xs text-neutral-300">
                  {project.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span className="leading-relaxed">{obj}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Key Achievements */}
            <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
              <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                Key Achievements & Resume Highlights
              </h3>
              {(project.key_achievements || []).length === 0 ? (
                <p className="text-xs text-neutral-500 italic">
                  No key achievements recorded. Add metrics and impact in Settings.
                </p>
              ) : (
                <ul className="space-y-2 text-xs text-neutral-300">
                  {project.key_achievements.map((ach, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">★</span>
                      <span className="leading-relaxed">{ach}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "features" && (
        <FeaturesTab projectId={project.id} features={features} />
      )}

      {activeTab === "bugs" && (
        <BugsTab projectId={project.id} bugs={bugs} features={features} />
      )}

      {activeTab === "architecture" && <ArchitectureTab project={project} />}

      {activeTab === "interview" && <InterviewPrepTab project={project} />}
    </div>
  );
}
