"use client";

import * as React from "react";
import Link from "next/link";
import { signOutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, User, X } from "lucide-react";
import { Sidebar } from "./sidebar";

interface HeaderProps {
  userEmail?: string;
  displayName?: string;
}

export function Header({ userEmail, displayName }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-800 bg-neutral-950/80 backdrop-blur px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-neutral-400 hover:text-neutral-100 md:hidden cursor-pointer rounded-lg hover:bg-neutral-800"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-100 hidden sm:inline">
            Personal Preparation Workspace
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/settings"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-xs font-medium text-neutral-300 transition-colors"
        >
          <div className="h-5 w-5 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-200">
            {displayName ? displayName.charAt(0).toUpperCase() : <User className="h-3 w-3" />}
          </div>
          <span className="hidden sm:inline">{displayName || userEmail || "User"}</span>
        </Link>

        <form action={signOutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="text-neutral-400 hover:text-red-400 hover:bg-neutral-900 flex items-center gap-1.5"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </form>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-64 bg-neutral-950 shadow-2xl flex flex-col z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </div>
        </div>
      )}
    </header>
  );
}
