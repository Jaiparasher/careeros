"use client";

import Link from "next/link";
import {
  CalendarClock,
  AlertTriangle,
  CalendarCheck,
  Clock,
  Trophy,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ApplicationsSummaryStats } from "@/features/applications/service";

interface FollowupAlertsBarProps {
  stats: ApplicationsSummaryStats;
  onOpenTemplates: () => void;
}

export function FollowupAlertsBar({
  stats,
  onOpenTemplates,
}: FollowupAlertsBarProps) {
  return (
    <div className="space-y-3">
      {/* Top Banner with Alert Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Due Today */}
        <Link href="/applications?filter=due_today">
          <Card
            className={`p-3.5 border transition-all cursor-pointer hover:border-amber-600/60 ${
              stats.dueTodayCount > 0
                ? "bg-amber-950/20 border-amber-800/50"
                : "bg-neutral-900/60 border-neutral-800"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-medium text-amber-300">Due Today</span>
              <CalendarClock className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
              {stats.dueTodayCount}
            </div>
            <p className="text-[10px] text-neutral-500 mt-0.5">Follow-ups scheduled</p>
          </Card>
        </Link>

        {/* Overdue */}
        <Link href="/applications?filter=overdue">
          <Card
            className={`p-3.5 border transition-all cursor-pointer hover:border-rose-600/60 ${
              stats.overdueCount > 0
                ? "bg-rose-950/20 border-rose-800/50"
                : "bg-neutral-900/60 border-neutral-800"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-medium text-rose-300">Overdue</span>
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-rose-300 mt-1">
              {stats.overdueCount}
            </div>
            <p className="text-[10px] text-neutral-500 mt-0.5">Missed follow-up dates</p>
          </Card>
        </Link>

        {/* Upcoming Interviews */}
        <Link href="/applications?filter=interviews">
          <Card className="p-3.5 border border-neutral-800 bg-neutral-900/60 hover:border-cyan-700/60 transition cursor-pointer">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-medium text-cyan-300">Interviews</span>
              <CalendarCheck className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
              {stats.upcomingInterviewsCount}
            </div>
            <p className="text-[10px] text-neutral-500 mt-0.5">Upcoming scheduled</p>
          </Card>
        </Link>

        {/* Awaiting Response (>7d) */}
        <Link href="/applications?filter=awaiting">
          <Card className="p-3.5 border border-neutral-800 bg-neutral-900/60 hover:border-blue-700/60 transition cursor-pointer">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-medium text-blue-300">Awaiting (&gt;7d)</span>
              <Clock className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-blue-300 mt-1">
              {stats.awaitingResponseCount}
            </div>
            <p className="text-[10px] text-neutral-500 mt-0.5">No update in 7+ days</p>
          </Card>
        </Link>

        {/* Offers Received */}
        <Link href="/applications?stage=offer" className="col-span-2 sm:col-span-1">
          <Card
            className={`p-3.5 border transition-all cursor-pointer hover:border-emerald-600/60 ${
              stats.offers > 0
                ? "bg-emerald-950/20 border-emerald-800/50"
                : "bg-neutral-900/60 border-neutral-800"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-medium text-emerald-300">Offers</span>
              <Trophy className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
              {stats.offers}
            </div>
            <p className="text-[10px] text-neutral-500 mt-0.5">Offers received</p>
          </Card>
        </Link>
      </div>

      {/* Templates Quick Action */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/40 border border-neutral-800 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-emerald-400" />
          <span>
            Need to send a follow-up email or request an employee referral?
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenTemplates}
          className="border-neutral-700 hover:bg-neutral-800 text-xs h-7 gap-1.5"
        >
          View Message Templates
        </Button>
      </div>
    </div>
  );
}
