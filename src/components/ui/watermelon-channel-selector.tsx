"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  UserCheck,
  Plus,
  ChevronDown,
  Search,
  X,
  CheckCircle2,
  Trash2,
  Check,
} from "lucide-react";
import { SocialIcon } from "@/components/ui/social-icons";

export interface AccountItem {
  id: string;
  platform: "facebook" | "instagram";
  accountName: string;
  status: "connected" | "disconnected";
  pageId?: string;
  businessAccountId?: string;
}

interface WatermelonChannelSelectorProps {
  filterPlatform: string;
  onTogglePlatform: (platform: "facebook" | "instagram" | "ALL") => void;
  connectedAccounts: AccountItem[];
  selectedAccountIds: string[];
  onToggleAccountSelection: (accId: string) => void;
  onSelectAllVisible: () => void;
  onClearAllVisible: () => void;
}

export function WatermelonChannelSelector({
  filterPlatform,
  onTogglePlatform,
  connectedAccounts,
  selectedAccountIds,
  onToggleAccountSelection,
  onSelectAllVisible,
  onClearAllVisible,
}: WatermelonChannelSelectorProps) {
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [accountSearchQuery, setAccountSearchQuery] = useState("");
  const [dropdownPlatformFilter, setDropdownPlatformFilter] = useState<string>("ALL");
  const [accountToRemove, setAccountToRemove] = useState<AccountItem | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Outside click & Escape key detection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAccountDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAccountDropdownOpen(false);
        setAccountToRemove(null);
      }
    };

    if (isAccountDropdownOpen || accountToRemove !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAccountDropdownOpen, accountToRemove]);

  const visibleAccounts = connectedAccounts.filter(
    (acc) => filterPlatform === "ALL" || acc.platform === filterPlatform
  );

  const filteredSearchAccounts = visibleAccounts.filter(
    (acc) =>
      acc.accountName.toLowerCase().includes(accountSearchQuery.toLowerCase()) &&
      (dropdownPlatformFilter === "ALL" || acc.platform === dropdownPlatformFilter)
  );

  return (
    <div className="space-y-4">
      {/* 1. Top Platform Filter Tabs: Facebook (Blue) & Instagram (Pink) */}
      <div className="p-2 sm:p-2.5 bg-card border border-border rounded-xl flex items-center justify-between gap-3 shadow-sm">
        <button
          type="button"
          onClick={() => onTogglePlatform("ALL")}
          className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-normal transition-all cursor-pointer ${
            filterPlatform === "ALL"
              ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs font-normal"
              : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
          }`}
        >
          All Channels ({connectedAccounts.length})
        </button>

        <button
          type="button"
          onClick={() => onTogglePlatform("facebook")}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-normal flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            filterPlatform === "facebook"
              ? "bg-[#1877F2] text-white shadow-md border border-blue-400/40"
              : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
          }`}
        >
          <SocialIcon platform="facebook" className="w-4 h-4 shrink-0" />
          <span>Facebook</span>
        </button>

        <button
          type="button"
          onClick={() => onTogglePlatform("instagram")}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-normal flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            filterPlatform === "instagram"
              ? "bg-[#E4405F] text-white shadow-md border border-pink-400/40"
              : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
          }`}
        >
          <SocialIcon platform="instagram" className="w-4 h-4 shrink-0" />
          <span>Instagram</span>
        </button>
      </div>

      {/* 2. Connected Channel Selector Dropdown Container */}
      <div ref={dropdownRef} className="bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 relative">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4.5 h-4.5 text-accent" />
            <label className="text-xs sm:text-sm font-normal text-foreground">
              Connected Channels (Multi-Account Selection)
            </label>
            <span className="px-2.5 py-0.5 bg-accent/10 border border-accent/30 text-accent font-normal text-[11px] rounded-md">
              {selectedAccountIds.length} of {visibleAccounts.length} Selected
            </span>
          </div>
        </div>

        <div className="relative">
          {/* Main Dropdown Trigger Button */}
          <button
            type="button"
            onClick={() => setIsAccountDropdownOpen((prev) => !prev)}
            className="w-full bg-card hover:bg-secondary/60 border border-border rounded-xl px-4 py-3 text-xs sm:text-sm font-normal text-foreground flex items-center justify-between gap-3 transition-colors shadow-2xs cursor-pointer"
          >
            {selectedAccountIds.length === 0 ? (
              <span className="text-muted-foreground font-normal">No channels selected (Click to choose channels)...</span>
            ) : (
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="bg-accent text-white text-[11px] font-normal px-2.5 py-0.5 rounded-md shrink-0">
                  {selectedAccountIds.length} Active
                </span>
                <span className="truncate text-foreground font-normal">
                  {connectedAccounts
                    .filter((a) => selectedAccountIds.includes(a.id))
                    .map((a) => a.accountName)
                    .join(", ")}
                </span>
              </div>
            )}

            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ${isAccountDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu Popover */}
          {isAccountDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
              {/* Search Input Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={accountSearchQuery}
                  onChange={(e) => setAccountSearchQuery(e.target.value)}
                  placeholder="Search connected channels to add or remove..."
                  autoFocus
                  className="w-full bg-secondary border border-border rounded-xl pl-9 pr-8 py-2.5 text-xs sm:text-sm font-normal text-foreground focus:outline-none focus:border-accent"
                />
                {accountSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setAccountSearchQuery("")}
                    className="absolute right-3 top-2.5 text-xs text-muted-foreground hover:text-foreground font-normal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Popover Sub-Filter Pills */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setDropdownPlatformFilter("ALL")}
                  className={`px-3 py-1 rounded-md text-xs font-normal transition-colors cursor-pointer ${
                    dropdownPlatformFilter === "ALL"
                      ? "bg-accent text-white shadow-xs"
                      : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  All Channels
                </button>
                <button
                  type="button"
                  onClick={() => setDropdownPlatformFilter("facebook")}
                  className={`px-3 py-1 rounded-md text-xs font-normal transition-colors cursor-pointer flex items-center gap-1.5 ${
                    dropdownPlatformFilter === "facebook"
                      ? "bg-[#1877F2] text-white shadow-xs"
                      : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  <SocialIcon platform="facebook" className="w-3.5 h-3.5" /> Facebook
                </button>
                <button
                  type="button"
                  onClick={() => setDropdownPlatformFilter("instagram")}
                  className={`px-3 py-1 rounded-md text-xs font-normal transition-colors cursor-pointer flex items-center gap-1.5 ${
                    dropdownPlatformFilter === "instagram"
                      ? "bg-[#E4405F] text-white shadow-xs"
                      : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  <SocialIcon platform="instagram" className="w-3.5 h-3.5" /> Instagram
                </button>
              </div>

              {/* Bulk Select / Clear Toolbar */}
              <div className="flex items-center justify-between gap-2 px-1 pt-1 border-b border-border pb-2 text-xs">
                <button
                  type="button"
                  onClick={onSelectAllVisible}
                  className="text-accent font-normal hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Select All Channels
                </button>
                <button
                  type="button"
                  onClick={onClearAllVisible}
                  className="text-red-500 hover:text-red-600 hover:underline font-normal text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All Selection
                </button>
              </div>

              {/* Scrollable Filtered Account Options */}
              <div className="max-h-60 overflow-y-auto space-y-1.5 pt-1">
                {filteredSearchAccounts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground font-normal">
                    No channels match "{accountSearchQuery}"
                  </div>
                ) : (
                  filteredSearchAccounts.map((acc) => {
                    const isSelected = selectedAccountIds.includes(acc.id);
                    return (
                      <div
                        key={acc.id}
                        onClick={() => {
                          if (isSelected) {
                            setAccountToRemove(acc);
                          } else {
                            onToggleAccountSelection(acc.id);
                          }
                        }}
                        className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 border ${
                          isSelected
                            ? "bg-accent/10 border-accent/40 text-foreground font-normal shadow-sm"
                            : "bg-secondary/60 hover:bg-secondary border-border/60 text-muted-foreground font-normal"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Checkbox */}
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? "bg-accent border-accent text-white"
                                : "border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>

                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 ${
                              acc.platform === "facebook" ? "bg-[#1877F2]" : "bg-[#E4405F]"
                            }`}
                          >
                            <SocialIcon platform={acc.platform} className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-normal truncate text-foreground">{acc.accountName}</div>
                            <div className="text-[11px] opacity-75 font-normal truncate">
                              {acc.platform === "facebook" ? "Facebook Page" : "Instagram Business"}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isSelected) {
                              setAccountToRemove(acc);
                            } else {
                              onToggleAccountSelection(acc.id);
                            }
                          }}
                          className={`p-2 rounded-lg shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? "bg-red-600 hover:bg-red-700 text-white shadow-sm border border-red-600"
                              : "bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/30"
                          }`}
                          title={isSelected ? `Remove ${acc.accountName}` : `Add ${acc.accountName}`}
                        >
                          {isSelected ? (
                            <Trash2 className="w-4 h-4 text-white" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer Toolbar */}
              <div className="pt-2 border-t border-border flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsAccountDropdownOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 text-xs font-normal rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Done Selecting
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Active Selected Channels List Below Dropdown */}
        {selectedAccountIds.length > 0 && (
          <div className="pt-3 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-normal text-foreground">
                  Active Selected Channels
                </span>
                <span className="px-2.5 py-0.5 bg-accent/10 border border-accent/30 text-accent font-normal text-[11px] rounded-md">
                  {selectedAccountIds.length}
                </span>
              </div>
              <button
                type="button"
                onClick={onClearAllVisible}
                className="text-red-500 hover:text-red-600 hover:underline font-normal text-xs flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span>Clear All Selected</span>
              </button>
            </div>

            <div className="w-full space-y-2">
              {connectedAccounts
                .filter((acc) => selectedAccountIds.includes(acc.id))
                .map((acc) => (
                  <div
                    key={acc.id}
                    className="w-full p-3.5 bg-card border border-border rounded-xl flex items-center justify-between gap-3 shadow-2xs transition-colors hover:border-accent/40"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 font-normal ${
                          acc.platform === "facebook" ? "bg-[#1877F2]" : "bg-[#E4405F]"
                        }`}
                      >
                        <SocialIcon platform={acc.platform} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-normal text-foreground truncate">
                          {acc.accountName}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-normal truncate">
                          {acc.platform === "facebook" ? "Facebook Page" : "Instagram Business Account"}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAccountToRemove(acc)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white shadow-xs rounded-lg transition-colors shrink-0 cursor-pointer border border-red-600 flex items-center justify-center"
                      title={`Remove ${acc.accountName}`}
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Remove Account Confirmation Modal */}
      {accountToRemove && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/30 shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-normal text-foreground">Remove Channel Selection?</h3>
                <p className="text-xs text-muted-foreground font-normal mt-0.5">Confirm account removal from active channel view</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-foreground font-normal leading-relaxed">
              Are you sure you want to remove <span className="font-normal text-accent">&quot;{accountToRemove.accountName}&quot;</span> from your active selected channels list?
            </p>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
              <button
                type="button"
                onClick={() => setAccountToRemove(null)}
                className="px-4 py-2 bg-secondary hover:bg-border text-foreground text-xs sm:text-sm font-normal rounded-xl border border-border transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleAccountSelection(accountToRemove.id);
                  setAccountToRemove(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-normal rounded-xl shadow-xs transition-colors cursor-pointer border border-red-600 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4 text-white" />
                <span>Remove Channel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
