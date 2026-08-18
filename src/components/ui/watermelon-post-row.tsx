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
  // Data mapping fallback if title is missing
  const postTitle = post.title || "Untitled Post";

  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl border border-border bg-card hover:border-accent/30 transition-colors group">
      {/* Platform Icon Badge */}
      <div className="relative mt-1 shrink-0">
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-sm">
          <SocialIcon platform={post.platform} className="w-5 h-5 text-white" />
        </div>
      </div>
      
      <div className="flex flex-1 items-center justify-between gap-3 min-w-0">
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-accent transition-colors">
            {postTitle}
          </div>
          <div className="text-xs text-muted-foreground font-normal mt-0.5 flex items-center gap-2">
            <span>{post.accountName}</span>
            <span>•</span>
            <span>{post.timestamp}</span>
          </div>
        </div>
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
