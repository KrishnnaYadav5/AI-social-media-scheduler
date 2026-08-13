"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface WatermelonStatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  isActive?: boolean;
  onClick?: () => void;
  iconColor?: string;
}

export function WatermelonStatCard({
  title,
  value,
  subtext,
  icon: Icon,
  isActive = false,
  onClick,
  iconColor = "text-accent",
}: WatermelonStatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-5 bg-card border rounded-md text-left transition-all shadow-sm space-y-2 w-full cursor-pointer ${
        isActive ? "border-accent ring-1 ring-accent" : "border-border hover:border-accent/40"
      }`}
    >
      <div className="flex items-center justify-between text-sm sm:text-base text-foreground font-normal">
        <span>{title}</span>
        <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
      </div>
      <div className="text-2xl sm:text-3xl font-normal text-foreground">{value}</div>
      {subtext && (
        <div className="text-xs text-muted-foreground font-normal">
          {subtext}
        </div>
      )}
    </button>
  );
}
