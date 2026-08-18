"use client";

import React from "react";

export interface SubNavItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ElementType;
  count?: number;
  activeColorClass?: string;
}

interface WatermelonSubNavProps<T extends string = string> {
  items: SubNavItem<T>[];
  activeTab: T;
  onTabChange: (id: T) => void;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
  divider?: boolean;
  className?: string;
}

export function WatermelonSubNav<T extends string = string>({
  items,
  activeTab,
  onTabChange,
  fullWidth = true,
  size = "md",
  divider = false,
  className = "",
}: WatermelonSubNavProps<T>) {
  const containerWidthClass = fullWidth ? "w-full justify-between" : "w-auto justify-start";
  const paddingClass =
    size === "sm"
      ? "px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-xl gap-1.5 font-normal"
      : size === "lg"
      ? "px-5 sm:px-7 py-3.5 text-sm sm:text-base rounded-xl gap-2.5 font-normal"
      : "px-4 sm:px-5 py-2.5 text-xs sm:text-sm md:text-base rounded-xl gap-2 font-normal";

  return (
    <div
      className={`px-3 sm:px-4 py-2 bg-gray-100/90 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl flex items-center gap-2 shadow-md flex-nowrap overflow-x-auto scrollbar-none ${containerWidthClass} ${className}`}
    >
      {items.map((item, idx) => {
        const Icon = item.icon;
        const isSelected = activeTab === item.id;
        const selectedStyle = item.activeColorClass
          ? `${item.activeColorClass} text-white shadow-md font-normal`
          : "bg-white dark:bg-white text-slate-900 dark:text-slate-900 shadow-md font-normal border border-slate-200/80";
        const unselectedStyle =
          "bg-gray-200/70 dark:bg-zinc-800/80 text-gray-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-700 border border-gray-300/60 dark:border-zinc-700/60 font-normal";

        return (
          <React.Fragment key={item.id}>
            {divider && idx > 0 && (
              <span className="text-gray-400 dark:text-gray-500 font-normal text-xs px-0.5 shrink-0">
                |
              </span>
            )}
            <button
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`transition-all flex items-center justify-center min-w-0 whitespace-nowrap ${
                fullWidth ? "flex-1" : "shrink-0"
              } ${paddingClass} ${isSelected ? selectedStyle : unselectedStyle}`}
            >
              {Icon && <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />}
              <span className="truncate">{item.label}</span>
              {typeof item.count === "number" && (
                <span className="text-xs sm:text-sm opacity-90 shrink-0 font-normal">({item.count})</span>
              )}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
