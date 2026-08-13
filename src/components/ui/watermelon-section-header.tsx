"use client";

import React from "react";

interface WatermelonSectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  className?: string;
}

export function WatermelonSectionHeader({
  title,
  subtitle,
  icon: Icon,
  action,
  className = "",
}: WatermelonSectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <div>
        <h3 className="text-base sm:text-lg font-normal text-foreground tracking-tight flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-accent shrink-0" />}
          <span>{title}</span>
        </h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5 font-normal">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
