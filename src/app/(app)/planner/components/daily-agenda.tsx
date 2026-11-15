"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CalendarCheck2,
} from "lucide-react";
import type { DayAgendaResult, StudyPlanRecord } from "@/features/planner/service";
import { toggleTaskAction, rescheduleTaskAction } from "@/features/planner/actions";

interface DailyAgendaProps {
  plan: StudyPlanRecord;
  agenda: DayAgendaResult;
  stats: {
    totalTasks: number;
    completedTasks: number;
    percentCompleted: number;
    currentDayNumber: number;
    totalDays: number;
  };
}

export function DailyAgenda({ plan, agenda, stats }: DailyAgendaProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const currentDate = new Date(agenda.date);

  function navigateDay(offsetDays: number) {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + offsetDays);
    const dateStr = next.toISOString().slice(0, 10);
    router.push(`/planner?date=${dateStr}`);
  }

  function handleToggle(taskId: string, currentCompleted: boolean) {
    startTransition(async () => {
      await toggleTaskAction({ taskId, completed: !currentCompleted });
      router.refresh();
    });
  }

  function handleRescheduleTomorrow(taskId: string) {
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 10);

    startTransition(async () => {
      await rescheduleTaskAction({ taskId, newDate: dateStr });
      router.refresh();
    });
  }

  const { capacity, totalPlannedMinutes, completedMinutes, dailyAvailableMinutes } = agenda;

  return (
    <div className="space-y-6">
      {/* Sprint Progress Header */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
                <CalendarCheck2 className="h-5 w-5 text-amber-400" />
                {plan.name}
              </h2>
              <Badge variant="outline" className="border-emerald-700/80 text-emerald-400 text-xs">
                Active
              </Badge>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Day <strong className="text-neutral-200">{stats.currentDayNumber}</strong> of{" "}
              <strong className="text-neutral-200">{stats.totalDays}</strong> • Started on{" "}
              {plan.starts_on}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-neutral-400">Overall Progress:</span>{" "}
              <span className="font-mono text-sm font-bold text-emerald-400">
                {stats.completedTasks} / {stats.totalTasks}
              </span>{" "}
              <span className="text-xs text-neutral-500">({stats.percentCompleted}%)</span>
            </div>
            <Link
              href="/planner/sprint"
              className="text-xs text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition"
            >
              Curriculum Overview
            </Link>
          </div>
        </div>

        {/* Overall Sprint Progress Bar */}
        <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${stats.percentCompleted}%` }}
          />
        </div>
      </div>

      {/* Date Navigation & Workload Meter */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          {/* Previous / Date / Next */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDay(-1)}
              className="h-8 px-2 border-neutral-800 text-neutral-300 hover:bg-neutral-800 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
            </Button>
            <div className="px-3 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-xs sm:text-sm font-semibold text-neutral-100 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-cyan-400" />
              <span>{agenda.date}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDay(1)}
              className="h-8 px-2 border-neutral-800 text-neutral-300 hover:bg-neutral-800 text-xs"
            >
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>

          {/* Daily Capacity Readout */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-400">Workload:</span>
            <span
              className={`font-mono font-bold ${
                capacity.isOverloaded ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {totalPlannedMinutes} min
            </span>
            <span className="text-neutral-500">/ {dailyAvailableMinutes} min budget</span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-400">Done:</span>
            <span className="font-mono font-bold text-cyan-400">{completedMinutes} min</span>
          </div>
        </div>

        {/* Capacity Overload Warning if applicable */}
        {capacity.isOverloaded && (
          <div className="p-3.5 rounded-lg bg-rose-950/60 border border-rose-800/80 flex items-start gap-2.5 text-xs text-rose-200">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-rose-100">
                Workload Overload Warning ({capacity.excessMinutes} min excess)
              </strong>
              <span>
                Today requires {totalPlannedMinutes} minutes, which exceeds your configured daily
                available study time ({dailyAvailableMinutes} min). Consider deferring non-urgent
                revisions to tomorrow.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Daily Tasks Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold text-neutral-200">
            Scheduled Tasks ({agenda.tasks.length})
          </h3>
        </div>

        {agenda.tasks.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-8 text-center space-y-2">
            <p className="text-sm text-neutral-400">No tasks scheduled for this day.</p>
            <p className="text-xs text-neutral-500">
              Use the date navigator above or check other days of your sprint.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {agenda.tasks.map((task) => {
              const isCompleted = task.status === "completed";

              const categoryBadge =
                task.category === "grind75" ? (
                  <Badge variant="outline" className="border-blue-700/80 text-blue-400 text-[10px]">
                    Grind 75 Core
                  </Badge>
                ) : task.category === "interview_question" ? (
                  <Badge variant="outline" className="border-cyan-700/80 text-cyan-400 text-[10px]">
                    Interview Question
                  </Badge>
                ) : task.category === "interview" ? (
                  <Badge variant="outline" className="border-amber-700/80 text-amber-400 text-[10px]">
                    Review Checkpoint
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-neutral-700 text-neutral-400 text-[10px]">
                    Daily Synthesis
                  </Badge>
                );

              return (
                <div
                  key={task.id}
                  className={`rounded-xl border p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCompleted
                      ? "border-neutral-800/60 bg-neutral-950/40 opacity-70"
                      : "border-neutral-800 bg-neutral-900/90 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggle(task.id, isCompleted)}
                      className="mt-0.5 text-neutral-600 hover:text-emerald-400 transition"
                    >
                      <CheckCircle2
                        className={`h-5 w-5 ${
                          isCompleted ? "fill-emerald-500 text-black" : "text-neutral-500"
                        }`}
                      />
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {categoryBadge}
                        <span className="text-xs text-neutral-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {task.estimated_minutes} min
                        </span>
                        {task.dsa_question?.difficulty && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              task.dsa_question.difficulty === "Easy"
                                ? "border-emerald-700/60 text-emerald-400"
                                : task.dsa_question.difficulty === "Medium"
                                ? "border-amber-700/60 text-amber-400"
                                : "border-rose-700/60 text-rose-400"
                            }`}
                          >
                            {task.dsa_question.difficulty}
                          </Badge>
                        )}
                      </div>

                      <h4
                        className={`text-sm font-semibold ${
                          isCompleted ? "line-through text-neutral-400" : "text-neutral-100"
                        }`}
                      >
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-xs text-neutral-400">{task.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Links & Reschedule */}
                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800 justify-end">
                    {task.interview_question_id && (
                      <Link
                        href={`/interview-questions/${task.interview_question_id}`}
                        className="text-xs text-cyan-400 hover:text-cyan-300 px-2.5 py-1 rounded bg-neutral-800/80 hover:bg-neutral-800 transition inline-flex items-center gap-1"
                      >
                        Rubric <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}

                    {task.question_id && (
                      <Link
                        href="/dsa"
                        className="text-xs text-blue-400 hover:text-blue-300 px-2.5 py-1 rounded bg-neutral-800/80 hover:bg-neutral-800 transition inline-flex items-center gap-1"
                      >
                        Solve DSA <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}

                    {!isCompleted && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleRescheduleTomorrow(task.id)}
                        className="text-xs text-neutral-500 hover:text-neutral-300 px-2 py-1 rounded hover:bg-neutral-800 transition"
                        title="Reschedule to tomorrow"
                      >
                        Defer →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
