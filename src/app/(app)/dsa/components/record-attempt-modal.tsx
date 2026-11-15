"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recordAttemptAction } from "@/features/dsa/actions";

interface RecordAttemptModalProps {
  questionId: string;
  questionTitle: string;
}

export function RecordAttemptModal({ questionId, questionTitle }: RecordAttemptModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleClose() {
    setOpen(false);
    setError(null);
    setSuccess(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await recordAttemptAction(questionId, formData);
      if (!result.success) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          handleClose();
          router.refresh();
        }, 1200);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-md border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 transition-colors"
      >
        <ClipboardList className="h-3.5 w-3.5" />
        Log
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-800 bg-neutral-900 px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-neutral-100">Log Attempt</h2>
                <p className="text-xs text-neutral-500 mt-0.5 truncate max-w-xs">{questionTitle}</p>
              </div>
              <button
                onClick={handleClose}
                className="text-neutral-500 hover:text-neutral-200 transition-colors ml-4"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Success state */}
            {success ? (
              <div className="p-8 text-center">
                <div className="text-green-400 text-2xl mb-2">✓</div>
                <p className="text-sm text-neutral-300 font-medium">Attempt recorded!</p>
                <p className="text-xs text-neutral-500 mt-1">Spaced revision scheduled automatically.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Outcome */}
                <div className="space-y-1.5">
                  <Label htmlFor="a-outcome" className="text-neutral-300 text-sm">
                    Outcome <span className="text-red-400">*</span>
                  </Label>
                  <select
                    id="a-outcome"
                    name="outcome"
                    required
                    defaultValue=""
                    className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="" disabled>Select outcome</option>
                    <option value="solved_independently">Solved Independently</option>
                    <option value="solved_with_hint">Solved with Hint</option>
                    <option value="could_not_solve">Could not Solve</option>
                    <option value="revisited">Revisited</option>
                  </select>
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <Label htmlFor="a-duration" className="text-neutral-300 text-sm">
                    Duration <span className="text-neutral-500 text-xs">(minutes, optional)</span>
                  </Label>
                  <Input
                    id="a-duration"
                    name="duration_minutes"
                    type="number"
                    min={1}
                    max={240}
                    placeholder="e.g. 30"
                    className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-blue-600"
                  />
                </div>

                {/* Hint Used */}
                <div className="flex items-center gap-2.5">
                  <input
                    id="a-hint"
                    name="hint_used"
                    type="checkbox"
                    value="true"
                    className="h-4 w-4 rounded border-neutral-600 bg-neutral-800 accent-blue-500"
                  />
                  <Label htmlFor="a-hint" className="text-neutral-300 text-sm cursor-pointer">
                    Hint Used
                  </Label>
                </div>

                {/* Code Language */}
                <div className="space-y-1.5">
                  <Label htmlFor="a-lang" className="text-neutral-300 text-sm">
                    Code Language
                  </Label>
                  <select
                    id="a-lang"
                    name="code_language"
                    defaultValue="Java"
                    className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Java">Java</option>
                    <option value="Python">Python</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Go">Go</option>
                    <option value="C++">C++</option>
                  </select>
                </div>

                {/* Complexities */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="a-time" className="text-neutral-300 text-sm">
                      Time Complexity <span className="text-neutral-500 text-xs">(optional)</span>
                    </Label>
                    <Input
                      id="a-time"
                      name="time_complexity"
                      placeholder="e.g. O(n)"
                      className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-blue-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="a-space" className="text-neutral-300 text-sm">
                      Space Complexity <span className="text-neutral-500 text-xs">(optional)</span>
                    </Label>
                    <Input
                      id="a-space"
                      name="space_complexity"
                      placeholder="e.g. O(1)"
                      className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* Approach Notes */}
                <div className="space-y-1.5">
                  <Label htmlFor="a-approach" className="text-neutral-300 text-sm">
                    Approach Notes <span className="text-neutral-500 text-xs">(optional)</span>
                  </Label>
                  <textarea
                    id="a-approach"
                    name="approach_notes"
                    rows={3}
                    placeholder="Describe your approach..."
                    className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-blue-600 focus:outline-none resize-none"
                  />
                </div>

                {/* Mistake Notes */}
                <div className="space-y-1.5">
                  <Label htmlFor="a-mistakes" className="text-neutral-300 text-sm">
                    Mistake Notes <span className="text-neutral-500 text-xs">(optional)</span>
                  </Label>
                  <textarea
                    id="a-mistakes"
                    name="mistake_notes"
                    rows={2}
                    placeholder="What went wrong or what to remember..."
                    className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-blue-600 focus:outline-none resize-none"
                  />
                </div>

                {/* Error */}
                {error && (
                  <p className="rounded-md bg-red-950/50 border border-red-800 px-3 py-2 text-sm text-red-300">
                    {error}
                  </p>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    disabled={isPending}
                    className="text-neutral-400 hover:text-neutral-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Record Attempt"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
