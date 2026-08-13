"use client";

import React from "react";
import { X } from "lucide-react";

interface WatermelonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function WatermelonModal({ isOpen, onClose, title, children }: WatermelonModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border w-full max-w-lg rounded-xl p-5 space-y-4 shadow-xl cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-normal text-foreground">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded bg-secondary hover:bg-border text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
