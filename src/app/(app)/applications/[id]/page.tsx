import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getApplicationById,
  getApplicationActivity,
  getInterviewRounds,
} from "@/features/applications/service";
import { ApplicationDetail } from "./components/application-detail";

interface ApplicationDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const application = await getApplicationById(supabase, user.id, id);

  if (!application) {
    notFound();
  }

  const [activity, rounds] = await Promise.all([
    getApplicationActivity(supabase, user.id, id),
    getInterviewRounds(supabase, user.id, id),
  ]);

  return (
    <ApplicationDetail
      application={application}
      activity={activity}
      rounds={rounds}
    />
  );
}
