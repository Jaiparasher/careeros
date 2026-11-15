"use client";

import * as React from "react";
import { completeOnboardingAction } from "@/features/profile/actions";
import { type ProfileFormInput } from "@/features/profile/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, BookOpen, Target, ArrowRight } from "lucide-react";

export function OnboardingForm({ initialDefaults }: { initialDefaults: ProfileFormInput }) {
  const [formData, setFormData] = React.useState<ProfileFormInput>(initialDefaults);
  const [targetRoleInput, setTargetRoleInput] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  function handleAddRole() {
    if (!targetRoleInput.trim()) return;
    if (!formData.target_roles.includes(targetRoleInput.trim())) {
      setFormData({
        ...formData,
        target_roles: [...formData.target_roles, targetRoleInput.trim()],
      });
    }
    setTargetRoleInput("");
  }

  function handleRemoveRole(roleToRemove: string) {
    if (formData.target_roles.length <= 1) {
      setError("Please keep at least one target role.");
      return;
    }
    setFormData({
      ...formData,
      target_roles: formData.target_roles.filter((r) => r !== roleToRemove),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await completeOnboardingAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "NEXT_REDIRECT") return;
      setError(err instanceof Error ? err.message : "Failed to initialize profile.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-950/50 border border-red-800 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Step 1: Career Profile & Target Goal */}
      <Card className="border-neutral-800 bg-neutral-900 text-neutral-100">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-400">
            <Target className="h-4 w-4 text-emerald-400" />
            Step 1 of 2: Career Profile & Availability
          </div>
          <CardTitle className="text-xl font-bold">Confirm Profile Details</CardTitle>
          <CardDescription className="text-neutral-400">
            Prefilled with your supplied baseline facts. You can adjust your target role and study availability anytime.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_name" className="text-neutral-200">
                Display Name
              </Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                required
                className="border-neutral-700 bg-neutral-800 text-neutral-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_employer" className="text-neutral-200">
                Current Employer
              </Label>
              <Input
                id="current_employer"
                value={formData.current_employer}
                onChange={(e) => setFormData({ ...formData, current_employer: e.target.value })}
                className="border-neutral-700 bg-neutral-800 text-neutral-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_title" className="text-neutral-200">
                Current Title
              </Label>
              <Input
                id="current_title"
                value={formData.current_title}
                onChange={(e) => setFormData({ ...formData, current_title: e.target.value })}
                className="border-neutral-700 bg-neutral-800 text-neutral-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-neutral-200">
                Timezone (IANA)
              </Label>
              <Input
                id="timezone"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                required
                className="border-neutral-700 bg-neutral-800 text-neutral-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-neutral-200">Target Roles</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.target_roles.map((role) => (
                <Badge
                  key={role}
                  variant="secondary"
                  className="bg-neutral-800 text-neutral-200 border border-neutral-700 px-3 py-1 flex items-center gap-1.5"
                >
                  {role}
                  <button
                    type="button"
                    onClick={() => handleRemoveRole(role)}
                    className="hover:text-red-400 text-xs ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add another role (e.g. Backend Engineer)"
                value={targetRoleInput}
                onChange={(e) => setTargetRoleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRole();
                  }
                }}
                className="border-neutral-700 bg-neutral-800 text-neutral-100 text-sm"
              />
              <Button type="button" variant="secondary" onClick={handleAddRole}>
                Add
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="min_salary" className="text-neutral-200">
                Target Min (LPA)
              </Label>
              <Input
                id="min_salary"
                type="number"
                min="0"
                step="0.5"
                value={formData.target_salary_min_lpa ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    target_salary_min_lpa: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="border-neutral-700 bg-neutral-800 text-neutral-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_salary" className="text-neutral-200">
                Target Max (LPA)
              </Label>
              <Input
                id="max_salary"
                type="number"
                min="0"
                step="0.5"
                value={formData.target_salary_max_lpa ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    target_salary_max_lpa: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="border-neutral-700 bg-neutral-800 text-neutral-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="daily_minutes" className="text-neutral-200 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                Daily Study Minutes
              </Label>
              <Input
                id="daily_minutes"
                type="number"
                min="1"
                max="1440"
                value={formData.daily_available_minutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    daily_available_minutes: Number(e.target.value) || 120,
                  })
                }
                required
                className="border-neutral-700 bg-neutral-800 text-neutral-100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Learning Baseline Confirmation */}
      <Card className="border-neutral-800 bg-neutral-900 text-neutral-100">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-400">
            <BookOpen className="h-4 w-4 text-cyan-400" />
            Step 2 of 2: Learning Baseline Confirmation
          </div>
          <CardTitle className="text-xl font-bold">Import Supplied History</CardTitle>
          <CardDescription className="text-neutral-400">
            Confirming will idempotently seed your 20 Coding Shuttle modules and link your verified DSA playlist.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-neutral-100">
                  Coding Shuttle: Spring Boot 0 to 100 Cohort 4.0
                </h4>
                <p className="text-xs text-neutral-400">
                  20 Modules total • 8 Completed (100%) • 1 In Progress (11%) • 11 Not Started (0%)
                </p>
              </div>
              <Badge variant="success" className="font-mono text-sm px-2.5 py-0.5">
                40.55% Avg
              </Badge>
            </div>
            <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: "40.55%" }}
              />
            </div>
            <p className="text-xs text-neutral-500">
              Note: Course completion does not equate to interview readiness. Phase 2 maintains separate confidence & assessment tracking.
            </p>
          </div>

          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="font-semibold text-sm text-neutral-200">
                  DSA Patterns 2026 (Padho with Pratyush)
                </span>
              </div>
              <Badge variant="outline" className="border-neutral-700 text-neutral-300">
                Completed
              </Badge>
            </div>
            <p className="text-xs text-neutral-400">
              Aggregate Solved: <strong className="text-neutral-200">350+ problems</strong>. Recorded as an aggregate baseline claim; individual questions and Grind 75 problems remain separate for exact tracking in Phase 2.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="bg-neutral-100 text-neutral-900 hover:bg-neutral-200 flex items-center gap-2 font-semibold"
        >
          {isSubmitting ? (
            "Initializing Workspace..."
          ) : (
            <>
              Confirm & Launch Workspace <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
