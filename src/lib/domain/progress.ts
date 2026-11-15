export interface ModuleProgress {
  completion_percent: number;
}

/**
 * Calculates the arithmetic mean completion percentage of course modules.
 * Returns a number rounded to two decimal places (e.g. 40.55).
 * Returns 0 if modules array is empty.
 */
export function calculateCourseProgress(modules: ModuleProgress[]): number {
  if (!modules || modules.length === 0) {
    return 0;
  }

  const total = modules.reduce((sum, mod) => {
    const val = Number(mod.completion_percent) || 0;
    return sum + Math.max(0, Math.min(100, val));
  }, 0);

  const mean = total / modules.length;
  return Number(mean.toFixed(2));
}
