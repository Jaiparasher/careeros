"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RefreshCw, SkipForward, Loader2 } from "lucide-react";
import {
  completeRevisionAction,
  rescheduleRevisionAction,
  skipRevisionAction,
} from "@/features/dsa/actions";
import type { RevisionScheduleRow } from "@/features/dsa/service";

interface RevisionCardActionsProps {
  revision: RevisionScheduleRow;
}

export function RevisionCardActions({ revision }: RevisionCardActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleComplete() {
    setError(null);
    startTransition(async () => {
      const res = await completeRevisionAction(revision.id);
      if (!res.success) {
        setError(res.error);
      } else {
        router.refresh();
      }
    });
  }

  function handleSkip() {
    setError(null);
    startTransition(async () => {
      const res = await skipRevisionAction(revision.id, "Skipped from detail view");
      if (!res.success) {
        setError(res.error);
      } else {
        router.refresh();
      }
    });
  }

  function handleReschedule(e: React.FormEvent) {
    e.preventDefault();
    if (!newDate) return;
    setError(null);
    startTransition(async () => {
      const res = await rescheduleRevisionAction(revision.id, {
        new_date: newDate,
      });
      if (!res.success) {
        setError(res.error);
      } else {
        setIsRescheduling(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleComplete}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-md bg-green-700 hover:bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          Mark Complete
        </button>

        <button
          onClick={() => setIsRescheduling(!isRescheduling)}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-md border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reschedule
        </button>

        <button
          onClick={handleSkip}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-md border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-500 transition-colors disabled:opacity-50"
        >
          <SkipForward className="h-3.5 w-3.5" />
          Skip
        </button>
      </div>

      {isRescheduling && (
        <form onSubmit={handleReschedule} className="flex items-center gap-2 pt-2">
          <input
            type="date"
            required
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isPending || !newDate}
            className="rounded bg-blue-600 hover:bg-blue-500 px-2.5 py-1 text-xs text-white transition-colors disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsRescheduling(false)}
            className="text-xs text-neutral-400 hover:text-neutral-200"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
