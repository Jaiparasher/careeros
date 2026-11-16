"use client";

import { useState } from "react";
import { ApplicationFilterToolbar } from "./application-filter-toolbar";
import { ApplicationsKanban } from "./applications-kanban";
import { ApplicationsTable } from "./applications-table";
import { FollowupAlertsBar } from "./followup-alerts-bar";
import { FollowupTemplatesModal } from "./followup-templates-modal";
import type {
  JobApplicationRecord,
  ApplicationsSummaryStats,
} from "@/features/applications/service";

interface ApplicationsViewContainerProps {
  applications: JobApplicationRecord[];
  stats: ApplicationsSummaryStats;
}

export function ApplicationsViewContainer({
  applications,
  stats,
}: ApplicationsViewContainerProps) {
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  return (
    <div className="space-y-5">
      {/* Follow-up Alerts & KPI Bar */}
      <FollowupAlertsBar
        stats={stats}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
      />

      {/* Filter and View mode Toolbar */}
      <ApplicationFilterToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* View: Kanban vs Table */}
      {viewMode === "kanban" ? (
        <ApplicationsKanban applications={applications} />
      ) : (
        <ApplicationsTable applications={applications} />
      )}

      {/* Templates Modal */}
      <FollowupTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
      />
    </div>
  );
}
