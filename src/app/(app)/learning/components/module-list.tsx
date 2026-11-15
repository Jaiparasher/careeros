"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Clock, BookOpen, AlertCircle, Save } from "lucide-react";
import { updateModuleProgressAction } from "@/features/learning/actions";
import type { LearningModule } from "@/features/learning/service";

interface ModuleListProps {
  initialModules: LearningModule[];
}

export function ModuleList({ initialModules }: ModuleListProps) {
  const [modules, setModules] = useState<LearningModule[]>(initialModules);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPercent, setEditPercent] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mean =
    modules.length > 0
      ? modules.reduce((sum, m) => sum + Number(m.completion_percent), 0) / modules.length
      : 0;

  function handleStartEdit(m: LearningModule) {
    setEditingId(m.id);
    setEditPercent(Number(m.completion_percent));
    setEditNotes(m.notes ?? "");
    setErrorMsg(null);
  }

  function handleSave(moduleId: string) {
    startTransition(async () => {
      setErrorMsg(null);
      const res = await updateModuleProgressAction({
        moduleId,
        completionPercent: editPercent,
        notes: editNotes || null,
      });

      if (!res.success) {
        setErrorMsg(res.error);
        return;
      }

      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, completion_percent: editPercent, notes: editNotes || null }
            : m
        )
      );
      setEditingId(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-lg p-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Average Course Progress
          </span>
          <div className="text-2xl font-bold text-neutral-100">
            {mean.toFixed(2)}%
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Preserving Coding Shuttle 20-module baseline (Initial: 40.55%).
          </p>
        </div>
        <div className="w-48 bg-neutral-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-amber-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, mean))}%` }}
          />
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-950/40 border border-red-800 text-red-300 px-3 py-2 rounded text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-2">
        {modules.map((m) => {
          const isEditing = editingId === m.id;
          const percent = Number(m.completion_percent);
          const isComplete = percent >= 100;
          const isInProgress = percent > 0 && percent < 100;

          return (
            <Card
              key={m.id}
              className="border-neutral-800 bg-neutral-900 text-neutral-100 transition-colors"
            >
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-900">
                      Module {m.module_number}
                    </span>
                    <h3 className="text-sm font-semibold text-neutral-200">
                      {m.title}
                    </h3>
                  </div>
                  {m.notes && !isEditing && (
                    <p className="text-xs text-neutral-400 italic">
                      Note: {m.notes}
                    </p>
                  )}
                  {isEditing && (
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center gap-3">
                        <label className="text-xs text-neutral-400 w-24">
                          Progress ({editPercent}%):
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={editPercent}
                          onChange={(e) => setEditPercent(Number(e.target.value))}
                          className="flex-1 accent-amber-500"
                        />
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={editPercent}
                          onChange={(e) =>
                            setEditPercent(
                              Math.min(100, Math.max(0, Number(e.target.value)))
                            )
                          }
                          className="w-16 h-7 text-xs bg-neutral-800 border-neutral-700 text-neutral-100"
                        />
                      </div>
                      <Input
                        type="text"
                        placeholder="Add module notes (optional)..."
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="h-7 text-xs bg-neutral-800 border-neutral-700 text-neutral-100"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {!isEditing ? (
                    <>
                      <div className="text-right">
                        <span className="text-xs font-bold text-neutral-200">
                          {percent.toFixed(0)}%
                        </span>
                        <div className="w-20 bg-neutral-800 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              isComplete
                                ? "bg-emerald-500"
                                : isInProgress
                                ? "bg-amber-500"
                                : "bg-neutral-600"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          isComplete
                            ? "border-emerald-700 text-emerald-400 bg-emerald-950/20"
                            : isInProgress
                            ? "border-amber-700 text-amber-400 bg-amber-950/20"
                            : "border-neutral-700 text-neutral-400"
                        }`}
                      >
                        {isComplete ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Done
                          </span>
                        ) : isInProgress ? (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> In Progress
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" /> To Do
                          </span>
                        )}
                      </Badge>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEdit(m)}
                        className="text-xs text-neutral-400 hover:text-neutral-100 h-7 px-2"
                      >
                        Edit
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSave(m.id)}
                        disabled={isPending}
                        className="bg-amber-600 hover:bg-amber-500 text-neutral-900 font-semibold h-7 text-xs flex items-center gap-1"
                      >
                        <Save className="h-3 w-3" /> Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(null)}
                        disabled={isPending}
                        className="text-xs text-neutral-400 hover:text-neutral-200 h-7"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
