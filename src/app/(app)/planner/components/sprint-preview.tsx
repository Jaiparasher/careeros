"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarCheck2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Info,
  ArrowLeft,
} from "lucide-react";
import { generateSprintSchedule } from "@/features/planner/workload";
import { acceptSprintPlanAction } from "@/features/planner/actions";

interface SprintPreviewProps {
  dailyAvailableMinutes: number;
  existingActivePlanName?: string;
}

export function SprintPreview({
  dailyAvailableMinutes,
  existingActivePlanName,
}: SprintPreviewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedDuration, setSelectedDuration] = useState<30 | 45 | 60>(30);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const startDate = new Date();
  const schedule = generateSprintSchedule({
    durationDays: selectedDuration,
    dailyAvailableMinutes,
    startDate,
  });

  const overloadedDays = schedule.days.filter((d) => d.isOverloaded);
  const isOverloadedPlan = overloadedDays.length > 0;
  const maxExcess = Math.max(0, ...schedule.days.map((d) => d.excessMinutes));

  function handleAcceptPlan() {
    setFeedback(null);
    startTransition(async () => {
      const res = await acceptSprintPlanAction({
        durationDays: String(selectedDuration) as "30" | "45" | "60",
      });

      if (res.success) {
        router.push("/planner");
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to accept sprint plan.",
        });
      }
    });
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <Link
          href="/planner"
          className="text-xs text-neutral-400 hover:text-neutral-200 inline-flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Planner
        </Link>
        <span className="text-xs text-neutral-500">Preview Before Accept</span>
      </div>

      {/* Header Card */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100 flex items-center gap-2">
              <CalendarCheck2 className="h-6 w-6 text-amber-400" />
              Configure & Preview Interview Sprint
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Deterministic, capacity-aware schedule including all 75 Grind 75 Core problems and resume topics.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>Daily Budget:</span>
            <strong className="text-neutral-100 font-mono">{dailyAvailableMinutes} min</strong>
          </div>
        </div>

        {existingActivePlanName && (
          <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-400 flex items-center gap-2">
            <Info className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>
              You already have an active plan:{" "}
              <strong className="text-neutral-200">{existingActivePlanName}</strong>. Accepting a
              new plan will archive the current plan and replace its pending tasks.
            </span>
          </div>
        )}
      </div>

      {/* Duration Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            days: 30 as const,
            title: "30-Day Sprint",
            badge: "Intensive",
            subtitle: "All 75 Grind problems in 30 days (~120-150 min/day)",
          },
          {
            days: 45 as const,
            title: "45-Day Sprint",
            badge: "Balanced",
            subtitle: "Distributed load (~75-100 min/day, recommended)",
          },
          {
            days: 60 as const,
            title: "60-Day Sprint",
            badge: "Sustainable",
            subtitle: "Gentle daily pace (~50-75 min/day)",
          },
        ].map((tab) => {
          const isSelected = selectedDuration === tab.days;
          return (
            <button
              key={tab.days}
              type="button"
              onClick={() => setSelectedDuration(tab.days)}
              className={`rounded-xl p-4 border text-left transition ${
                isSelected
                  ? "border-cyan-500/80 bg-neutral-800/90 ring-1 ring-cyan-500/50"
                  : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-sm text-neutral-100">{tab.title}</span>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    tab.days === 45
                      ? "border-emerald-700 text-emerald-400"
                      : "border-neutral-700 text-neutral-400"
                  }`}
                >
                  {tab.badge}
                </Badge>
              </div>
              <p className="text-xs text-neutral-400">{tab.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Capacity & Overload Alert */}
      {isOverloadedPlan ? (
        <div className="rounded-xl border border-rose-800/80 bg-rose-950/60 p-4 sm:p-5 space-y-2 text-rose-200">
          <div className="flex items-center gap-2 font-semibold text-rose-100 text-sm">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
            <span>
              Workload Warning: {overloadedDays.length} days exceed your daily budget by up to{" "}
              {maxExcess} minutes
            </span>
          </div>
          <p className="text-xs leading-relaxed">
            The {selectedDuration}-day curriculum requires an average of{" "}
            <strong>{schedule.averageDailyMinutes} minutes/day</strong>, which exceeds your
            configured daily available study time ({dailyAvailableMinutes} min).
          </p>
          <div className="pt-1 flex flex-wrap gap-2">
            {selectedDuration === 30 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDuration(45)}
                className="border-rose-700/80 bg-rose-900/40 text-rose-200 hover:bg-rose-900/70 text-xs"
              >
                Switch to 45-Day Balanced Alternative →
              </Button>
            )}
            {selectedDuration === 45 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDuration(60)}
                className="border-rose-700/80 bg-rose-900/40 text-rose-200 hover:bg-rose-900/70 text-xs"
              >
                Switch to 60-Day Sustainable Alternative →
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-800/80 bg-emerald-950/50 p-4 flex items-center gap-3 text-xs text-emerald-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <strong className="text-emerald-100 font-semibold block text-sm">
              Capacity Verified: Sustainable Workload
            </strong>
            <span>
              Average daily workload is {schedule.averageDailyMinutes} min, comfortably within your{" "}
              {dailyAvailableMinutes} min daily budget.
            </span>
          </div>
        </div>
      )}

      {/* Schedule Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-3">
          <span className="text-[11px] text-neutral-500 block">Total Duration</span>
          <strong className="text-lg font-bold text-neutral-100">{selectedDuration} Days</strong>
        </div>
        <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-3">
          <span className="text-[11px] text-neutral-500 block">Grind 75 Covered</span>
          <strong className="text-lg font-bold text-blue-400">75 / 75 Problems</strong>
        </div>
        <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-3">
          <span className="text-[11px] text-neutral-500 block">Average Daily</span>
          <strong className="text-lg font-bold text-amber-400">
            {schedule.averageDailyMinutes} min
          </strong>
        </div>
        <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-3">
          <span className="text-[11px] text-neutral-500 block">Review Checkpoints</span>
          <strong className="text-lg font-bold text-emerald-400">
            {schedule.days.filter((d) => d.isReviewDay).length} Days
          </strong>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs font-medium border ${
            feedback.type === "success"
              ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
              : "bg-rose-950/60 border-rose-800 text-rose-300"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Action / Acceptance Bar */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-200">
            Ready to accept this sprint curriculum?
          </h3>
          <p className="text-xs text-neutral-400">
            Generates scheduled tasks in your Daily Planner for all {selectedDuration} days.
          </p>
        </div>

        <Button
          type="button"
          disabled={isPending}
          onClick={handleAcceptPlan}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-6 py-2.5 inline-flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {isPending ? "Generating Sprint Tasks..." : `Accept & Start ${selectedDuration}-Day Sprint`}
        </Button>
      </div>

      {/* Day by Day Curriculum Preview */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-neutral-200 px-1">
          Curriculum Day-by-Day Preview ({schedule.days.length} Days)
        </h3>

        <div className="space-y-2">
          {schedule.days.map((day) => (
            <div
              key={day.dayNumber}
              className={`rounded-xl border p-3.5 sm:p-4 text-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                day.isReviewDay
                  ? "border-amber-800/60 bg-amber-950/20"
                  : "border-neutral-800 bg-neutral-900/60 hover:bg-neutral-900"
              }`}
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`font-mono text-[10px] ${
                      day.isReviewDay
                        ? "border-amber-700 text-amber-400"
                        : "border-neutral-700 text-neutral-300"
                    }`}
                  >
                    Day {day.dayNumber}
                  </Badge>
                  <span className="text-neutral-500">{day.date}</span>
                  {day.isOverloaded && (
                    <Badge variant="outline" className="border-rose-700 text-rose-400 text-[10px]">
                      Overloaded (+{day.excessMinutes}m)
                    </Badge>
                  )}
                </div>

                <div className="font-semibold text-neutral-200 text-sm">{day.focusTopic}</div>

                {day.grindProblemOrders.length > 0 && (
                  <div className="text-neutral-400">
                    <span className="text-blue-400 font-medium">Grind 75: </span>
                    Problems #{day.grindProblemOrders.join(", #")}
                  </div>
                )}
              </div>

              <div className="shrink-0 text-right">
                <span className="text-neutral-400 block font-mono">
                  {day.estimatedMinutes} min estimated
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
