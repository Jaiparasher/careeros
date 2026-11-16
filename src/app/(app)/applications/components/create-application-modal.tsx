"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, X, Loader2, AlertTriangle } from "lucide-react";
import {
  createApplicationAction,
  checkDuplicateAction,
} from "@/features/applications/actions";
import {
  type ApplicationStage,
  type WorkMode,
  type EmploymentType,
  type ReferralStatus,
  stageLabels,
} from "@/features/applications/schema";

export function CreateApplicationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    company: "",
    role_title: "",
    stage: "interested" as ApplicationStage,
    work_mode: "hybrid" as WorkMode,
    employment_type: "full_time" as EmploymentType,
    job_url: "",
    careers_url: "",
    job_description: "",
    location: "",
    salary_min_lpa: "",
    salary_max_lpa: "",
    expected_ctc_lpa: "",
    applied_salary_lpa: "",
    recruiter_name: "",
    recruiter_contact: "",
    referral_name: "",
    referral_contact: "",
    referral_status: "not_requested" as ReferralStatus,
    application_date: "",
    next_follow_up_at: "",
    interview_date: "",
    notes: "",
  });

  // Duplicate detection check when company or role or job_url changes
  useEffect(() => {
    if (!formData.company.trim() && !formData.job_url.trim()) {
      setDuplicateWarning(null);
      return;
    }

    const timer = setTimeout(async () => {
      if (formData.company.trim() && formData.role_title.trim()) {
        const res = await checkDuplicateAction(
          formData.company,
          formData.role_title,
          formData.job_url || null
        );
        if (res.success && res.data?.hasDuplicate) {
          setDuplicateWarning(res.data.reason || "Possible duplicate application found.");
        } else {
          setDuplicateWarning(null);
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.company, formData.role_title, formData.job_url]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await createApplicationAction({
        company: formData.company,
        role_title: formData.role_title,
        stage: formData.stage,
        work_mode: formData.work_mode,
        employment_type: formData.employment_type,
        job_url: formData.job_url || null,
        careers_url: formData.careers_url || null,
        job_description: formData.job_description || "",
        location: formData.location || "",
        salary_min_lpa: formData.salary_min_lpa ? Number(formData.salary_min_lpa) : null,
        salary_max_lpa: formData.salary_max_lpa ? Number(formData.salary_max_lpa) : null,
        expected_ctc_lpa: formData.expected_ctc_lpa ? Number(formData.expected_ctc_lpa) : null,
        applied_salary_lpa: formData.applied_salary_lpa ? Number(formData.applied_salary_lpa) : null,
        recruiter_name: formData.recruiter_name || "",
        recruiter_contact: formData.recruiter_contact || "",
        referral_name: formData.referral_name || "",
        referral_contact: formData.referral_contact || "",
        referral_status: formData.referral_status,
        application_date: formData.application_date || null,
        next_follow_up_at: formData.next_follow_up_at || null,
        interview_date: formData.interview_date || null,
        notes: formData.notes || "",
      });

      if (!res.success) {
        setError(res.error || "Failed to create application");
      } else {
        setIsOpen(false);
        setFormData({
          company: "",
          role_title: "",
          stage: "interested",
          work_mode: "hybrid",
          employment_type: "full_time",
          job_url: "",
          careers_url: "",
          job_description: "",
          location: "",
          salary_min_lpa: "",
          salary_max_lpa: "",
          expected_ctc_lpa: "",
          applied_salary_lpa: "",
          recruiter_name: "",
          recruiter_contact: "",
          referral_name: "",
          referral_contact: "",
          referral_status: "not_requested",
          application_date: "",
          next_follow_up_at: "",
          interview_date: "",
          notes: "",
        });
        setDuplicateWarning(null);
        router.refresh();
      }
    });
  }

  return (
    <>
      <Button
        onClick={() => {
          setIsOpen(true);
          setError(null);
          setDuplicateWarning(null);
        }}
        className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 shadow-sm text-xs sm:text-sm"
      >
        <Plus className="h-4 w-4" />
        Add Application
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-800">
              <div>
                <h2 className="text-base font-semibold text-neutral-100">
                  Track New Job Application
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Record company, role, stage, recruiter contact, and compensation targets.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-neutral-200 p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              {error && (
                <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  {error}
                </div>
              )}

              {/* Duplicate Warning Alert */}
              {duplicateWarning && (
                <div className="p-3 text-xs rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Duplicate Warning: </span>
                    <span>{duplicateWarning}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="company" className="text-xs font-medium text-neutral-300">
                    Company Name *
                  </Label>
                  <Input
                    id="company"
                    required
                    placeholder="e.g. Google, Microsoft, Startup"
                    value={formData.company}
                    onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                    className="bg-neutral-950 border-neutral-800 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="role_title" className="text-xs font-medium text-neutral-300">
                    Role Title *
                  </Label>
                  <Input
                    id="role_title"
                    required
                    placeholder="e.g. Senior Java Backend Engineer"
                    value={formData.role_title}
                    onChange={(e) => setFormData((p) => ({ ...p, role_title: e.target.value }))}
                    className="bg-neutral-950 border-neutral-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="stage" className="text-xs font-medium text-neutral-300">
                    Initial Stage
                  </Label>
                  <select
                    id="stage"
                    value={formData.stage}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, stage: e.target.value as ApplicationStage }))
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {Object.entries(stageLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="work_mode" className="text-xs font-medium text-neutral-300">
                    Work Mode
                  </Label>
                  <select
                    id="work_mode"
                    value={formData.work_mode}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, work_mode: e.target.value as WorkMode }))
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">Onsite</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-xs font-medium text-neutral-300">
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g. Bengaluru / Remote"
                    value={formData.location}
                    onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                    className="bg-neutral-950 border-neutral-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="job_url" className="text-xs font-medium text-neutral-300">
                    Job Posting URL
                  </Label>
                  <Input
                    id="job_url"
                    type="url"
                    placeholder="https://linkedin.com/jobs/..."
                    value={formData.job_url}
                    onChange={(e) => setFormData((p) => ({ ...p, job_url: e.target.value }))}
                    className="bg-neutral-950 border-neutral-800 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="careers_url" className="text-xs font-medium text-neutral-300">
                    Careers Portal URL
                  </Label>
                  <Input
                    id="careers_url"
                    type="url"
                    placeholder="https://company.com/careers"
                    value={formData.careers_url}
                    onChange={(e) => setFormData((p) => ({ ...p, careers_url: e.target.value }))}
                    className="bg-neutral-950 border-neutral-800 text-xs"
                  />
                </div>
              </div>

              {/* Compensation details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                <div className="space-y-1">
                  <Label className="text-[11px] text-neutral-400">Min Salary (LPA)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 12"
                    value={formData.salary_min_lpa}
                    onChange={(e) => setFormData((p) => ({ ...p, salary_min_lpa: e.target.value }))}
                    className="bg-neutral-900 border-neutral-800 text-xs h-8"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-neutral-400">Max Salary (LPA)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 18"
                    value={formData.salary_max_lpa}
                    onChange={(e) => setFormData((p) => ({ ...p, salary_max_lpa: e.target.value }))}
                    className="bg-neutral-900 border-neutral-800 text-xs h-8"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-neutral-400">Expected CTC (LPA)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 15"
                    value={formData.expected_ctc_lpa}
                    onChange={(e) => setFormData((p) => ({ ...p, expected_ctc_lpa: e.target.value }))}
                    className="bg-neutral-900 border-neutral-800 text-xs h-8"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-neutral-400">Applied CTC (LPA)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 15"
                    value={formData.applied_salary_lpa}
                    onChange={(e) => setFormData((p) => ({ ...p, applied_salary_lpa: e.target.value }))}
                    className="bg-neutral-900 border-neutral-800 text-xs h-8"
                  />
                </div>
              </div>

              {/* Recruiter & Referral */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                  <span className="text-[11px] font-semibold text-neutral-300">Recruiter Details</span>
                  <div className="space-y-1.5">
                    <Input
                      placeholder="Recruiter Name (e.g. Anjali Gupta)"
                      value={formData.recruiter_name}
                      onChange={(e) => setFormData((p) => ({ ...p, recruiter_name: e.target.value }))}
                      className="bg-neutral-900 border-neutral-800 text-xs h-8"
                    />
                    <Input
                      placeholder="Email / LinkedIn contact"
                      value={formData.recruiter_contact}
                      onChange={(e) => setFormData((p) => ({ ...p, recruiter_contact: e.target.value }))}
                      className="bg-neutral-900 border-neutral-800 text-xs h-8"
                    />
                  </div>
                </div>

                <div className="space-y-2 p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                  <span className="text-[11px] font-semibold text-neutral-300">Referral Contact</span>
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Referrer Name"
                        value={formData.referral_name}
                        onChange={(e) => setFormData((p) => ({ ...p, referral_name: e.target.value }))}
                        className="bg-neutral-900 border-neutral-800 text-xs h-8 flex-1"
                      />
                      <select
                        value={formData.referral_status}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            referral_status: e.target.value as ReferralStatus,
                          }))
                        }
                        className="bg-neutral-900 border border-neutral-800 rounded-md px-2 text-[11px] text-neutral-200"
                      >
                        <option value="not_requested">Not Requested</option>
                        <option value="requested">Requested</option>
                        <option value="referred">Referred</option>
                        <option value="declined">Declined</option>
                      </select>
                    </div>
                    <Input
                      placeholder="Referrer Email / Profile"
                      value={formData.referral_contact}
                      onChange={(e) => setFormData((p) => ({ ...p, referral_contact: e.target.value }))}
                      className="bg-neutral-900 border-neutral-800 text-xs h-8"
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="application_date" className="text-xs font-medium text-neutral-300">
                    Application Date
                  </Label>
                  <Input
                    id="application_date"
                    type="date"
                    value={formData.application_date}
                    onChange={(e) => setFormData((p) => ({ ...p, application_date: e.target.value }))}
                    className="bg-neutral-950 border-neutral-800 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="next_follow_up_at" className="text-xs font-medium text-neutral-300">
                    Next Follow-Up Date
                  </Label>
                  <Input
                    id="next_follow_up_at"
                    type="date"
                    value={formData.next_follow_up_at}
                    onChange={(e) => setFormData((p) => ({ ...p, next_follow_up_at: e.target.value }))}
                    className="bg-neutral-950 border-neutral-800 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-medium text-neutral-300">
                  Notes & Context
                </Label>
                <Textarea
                  id="notes"
                  rows={2}
                  placeholder="Key tech stack requirements, hiring manager info, interview impressions..."
                  value={formData.notes}
                  onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                  className="bg-neutral-950 border-neutral-800 text-xs"
                />
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
                  Save Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
