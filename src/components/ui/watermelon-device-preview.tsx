"use client";

import React, { useState } from "react";
import { Smartphone, Monitor, ThumbsUp, MessageCircle, Share2, Heart, Bookmark } from "lucide-react";
import { SocialIcon } from "./social-icons";

interface WatermelonDevicePreviewProps {
  platform: "facebook" | "instagram";
  content: string;
  mediaUrls?: string[];
  accountName?: string;
}

export function WatermelonDevicePreview({
  platform,
  content,
  mediaUrls = [],
  accountName = "Watermelon.io Official",
}: WatermelonDevicePreviewProps) {
  const [mode, setMode] = useState<"mobile" | "desktop">("mobile");

  const isFacebook = platform === "facebook";

  return (
    <div
      className={`bg-card border p-4 rounded space-y-3 select-none transition-colors ${
        isFacebook ? "border-[#1877F2]/40" : "border-[#E4405F]/40"
      }`}
    >
      {/* Header with Distinct Platform Color Badges */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] font-normal px-2.5 py-1 rounded flex items-center gap-1.5 border shadow-sm ${
              isFacebook
                ? "bg-[#1877F2] text-white border-[#1877F2]"
                : "bg-[#E4405F] text-white border-[#E4405F]"
            }`}
          >
            <SocialIcon platform={platform} className="w-3.5 h-3.5" />
            <span>{isFacebook ? "FACEBOOK PREVIEW" : "INSTAGRAM PREVIEW"}</span>
          </span>
        </div>

        {/* View Mode Toggle: Mobile Icon Pink & Computer Icon Blue */}
        <div className="flex items-center gap-1.5 bg-secondary p-1 rounded border border-border">
          <button
            onClick={() => setMode("mobile")}
            className={`p-1.5 rounded text-xs flex items-center justify-center transition-all ${
              mode === "mobile"
                ? "bg-card font-normal shadow-sm border border-[#E4405F]/40 ring-1 ring-[#E4405F]"
                : "hover:bg-card/50"
            }`}
            title="Mobile Device Feed"
          >
            <Smartphone className="w-4 h-4 text-[#E4405F]" />
          </button>
          <button
            onClick={() => setMode("desktop")}
            className={`p-1.5 rounded text-xs flex items-center justify-center transition-all ${
              mode === "desktop"
                ? "bg-card font-normal shadow-sm border border-[#1877F2]/40 ring-1 ring-[#1877F2]"
                : "hover:bg-card/50"
            }`}
            title="Desktop Feed View"
          >
            <Monitor className="w-4 h-4 text-[#1877F2]" />
          </button>
        </div>
      </div>

      {/* Simulated Device Feed Card */}
      <div
        className={`border rounded bg-secondary p-4 space-y-3 ${
          isFacebook ? "border-[#1877F2]/30" : "border-[#E4405F]/30"
        } ${mode === "mobile" ? "max-w-xs mx-auto" : "w-full"}`}
      >
        {/* User Account Header */}
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-full font-normal flex items-center justify-center text-xs shadow-sm ${
              isFacebook ? "bg-[#1877F2] text-white" : "bg-[#E4405F] text-white"
            }`}
          >
            <SocialIcon platform={platform} className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-normal text-foreground">{accountName}</div>
            <div className="text-[10px] text-muted-foreground">Published &bull; Just now</div>
          </div>
        </div>

        {/* Post Copy */}
        <div className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
          {content || `Your ${platform} publication copy will be rendered here...`}
        </div>

        {/* Post Media Asset */}
        {mediaUrls.length > 0 ? (
          <div className="w-full h-44 rounded overflow-hidden bg-card border border-border">
            <img src={mediaUrls[0]} alt="Media Preview" className="w-full h-full object-cover" />
          </div>
        ) : (
          !isFacebook && (
            <div className="w-full h-44 rounded border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground bg-card">
              [Instagram Image/Video Asset Required]
            </div>
          )
        )}

        {/* Simulated Platform Specific Action Bar */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-muted-foreground text-[11px]">
          {isFacebook ? (
            <>
              <div className="flex items-center gap-1.5 text-[#1877F2] font-normal cursor-pointer">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Like</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-foreground cursor-pointer">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Comment</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-foreground cursor-pointer">
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-[#E4405F] cursor-pointer" />
                <MessageCircle className="w-4 h-4 hover:text-foreground cursor-pointer" />
                <Share2 className="w-4 h-4 hover:text-foreground cursor-pointer" />
              </div>
              <Bookmark className="w-4 h-4 hover:text-foreground cursor-pointer" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
