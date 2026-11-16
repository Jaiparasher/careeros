"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Code2,
  GraduationCap,
  CalendarCheck2,
  HelpCircle,
  FolderGit2,
  Briefcase,
  FileText,
  Settings,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  phase?: string;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "DSA Practice",
    href: "/dsa",
    icon: Code2,
    phase: "P2",
  },
  {
    title: "Learning Roadmap",
    href: "/learning",
    icon: GraduationCap,
    phase: "P2",
  },
  {
    title: "Study Planner",
    href: "/planner",
    icon: CalendarCheck2,
    phase: "P2",
  },
  {
    title: "Interview Bank",
    href: "/interview-questions",
    icon: HelpCircle,
    phase: "P2",
  },
  {
    title: "Project Tracker",
    href: "/projects",
    icon: FolderGit2,
    phase: "P3",
  },
  {
    title: "Job Tracker",
    href: "/applications",
    icon: Briefcase,
    phase: "P3",
  },
  {
    title: "Resume & JD",
    href: "/resume",
    icon: FileText,
    phase: "P3",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col w-64 border-r border-neutral-800 bg-neutral-950 text-neutral-200 select-none",
        className
      )}
    >
      <div className="flex h-16 items-center px-6 border-b border-neutral-800/80 gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 text-neutral-100 border border-neutral-700 font-bold">
          C
        </div>
        <div>
          <span className="font-bold text-base tracking-tight text-neutral-100">
            CareerOS
          </span>
          <span className="ml-2 text-[10px] text-neutral-500 font-medium px-1.5 py-0.5 rounded border border-neutral-800">
            v1.0
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Workspace
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-neutral-800 text-neutral-100"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("h-4 w-4", isActive ? "text-neutral-100" : "text-neutral-400")} />
                <span>{item.title}</span>
              </div>
              {item.phase && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 border-neutral-700 text-neutral-500 group-hover:text-neutral-400"
                >
                  {item.phase}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-800/80">
        <div className="rounded-lg bg-neutral-900/60 border border-neutral-800 p-3 text-xs text-neutral-400 space-y-1.5">
          <div className="flex items-center gap-1.5 font-medium text-neutral-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Phase 1 Active
          </div>
          <p className="text-[11px] leading-relaxed text-neutral-500">
            Foundation baseline loaded. DSA & planner modules unlock in Phase 2.
          </p>
        </div>
      </div>
    </aside>
  );
}
