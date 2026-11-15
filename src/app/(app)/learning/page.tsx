import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Layers, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserModules, getUserTopics, type LearningModule, type LearningTopic } from "@/features/learning/service";
import { ModuleList } from "./components/module-list";
import { TopicMatrix } from "./components/topic-matrix";

export default async function LearningPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const activeTab = params.tab === "topics" ? "topics" : "modules";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let modules: LearningModule[] = [];
  let topics: LearningTopic[] = [];

  if (user) {
    [modules, topics] = await Promise.all([
      getUserModules(supabase, user.id),
      getUserTopics(supabase, user.id),
    ]);
  }

  const meanProgress =
    modules.length > 0
      ? modules.reduce((sum, m) => sum + Number(m.completion_percent), 0) / modules.length
      : 0;

  const assessedTopicsCount = topics.filter(
    (t) => t.assessment_status !== "not_assessed"
  ).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-100">Learning Roadmap</h1>
            <Badge variant="outline" className="border-amber-700 text-amber-400">
              Phase 2 Active
            </Badge>
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            Coding Shuttle course modules and decoupled topic confidence tracking (Rule 8).
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-xs text-neutral-400 hover:text-neutral-200 inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-neutral-800 gap-2">
        <Link
          href="/learning?tab=modules"
          className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "modules"
              ? "border-amber-500 text-amber-400"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          Course Modules ({modules.length})
          <Badge
            variant="outline"
            className="ml-1 text-[10px] border-neutral-800 text-neutral-400"
          >
            {meanProgress.toFixed(1)}%
          </Badge>
        </Link>

        <Link
          href="/learning?tab=topics"
          className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "topics"
              ? "border-amber-500 text-amber-400"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Topic Confidence Matrix ({topics.length})
          <Badge
            variant="outline"
            className="ml-1 text-[10px] border-neutral-800 text-neutral-400"
          >
            {assessedTopicsCount} assessed
          </Badge>
        </Link>
      </div>

      {activeTab === "modules" ? (
        <ModuleList initialModules={modules} />
      ) : (
        <TopicMatrix initialTopics={topics} />
      )}
    </div>
  );
}
