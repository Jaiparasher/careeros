"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Cpu, CheckCircle2, Save, Loader2 } from "lucide-react";
import { updateArchitectureAction } from "@/features/projects/actions";
import type { ProjectRecord } from "@/features/projects/service";

interface ArchitectureTabProps {
  project: ProjectRecord;
}

export function ArchitectureTab({ project }: ArchitectureTabProps) {
  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState(false);

  const existingDetails = (project.architecture_details || {}) as Record<string, string>;

  const [formData, setFormData] = useState({
    overview: existingDetails.overview || project.architecture_notes || "",
    major_decisions: existingDetails.major_decisions || "",
    database_design: existingDetails.database_design || "",
    api_design: existingDetails.api_design || "",
    challenges_solutions: existingDetails.challenges_solutions || project.challenges || "",
    scalability: existingDetails.scalability || "",
    security: existingDetails.security || "",
    lessons_learned: existingDetails.lessons_learned || "",
  });

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg(false);

    startTransition(async () => {
      const res = await updateArchitectureAction(project.id, formData);
      if (res.success) {
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 3000);
      }
    });
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            Architecture, System Design & Technical Decisions
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Document system topology, data access choices, security guards, and design trade-offs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {successMsg && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Saved!
            </span>
          )}
          <Button
            type="submit"
            disabled={isPending}
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs gap-1.5"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Architecture Notes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* Architecture Overview */}
        <div className="space-y-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
          <Label className="text-neutral-200 font-semibold flex items-center gap-1.5">
            Architecture Topology & System Boundaries
          </Label>
          <p className="text-[11px] text-neutral-400">
            High-level overview: client/backend split, messaging brokers, storage layers and caching tiers.
          </p>
          <Textarea
            rows={5}
            placeholder="e.g. Next.js SPA communicating via REST/SSE to a Spring Boot modular monolith with PostgreSQL and Redis..."
            value={formData.overview}
            onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
            className="bg-neutral-950 border-neutral-800 text-neutral-100 text-xs resize-y"
          />
        </div>

        {/* Major Technical Decisions */}
        <div className="space-y-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
          <Label className="text-neutral-200 font-semibold flex items-center gap-1.5">
            Major Technical Decisions & Trade-offs
          </Label>
          <p className="text-[11px] text-neutral-400">
            Why technology X over Y? (e.g. Why PostgreSQL + pgvector over a standalone vector database).
          </p>
          <Textarea
            rows={5}
            placeholder="e.g. Chosen PostgreSQL + pgvector to eliminate multi-database synchronizations and preserve relational transactions..."
            value={formData.major_decisions}
            onChange={(e) => setFormData({ ...formData, major_decisions: e.target.value })}
            className="bg-neutral-950 border-neutral-800 text-neutral-100 text-xs resize-y"
          />
        </div>

        {/* Database Design */}
        <div className="space-y-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
          <Label className="text-neutral-200 font-semibold">
            Database Design, Schema & Indexing
          </Label>
          <p className="text-[11px] text-neutral-400">
            Key entities, relationships, foreign key constraints, composite keys and query indexes.
          </p>
          <Textarea
            rows={5}
            placeholder="e.g. Normalized 3NF tables with composite foreign keys (project_id, user_id) enforcing multi-tenant isolation..."
            value={formData.database_design}
            onChange={(e) => setFormData({ ...formData, database_design: e.target.value })}
            className="bg-neutral-950 border-neutral-800 text-neutral-100 text-xs resize-y"
          />
        </div>

        {/* API Design */}
        <div className="space-y-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
          <Label className="text-neutral-200 font-semibold">
            API Design, Streaming & Contracts
          </Label>
          <p className="text-[11px] text-neutral-400">
            REST conventions, SSE streaming endpoints, idempotency keys, error models and schema contracts.
          </p>
          <Textarea
            rows={5}
            placeholder="e.g. Server-Sent Events (text/event-stream) for chunked streaming, JWT-authenticated Bearer tokens in headers..."
            value={formData.api_design}
            onChange={(e) => setFormData({ ...formData, api_design: e.target.value })}
            className="bg-neutral-950 border-neutral-800 text-neutral-100 text-xs resize-y"
          />
        </div>

        {/* Technical Challenges & Solutions */}
        <div className="space-y-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
          <Label className="text-neutral-200 font-semibold">
            Engineering Challenges & Root Cause Solutions
          </Label>
          <p className="text-[11px] text-neutral-400">
            Hardest technical bugs solved, race conditions, memory leaks or query bottlenecks.
          </p>
          <Textarea
            rows={5}
            placeholder="e.g. Handled client disconnect during long LLM generations by configuring reactive cancellation hooks..."
            value={formData.challenges_solutions}
            onChange={(e) => setFormData({ ...formData, challenges_solutions: e.target.value })}
            className="bg-neutral-950 border-neutral-800 text-neutral-100 text-xs resize-y"
          />
        </div>

        {/* Performance & Scalability */}
        <div className="space-y-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
          <Label className="text-neutral-200 font-semibold">
            Performance, Latency & Scalability
          </Label>
          <p className="text-[11px] text-neutral-400">
            Connection pooling (HikariCP), async execution, query optimization, horizontal scaling.
          </p>
          <Textarea
            rows={5}
            placeholder="e.g. Tuned connection pool to 20 connections; cached static metadata in Redis with 10-minute TTL..."
            value={formData.scalability}
            onChange={(e) => setFormData({ ...formData, scalability: e.target.value })}
            className="bg-neutral-950 border-neutral-800 text-neutral-100 text-xs resize-y"
          />
        </div>

        {/* Security Implementation */}
        <div className="space-y-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
          <Label className="text-neutral-200 font-semibold">
            Security, Auth & Threat Prevention
          </Label>
          <p className="text-[11px] text-neutral-400">
            Input sanitization, Zod boundary validation, Supabase Row-Level Security, rate limiting.
          </p>
          <Textarea
            rows={5}
            placeholder="e.g. Enforced strict PostgreSQL Row Level Security; eliminated client-side tampering using server-side auth.uid()..."
            value={formData.security}
            onChange={(e) => setFormData({ ...formData, security: e.target.value })}
            className="bg-neutral-950 border-neutral-800 text-neutral-100 text-xs resize-y"
          />
        </div>

        {/* Lessons Learned */}
        <div className="space-y-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
          <Label className="text-neutral-200 font-semibold">
            Lessons Learned & What I Would Do Differently
          </Label>
          <p className="text-[11px] text-neutral-400">
            Hindsight architectural insights: schema evolution, observability, test setup.
          </p>
          <Textarea
            rows={5}
            placeholder="e.g. Would adopt automated contract testing earlier to prevent frontend/backend payload mismatches..."
            value={formData.lessons_learned}
            onChange={(e) => setFormData({ ...formData, lessons_learned: e.target.value })}
            className="bg-neutral-950 border-neutral-800 text-neutral-100 text-xs resize-y"
          />
        </div>
      </div>
    </form>
  );
}
