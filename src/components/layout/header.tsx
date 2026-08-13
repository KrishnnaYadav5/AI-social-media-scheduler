"use client";

import React from "react";
import { useTheme } from "@/components/providers/theme.provider";
import { useAuth } from "@/components/providers/auth.provider";
import { Sun, Moon, Plus, Bot, ShieldCheck, LogOut } from "lucide-react";
import Link from "next/link";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, signOut, loading } = useAuth();

  const displayName = user?.user_metadata?.full_name as string | undefined;
  const userInitials = displayName
    ? displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "??";

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <header className="h-20 bg-card border-b border-border px-5 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left: Brand Identity & Workspace Badge */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white font-normal shadow-md shrink-0">
          <Bot className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-3">
          <h2 className="text-base sm:text-lg font-normal text-foreground tracking-tight truncate">
            SocialPulse AI Workspace
          </h2>
        </div>
      </div>

      {/* Right: Theme Switcher + New Post CTA + User */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Light / Dark Theme Switcher */}
        <div className="bg-secondary dark:bg-black border border-border dark:border-stone-800 p-2 rounded-2xl flex items-center gap-1.5 text-xs shadow-sm">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`p-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
              theme === "light"
                ? "bg-card dark:bg-white text-foreground dark:text-slate-900 shadow-md font-normal border border-border/50 dark:border-none"
                : "text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white font-normal"
            }`}
            title="Light Mode"
          >
            <Sun className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`p-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
              theme === "dark"
                ? "bg-card dark:bg-white text-foreground dark:text-slate-900 shadow-md font-normal border border-border/50 dark:border-none"
                : "text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white font-normal"
            }`}
            title="Dark Mode"
          >
            <Moon className="w-5 h-5" />
          </button>
        </div>

        {/* New Post CTA */}
        <Link
          href="/editor"
          className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 text-xs sm:text-sm font-normal px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl flex items-center gap-2 shadow-md transition-all hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900" />
          <span className="hidden xs:inline">New Post</span>
        </Link>

        {/* User Avatar + Sign Out */}
        {!loading && user && (
          <div className="flex items-center gap-2.5 pl-3 sm:pl-4 border-l border-border dark:border-stone-800">
            <div className="flex items-center gap-2.5 group relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.user_metadata?.full_name ?? "User"}
                  className="w-9 h-9 rounded-full border-2 border-border object-cover shadow-sm"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white text-xs font-normal border-2 border-border shadow-sm">
                  {userInitials}
                </div>
              )}
                <div className="hidden sm:block">
                  <div className="text-xs font-normal text-foreground truncate max-w-[120px]">
                    {displayName ?? user.email?.split("@")[0]}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">{user.email}</div>
                </div>
            </div>
            <button
              type="button"
              onClick={signOut}
              title="Sign Out"
              className="p-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}