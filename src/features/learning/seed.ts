import fs from "fs";
import path from "path";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface SeedResult {
  total: number;
  insertedCount: number;
  existingCount: number;
  error?: string;
}

interface RawModule {
  course_key: string;
  module_number: number;
  module_key: string;
  title: string;
  completion_percent: number;
  status: string;
  source: string;
}

interface ModulesFile {
  course_name: string;
  provider: string;
  modules: RawModule[];
}

export async function seedCodingShuttleModules(
  supabase: SupabaseClient,
  userId: string
): Promise<SeedResult> {
  const filePath = path.resolve(process.cwd(), "seed-data/coding-shuttle-modules.json");
  const rawData = fs.readFileSync(filePath, "utf-8");
  const parsed: ModulesFile = JSON.parse(rawData);

  const { data: existingModules, error: fetchError } = await supabase
    .from("learning_modules")
    .select("module_key")
    .eq("user_id", userId);

  if (fetchError) {
    return {
      total: parsed.modules.length,
      insertedCount: 0,
      existingCount: 0,
      error: fetchError.message,
    };
  }

  const existingKeySet = new Set(
    (existingModules || []).map((m: { module_key: string }) => m.module_key)
  );

  const toInsert = parsed.modules
    .filter((mod) => !existingKeySet.has(mod.module_key))
    .map((mod) => ({
      user_id: userId,
      course_key: mod.course_key,
      module_key: mod.module_key,
      course_name: parsed.course_name,
      provider: parsed.provider,
      module_number: mod.module_number,
      title: mod.title,
      completion_percent: mod.completion_percent,
      status: mod.status,
      source: "user_supplied_baseline",
    }));

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("learning_modules")
      .insert(toInsert);

    if (insertError) {
      return {
        total: parsed.modules.length,
        insertedCount: 0,
        existingCount: existingKeySet.size,
        error: insertError.message,
      };
    }
  }

  return {
    total: parsed.modules.length,
    insertedCount: toInsert.length,
    existingCount: existingKeySet.size,
  };
}
