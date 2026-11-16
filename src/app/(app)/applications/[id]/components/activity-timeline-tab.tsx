"use client";

import {
  GitCommit,
  Sparkles,
  CalendarCheck,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";
import { StageBadge } from "../../components/stage-badge";
import { type ApplicationStage } from "@/features/applications/schema";
import type { ApplicationActivityRecord } from "@/features/applications/service";

interface ActivityTimelineTabProps {
  activity: ApplicationActivityRecord[];
}

export function ActivityTimelineTab({ activity }: ActivityTimelineTabProps) {
  if (activity.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-neutral-500 rounded-lg bg-neutral-900/40 border border-neutral-800 space-y-1">
        <Clock className="h-6 w-6 text-neutral-600 mx-auto mb-2" />
        <p>No activity records logged yet for this application.</p>
        <p className="text-[11px] text-neutral-600">
          Stage changes, interview scheduling, and status updates will automatically appear here.
        </p>
      </div>
    );
  }

  function getActivityIcon(type: string) {
    switch (type) {
      case "stage_change":
        return <GitCommit className="h-3.5 w-3.5 text-cyan-400" />;
      case "created":
        return <Sparkles className="h-3.5 w-3.5 text-emerald-400" />;
      case "interview_scheduled":
        return <CalendarCheck className="h-3.5 w-3.5 text-amber-400" />;
      case "interview_completed":
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
      default:
        return <FileText className="h-3.5 w-3.5 text-neutral-400" />;
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
          <Clock className="h-4 w-4 text-cyan-400" />
          Application Activity & Stage Transition History
        </h3>
        <p className="text-xs text-neutral-400 mt-0.5">
          Auditable chronological history of stage changes, interview rounds, and notes.
        </p>
      </div>

      <div className="relative pl-6 space-y-4 border-l border-neutral-800 ml-2 pt-1">
        {activity.map((item) => (
          <div key={item.id} className="relative group">
            {/* Timeline node icon */}
            <span className="absolute -left-[31px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-950 border border-neutral-800 group-hover:border-neutral-600 transition">
              {getActivityIcon(item.activity_type)}
            </span>

            {/* Event details card */}
            <div className="p-3.5 rounded-lg bg-neutral-900/60 border border-neutral-800/80 space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-semibold text-neutral-100">
                  {item.title}
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>

              {/* Stage transition pill if available */}
              {item.from_stage && item.to_stage && (
                <div className="flex items-center gap-2 text-xs pt-1">
                  <StageBadge stage={item.from_stage as ApplicationStage} />
                  <ArrowRight className="h-3 w-3 text-neutral-500" />
                  <StageBadge stage={item.to_stage as ApplicationStage} />
                </div>
              )}

              {/* Description */}
              {item.description && (
                <p className="text-xs text-neutral-400 leading-relaxed pt-0.5">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
