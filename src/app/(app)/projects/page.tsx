import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  FolderGit2,
  Clock,
  CheckCircle2,
  ListTodo,
  Bug,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  getProjects,
  getProjectsSummaryStats,
  seedLovableProjectIfEmpty,
} from "@/features/projects/service";
import { ProjectCard } from "./components/project-card";
import { CreateProjectModal } from "./components/create-project-modal";
import { ProjectFilterToolbar } from "./components/project-filter-toolbar";

interface ProjectsPageProps {
  searchParams: Promise<{
    status?: string;
    type?: string;
    q?: string;
  }>;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ensure initial Lovable project is seeded if user has no projects
  await seedLovableProjectIfEmpty(supabase, user.id);

  const resolvedParams = await searchParams;
  const statusFilter = resolvedParams.status;
  const searchQuery = (resolvedParams.q || "").toLowerCase().trim();

  const [allProjects, stats] = await Promise.all([
    getProjects(
      supabase,
      user.id,
      statusFilter && statusFilter !== "all" ? { status: statusFilter } : undefined
    ),
    getProjectsSummaryStats(supabase, user.id),
  ]);

  // Client-side text filter on name, summary, or technologies
  const filteredProjects = allProjects.filter((p) => {
    if (!searchQuery) return true;
    const nameMatch = p.name.toLowerCase().includes(searchQuery);
    const summaryMatch = (p.summary || "").toLowerCase().includes(searchQuery);
    const techMatch = (p.technologies || []).some((t) =>
      t.toLowerCase().includes(searchQuery)
    );
    return nameMatch || summaryMatch || techMatch;
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
              <FolderGit2 className="h-5 w-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100">
              Project Tracker
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
            Track resume engineering projects, manage feature roadmaps, log defects, document system architecture, and prepare technical interview stories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CreateProjectModal />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-neutral-800 bg-neutral-900/80 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Total Projects</span>
            <FolderGit2 className="h-3.5 w-3.5 text-neutral-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-100 mt-2">
            {stats.total}
          </div>
          <span className="text-[10px] text-neutral-500 mt-0.5">Tracked in CareerOS</span>
        </Card>

        <Card className="border-neutral-800 bg-neutral-900/80 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>In Progress</span>
            <Clock className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-2">
            {stats.in_progress}
          </div>
          <span className="text-[10px] text-neutral-500 mt-0.5">Active development</span>
        </Card>

        <Card className="border-neutral-800 bg-neutral-900/80 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Completed</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {stats.completed}
          </div>
          <span className="text-[10px] text-neutral-500 mt-0.5">Shipped & production</span>
        </Card>

        <Card className="border-neutral-800 bg-neutral-900/80 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Total Features</span>
            <ListTodo className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-2">
            {stats.totalFeatures}
          </div>
          <span className="text-[10px] text-neutral-500 mt-0.5">Across all projects</span>
        </Card>

        <Card className="border-neutral-800 bg-neutral-900/80 p-3.5 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Active Bugs</span>
            <Bug className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-2">
            {stats.activeBugs}
          </div>
          <span className="text-[10px] text-neutral-500 mt-0.5">Open & investigating</span>
        </Card>
      </div>

      {/* Filter and Search toolbar */}
      <ProjectFilterToolbar />

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="border-neutral-800 bg-neutral-900/40 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-neutral-800/80 mx-auto flex items-center justify-center text-neutral-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-200">No projects found</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            {searchQuery || (statusFilter && statusFilter !== "all")
              ? "No projects match your current filter or search criteria. Try clearing the search."
              : "Get started by adding your first software project to organize features, defects, system design, and interview stories."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
