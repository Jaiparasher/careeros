"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UploadCloud, X, Loader2, FileCheck, AlertCircle } from "lucide-react";
import { uploadResumeAction } from "@/features/resumes/actions";
import { ALLOWED_RESUME_MIME_TYPES, MAX_RESUME_FILE_SIZE_BYTES } from "@/features/resumes/schema";

interface ResumeUploadModalProps {
  hasPrimaryResume: boolean;
  versionCount: number;
}

export function ResumeUploadModal({ hasPrimaryResume, versionCount }: ResumeUploadModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [versionLabel, setVersionLabel] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [notes, setNotes] = useState("");
  const [isPrimary, setIsPrimary] = useState(!hasPrimaryResume);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !ALLOWED_RESUME_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_RESUME_MIME_TYPES)[number]
      ) &&
      !file.name.match(/\.(pdf|docx)$/i)
    ) {
      setError("Only PDF (.pdf) and Word (.docx) documents are supported.");
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_RESUME_FILE_SIZE_BYTES) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 10MB limit.`);
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Auto-fill version label if empty
    if (!versionLabel) {
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setVersionLabel(`v${versionCount + 1} - ${baseName.slice(0, 30)}`);
    }
  }

  function handleReset() {
    setSelectedFile(null);
    setVersionLabel("");
    setTargetRole("");
    setNotes("");
    setIsPrimary(!hasPrimaryResume);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please choose a resume file to upload.");
      return;
    }

    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("version_label", versionLabel.trim() || `Resume v${versionCount + 1}`);
    formData.append("target_role", targetRole.trim());
    formData.append("notes", notes.trim());
    formData.append("is_primary", isPrimary ? "true" : "false");

    startTransition(async () => {
      const result = await uploadResumeAction(formData);
      if (!result.success) {
        setError(result.error || "Failed to upload resume.");
      } else {
        handleReset();
        setIsOpen(false);
        router.refresh();
      }
    });
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => {
          handleReset();
          setIsOpen(true);
        }}
        className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-sm font-medium"
      >
        <UploadCloud className="h-4 w-4" /> Upload Resume
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl text-neutral-100 my-8">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-semibold">Upload Resume</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-neutral-400 hover:text-neutral-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-950/80 border border-red-800 p-3 text-xs text-red-200 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <Label className="text-xs text-neutral-400">
              Resume Document <span className="text-rose-400">*</span>
            </Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mt-1.5 flex flex-col items-center justify-center border-2 border-dashed border-neutral-700 hover:border-emerald-500/70 rounded-lg p-5 cursor-pointer bg-neutral-950/50 transition"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="hidden"
              />
              {selectedFile ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                  <FileCheck className="h-5 w-5" />
                  <span>{selectedFile.name}</span>
                  <span className="text-xs text-neutral-400">
                    ({(selectedFile.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
              ) : (
                <>
                  <UploadCloud className="h-8 w-8 text-neutral-400 mb-1" />
                  <span className="text-sm font-medium text-neutral-200">
                    Click to select PDF or DOCX file
                  </span>
                  <span className="text-xs text-neutral-500 mt-0.5">
                    Max file size 10MB • Private & Encrypted
                  </span>
                </>
              )}
            </div>
          </div>

          <div>
            <Label className="text-xs text-neutral-400">
              Version Label <span className="text-rose-400">*</span>
            </Label>
            <Input
              value={versionLabel}
              onChange={(e) => setVersionLabel(e.target.value)}
              placeholder="e.g. Full Stack SDE II - 2026"
              required
              className="mt-1 bg-neutral-950 border-neutral-800 text-neutral-100"
            />
          </div>

          <div>
            <Label className="text-xs text-neutral-400">Target Role (Optional)</Label>
            <Input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Java Backend Developer"
              className="mt-1 bg-neutral-950 border-neutral-800 text-neutral-100"
            />
          </div>

          <div>
            <Label className="text-xs text-neutral-400">Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tailored for distributed systems, highlighted Kafka & microservices..."
              rows={2}
              className="mt-1 bg-neutral-950 border-neutral-800 text-neutral-100 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_primary"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-700 bg-neutral-950 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="is_primary" className="text-xs text-neutral-300 font-medium cursor-pointer">
              Set as Primary Resume (used as default for job descriptions and applications)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !selectedFile}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading & Parsing...
                </>
              ) : (
                "Upload Resume"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
