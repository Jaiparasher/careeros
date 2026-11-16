"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ProjectFilterToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") || "all";
  const currentSearch = searchParams.get("search") || "";

  function updateQuery(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || !value.trim()) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/projects?${params.toString()}`);
  }

  const statusFilters = [
    { id: "all", label: "All Projects" },
    { id: "in_progress", label: "In Progress" },
    { id: "planned", label: "Planning" },
    { id: "completed", label: "Completed" },
    { id: "on_hold", label: "On Hold" },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
      {/* Status pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        {statusFilters.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => updateQuery("status", s.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              currentStatus === s.id
                ? "bg-neutral-800 text-neutral-100 border border-neutral-700"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Search box */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
        <Input
          placeholder="Filter by name or tech..."
          defaultValue={currentSearch}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateQuery("search", (e.target as HTMLInputElement).value);
            }
          }}
          className="pl-8 text-xs bg-neutral-950 border-neutral-800 text-neutral-100 h-8"
        />
      </div>
    </div>
  );
}
