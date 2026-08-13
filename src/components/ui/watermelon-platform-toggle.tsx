"use client";

import React from "react";
import { SocialIcon } from "@/components/ui/social-icons";

interface WatermelonPlatformToggleProps {
  selectedPlatforms: string[];
  onToggle: (platform: string) => void;
  className?: string;
}

export function WatermelonPlatformToggle({
  selectedPlatforms,
  onToggle,
  className = "",
}: WatermelonPlatformToggleProps) {
  const platforms = [
    { id: "facebook", label: "Facebook Page", colorClass: "bg-[#1877F2] text-white border-[#1877F2]" },
    { id: "instagram", label: "Instagram Business", colorClass: "bg-[#E4405F] text-white border-[#E4405F]" },
  ];

  return (
    <div
      className={`p-2 bg-secondary dark:bg-black border border-border dark:border-stone-800 rounded-2xl flex items-center gap-2.5 text-sm sm:text-base font-normal w-full shadow-md ${className}`}
    >
      {platforms.map((p) => {
        const isSelected = selectedPlatforms.includes(p.id);
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onToggle(p.id)}
            className={`flex-1 py-3.5 px-6 rounded-xl border text-sm sm:text-base font-normal flex items-center justify-center gap-2.5 transition-all ${
              isSelected
                ? `${p.colorClass} shadow-md scale-[1.01]`
                : "bg-card dark:bg-stone-900 text-muted-foreground dark:text-slate-300 border-border dark:border-stone-800 hover:border-[#1877F2]/50"
            }`}
          >
            <SocialIcon platform={p.id} className="w-5 h-5" />
            <span>{p.label}</span>
          </button>
        );
      })}
    </div>
  );
}
