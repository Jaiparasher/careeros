"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { updateQuestionNotesAction } from "@/features/dsa/actions";

interface QuestionNotesFormProps {
  questionId: string;
  initialNotes?: string | null;
}

export function QuestionNotesForm({
  questionId,
  initialNotes,
}: QuestionNotesFormProps) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const res = await updateQuestionNotesAction(questionId, notes);
      if (!res.success) {
        setError(res.error);
      } else {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-xs text-red-400">{error}</p>}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={5}
        placeholder="Add approach notes, key insights, patterns to remember..."
        className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-blue-600 focus:outline-none resize-none"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-500">
          {saved && (
            <span className="text-green-400 inline-flex items-center gap-1">
              <Check className="h-3 w-3" /> Notes saved
            </span>
          )}
        </span>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-sm text-white font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save Notes
        </button>
      </div>
    </form>
  );
}
