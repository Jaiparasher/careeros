"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  DollarSign,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { changeApplicationStageAction } from "@/features/applications/actions";
import {
  type ApplicationStage,
  stageLabels,
} from "@/features/applications/schema";
import type { JobApplicationRecord } from "@/features/applications/service";

interface ApplicationsKanbanProps {
  applications: JobApplicationRecord[];
}

const kanbanColumns: { stage: ApplicationStage; label: string; color: string }[] = [
  { stage: "interested", label: "Interested", color: "border-neutral-700 text-neutral-300" },
  { stage: "referral_requested", label: "Referral Req.", color: "border-purple-800 text-purple-300" },
  { stage: "applied", label: "Applied", color: "border-blue-800 text-blue-300" },
  { stage: "screening", label: "Recruiter Screen", color: "border-cyan-800 text-cyan-300" },
  { stage: "technical_round_1", label: "Tech Round 1", color: "border-amber-800 text-amber-300" },
  { stage: "technical_round_2", label: "Tech Round 2", color: "border-amber-700 text-amber-200" },
  { stage: "managerial_round", label: "Managerial", color: "border-orange-800 text-orange-300" },
  { stage: "hr", label: "HR Round", color: "border-indigo-800 text-indigo-300" },
  { stage: "offer", label: "Offer Received", color: "border-emerald-700 text-emerald-300" },
  { stage: "on_hold", label: "On Hold", color: "border-neutral-700 text-neutral-400" },
  { stage: "rejected", label: "Rejected", color: "border-rose-900 text-rose-300" },
];

export function ApplicationsKanban({ applications }: ApplicationsKanbanProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleStageChange(applicationId: string, newStage: ApplicationStage) {
    startTransition(async () => {
      await changeApplicationStageAction(applicationId, newStage);
      router.refresh();
    });
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex gap-3 overflow-x-auto pb-6 pt-1 select-none min-h-[550px]">
      {kanbanColumns.map(({ stage, label, color }) => {
        const columnApps = applications.filter((app) => app.stage === stage);

        return (
          <div
            key={stage}
            className="flex-shrink-0 w-72 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col max-h-[80vh]"
          >
            {/* Column Header */}
            <div className="p-3 border-b border-neutral-800/80 flex items-center justify-between bg-neutral-950/40 rounded-t-xl">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${color}`}>{label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-400 font-mono">
                  {columnApps.length}
                </span>
              </div>
            </div>

            {/* Column Cards */}
            <div className="p-2 space-y-2.5 overflow-y-auto flex-1">
              {columnApps.length === 0 ? (
                <div className="p-6 text-center text-[11px] text-neutral-600 border border-dashed border-neutral-800/60 rounded-lg my-2">
                  No applications
                </div>
              ) : (
                columnApps.map((app) => {
                  const isFollowupDue =
                    app.next_follow_up_at &&
                    app.stage !== "offer" &&
                    app.stage !== "rejected" &&
                    app.next_follow_up_at <= todayStr;

                  return (
                    <Card
                      key={app.id}
                      className="p-3 bg-neutral-950/80 border-neutral-800/90 hover:border-neutral-700 transition shadow-sm space-y-2"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="min-w-0">
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block truncate">
                            {app.company}
                          </span>
                          <Link
                            href={`/applications/${app.id}`}
                            className="text-xs font-bold text-neutral-100 hover:text-emerald-400 transition truncate block"
                          >
                            {app.role_title}
                          </Link>
                        </div>

                        {app.job_url && (
                          <a
                            href={app.job_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-neutral-500 hover:text-neutral-300 p-0.5 shrink-0"
                            title="Open Job Posting"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>

                      {/* Work mode & Location */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-neutral-400">
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 border-neutral-800 text-neutral-400 bg-neutral-900"
                        >
                          {app.work_mode}
                        </Badge>
                        {app.location && (
                          <span className="flex items-center gap-0.5 truncate max-w-[120px]">
                            <MapPin className="h-2.5 w-2.5 text-neutral-500 shrink-0" />
                            {app.location}
                          </span>
                        )}
                      </div>

                      {/* Salary */}
                      {(app.salary_min_lpa || app.salary_max_lpa || app.expected_ctc_lpa) && (
                        <div className="text-[10px] text-neutral-300 font-mono flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span>
                            {app.salary_min_lpa && app.salary_max_lpa
                              ? `₹${app.salary_min_lpa} - ${app.salary_max_lpa} LPA`
                              : app.expected_ctc_lpa
                              ? `Exp: ₹${app.expected_ctc_lpa} LPA`
                              : `₹${app.salary_min_lpa || app.salary_max_lpa} LPA`}
                          </span>
                        </div>
                      )}

                      {/* Follow-up reminder */}
                      {app.next_follow_up_at && (
                        <div
                          className={`text-[10px] flex items-center gap-1 pt-0.5 ${
                            isFollowupDue
                              ? "text-rose-400 font-semibold"
                              : "text-neutral-500"
                          }`}
                        >
                          <Clock className="h-2.5 w-2.5 shrink-0" />
                          <span>Follow-up: {app.next_follow_up_at}</span>
                        </div>
                      )}

                      {/* Quick stage mover */}
                      <div className="pt-2 border-t border-neutral-900 flex items-center justify-between">
                        <select
                          disabled={isPending}
                          value={app.stage}
                          onChange={(e) =>
                            handleStageChange(app.id, e.target.value as ApplicationStage)
                          }
                          className="bg-neutral-900 border border-neutral-800 rounded px-1.5 py-0.5 text-[10px] text-neutral-400 focus:outline-none focus:text-neutral-200"
                        >
                          {Object.entries(stageLabels).map(([sKey, sLabel]) => (
                            <option key={sKey} value={sKey}>
                              → {sLabel}
                            </option>
                          ))}
                        </select>

                        <Link
                          href={`/applications/${app.id}`}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
                        >
                          Details <ArrowRight className="h-2.5 w-2.5" />
                        </Link>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
