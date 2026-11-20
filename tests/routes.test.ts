import { describe, it, expect } from "vitest";
import { isProtectedAppRoute } from "@/lib/supabase/middleware";

describe("Protected Routes Matching (isProtectedAppRoute)", () => {
  it("identifies existing protected core application routes correctly", () => {
    expect(isProtectedAppRoute("/dashboard")).toBe(true);
    expect(isProtectedAppRoute("/dashboard/overview")).toBe(true);
    expect(isProtectedAppRoute("/dsa")).toBe(true);
    expect(isProtectedAppRoute("/dsa/questions")).toBe(true);
    expect(isProtectedAppRoute("/learning")).toBe(true);
    expect(isProtectedAppRoute("/learning/modules")).toBe(true);
    expect(isProtectedAppRoute("/planner")).toBe(true);
    expect(isProtectedAppRoute("/planner/recommendations")).toBe(true);
    expect(isProtectedAppRoute("/planner/sprint")).toBe(true);
    expect(isProtectedAppRoute("/interview-questions")).toBe(true);
    expect(isProtectedAppRoute("/interview-questions/q-123")).toBe(true);
    expect(isProtectedAppRoute("/settings")).toBe(true);
  });

  it("identifies Phase 3 & Phase 4 protected routes and nested paths (N-02)", () => {
    expect(isProtectedAppRoute("/projects")).toBe(true);
    expect(isProtectedAppRoute("/projects/proj-123")).toBe(true);
    expect(isProtectedAppRoute("/applications")).toBe(true);
    expect(isProtectedAppRoute("/applications/app-456")).toBe(true);
    expect(isProtectedAppRoute("/resume")).toBe(true);
    expect(isProtectedAppRoute("/resume/analysis/an-789")).toBe(true);
    expect(isProtectedAppRoute("/interview")).toBe(true);
    expect(isProtectedAppRoute("/interview/sess-101")).toBe(true);
    expect(isProtectedAppRoute("/onboarding")).toBe(true);
    expect(isProtectedAppRoute("/onboarding/step-2")).toBe(true);
  });

  it("identifies public routes as non-protected", () => {
    expect(isProtectedAppRoute("/")).toBe(false);
    expect(isProtectedAppRoute("/login")).toBe(false);
    expect(isProtectedAppRoute("/register")).toBe(false);
    expect(isProtectedAppRoute("/auth/callback")).toBe(false);
    expect(isProtectedAppRoute("/about")).toBe(false);
    expect(isProtectedAppRoute("/api/health")).toBe(false);
  });

  it("does not accidentally match unrelated routes sharing a protected prefix", () => {
    expect(isProtectedAppRoute("/projects-public")).toBe(false);
    expect(isProtectedAppRoute("/applications-guide")).toBe(false);
    expect(isProtectedAppRoute("/resume-builder")).toBe(false);
    expect(isProtectedAppRoute("/interview-tips")).toBe(false);
    expect(isProtectedAppRoute("/onboarding-faq")).toBe(false);
    expect(isProtectedAppRoute("/dashboard-demo")).toBe(false);
    expect(isProtectedAppRoute("/dsa-cheatsheet")).toBe(false);
    expect(isProtectedAppRoute("/settings-help")).toBe(false);
  });
});
