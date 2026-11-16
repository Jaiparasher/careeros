"use client";

import { useState } from "react";
import { X, Copy, Check, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  generateRecruiterFollowUpTemplate,
  generateReferralRequestTemplate,
  generateInterviewThankYouTemplate,
} from "@/features/applications/schema";

interface FollowupTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCompany?: string;
  defaultRole?: string;
}

export function FollowupTemplatesModal({
  isOpen,
  onClose,
  defaultCompany = "",
  defaultRole = "",
}: FollowupTemplatesModalProps) {
  const [activeTab, setActiveTab] = useState<"followup" | "referral" | "thankyou">("followup");
  const [copied, setCopied] = useState(false);

  const [company, setCompany] = useState(defaultCompany || "Google");
  const [role, setRole] = useState(defaultRole || "Software Engineer (Java / Backend)");
  const [applicantName, setApplicantName] = useState("Jai");
  const [interviewerName, setInterviewerName] = useState("");
  const [roundName, setRoundName] = useState("Technical Round 1");
  const [connectionName, setConnectionName] = useState("");
  const [jobUrl, setJobUrl] = useState("");

  if (!isOpen) return null;

  let currentTemplate = "";
  if (activeTab === "followup") {
    currentTemplate = generateRecruiterFollowUpTemplate({
      company,
      role,
      applicantName,
    });
  } else if (activeTab === "referral") {
    currentTemplate = generateReferralRequestTemplate({
      company,
      role,
      applicantName,
      connectionName: connectionName || undefined,
      jobUrl: jobUrl || undefined,
    });
  } else {
    currentTemplate = generateInterviewThankYouTemplate({
      company,
      role,
      interviewerName: interviewerName || undefined,
      roundName: roundName || undefined,
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(currentTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800">
          <div>
            <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              Outreach & Follow-Up Message Templates
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Copyable templates customized for recruiter follow-ups, employee referrals, and interview thank-you notes.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 p-1 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-neutral-800 px-5 pt-2 gap-2 text-xs bg-neutral-950/40">
          <button
            type="button"
            onClick={() => setActiveTab("followup")}
            className={`pb-2.5 font-medium border-b-2 transition-colors ${
              activeTab === "followup"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Recruiter Follow-Up
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("referral")}
            className={`pb-2.5 font-medium border-b-2 transition-colors ${
              activeTab === "referral"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Referral Request
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("thankyou")}
            className={`pb-2.5 font-medium border-b-2 transition-colors ${
              activeTab === "thankyou"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Post-Interview Thank You
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Form customization fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-neutral-950 border border-neutral-800/80">
            <div className="space-y-1">
              <Label className="text-[11px] text-neutral-400">Target Company</Label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="bg-neutral-900 border-neutral-800 text-xs h-8"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] text-neutral-400">Target Role Title</Label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-neutral-900 border-neutral-800 text-xs h-8"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] text-neutral-400">Your Name</Label>
              <Input
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="bg-neutral-900 border-neutral-800 text-xs h-8"
              />
            </div>

            {activeTab === "referral" && (
              <>
                <div className="space-y-1">
                  <Label className="text-[11px] text-neutral-400">Contact / Connection Name</Label>
                  <Input
                    placeholder="e.g. Alex"
                    value={connectionName}
                    onChange={(e) => setConnectionName(e.target.value)}
                    className="bg-neutral-900 border-neutral-800 text-xs h-8"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-[11px] text-neutral-400">Job Posting URL (optional)</Label>
                  <Input
                    placeholder="https://..."
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="bg-neutral-900 border-neutral-800 text-xs h-8"
                  />
                </div>
              </>
            )}

            {activeTab === "thankyou" && (
              <>
                <div className="space-y-1">
                  <Label className="text-[11px] text-neutral-400">Interviewer Name</Label>
                  <Input
                    placeholder="e.g. Priya Sharma"
                    value={interviewerName}
                    onChange={(e) => setInterviewerName(e.target.value)}
                    className="bg-neutral-900 border-neutral-800 text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-neutral-400">Round Name</Label>
                  <Input
                    placeholder="e.g. System Design Round"
                    value={roundName}
                    onChange={(e) => setRoundName(e.target.value)}
                    className="bg-neutral-900 border-neutral-800 text-xs h-8"
                  />
                </div>
              </>
            )}
          </div>

          {/* Generated Template Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-neutral-300">
                Generated Message
              </Label>
              <Button
                type="button"
                size="sm"
                onClick={handleCopy}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-7 gap-1.5"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied to Clipboard!" : "Copy Text"}
              </Button>
            </div>

            <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed select-all">
              {currentTemplate}
            </div>

            <p className="text-[10px] text-neutral-500 italic">
              * Note: CareerOS does not send emails or messages automatically. Copy and customize the text before sending via LinkedIn, Gmail, or your email client.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-neutral-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-neutral-700 text-xs text-neutral-300"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
