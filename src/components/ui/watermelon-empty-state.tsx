"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface WatermelonEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function WatermelonEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: WatermelonEmptyStateProps) {
  return (
    <div className="p-8 text-center bg-card border border-border rounded-md space-y-3 shadow-sm my-4">
      <div className="w-12 h-12 rounded-md bg-accent/10 text-accent flex items-center justify-center mx-auto">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-normal text-foreground">{title}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground font-normal max-w-md mx-auto">
        {description}
      </p>

      {actionLabel && (
        <div className="pt-2">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 text-xs font-normal rounded-xl shadow-sm transition-all cursor-pointer"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 text-xs font-normal rounded-xl shadow-sm transition-all cursor-pointer"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
