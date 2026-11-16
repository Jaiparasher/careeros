"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, LayoutGrid, Table, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { stageLabels } from "@/features/applications/schema";

interface ApplicationFilterToolbarProps {
  viewMode: "kanban" | "table";
  onViewModeChange: (mode: "kanban" | "table") => void;
}

export function ApplicationFilterToolbar({
  viewMode,
  onViewModeChange,
}: ApplicationFilterToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("q") || "";
  const currentStage = searchParams.get("stage") || "all";
  const currentWorkMode = searchParams.get("work_mode") || "all";
  const currentSort = searchParams.get("sort") || "recent";
  const currentFilter = searchParams.get("filter");

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "" || val === "all") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    router.replace(`${pathname}?${params.toString()}`);
  }

  function handleClearAll() {
    router.replace(pathname);
  }

  const hasActiveFilters =
    Boolean(currentSearch) ||
    currentStage !== "all" ||
    currentWorkMode !== "all" ||
    Boolean(currentFilter);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
      {/* Search Input */}
      <div className="flex-1 relative min-w-[200px] max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-500" />
        <Input
          type="text"
          placeholder="Search by company, role, location..."
          value={currentSearch}
          onChange={(e) => updateParams({ q: e.target.value })}
          className="bg-neutral-950 border-neutral-800 text-xs pl-8 h-8"
        />
      </div>

      {/* Filter Selectors */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Stage Filter */}
        <select
          value={currentStage}
          onChange={(e) => updateParams({ stage: e.target.value, filter: null })}
          className="bg-neutral-950 border border-neutral-800 rounded-md px-2.5 py-1 text-xs text-neutral-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 h-8"
        >
          <option value="all">All Stages (11)</option>
          {Object.entries(stageLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        {/* Work Mode Filter */}
        <select
          value={currentWorkMode}
          onChange={(e) => updateParams({ work_mode: e.target.value })}
          className="bg-neutral-950 border border-neutral-800 rounded-md px-2.5 py-1 text-xs text-neutral-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 h-8"
        >
          <option value="all">All Work Modes</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">Onsite</option>
        </select>

        {/* Sort Selector */}
        <select
          value={currentSort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="bg-neutral-950 border border-neutral-800 rounded-md px-2.5 py-1 text-xs text-neutral-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 h-8"
        >
          <option value="recent">Sort: Recently Updated</option>
          <option value="followup">Sort: Next Follow-Up</option>
          <option value="applied_date">Sort: Application Date</option>
          <option value="salary">Sort: Salary (High to Low)</option>
          <option value="company">Sort: Company (A-Z)</option>
        </select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-neutral-400 hover:text-neutral-200 text-xs h-8 px-2 gap-1"
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}

        {/* View Mode Toggle: Kanban vs Table */}
        <div className="flex items-center rounded-lg bg-neutral-950 p-0.5 border border-neutral-800 shrink-0 ml-auto">
          <button
            type="button"
            onClick={() => onViewModeChange("kanban")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
              viewMode === "kanban"
                ? "bg-neutral-800 text-neutral-100 font-medium"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Kanban
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
              viewMode === "table"
                ? "bg-neutral-800 text-neutral-100 font-medium"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Table className="h-3.5 w-3.5" />
            Table
          </button>
        </div>
      </div>
    </div>
  );
}
