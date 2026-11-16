"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  Star,
  Trash2,
  Edit3,
  Loader2,
  Calendar,
  HardDrive,
  Briefcase,
} from "lucide-react";
import { ResumeRow } from "@/features/resumes/schema";
import {
  getResumeDownloadUrlAction,
  setPrimaryResumeAction,
  deleteResumeAction,
} from "@/features/resumes/actions";
import { ExtractedTextModal } from "./extracted-text-modal";

interface ResumeVersionCardProps {
  resume: ResumeRow;
  onSelectForAnalysis?: (resume: ResumeRow) => void;
}

export function ResumeVersionCard({ resume, onSelectForAnalysis }: ResumeVersionCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showTextModal, setShowTextModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDownload() {
    setError(null);
    setIsDownloading(true);
    try {
      const res = await getResumeDownloadUrlAction(resume.id);
      if (res.success && res.data?.signedUrl) {
        // Open signed download link
        const a = document.createElement("a");
        a.href = res.data.signedUrl;
        a.download = res.data.fileName || "resume";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        setError(res.error || "Failed to generate secure download link.");
      }
    } catch {
      setError("Download request failed.");
    } finally {
      setIsDownloading(false);
    }
  }

  function handleSetPrimary() {
    setError(null);
    startTransition(async () => {
      const res = await setPrimaryResumeAction(resume.id);
      if (!res.success) {
        setError(res.error || "Failed to set primary resume.");
      } else {
        router.refresh();
      }
    });
  }

  function handleDelete() {
    if (!window.confirm(`Are you sure you want to delete "${resume.version_label}"? This will remove the file permanently.`)) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await deleteResumeAction(resume.id);
      if (!res.success) {
        setError(res.error || "Failed to delete resume.");
      } else {
        router.refresh();
      }
    });
  }

  const formattedDate = new Date(resume.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedSize =
    resume.file_size_bytes < 1024 * 1024
      ? `${(resume.file_size_bytes / 1024).toFixed(0)} KB`
      : `${(resume.file_size_bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-sm hover:border-neutral-700/80 transition flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-800 border border-neutral-700 text-emerald-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-neutral-100 text-sm md:text-base">
                    {resume.version_label}
                  </h4>
                  {resume.is_primary && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[11px] gap-1 font-medium">
                      <Star className="h-3 w-3 fill-emerald-400" /> Primary
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-neutral-400 mt-0.5 truncate max-w-xs md:max-w-sm">
                  {resume.file_name}
                </p>
              </div>
            </div>

            {/* Extraction badge */}
            <Badge
              variant="outline"
              className={
                resume.extraction_status === "completed"
                  ? "bg-emerald-950/60 text-emerald-400 border-emerald-800 text-[10px]"
                  : resume.extraction_status === "manual"
                  ? "bg-sky-950/60 text-sky-400 border-sky-800 text-[10px]"
                  : resume.extraction_status === "failed"
                  ? "bg-amber-950/60 text-amber-400 border-amber-800 text-[10px]"
                  : "bg-neutral-800 text-neutral-400 text-[10px]"
              }
            >
              {resume.extraction_status === "completed" && "Text Extracted"}
              {resume.extraction_status === "manual" && "Text Edited"}
              {resume.extraction_status === "failed" && "Extraction Failed"}
              {resume.extraction_status === "pending" && "Extraction Pending"}
            </Badge>
          </div>

          {/* Target Role & Notes */}
          {resume.target_role && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-300">
              <Briefcase className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
              <span className="font-medium text-neutral-200">{resume.target_role}</span>
            </div>
          )}

          {resume.notes && (
            <p className="mt-2 text-xs text-neutral-400 line-clamp-2 bg-neutral-950/60 p-2 rounded border border-neutral-800/80">
              {resume.notes}
            </p>
          )}

          {/* Metadata */}
          <div className="mt-3.5 flex items-center gap-4 text-[11px] text-neutral-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" /> {formattedSize}
            </span>
          </div>

          {error && (
            <div className="mt-2 rounded bg-red-950/70 border border-red-800 p-2 text-xs text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              className="h-8 text-xs border-neutral-700 text-neutral-300 hover:bg-neutral-800 gap-1.5"
            >
              {isDownloading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5 text-neutral-400" />
              )}
              Download
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowTextModal(true)}
              className="h-8 text-xs border-neutral-700 text-neutral-300 hover:bg-neutral-800 gap-1.5"
            >
              <Edit3 className="h-3.5 w-3.5 text-neutral-400" />
              View / Edit Text
            </Button>

            {onSelectForAnalysis && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onSelectForAnalysis(resume)}
                className="h-8 text-xs border-emerald-800 text-emerald-400 hover:bg-emerald-950/50"
              >
                Compare with JD
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            {!resume.is_primary && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSetPrimary}
                disabled={isPending}
                className="h-8 text-xs text-neutral-400 hover:text-emerald-400 hover:bg-emerald-950/30 gap-1"
                title="Set as primary resume"
              >
                <Star className="h-3.5 w-3.5" /> Make Primary
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isPending}
              className="h-8 w-8 p-0 text-neutral-500 hover:text-rose-400 hover:bg-rose-950/30"
              title="Delete resume"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <ExtractedTextModal
        resume={resume}
        isOpen={showTextModal}
        onClose={() => setShowTextModal(false)}
      />
    </>
  );
}
