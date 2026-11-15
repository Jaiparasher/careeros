"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Upload, Download, Loader2 } from "lucide-react";
import { AddQuestionModal } from "./add-question-modal";
import {
  syncGrind75Action,
  importQuestionsFromCSVAction,
  exportQuestionsCSVAction,
} from "@/features/dsa/actions";

export function DSAHeaderActions() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSyncing, startSync] = useTransition();
  const [isExporting, startExport] = useTransition();
  const [isImporting, startImport] = useTransition();
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(
    null
  );

  function handleSyncGrind75() {
    setFeedback(null);
    startSync(async () => {
      const res = await syncGrind75Action();
      if (!res.success) {
        setFeedback({ message: res.error, type: "error" });
      } else {
        const d = res.data;
        const msg = `Grind 75 Synced: ${d.linked} linked, ${d.inserted} inserted, ${d.skipped} already up to date.`;
        setFeedback({ message: msg, type: "success" });
        router.refresh();
      }
    });
  }

  function handleExportCSV() {
    setFeedback(null);
    startExport(async () => {
      const res = await exportQuestionsCSVAction();
      if (!res.success) {
        setFeedback({ message: res.error, type: "error" });
        return;
      }
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `careeros_dsa_questions_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFeedback(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        setFeedback({ message: "CSV file is empty or only contains header.", type: "error" });
        return;
      }

      const headers = lines[0]!.split(",").map((h) => h.trim().toLowerCase());
      const rows = lines.slice(1).map((line) => {
        // Basic CSV split supporting quoted strings
        const values: string[] = [];
        let inQuotes = false;
        let cur = "";
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            values.push(cur.trim());
            cur = "";
          } else {
            cur += char;
          }
        }
        values.push(cur.trim());

        const rowObj: Record<string, string> = {};
        headers.forEach((h, i) => {
          rowObj[h] = values[i] ?? "";
        });

        return {
          title: rowObj.title ?? "",
          url: rowObj.url || undefined,
          difficulty: (rowObj.difficulty?.toLowerCase() as "easy" | "medium" | "hard") ?? "medium",
          patterns: rowObj.patterns || undefined,
          source: rowObj.source || undefined,
          status: (rowObj.status?.toLowerCase() as "not_started" | "attempted" | "solved" | "needs_revision") ?? "not_started",
          notes: rowObj.notes || undefined,
          time_complexity: rowObj.time_complexity || undefined,
          space_complexity: rowObj.space_complexity || undefined,
        };
      });

      startImport(async () => {
        const res = await importQuestionsFromCSVAction(rows);
        if (!res.success) {
          setFeedback({ message: res.error, type: "error" });
        } else {
          const d = res.data;
          const msg = `CSV Import: ${d.imported} imported, ${d.skipped} skipped${
            d.errors.length ? `, ${d.errors.length} errors` : ""
          }`;
          setFeedback({
            message: msg,
            type: d.errors.length > 0 && d.imported === 0 ? "error" : "success",
          });
          router.refresh();
        }
      });
    };

    reader.readAsText(file);
    // Reset input
    e.target.value = "";
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <AddQuestionModal />

        <button
          onClick={handleSyncGrind75}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 disabled:opacity-50 transition-colors"
        >
          {isSyncing ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Sync Grind 75
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="inline-flex items-center gap-1.5 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 disabled:opacity-50 transition-colors"
        >
          {isImporting ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Import CSV
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelected}
          className="hidden"
        />

        <button
          onClick={handleExportCSV}
          disabled={isExporting}
          className="inline-flex items-center gap-1.5 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 disabled:opacity-50 transition-colors"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export CSV
        </button>
      </div>

      {feedback && (
        <div
          className={`text-xs px-3 py-1.5 rounded border max-w-md ${
            feedback.type === "success"
              ? "border-green-800/60 bg-green-950/40 text-green-300"
              : "border-red-800/60 bg-red-950/40 text-red-300"
          }`}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}
