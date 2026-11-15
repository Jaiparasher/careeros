import { describe, it, expect } from "vitest";
import { isProtectedAppRoute } from "@/lib/supabase/middleware";

describe("Protected Routes Matching (isProtectedAppRoute)", () => {
  it("identifies protected core application routes correctly", () => {
    expect(isProtectedAppRoute("/dashboard")).toBe(true);
    expect(isProtectedAppRoute("/dashboard/overview")).toBe(true);
    expect(isProtectedAppRoute("/dsa")).toBe(true);
    expect(isProtectedAppRoute("/dsa/questions")).toBe(true);
    expect(isProtectedAppRoute("/learning")).toBe(true);
    expect(isProtectedAppRoute("/learning/modules")).toBe(true);
    expect(isProtectedAppRoute("/planner")).toBe(true);
    expect(isProtectedAppRoute("/interview-questions")).toBe(true);
    expect(isProtectedAppRoute("/settings")).toBe(true);
  });

  it("identifies public routes as non-protected", () => {
    expect(isProtectedAppRoute("/")).toBe(false);
    expect(isProtectedAppRoute("/login")).toBe(false);
    expect(isProtectedAppRoute("/auth/callback")).toBe(false);
    expect(isProtectedAppRoute("/about")).toBe(false);
    expect(isProtectedAppRoute("/api/health")).toBe(false);
  });
});
