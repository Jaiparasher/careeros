"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  FileCode,
  Plus,
  Trash2,
  Edit2,
  X,
  Loader2,
  Building,
  Sparkles,
  Link as LinkIcon,
  Calendar,
} from "lucide-react";
import { JobDescriptionRow, JobDescriptionInput } from "@/features/resumes/schema";
import {
  createJobDescriptionAction,
  updateJobDescriptionAction,
  deleteJobDescriptionAction,
} from "@/features/resumes/actions";

interface ApplicationOption {
  id: string;
  company_name: string;
  role_title: string;
}

interface JdManagerProps {
  jobDescriptions: JobDescriptionRow[];
  applications: ApplicationOption[];
  onSelectForAnalysis: (jd: JobDescriptionRow) => void;
}

export function JdManager({
  jobDescriptions,
  applications,
  onSelectForAnalysis,
}: JdManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJd, setEditingJd] = useState<JobDescriptionRow | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState<JobDescriptionInput>({
    company: "",
    role_title: "",
    target_role: "",
    raw_text: "",
    application_id: null,
    resume_id: null,
    notes: "",
  });

  function openCreateModal() {
    setEditingJd(null);
    setFormData({
      company: "",
      role_title: "",
      target_role: "",
      raw_text: "",
      application_id: null,
      resume_id: null,
      notes: "",
    });
    setError(null);
    setIsModalOpen(true);
  }

  function openEditModal(jd: JobDescriptionRow) {
    setEditingJd(jd);
    setFormData({
      company: jd.company,
      role_title: jd.role_title,
      target_role: jd.target_role || "",
      raw_text: jd.raw_text,
      application_id: jd.application_id || null,
      resume_id: jd.resume_id || null,
      notes: jd.notes || "",
    });
    setError(null);
    setIsModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (formData.raw_text.trim().length < 10) {
      setError("Please paste the full job description text (minimum 10 characters).");
      return;
    }

    startTransition(async () => {
      if (editingJd) {
        const result = await updateJobDescriptionAction(editingJd.id, formData);
        if (!result.success) {
          setError(result.error || "Failed to update job description.");
        } else {
          setIsModalOpen(false);
          router.refresh();
        }
      } else {
        const result = await createJobDescriptionAction(formData);
        if (!result.success) {
          setError(result.error || "Failed to save job description.");
        } else {
          setIsModalOpen(false);
          router.refresh();
        }
      }
    });
  }

  function handleDelete(jd: JobDescriptionRow) {
    if (!window.confirm(`Delete job description for ${jd.company} - ${jd.role_title}?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteJobDescriptionAction(jd.id);
      if (!result.success) {
        alert(result.error || "Failed to delete job description.");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-100">
            Saved Job Descriptions
          </h3>
          <p className="text-xs text-neutral-400">
            Store JDs from target companies to track skill requirements and run keyword alignment.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" /> Save New JD
        </Button>
      </div>

      {jobDescriptions.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-8 text-center">
          <FileCode className="h-10 w-10 text-neutral-500 mx-auto mb-2.5" />
          <h4 className="text-sm font-medium text-neutral-200">No Job Descriptions Saved</h4>
          <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1 mb-4">
            Paste job descriptions from LinkedIn, Indeed, or career portals to analyze how your resume aligns with their requirements.
          </p>
          <Button
            onClick={openCreateModal}
            variant="outline"
            className="border-neutral-700 text-neutral-200 hover:bg-neutral-800 text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Paste First JD
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobDescriptions.map((jd) => {
            const linkedApp = applications.find((a) => a.id === jd.application_id);
            const formattedDate = new Date(jd.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={jd.id}
                className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-sm hover:border-neutral-700/80 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-800 border border-neutral-700 text-sky-400">
                        <Building className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-100 text-sm">{jd.role_title}</h4>
                        <p className="text-xs font-medium text-neutral-400">{jd.company}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(jd)}
                        className="h-7 w-7 p-0 text-neutral-400 hover:text-neutral-200"
                        title="Edit JD"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(jd)}
                        className="h-7 w-7 p-0 text-neutral-400 hover:text-rose-400"
                        title="Delete JD"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {linkedApp && (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-950 text-neutral-300 border border-neutral-800 text-[11px]">
                      <LinkIcon className="h-3 w-3 text-emerald-400" />
                      <span>Linked Application: {linkedApp.company_name}</span>
                    </div>
                  )}

                  {jd.extracted_skills && jd.extracted_skills.length > 0 && (
                    <div className="mt-3">
                      <span className="text-[11px] text-neutral-500 block mb-1.5">
                        Detected Skills ({jd.extracted_skills.length}):
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                        {jd.extracted_skills.map((s) => (
                          <Badge
                            key={s}
                            variant="outline"
                            className="bg-neutral-950 text-neutral-300 border-neutral-800 text-[10px] py-0"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="mt-3 text-xs text-neutral-400 line-clamp-3 bg-neutral-950/60 p-2.5 rounded border border-neutral-800/80 font-mono text-[11px]">
                    {jd.raw_text.slice(0, 200)}...
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {formattedDate}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onSelectForAnalysis(jd)}
                    className="h-7 bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1"
                  >
                    <Sparkles className="h-3 w-3" /> Analyze Alignment
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl text-neutral-100 my-8">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-semibold">
                {editingJd ? "Edit Job Description" : "Save Job Description"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-3 rounded bg-red-950/80 border border-red-800 p-2.5 text-xs text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-neutral-400">
                    Company Name <span className="text-rose-400">*</span>
                  </Label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Google, TCS, Flipkart"
                    required
                    className="mt-1 bg-neutral-950 border-neutral-800 text-neutral-100 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-400">
                    Role Title <span className="text-rose-400">*</span>
                  </Label>
                  <Input
                    value={formData.role_title}
                    onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                    placeholder="e.g. Senior Backend Engineer"
                    required
                    className="mt-1 bg-neutral-950 border-neutral-800 text-neutral-100 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-neutral-400">Target Role Domain (Optional)</Label>
                  <Input
                    value={formData.target_role || ""}
                    onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                    placeholder="e.g. Java Microservices"
                    className="mt-1 bg-neutral-950 border-neutral-800 text-neutral-100 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-400">Link to Application (Optional)</Label>
                  <select
                    value={formData.application_id || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        application_id: e.target.value ? e.target.value : null,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">None (Independent JD)</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.company_name} - {app.role_title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs text-neutral-400">
                  Full Job Description Text <span className="text-rose-400">*</span>
                </Label>
                <Textarea
                  value={formData.raw_text}
                  onChange={(e) => setFormData({ ...formData, raw_text: e.target.value })}
                  placeholder="Paste the full job description text here, including requirements, responsibilities, and qualifications..."
                  rows={8}
                  required
                  className="mt-1 bg-neutral-950 border-neutral-800 text-neutral-100 font-mono text-xs"
                />
              </div>

              <div>
                <Label className="text-xs text-neutral-400">Personal Notes (Optional)</Label>
                <Input
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Recruiter contact, key emphasis on Kafka, referral through alumni..."
                  className="mt-1 bg-neutral-950 border-neutral-800 text-neutral-100 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isPending}
                  className="text-xs border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : editingJd ? (
                    "Update JD"
                  ) : (
                    "Save JD"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
