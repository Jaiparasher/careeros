"use client";

import Link from "next/link";
import { AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RevisionBannerProps {
  dueCount: number;
  overdueCount: number;
}

export function RevisionBanner({ dueCount, overdueCount }: RevisionBannerProps) {
  if (dueCount === 0 && overdueCount === 0) return null;

  const isOverdue = overdueCount > 0;
  const total = dueCount + overdueCount;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm",
        isOverdue
          ? "border-red-800/60 bg-red-950/30 text-red-300"
          : "border-amber-800/60 bg-amber-950/30 text-amber-300"
      )}
    >
      <div className="flex items-center gap-2">
        {isOverdue ? (
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
        ) : (
          <Clock className="h-4 w-4 shrink-0 text-amber-400" />
        )}
        <span>
          {overdueCount > 0 && (
            <>
              <strong className="text-red-200">{overdueCount}</strong> overdue revision
              {overdueCount !== 1 ? "s" : ""}
            </>
          )}
          {overdueCount > 0 && dueCount > 0 && " and "}
          {dueCount > 0 && (
            <>
              <strong className={isOverdue ? "text-red-200" : "text-amber-200"}>{dueCount}</strong>{" "}
              revision{dueCount !== 1 ? "s" : ""} due today
            </>
          )}
          {overdueCount === 0 && dueCount > 0 && (
            <>
              {" "}
              — {total} total pending
            </>
          )}
        </span>
      </div>
      <Link
        href="/dsa?tab=due"
        className={cn(
          "shrink-0 rounded-md px-3 py-1 text-xs font-medium transition-colors",
          isOverdue
            ? "bg-red-900/50 text-red-200 hover:bg-red-900 hover:text-red-100"
            : "bg-amber-900/50 text-amber-200 hover:bg-amber-900 hover:text-amber-100"
        )}
      >
        View Due Today →
      </Link>
    </div>
  );
}
