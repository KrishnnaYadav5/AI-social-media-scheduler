"use client";

import React from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { WatermelonModal } from "./watermelon-modal";

interface WatermelonConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

export function WatermelonConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone. This item will be permanently removed.",
  confirmText = "Delete Item",
  cancelText = "Cancel",
}: WatermelonConfirmModalProps) {
  return (
    <WatermelonModal isOpen={isOpen} onClose={onClose} title="">
      <div className="space-y-5 pt-1 pb-2">
        {/* Centered Destructive Icon Badge */}
        <div className="w-12 h-12 rounded-full bg-danger/10 border border-danger/30 text-danger flex items-center justify-center mx-auto shadow-sm">
          <Trash2 className="w-6 h-6" />
        </div>

        {/* Human-Friendly Centered Typography */}
        <div className="space-y-1.5 text-center">
          <h3 className="text-base font-normal text-foreground tracking-tight">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {description}
          </p>
        </div>

        {/* Equal-Width Side-by-Side Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-secondary border border-border hover:bg-border text-foreground text-xs font-normal rounded transition-colors"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full py-2.5 bg-danger hover:bg-danger/90 text-white text-xs sm:text-sm font-normal rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </WatermelonModal>
  );
}
