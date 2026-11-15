"use client";

import * as React from "react";
import Link from "next/link";
import { signInAction, signUpAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, KeyRound, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = React.useState<"signin" | "signup">("signin");
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      if (mode === "signin") {
        const result = await signInAction(null, formData);
        if (result?.error) {
          setError(result.error);
        }
      } else {
        const result = await signUpAction(null, formData);
        if (result?.error) {
          setError(result.error);
        } else if (result?.success) {
          setSuccessMessage(
            "Account created! If email confirmation is enabled on your Supabase project, check your inbox; otherwise you can sign in directly."
          );
          setMode("signin");
        }
      }
    } catch (err: unknown) {
      // Next.js redirect throws a special internal error; do not catch it as a failure
      if (err instanceof Error && err.message === "NEXT_REDIRECT") {
        return;
      }
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 p-4 text-neutral-100">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <Card className="w-full max-w-md border-neutral-800 bg-neutral-900 text-neutral-100 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800 text-neutral-100 border border-neutral-700">
            <KeyRound className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </CardTitle>
          <CardDescription className="text-neutral-400">
            {mode === "signin"
              ? "Sign in to access your CareerOS workspace"
              : "Register as the owner of this CareerOS instance"}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-950/50 border border-red-800/80 p-3 text-xs text-red-300">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="rounded-lg bg-emerald-950/50 border border-emerald-800/80 p-3 text-xs text-emerald-300">
                {successMessage}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-200">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@careeros.dev"
                required
                className="border-neutral-700 bg-neutral-800 text-neutral-100 focus-visible:ring-neutral-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-200">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="border-neutral-700 bg-neutral-800 text-neutral-100 focus-visible:ring-neutral-500"
              />
            </div>

            <div className="rounded-lg bg-neutral-800/60 border border-neutral-700/60 p-3 text-xs text-neutral-400 space-y-1">
              <div className="font-semibold text-neutral-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-neutral-400" />
                Single-Owner Workspace
              </div>
              <p>
                CareerOS is a personal tool. Data is protected by Supabase Row-Level Security (RLS) linked to your owner ID.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
            >
              {isLoading
                ? "Processing..."
                : mode === "signin"
                ? "Sign in"
                : "Create Account"}
            </Button>

            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccessMessage(null);
                setMode(mode === "signin" ? "signup" : "signin");
              }}
              className="text-xs text-neutral-400 hover:text-neutral-200 underline transition-colors cursor-pointer"
            >
              {mode === "signin"
                ? "Don't have an account? Sign up"
                : "Already registered? Sign in"}
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
