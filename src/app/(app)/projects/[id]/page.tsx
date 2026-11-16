import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getProjectById,
  getProjectFeatures,
  getProjectBugs,
} from "@/features/projects/service";
import { ProjectWorkspace } from "../components/project-workspace";

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: ProjectDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const project = await getProjectById(supabase, user.id, id);

  if (!project) {
    notFound();
  }

  const [features, bugs] = await Promise.all([
    getProjectFeatures(supabase, user.id, id),
    getProjectBugs(supabase, user.id, id),
  ]);

  return (
    <ProjectWorkspace
      project={project}
      features={features}
      bugs={bugs}
      initialTab={resolvedSearchParams.tab || "overview"}
    />
  );
}
