"use client";

import React from "react";

interface WatermelonBadgeProps {
  variant?: "primary" | "accent" | "warning" | "danger" | "secondary";
  children: React.ReactNode;
  className?: string;
}

export function WatermelonBadge({ variant = "primary", children, className = "" }: WatermelonBadgeProps) {
  const variantStyles = {
    primary: "bg-primary/20 text-primary",
    accent: "bg-accent/20 text-accent",
    warning: "bg-warning/20 text-warning",
    danger: "bg-danger/20 text-danger",
    secondary: "bg-secondary text-secondary-foreground",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-normal uppercase tracking-wider inline-flex items-center gap-1.5 border-none ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
