"use client";

import React from "react";
import { SocialIcon } from "@/components/ui/social-icons";
import { WatermelonBadge } from "@/components/ui/watermelon-badge";

export interface ActivityItem {
  id: string;
  title: string;
  platform: "facebook" | "instagram";
  accountId?: string;
  accountName: string;
  status: "PUBLISHED" | "QUEUED" | "FAILED" | "DRAFT";
  timestamp: string;
}

interface WatermelonPostRowProps {
  post: ActivityItem;
  onAction?: (post: ActivityItem) => void;
  actionLabel?: string;
}

export function WatermelonPostRow({
  post,
  onAction,
  actionLabel,
}: WatermelonPostRowProps) {
  return (
    <div className="p-4 bg-secondary/80 hover:bg-secondary border border-border rounded-md flex items-center justify-between gap-3 shadow-xs transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-9 h-9 rounded-md flex items-center justify-center font-normal text-white shrink-0 shadow-xs ${
            post.platform === "facebook" ? "bg-[#1877F2]" : "bg-[#E4405F]"
          }`}
        >
          <SocialIcon platform={post.platform} className="w-4.5 h-4.5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs sm:text-sm font-normal text-foreground truncate">{post.title}</div>
          <div className="text-xs text-muted-foreground font-normal mt-0.5 flex items-center gap-2">
            <span>{post.accountName}</span>
            <span>•</span>
            <span>{post.timestamp}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <WatermelonBadge
          variant={
            post.status === "PUBLISHED"
              ? "accent"
              : post.status === "QUEUED"
              ? "accent"
              : post.status === "FAILED"
              ? "danger"
              : "secondary"
          }
        >
          {post.status}
        </WatermelonBadge>

        {onAction && actionLabel && (
          <button
            type="button"
            onClick={() => onAction(post)}
            className="text-xs text-accent font-normal hover:underline px-2 py-1"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
