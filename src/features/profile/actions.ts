"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { profileFormSchema, type ProfileFormInput } from "./schema";
import { saveInitialProfile, updateProfile } from "./service";

export type ProfileActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function completeOnboardingAction(
  data: ProfileFormInput
): Promise<ProfileActionResult> {
  const validation = profileFormSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Validation failed.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Authentication required.",
    };
  }

  const result = await saveInitialProfile(supabase, user.id, validation.data);

  if (result.error) {
    return {
      success: false,
      error: result.error,
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function updateProfileSettingsAction(
  data: Partial<ProfileFormInput>
): Promise<ProfileActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Authentication required.",
    };
  }

  const result = await updateProfile(supabase, user.id, data);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return {
    success: true,
    message: "Profile updated successfully.",
  };
}
