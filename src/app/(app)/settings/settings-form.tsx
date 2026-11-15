"use client";

import * as React from "react";
import { updateProfileSettingsAction } from "@/features/profile/actions";
import { type ProfileRecord } from "@/features/profile/service";
import { type ProfileFormInput } from "@/features/profile/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Save, User, Target } from "lucide-react";

export function SettingsForm({ profile }: { profile: ProfileRecord }) {
  const [formData, setFormData] = React.useState<Partial<ProfileFormInput>>({
    display_name: profile.display_name,
    current_employer: profile.current_employer || "",
    current_title: profile.current_title || "",
    target_roles: profile.target_roles || [],
    target_salary_min_lpa: profile.target_salary_min_lpa,
    target_salary_max_lpa: profile.target_salary_max_lpa,
    timezone: profile.timezone || "Asia/Kolkata",
    daily_available_minutes: profile.daily_available_minutes || 120,
    theme_preference: profile.theme_preference || "system",
  });

  const [roleInput, setRoleInput] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  function handleAddRole() {
    if (!roleInput.trim()) return;
    const currentRoles = formData.target_roles || [];
    if (!currentRoles.includes(roleInput.trim())) {
      setFormData({
        ...formData,
        target_roles: [...currentRoles, roleInput.trim()],
      });
    }
    setRoleInput("");
  }

  function handleRemoveRole(roleToRemove: string) {
    const currentRoles = formData.target_roles || [];
    if (currentRoles.length <= 1) {
      setError("Please keep at least one target role.");
      return;
    }
    setFormData({
      ...formData,
      target_roles: currentRoles.filter((r) => r !== roleToRemove),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const result = await updateProfileSettingsAction(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Profile settings updated successfully.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-950/50 border border-red-800 p-4 text-sm text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-emerald-950/50 border border-emerald-800 p-4 text-sm text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {success}
        </div>
      )}

      {/* Identity & Career Info */}
      <Card className="border-neutral-800 bg-neutral-900 text-neutral-100">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <User className="h-4 w-4 text-emerald-400" />
            Personal & Professional Details
          </CardTitle>
          <CardDescription className="text-neutral-400">
            Basic information about your current professional role.
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
                value={formData.display_name || ""}
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
                value={formData.current_employer || ""}
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
                value={formData.current_title || ""}
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
                value={formData.timezone || "Asia/Kolkata"}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                required
                className="border-neutral-700 bg-neutral-800 text-neutral-100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Role & Study Availability */}
      <Card className="border-neutral-800 bg-neutral-900 text-neutral-100">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Target className="h-4 w-4 text-cyan-400" />
            Preparation Goals & Time Budget
          </CardTitle>
          <CardDescription className="text-neutral-400">
            Target roles and daily study minutes dictate the workload calculations for the 30-day interview sprint in Phase 2.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-neutral-200">Target Roles</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(formData.target_roles || []).map((role) => (
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
                placeholder="Add role (e.g. SDE I)"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRole();
                  }
                }}
                className="border-neutral-700 bg-neutral-800 text-neutral-100"
              />
              <Button type="button" variant="secondary" onClick={handleAddRole}>
                Add
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="salary_min" className="text-neutral-200">
                Target Min (LPA)
              </Label>
              <Input
                id="salary_min"
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
              <Label htmlFor="salary_max" className="text-neutral-200">
                Target Max (LPA)
              </Label>
              <Input
                id="salary_max"
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
                value={formData.daily_available_minutes || 120}
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
        <CardFooter className="flex justify-end border-t border-neutral-800 pt-4">
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-neutral-100 text-neutral-900 hover:bg-neutral-200 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving Changes..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
