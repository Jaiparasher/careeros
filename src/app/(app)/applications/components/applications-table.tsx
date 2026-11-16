"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Clock,
  ArrowRight,
} from "lucide-react";
import { StageBadge } from "./stage-badge";
import { changeApplicationStageAction } from "@/features/applications/actions";
import {
  type ApplicationStage,
  stageLabels,
} from "@/features/applications/schema";
import type { JobApplicationRecord } from "@/features/applications/service";

interface ApplicationsTableProps {
  applications: JobApplicationRecord[];
}

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const todayStr = new Date().toISOString().slice(0, 10);

  function handleStageChange(applicationId: string, newStage: ApplicationStage) {
    startTransition(async () => {
      await changeApplicationStageAction(applicationId, newStage);
      router.refresh();
    });
  }

  if (applications.length === 0) {
    return (
      <div className="p-12 text-center text-xs text-neutral-500 rounded-xl bg-neutral-900/40 border border-neutral-800">
        No applications match the current filter criteria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/60 shadow-sm">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400 font-medium">
          <tr>
            <th className="py-3 px-4">Company & Role</th>
            <th className="py-3 px-4">Pipeline Stage</th>
            <th className="py-3 px-4">Work Mode</th>
            <th className="py-3 px-4">Salary Range</th>
            <th className="py-3 px-4">Applied Date</th>
            <th className="py-3 px-4">Next Follow-Up</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/80 text-neutral-200">
          {applications.map((app) => {
            const isFollowupDue =
              app.next_follow_up_at &&
              app.stage !== "offer" &&
              app.stage !== "rejected" &&
              app.next_follow_up_at <= todayStr;

            return (
              <tr
                key={app.id}
                className="hover:bg-neutral-850/50 transition-colors group"
              >
                {/* Company & Role */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div>
                      <Link
                        href={`/applications/${app.id}`}
                        className="font-semibold text-neutral-100 hover:text-emerald-400 transition"
                      >
                        {app.company}
                      </Link>
                      <div className="text-[11px] text-neutral-400">
                        {app.role_title}
                      </div>
                    </div>
                    {app.job_url && (
                      <a
                        href={app.job_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-neutral-500 hover:text-neutral-300 p-0.5"
                        title="View Job Post"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </td>

                {/* Stage */}
                <td className="py-3 px-4">
                  <StageBadge stage={app.stage} />
                </td>

                {/* Work Mode */}
                <td className="py-3 px-4 text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <span className="capitalize">{app.work_mode}</span>
                    {app.location && (
                      <span className="text-[10px] text-neutral-500 truncate max-w-[100px]">
                        ({app.location})
                      </span>
                    )}
                  </div>
                </td>

                {/* Salary */}
                <td className="py-3 px-4 font-mono text-[11px] text-neutral-300">
                  {app.salary_min_lpa && app.salary_max_lpa
                    ? `₹${app.salary_min_lpa} - ${app.salary_max_lpa} LPA`
                    : app.expected_ctc_lpa
                    ? `Exp: ₹${app.expected_ctc_lpa} LPA`
                    : app.salary_min_lpa || app.salary_max_lpa
                    ? `₹${app.salary_min_lpa || app.salary_max_lpa} LPA`
                    : "—"}
                </td>

                {/* Application Date */}
                <td className="py-3 px-4 text-neutral-400 text-[11px]">
                  {app.application_date || "—"}
                </td>

                {/* Next Follow-Up */}
                <td className="py-3 px-4 text-[11px]">
                  {app.next_follow_up_at ? (
                    <span
                      className={`flex items-center gap-1 ${
                        isFollowupDue
                          ? "text-rose-400 font-semibold"
                          : "text-neutral-400"
                      }`}
                    >
                      <Clock className="h-3 w-3 shrink-0" />
                      {app.next_follow_up_at}
                    </span>
                  ) : (
                    <span className="text-neutral-600">—</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <select
                      disabled={isPending}
                      value={app.stage}
                      onChange={(e) =>
                        handleStageChange(app.id, e.target.value as ApplicationStage)
                      }
                      className="bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-[11px] text-neutral-300 focus:outline-none"
                    >
                      {Object.entries(stageLabels).map(([sKey, sLabel]) => (
                        <option key={sKey} value={sKey}>
                          {sLabel}
                        </option>
                      ))}
                    </select>

                    <Link
                      href={`/applications/${app.id}`}
                      className="p-1 rounded text-neutral-400 hover:text-emerald-400 transition"
                      title="View Details"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
