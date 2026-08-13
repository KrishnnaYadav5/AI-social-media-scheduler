"use client";

import React from "react";
import { Trash2, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Edit, Send, CheckSquare, Square } from "lucide-react";
import Link from "next/link";

interface WatermelonKanbanCardProps {
  id: string;
  title: string;
  description: string;
  status: "idea" | "review" | "approved" | "production";
  tags: string[];
  images?: string[];
  color?: string;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMoveLeft?: (id: string) => void;
  onMoveRight?: (id: string) => void;
  onDragStart?: (e: React.DragEvent, id: string) => void;
}

export function WatermelonKanbanCard({
  id,
  title,
  description,
  status,
  tags,
  images = [],
  color = "default",
  isSelected = false,
  onToggleSelect,
  onEdit,
  onDelete,
  onMoveLeft,
  onMoveRight,
  onDragStart,
}: WatermelonKanbanCardProps) {
  const getBadgeInfo = (s: string) => {
    switch (s) {
      case "idea":
        return { label: "Backlog", dot: "bg-slate-400" };
      case "review":
        return { label: "Review", dot: "bg-amber-400" };
      case "approved":
        return { label: "Approved", dot: "bg-emerald-400" };
      case "production":
        return { label: "Post", dot: "bg-blue-400" };
      default:
        return { label: s, dot: "bg-accent" };
    }
  };

  const badgeInfo = getBadgeInfo(status);

  // Clean Color Styles Palette (Uniform Borders)
  const colorAccentStyles: Record<string, string> = {
    emerald: "border border-emerald-500/30 bg-emerald-500/15 dark:bg-emerald-500/25 text-foreground",
    blue: "border border-blue-500/30 bg-blue-500/15 dark:bg-blue-500/25 text-foreground",
    amber: "border border-amber-500/30 bg-amber-500/15 dark:bg-amber-500/25 text-foreground",
    rose: "border border-rose-500/30 bg-rose-500/15 dark:bg-rose-500/25 text-foreground",
    purple: "border border-purple-500/30 bg-purple-500/15 dark:bg-purple-500/25 text-foreground",
    default: "border border-border/80 dark:border-stone-800 bg-card dark:bg-stone-900 text-foreground",
  };

  const colorDotMap: Record<string, string> = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    purple: "bg-purple-500",
    default: badgeInfo.dot,
  };

  const cardStyle = colorAccentStyles[color] || colorAccentStyles.default;
  const dotStyle = colorDotMap[color] || badgeInfo.dot;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, id)}
      className={`p-4 sm:p-5 rounded-2xl space-y-3.5 select-none cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200 ${
        isSelected ? "ring-2 ring-blue-600 dark:ring-blue-400 shadow-md scale-[1.01]" : ""
      } ${cardStyle}`}
    >
      {/* 1. Top Header: Selection Checkbox + Status Dot + Title + Solid Blue Edit Button (Top Right) */}
      <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-border/30 dark:border-stone-800/50">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {onToggleSelect && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(id);
              }}
              className="p-0.5 text-foreground hover:scale-110 transition-all shrink-0 cursor-pointer"
              title={isSelected ? "Deselect Card" : "Select Card"}
            >
              {isSelected ? (
                <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <Square className="w-5 h-5 text-muted-foreground/60 hover:text-foreground" />
              )}
            </button>
          )}
          <span className={`w-2.5 h-2.5 rounded-full ${dotStyle} shrink-0 shadow-xs`} />
          <h4 className="text-sm sm:text-base font-normal text-foreground tracking-tight leading-snug truncate">
            {title}
          </h4>
        </div>

        {/* Transparent Line Art Edit Icon Button with Sharp Border */}
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(id)}
            className="w-8 h-8 rounded-xl bg-transparent hover:bg-slate-200/60 dark:hover:bg-stone-800/80 text-foreground border-2 border-slate-300 dark:border-stone-700 flex items-center justify-center transition-all hover:scale-105 shadow-sm shrink-0"
            title="Edit Content Idea"
          >
            <Edit className="w-4 h-4 text-foreground stroke-[1.75]" />
          </button>
        )}
      </div>

      {/* 2. Concept Description Copy */}
      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed font-normal">
        {description}
      </p>

      {/* 3. Attachment Image Preview */}
      {images.length > 0 && (
        <div className="w-full h-28 rounded-xl overflow-hidden border border-border/50 dark:border-stone-800 bg-secondary shadow-2xs">
          <img src={images[0]} alt="Attachment" className="w-full h-full object-cover" />
        </div>
      )}

      {/* 4. Tag Pills Row */}
      {tags && tags.filter((t) => t.trim().length > 0).length > 0 && (
        <div className="pt-2 border-t border-border/20 dark:border-stone-800/30 flex items-center gap-1.5 flex-wrap">
          {tags.filter((t) => t.trim().length > 0).map((t) => (
            <span
              key={t}
              className="text-[10px] sm:text-xs text-muted-foreground font-normal px-2.5 py-1 rounded-md bg-secondary/80 dark:bg-stone-800/80 border border-border/40 dark:border-stone-700/60 shadow-2xs"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* 5. Combined Bottom Row: Stepper Arrows (< | >) + Convert to Live Post CTA Button */}
      {(onMoveLeft || onMoveRight || status === "production") && (
        <div className="pt-2.5 border-t border-border/30 dark:border-stone-800/50 flex items-center gap-2 w-full">
          {onMoveLeft && (
            <button
              type="button"
              onClick={() => onMoveLeft(id)}
              className="w-9 h-9 rounded-xl bg-transparent hover:bg-slate-200/60 dark:hover:bg-stone-800/80 text-foreground border-2 border-slate-300 dark:border-stone-700 flex items-center justify-center transition-all hover:scale-105 shadow-sm shrink-0"
              title="Move Previous Stage (<)"
            >
              <ArrowLeft className="w-4 h-4 text-foreground stroke-[1.75]" />
            </button>
          )}

          {status === "production" && (
            <Link
              href={`/editor?id=${id}&title=${encodeURIComponent(title)}&content=${encodeURIComponent(description)}&tags=${encodeURIComponent(tags ? tags.join(",") : "")}`}
              className="flex-1 min-w-0 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-normal text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-[1.01] truncate"
            >
              <Send className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="truncate">Convert to Live Post</span>
            </Link>
          )}

          {onMoveRight && (
            <button
              type="button"
              onClick={() => onMoveRight(id)}
              className="w-9 h-9 rounded-xl bg-transparent hover:bg-slate-200/60 dark:hover:bg-stone-800/80 text-foreground border-2 border-slate-300 dark:border-stone-700 flex items-center justify-center transition-all hover:scale-105 shadow-sm shrink-0"
              title="Move Next Stage (>)"
            >
              <ArrowRight className="w-4 h-4 text-foreground stroke-[1.75]" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
