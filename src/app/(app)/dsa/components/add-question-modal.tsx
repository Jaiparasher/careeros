"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addQuestionAction } from "@/features/dsa/actions";

function validateLeetCodeUrl(url: string): boolean {
  if (!url) return true; // optional
  try {
    const u = new URL(url);
    return u.hostname === "leetcode.com";
  } catch {
    return false;
  }
}

export function AddQuestionModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  function handleClose() {
    setOpen(false);
    setError(null);
    setUrlError(null);
  }

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (val && !validateLeetCodeUrl(val)) {
      setUrlError("Must be a valid leetcode.com URL");
    } else {
      setUrlError(null);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const url = formData.get("leetcode_url") as string;
    if (url && !validateLeetCodeUrl(url)) {
      setUrlError("Must be a valid leetcode.com URL");
      return;
    }

    startTransition(async () => {
      const result = await addQuestionAction(formData);
      if (!result.success) {
        setError(result.error);
      } else {
        handleClose();
        router.refresh();
      }
    });
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
        size="sm"
      >
        <Plus className="h-4 w-4 mr-1.5" />
        Add Question
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
              <h2 className="text-base font-semibold text-neutral-100">Add DSA Question</h2>
              <button
                onClick={handleClose}
                className="text-neutral-500 hover:text-neutral-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="q-title" className="text-neutral-300 text-sm">
                  Title <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="q-title"
                  name="title"
                  required
                  placeholder="e.g. Two Sum"
                  className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-blue-600"
                />
              </div>

              {/* LeetCode URL */}
              <div className="space-y-1.5">
                <Label htmlFor="q-url" className="text-neutral-300 text-sm">
                  LeetCode URL <span className="text-neutral-500 text-xs">(optional)</span>
                </Label>
                <Input
                  id="q-url"
                  name="leetcode_url"
                  type="url"
                  placeholder="https://leetcode.com/problems/two-sum/"
                  onChange={handleUrlChange}
                  className={`bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-blue-600 ${
                    urlError ? "border-red-600" : ""
                  }`}
                />
                {urlError && <p className="text-xs text-red-400">{urlError}</p>}
              </div>

              {/* Difficulty */}
              <div className="space-y-1.5">
                <Label htmlFor="q-difficulty" className="text-neutral-300 text-sm">
                  Difficulty <span className="text-red-400">*</span>
                </Label>
                <select
                  id="q-difficulty"
                  name="difficulty"
                  required
                  defaultValue=""
                  className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-blue-600 focus:outline-none"
                >
                  <option value="" disabled>
                    Select difficulty
                  </option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Patterns / Topics */}
              <div className="space-y-1.5">
                <Label htmlFor="q-topics" className="text-neutral-300 text-sm">
                  Patterns / Topics{" "}
                  <span className="text-neutral-500 text-xs">(comma or semicolon separated)</span>
                </Label>
                <Input
                  id="q-topics"
                  name="topics"
                  placeholder="e.g. Array, Hash Table, Two Pointers"
                  className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-blue-600"
                />
              </div>

              {/* Source */}
              <div className="space-y-1.5">
                <Label htmlFor="q-source" className="text-neutral-300 text-sm">
                  Source <span className="text-neutral-500 text-xs">(optional, defaults to &quot;Personal&quot;)</span>
                </Label>
                <Input
                  id="q-source"
                  name="source"
                  placeholder="Personal"
                  className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-blue-600"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="q-notes" className="text-neutral-300 text-sm">
                  Notes <span className="text-neutral-500 text-xs">(optional)</span>
                </Label>
                <textarea
                  id="q-notes"
                  name="notes"
                  rows={3}
                  placeholder="Initial notes or hints..."
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
                  disabled={isPending || !!urlError}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Question"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
