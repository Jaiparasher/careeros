"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Copy, Check, Save, Loader2, AlertTriangle, FileText } from "lucide-react";
import { updateResumeTextAction } from "@/features/resumes/actions";
import { ResumeRow } from "@/features/resumes/schema";

interface ExtractedTextModalProps {
  resume: ResumeRow;
  isOpen: boolean;
  onClose: () => void;
}

export function ExtractedTextModal({ resume, isOpen, onClose }: ExtractedTextModalProps) {
  const [text, setText] = useState(resume.extracted_text || "");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  function handleSave() {
    setError(null);
    setSavedSuccess(false);

    if (!text.trim()) {
      setError("Resume text cannot be blank.");
      return;
    }

    startTransition(async () => {
      const result = await updateResumeTextAction(resume.id, text);
      if (!result.success) {
        setError(result.error || "Failed to update resume text.");
      } else {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        router.refresh();
      }
    });
  }

  const isFailed = resume.extraction_status === "failed" || !resume.extracted_text;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl text-neutral-100 my-8">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-semibold leading-tight">
                Extracted Text: {resume.version_label}
              </h3>
              <p className="text-xs text-neutral-400">{resume.file_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                resume.extraction_status === "completed"
                  ? "bg-emerald-950/60 text-emerald-400 border-emerald-800 text-[10px]"
                  : resume.extraction_status === "manual"
                  ? "bg-sky-950/60 text-sky-400 border-sky-800 text-[10px]"
                  : "bg-amber-950/60 text-amber-400 border-amber-800 text-[10px]"
              }
            >
              Status: {resume.extraction_status}
            </Badge>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-200 transition ml-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isFailed && (
          <div className="mt-3 rounded-lg bg-amber-950/40 border border-amber-800/80 p-3 text-xs text-amber-200 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-semibold">Automatic parser did not find readable text.</span>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                The uploaded document may be a scanned image or contain custom embedded fonts.
                You can paste your resume text below and click &quot;Save Updates&quot; to enable
                deterministic skill matching.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-3 rounded-lg bg-red-950/80 border border-red-800 p-2.5 text-xs text-red-200">
            {error}
          </div>
        )}

        {savedSuccess && (
          <div className="mt-3 rounded-lg bg-emerald-950/80 border border-emerald-800 p-2.5 text-xs text-emerald-200 flex items-center gap-1.5">
            <Check className="h-4 w-4" /> Text updated successfully!
          </div>
        )}

        <div className="mt-4">
          <div className="flex items-center justify-between pb-1.5">
            <span className="text-xs font-medium text-neutral-400">
              Resume Content ({text.length} characters • {text.split(/\s+/).filter(Boolean).length} words)
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-7 text-xs border-neutral-700 text-neutral-300 hover:bg-neutral-800 gap-1"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or edit resume text here..."
            rows={16}
            className="w-full font-mono text-xs leading-relaxed bg-neutral-950 border-neutral-800 text-neutral-200 p-3 rounded-lg focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center justify-between pt-4 mt-2 border-t border-neutral-800">
          <span className="text-[11px] text-neutral-500">
            Changes are saved to your account and used for JD keyword alignment.
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" /> Save Updates
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
