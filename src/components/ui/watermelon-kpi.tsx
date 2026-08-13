"use client";

import React from "react";
import { WatermelonBadge } from "./watermelon-badge";

interface WatermelonKPIProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  badgeText?: string;
  badgeVariant?: "primary" | "accent" | "warning" | "danger" | "secondary";
}

export function WatermelonKPI({
  label,
  value,
  subtitle,
  icon,
  badgeText,
  badgeVariant = "primary",
}: WatermelonKPIProps) {
  return (
    <div className="bg-card border border-border py-5 px-5 rounded space-y-3 select-none">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-normal text-foreground">{label}</span>
        {icon && <div className="text-primary">{icon}</div>}
      </div>

      <div className="flex items-baseline justify-between pt-1">
        <div className="text-2xl font-normal text-foreground">{value}</div>
        {badgeText && <WatermelonBadge variant={badgeVariant}>{badgeText}</WatermelonBadge>}
      </div>

      {subtitle && <div className="text-[11px] text-muted-foreground pt-1">{subtitle}</div>}
    </div>
  );
}
