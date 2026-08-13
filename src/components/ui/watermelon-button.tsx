"use client";

import React from "react";

interface WatermelonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function WatermelonButton({
  type = "button",
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: WatermelonButtonProps) {
  const baseStyle = "font-normal rounded flex items-center justify-center gap-2 select-none border cursor-pointer transition-all active:scale-[0.98]";

  const sizeStyles = {
    sm: "px-2.5 py-1 text-[11px]",
    md: "px-3.5 py-2 text-xs",
    lg: "px-4 py-2.5 text-sm",
  };

  const variantStyles = {
    primary: "bg-primary hover:bg-primary-hover text-primary-foreground border-primary",
    accent: "bg-accent hover:bg-accent/90 text-primary-foreground border-accent",
    secondary: "bg-secondary hover:bg-border text-foreground border-border",
    outline: "bg-transparent text-foreground border-border hover:bg-secondary",
    danger: "bg-danger text-primary-foreground border-danger hover:bg-danger/90",
  };

  return (
    <button
      type={type}
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
