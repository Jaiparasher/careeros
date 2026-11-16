"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Clock,
  User,
  Trophy,
  CalendarCheck,
  FileText,
  MessageSquare,
  Building2,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StageBadge } from "../../components/stage-badge";
import { FollowupTemplatesModal } from "../../components/followup-templates-modal";
import { InterviewRoundsTab } from "./interview-rounds-tab";
import { ActivityTimelineTab } from "./activity-timeline-tab";
import { EditApplicationModal } from "./edit-application-modal";
import { changeApplicationStageAction } from "@/features/applications/actions";
import {
  type ApplicationStage,
  type OfferDetails,
  stageLabels,
} from "@/features/applications/schema";
import type {
  JobApplicationRecord,
  ApplicationActivityRecord,
  InterviewRoundRecord,
} from "@/features/applications/service";

interface ApplicationDetailProps {
  application: JobApplicationRecord;
  activity: ApplicationActivityRecord[];
  rounds: InterviewRoundRecord[];
}

export function ApplicationDetail({
  application,
  activity,
  rounds,
}: ApplicationDetailProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "rounds" | "timeline">("overview");
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleStageChange(newStage: ApplicationStage) {
    startTransition(async () => {
      await changeApplicationStageAction(application.id, newStage);
      router.refresh();
    });
  }

  const offer = (application.offer_details || {}) as Partial<OfferDetails>;
  const todayStr = new Date().toISOString().slice(0, 10);
  const isFollowupDue =
    application.next_follow_up_at &&
    application.stage !== "offer" &&
    application.stage !== "rejected" &&
    application.next_follow_up_at <= todayStr;

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl animate-in fade-in duration-200">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Link
          href="/applications"
          className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Applications
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 shadow-sm">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100">
              {application.company}
            </h1>
            <StageBadge stage={application.stage} />
            <Badge
              variant="outline"
              className="bg-neutral-950 text-neutral-400 border-neutral-800 text-xs capitalize"
            >
              {application.work_mode}
            </Badge>
            <Badge
              variant="outline"
              className="bg-neutral-950 text-neutral-400 border-neutral-800 text-xs"
            >
              {application.employment_type.replace("_", " ")}
            </Badge>
          </div>

          <div className="text-sm font-medium text-neutral-200">
            {application.role_title}
          </div>

          {/* Quick links & metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 pt-1">
            {application.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-neutral-500" />
                {application.location}
              </span>
            )}

            {application.job_url && (
              <a
                href={application.job_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Job Posting
              </a>
            )}

            {application.careers_url && (
              <a
                href={application.careers_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-neutral-300 hover:text-white transition"
              >
                <Building2 className="h-3.5 w-3.5 text-neutral-400" />
                Careers Portal
              </a>
            )}

            {application.application_date && (
              <span className="text-neutral-400">
                Applied: {application.application_date}
              </span>
            )}
          </div>
        </div>

        {/* Stage Mover & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
          <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            <span className="text-[11px] text-neutral-400 pl-1.5 font-medium">Stage:</span>
            <select
              disabled={isPending}
              value={application.stage}
              onChange={(e) => handleStageChange(e.target.value as ApplicationStage)}
              className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {Object.entries(stageLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTemplatesOpen(true)}
            className="border-neutral-700 text-xs gap-1.5"
          >
            <MessageSquare className="h-3.5 w-3.5 text-neutral-400" />
            Templates
          </Button>

          <EditApplicationModal application={application} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 gap-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium border-b-2 transition-colors ${
            activeTab === "overview"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <FileText className="h-4 w-4" />
          Overview & Compensation
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rounds")}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium border-b-2 transition-colors ${
            activeTab === "rounds"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <CalendarCheck className="h-4 w-4" />
          Interview Rounds
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-800 text-neutral-300 font-mono">
            {rounds.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("timeline")}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium border-b-2 transition-colors ${
            activeTab === "timeline"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <Clock className="h-4 w-4" />
          Activity & Audit Log
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-800 text-neutral-300 font-mono">
            {activity.length}
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          {/* Follow-up reminder if set */}
          {application.next_follow_up_at && (
            <div
              className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                isFollowupDue
                  ? "bg-rose-950/20 border-rose-800/50 text-rose-300"
                  : "bg-neutral-900/60 border-neutral-800 text-neutral-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" />
                <span>
                  Next scheduled follow-up:{" "}
                  <strong className="font-mono">{application.next_follow_up_at}</strong>
                  {isFollowupDue && " (Due / Action required today)"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTemplatesOpen(true)}
                className="border-neutral-700 text-xs h-7"
              >
                Draft Follow-Up Email
              </Button>
            </div>
          )}

          {/* Compensation Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-3.5 bg-neutral-900/60 border-neutral-800 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-neutral-500">
                Posted Salary Range
              </span>
              <div className="text-base font-bold font-mono text-neutral-200">
                {application.salary_min_lpa && application.salary_max_lpa
                  ? `₹${application.salary_min_lpa} - ${application.salary_max_lpa} LPA`
                  : application.salary_min_lpa || application.salary_max_lpa
                  ? `₹${application.salary_min_lpa || application.salary_max_lpa} LPA`
                  : "Not Disclosed"}
              </div>
            </Card>

            <Card className="p-3.5 bg-neutral-900/60 border-neutral-800 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-neutral-500">
                Expected CTC
              </span>
              <div className="text-base font-bold font-mono text-cyan-300">
                {application.expected_ctc_lpa
                  ? `₹${application.expected_ctc_lpa} LPA`
                  : "—"}
              </div>
            </Card>

            <Card className="p-3.5 bg-neutral-900/60 border-neutral-800 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-neutral-500">
                Applied CTC
              </span>
              <div className="text-base font-bold font-mono text-neutral-200">
                {application.applied_salary_lpa
                  ? `₹${application.applied_salary_lpa} LPA`
                  : "—"}
              </div>
            </Card>

            <Card className="p-3.5 bg-neutral-900/60 border-neutral-800 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-neutral-500">
                Offer Status
              </span>
              <div className="text-base font-bold text-emerald-400 capitalize">
                {offer.decision && offer.decision !== "pending"
                  ? offer.decision
                  : application.stage === "offer"
                  ? "Offer Received"
                  : "In Pipeline"}
              </div>
            </Card>
          </div>

          {/* Offer Details if present */}
          {(offer.base_salary_lpa || offer.bonus_lpa || offer.equity_details || application.stage === "offer") && (
            <Card className="p-4 bg-emerald-950/20 border-emerald-800/40 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold">
                <Trophy className="h-4 w-4 text-emerald-400" />
                Offer Details & Compensation Breakdown
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-neutral-400 text-[11px] block">Base Salary</span>
                  <span className="font-mono font-bold text-emerald-300">
                    {offer.base_salary_lpa ? `₹${offer.base_salary_lpa} LPA` : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 text-[11px] block">Annual Bonus</span>
                  <span className="font-mono font-bold text-emerald-300">
                    {offer.bonus_lpa ? `₹${offer.bonus_lpa} LPA` : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 text-[11px] block">Decision Deadline</span>
                  <span className="text-neutral-200">
                    {offer.offer_deadline || "No deadline recorded"}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 text-[11px] block">Decision</span>
                  <span className="capitalize font-semibold text-emerald-300">
                    {offer.decision || "Pending"}
                  </span>
                </div>
              </div>

              {offer.equity_details && (
                <div className="text-xs pt-1 border-t border-emerald-900/30">
                  <span className="text-neutral-400 text-[11px] block">Equity & Perks</span>
                  <span className="text-neutral-200 leading-relaxed">
                    {offer.equity_details}
                  </span>
                </div>
              )}
            </Card>
          )}

          {/* Contacts & Referral */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Recruiter Details */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-blue-400" />
                Recruiter Information
              </h3>
              {application.recruiter_name || application.recruiter_contact ? (
                <div className="space-y-1 text-xs text-neutral-300">
                  <div className="font-medium">{application.recruiter_name || "Recruiter"}</div>
                  {application.recruiter_contact && (
                    <div className="text-neutral-400 flex items-center gap-1.5 font-mono text-[11px]">
                      <Mail className="h-3 w-3 text-neutral-500" />
                      {application.recruiter_contact}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-neutral-500 italic">
                  No recruiter contact documented yet.
                </p>
              )}
            </div>

            {/* Referral Contact */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-purple-400" />
                Employee Referral Status
              </h3>
              {application.referral_name || application.referral_status !== "not_requested" ? (
                <div className="space-y-1 text-xs text-neutral-300">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{application.referral_name || "Employee"}</span>
                    <Badge variant="outline" className="text-[10px] capitalize border-purple-800 text-purple-300">
                      {application.referral_status.replace("_", " ")}
                    </Badge>
                  </div>
                  {application.referral_contact && (
                    <div className="text-neutral-400 text-[11px] font-mono">
                      {application.referral_contact}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-neutral-500 italic">
                  No referral requested for this role.
                </p>
              )}
            </div>
          </div>

          {/* Job Description & Notes */}
          {application.job_description && (
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Job Description
              </h3>
              <p className="text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto pr-2">
                {application.job_description}
              </p>
            </div>
          )}

          {application.notes && (
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Personal Notes & Strategy
              </h3>
              <p className="text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed">
                {application.notes}
              </p>
            </div>
          )}

          {application.rejection_reason && (
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-1 text-xs text-rose-300">
              <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block">
                Rejection Reason / Learnings
              </span>
              <p className="leading-relaxed">{application.rejection_reason}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "rounds" && (
        <InterviewRoundsTab
          applicationId={application.id}
          rounds={rounds}
        />
      )}

      {activeTab === "timeline" && (
        <ActivityTimelineTab activity={activity} />
      )}

      {/* Templates Modal */}
      <FollowupTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        defaultCompany={application.company}
        defaultRole={application.role_title}
      />
    </div>
  );
}
