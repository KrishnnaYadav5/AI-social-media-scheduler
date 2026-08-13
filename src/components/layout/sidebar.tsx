"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenSquare,
  FileText,
  Calendar,
  Lightbulb,
  Share2,
  Image as ImageIcon,
  BarChart3,
  Settings,
  Bot,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
  Plus,
  ShieldCheck,
  Users,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "@/components/providers/theme.provider";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Post Editor", href: "/editor", icon: PenSquare },
  { label: "Posts", href: "/posts", icon: FileText },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Ideas Board", href: "/ideas", icon: Lightbulb },
  { label: "Media", href: "/media", icon: ImageIcon },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Accounts", href: "/accounts", icon: Share2 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <>
      {/* Mobile Top Header Bar */}
      <div className="lg:hidden bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-accent rounded-xl flex items-center justify-center text-white font-normal shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <span className="font-normal text-base text-foreground">SocialPulse AI</span>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 bg-secondary border border-border rounded-xl text-foreground flex items-center gap-1.5 text-xs font-normal"
          aria-label="Toggle Mobile Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span>Menu</span>
        </button>
      </div>

      {/* Desktop Sidebar & Mobile Vertical Drawer */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 bg-card border-r border-border min-h-screen flex flex-col justify-between p-4 select-none transform lg:transform-none transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-4">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 py-2.5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center text-white font-normal shadow-md shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-normal text-base tracking-tight text-foreground leading-none">SocialPulse AI</h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-muted-foreground p-2 bg-secondary border border-border rounded-xl"
            >
              <X className="w-4 h-4" />
            </button>
          </div>



          {/* Quick Create Post Action Button */}
          <div className="px-1">
            <Link
              href="/editor"
              onClick={() => setMobileOpen(false)}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 text-xs sm:text-sm py-3 px-4 rounded-xl font-normal flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4 text-slate-900" />
              <span>Create Post</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1.5 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-normal transition-all group ${
                    isActive
                      ? "bg-accent text-white shadow-md"
                      : "text-foreground hover:bg-secondary hover:text-accent font-normal"
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 transition-colors ${isActive ? "text-white" : "text-muted-foreground group-hover:text-accent"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status & Theme Controls */}
        <div className="space-y-3 pt-3 border-t border-border mt-4">
          {/* Mobile Theme Controls */}
          <div className="lg:hidden p-3 bg-secondary rounded-xl border border-border space-y-2">
            <div className="text-xs font-normal text-foreground">Theme Mode</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`py-2 rounded-lg text-xs font-normal flex items-center justify-center gap-1 border ${
                  theme === "light" ? "bg-accent text-white border-accent" : "bg-card text-muted-foreground border-border"
                }`}
              >
                <Sun className="w-4 h-4" /> Light
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`py-2 rounded-lg text-xs font-normal flex items-center justify-center gap-1 border ${
                  theme === "dark" ? "bg-accent text-white border-accent" : "bg-card text-muted-foreground border-border"
                }`}
              >
                <Moon className="w-4 h-4" /> Dark
              </button>
            </div>
          </div>

          {/* Engine Status Box */}
          <div className="p-3.5 bg-secondary/80 rounded-xl border border-border space-y-1.5 text-xs shadow-sm">
            <div className="flex items-center justify-between text-foreground font-normal">
              <span>Engine Status</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-normal">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> Connected
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground font-normal">
              Meta Graph API v19.0 &bull; QStash Scheduler
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}
    </>
  );
}
