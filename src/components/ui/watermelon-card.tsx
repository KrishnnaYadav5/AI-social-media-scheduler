"use client";

import React from "react";

interface WatermelonCardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function WatermelonCard({
  title,
  subtitle,
  action,
  children,
  className = "",
}: WatermelonCardProps) {
  return (
    <div className={`bg-card border border-border py-6 px-6 rounded space-y-4 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            {title && <h3 className="text-sm font-normal text-foreground">{title}</h3>}
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="pt-2">{children}</div>
    </div>
  );
}
