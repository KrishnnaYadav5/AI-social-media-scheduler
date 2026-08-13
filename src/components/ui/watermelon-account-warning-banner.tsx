"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

interface WatermelonAccountWarningBannerProps {
  message?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function WatermelonAccountWarningBanner({
  message = "No active social accounts connected. Connect your Facebook Page or Instagram Business Account to enable live Meta Graph API publishing.",
  actionLabel = "Connect Accounts",
  actionHref = "/accounts",
}: WatermelonAccountWarningBannerProps) {
  return (
    <div className="p-4 bg-card border border-border text-foreground rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/30 shrink-0">
          <AlertCircle className="w-5 h-5 text-red-500" />
        </div>
        <div className="text-xs sm:text-sm text-white font-normal leading-relaxed">
          {message}
        </div>
      </div>
      <Link
        href={actionHref}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white border border-red-600 text-xs font-normal rounded-xl shrink-0 transition-all shadow-sm cursor-pointer"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
