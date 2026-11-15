import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variant === "default" && "bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900",
        variant === "secondary" && "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100",
        variant === "outline" && "border border-neutral-300 text-neutral-800 dark:border-neutral-700 dark:text-neutral-200",
        variant === "success" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
        variant === "warning" && "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
        className
      )}
      {...props}
    />
  );
}
