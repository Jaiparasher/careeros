"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Settings, X, Loader2, Trash2, AlertTriangle } from "lucide-react";
import {
  updateApplicationAction,
  deleteApplicationAction,
} from "@/features/applications/actions";
import {
  type ApplicationStage,
  type WorkMode,
  type OfferDetails,
  stageLabels,
} from "@/features/applications/schema";
import type { JobApplicationRecord } from "@/features/applications/service";

interface EditApplicationModalProps {
  application: JobApplicationRecord;
}

export function EditApplicationModal({ application }: EditApplicationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const offer = (application.offer_details || {}) as Partial<OfferDetails>;

  const [formData, setFormData] = useState({
    company: application.company || "",
    role_title: application.role_title || "",
    stage: application.stage,
    work_mode: application.work_mode,
    employment_type: application.employment_type || "full_time",
    job_url: application.job_url || "",
    careers_url: application.careers_url || "",
    job_description: application.job_description || "",
    location: application.location || "",
    salary_min_lpa: application.salary_min_lpa?.toString() || "",
    salary_max_lpa: application.salary_max_lpa?.toString() || "",
    expected_ctc_lpa: application.expected_ctc_lpa?.toString() || "",
    applied_salary_lpa: application.applied_salary_lpa?.toString() || "",
    recruiter_name: application.recruiter_name || "",
    recruiter_contact: application.recruiter_contact || "",
    referral_name: application.referral_name || "",
    referral_contact: application.referral_contact || "",
    referral_status: application.referral_status || "not_requested",
    application_date: application.application_date || "",
    next_follow_up_at: application.next_follow_up_at || "",
    interview_date: application.interview_date
      ? new Date(application.interview_date).toISOString().slice(0, 16)
      : "",
    notes: application.notes || "",
    rejection_reason: application.rejection_reason || "",
    // Offer details
    offer_base_salary_lpa: offer.base_salary_lpa?.toString() || "",
    offer_bonus_lpa: offer.bonus_lpa?.toString() || "",
    offer_equity_details: offer.equity_details || "",
    offer_benefits_summary: offer.benefits_summary || "",
    offer_deadline: offer.offer_deadline || "",
    offer_decision: offer.decision || "pending",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await updateApplicationAction(application.id, {
        company: formData.company,
        role_title: formData.role_title,
        stage: formData.stage,
        work_mode: formData.work_mode,
        employment_type: formData.employment_type,
        job_url: formData.job_url || null,
        careers_url: formData.careers_url || null,
        job_description: formData.job_description,
        location: formData.location,
        salary_min_lpa: formData.salary_min_lpa ? Number(formData.salary_min_lpa) : null,
        salary_max_lpa: formData.salary_max_lpa ? Number(formData.salary_max_lpa) : null,
        expected_ctc_lpa: formData.expected_ctc_lpa ? Number(formData.expected_ctc_lpa) : null,
        applied_salary_lpa: formData.applied_salary_lpa ? Number(formData.applied_salary_lpa) : null,
        recruiter_name: formData.recruiter_name,
        recruiter_contact: formData.recruiter_contact,
        referral_name: formData.referral_name,
        referral_contact: formData.referral_contact,
        referral_status: formData.referral_status,
        application_date: formData.application_date || null,
        next_follow_up_at: formData.next_follow_up_at || null,
        interview_date: formData.interview_date
          ? new Date(formData.interview_date).toISOString()
          : null,
        notes: formData.notes,
        rejection_reason: formData.rejection_reason,
        offer_details: {
          base_salary_lpa: formData.offer_base_salary_lpa
            ? Number(formData.offer_base_salary_lpa)
            : null,
          bonus_lpa: formData.offer_bonus_lpa ? Number(formData.offer_bonus_lpa) : null,
          equity_details: formData.offer_equity_details,
          benefits_summary: formData.offer_benefits_summary,
          offer_deadline: formData.offer_deadline || null,
          decision: formData.offer_decision,
        },
      });

      if (!res.success) {
        setError(res.error || "Failed to update application");
      } else {
        setIsOpen(false);
        router.refresh();
      }
    });
  }

  function handleDelete() {
    setIsDeleting(true);
    startTransition(async () => {
      const res = await deleteApplicationAction(application.id);
      if (!res.success) {
        setError(res.error || "Failed to delete application");
        setIsDeleting(false);
      } else {
        router.push("/applications");
        router.refresh();
      }
    });
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setIsOpen(true);
          setError(null);
          setConfirmDelete(false);
        }}
        className="border-neutral-700 text-xs gap-1.5"
      >
        <Settings className="h-3.5 w-3.5 text-neutral-400" />
        Edit Details
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h2 className="text-base font-semibold text-neutral-100">
                Edit Application Settings
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-neutral-200 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {error && (
                <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-neutral-300">Company Name *</Label>
                  <Input
                    required
                    value={formData.company}
                    onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                    className="bg-neutral-950 border-neutral-800 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-neutral-300">Role Title *</Label>
                  <Input
                    required
                    value={formData.role_title}
                    onChange={(e) => setFormData((p) => ({ ...p, role_title: e.target.value }))}
                    className="bg-neutral-950 border-neutral-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-neutral-300">Stage</Label>
                  <select
                    value={formData.stage}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, stage: e.target.value as ApplicationStage }))
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-neutral-200"
                  >
                    {Object.entries(stageLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-neutral-300">Work Mode</Label>
                  <select
                    value={formData.work_mode}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, work_mode: e.target.value as WorkMode }))
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-neutral-200"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">Onsite</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-neutral-300">Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                    className="bg-neutral-950 border-neutral-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-neutral-300">Job URL</Label>
                  <Input
                    type="url"
                    value={formData.job_url}
                    onChange={(e) => setFormData((p) => ({ ...p, job_url: e.target.value }))}
                    className="bg-neutral-950 border-neutral-800 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-neutral-300">Careers Portal URL</Label>
                  <Input
                    type="url"
                    value={formData.careers_url}
                    onChange={(e) => setFormData((p) => ({ ...p, careers_url: e.target.value }))}
                    className="bg-neutral-950 border-neutral-800 text-xs"
                  />
                </div>
              </div>

              {/* Offer Details section */}
              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2.5">
                <span className="text-xs font-semibold text-emerald-400">
                  Offer & Compensation Breakdown
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-neutral-400">Base Salary (LPA)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={formData.offer_base_salary_lpa}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, offer_base_salary_lpa: e.target.value }))
                      }
                      className="bg-neutral-900 border-neutral-800 text-xs h-8"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] text-neutral-400">Annual Bonus (LPA)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={formData.offer_bonus_lpa}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, offer_bonus_lpa: e.target.value }))
                      }
                      className="bg-neutral-900 border-neutral-800 text-xs h-8"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] text-neutral-400">Offer Deadline</Label>
                    <Input
                      type="date"
                      value={formData.offer_deadline}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, offer_deadline: e.target.value }))
                      }
                      className="bg-neutral-900 border-neutral-800 text-xs h-8"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] text-neutral-400">Offer Decision</Label>
                    <select
                      value={formData.offer_decision}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          offer_decision: e.target.value as "pending" | "accepted" | "declined",
                        }))
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 text-xs text-neutral-200 h-8"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] text-neutral-400">Equity / Stocks / Joining Bonus</Label>
                  <Input
                    placeholder="e.g. ₹4L RSUs vested over 4 years, ₹1L joining bonus"
                    value={formData.offer_equity_details}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, offer_equity_details: e.target.value }))
                    }
                    className="bg-neutral-900 border-neutral-800 text-xs h-8"
                  />
                </div>
              </div>

              {/* Dates & Rejection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-neutral-300">Next Follow-Up Date</Label>
                  <Input
                    type="date"
                    value={formData.next_follow_up_at}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, next_follow_up_at: e.target.value }))
                    }
                    className="bg-neutral-950 border-neutral-800 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-neutral-300">Rejection Reason (if rejected)</Label>
                  <Input
                    placeholder="e.g. Position filled internally / candidate location mismatch"
                    value={formData.rejection_reason}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, rejection_reason: e.target.value }))
                    }
                    className="bg-neutral-950 border-neutral-800 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-neutral-300">Notes</Label>
                <Textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                  className="bg-neutral-950 border-neutral-800 text-xs"
                />
              </div>

              {/* Danger Zone: Delete */}
              <div className="pt-4 border-t border-neutral-800/80">
                {!confirmDelete ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(true)}
                    className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete this application...
                  </Button>
                ) : (
                  <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/50 space-y-2">
                    <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                      Permanently delete this application?
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      This will remove all interview rounds and activity history associated with this application. This action cannot be undone.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        disabled={isDeleting}
                        onClick={handleDelete}
                        className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-7 gap-1"
                      >
                        {isDeleting && <Loader2 className="h-3 w-3 animate-spin" />}
                        Yes, Delete Application
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isDeleting}
                        onClick={() => setConfirmDelete(false)}
                        className="text-xs h-7 text-neutral-400 hover:text-neutral-200"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-neutral-400 hover:text-neutral-200 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5"
                >
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
