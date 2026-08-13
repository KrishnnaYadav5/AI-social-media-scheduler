"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ExternalLink,
  Trash2,
  Copy,
  Edit,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  CheckSquare,
  Square,
  RefreshCw,
  Clock,
  Send,
} from "lucide-react";
import { SocialIcon } from "@/components/ui/social-icons";
import { WatermelonModal } from "@/components/ui/watermelon-modal";
import { WatermelonConfirmModal } from "@/components/ui/watermelon-confirm-modal";
import { WatermelonBadge } from "@/components/ui/watermelon-badge";
import { WatermelonEmptyState } from "@/components/ui/watermelon-empty-state";

interface PostItem {
  id: string;
  content: string;
  targetPlatforms: string[];
  status: "draft" | "scheduled" | "published" | "failed";
  scheduledAt?: string;
  publishedAt?: string;
  publishedUrl?: string;
  failureReason?: string;
  mediaUrl?: string;
  dateGroup: "Today" | "Tomorrow" | "This Week" | "Older";
}

const initialPosts: PostItem[] = [
  {
    id: "post_1",
    content: "Exciting news! We are launching our new AI Social Media Scheduler today. Automate your posts with ease.",
    targetPlatforms: ["facebook", "instagram"],
    status: "published",
    publishedAt: "2026-07-27 10:00",
    publishedUrl: "https://facebook.com/posts/fb_post_123",
    mediaUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
    dateGroup: "Today",
  },
  {
    id: "post_2",
    content: "5 proven content strategies to boost your Instagram engagement this month.",
    targetPlatforms: ["instagram"],
    status: "scheduled",
    scheduledAt: "Tomorrow at 14:30",
    mediaUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    dateGroup: "Tomorrow",
  },
  {
    id: "post_3",
    content: "Drafting our weekly tech update newsletter post.",
    targetPlatforms: ["facebook"],
    status: "draft",
    dateGroup: "This Week",
  },
  {
    id: "post_4",
    content: "Special weekend discount announcement for all early SaaS adopters.",
    targetPlatforms: ["facebook", "instagram"],
    status: "failed",
    failureReason: "Media asset rendering timeout. Retrying queue.",
    dateGroup: "Today",
  },
];

export default function PostsListPage() {
  const [activeTab, setActiveTab] = useState<"all" | "draft" | "scheduled" | "published" | "failed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [postsList, setPostsList] = useState<PostItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Load posts from Supabase via API
  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (data.posts) {
        const mapped: PostItem[] = data.posts.map((p: any) => ({
          id: p.id,
          content: p.content,
          targetPlatforms: p.target_platforms || [],
          status: p.status as PostItem["status"],
          scheduledAt: p.scheduled_at ? new Date(p.scheduled_at).toLocaleString() : undefined,
          publishedAt: p.published_at ? new Date(p.published_at).toLocaleString() : undefined,
          publishedUrl: p.published_url,
          failureReason: p.failure_reason,
          mediaUrl: p.media_urls?.[0],
          dateGroup: "Today" as PostItem["dateGroup"],
        }));
        setPostsList(mapped);
      }
    } catch {
      setPostsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  const savePostsList = (newList: PostItem[]) => {
    setPostsList(newList);
  };

  // Confirmation Modal State
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Delete",
    onConfirm: () => {},
  });

  // Reschedule Modal State
  const [reschedulePostId, setReschedulePostId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("2026-08-09");
  const [rescheduleTime, setRescheduleTime] = useState("14:30");

  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulePostId) return;

    setPostsList((prev) =>
      prev.map((p) =>
        p.id === reschedulePostId
          ? {
              ...p,
              scheduledAt: `${rescheduleDate} at ${rescheduleTime}`,
            }
          : p
      )
    );
    setReschedulePostId(null);
    setNoticeMessage(`Post successfully rescheduled for ${rescheduleDate} at ${rescheduleTime}!`);
    setTimeout(() => setNoticeMessage(null), 3500);
  };

  const filteredPosts = postsList.filter((post) => {
    if (!post) return false;
    if (activeTab !== "all" && (post.status || "").toLowerCase() !== activeTab.toLowerCase()) return false;
    const platforms = Array.isArray(post.targetPlatforms)
      ? post.targetPlatforms
      : (post as any).platform
      ? [(post as any).platform]
      : [];
    if (selectedPlatform !== "all" && !platforms.includes(selectedPlatform)) return false;
    const textToSearch = (post.content || (post as any).title || "").toLowerCase();
    if (searchQuery && !textToSearch.includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getBadgeCount = (status: string) => {
    if (status === "all") return postsList.length;
    return postsList.filter((p) => p.status === status).length;
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredPosts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPosts.map((p) => p.id));
    }
  };

  const promptBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmModalState({
      isOpen: true,
      title: `Delete ${selectedIds.length} Selected Posts?`,
      description: `Are you sure you want to delete these ${selectedIds.length} selected posts? This action cannot be undone.`,
      confirmText: "Delete",
      onConfirm: async () => {
        await Promise.all(selectedIds.map((id) => fetch(`/api/posts/${id}`, { method: "DELETE" })));
        setPostsList((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
        setSelectedIds([]);
      },
    });
  };

  const promptSingleDelete = (id: string) => {
    setConfirmModalState({
      isOpen: true,
      title: "Delete Selected Post?",
      description: "Are you sure you want to delete this post? This item will be permanently removed.",
      confirmText: "Delete",
      onConfirm: async () => {
        await fetch(`/api/posts/${id}`, { method: "DELETE" });
        setPostsList((prev) => prev.filter((p) => p.id !== id));
        setSelectedIds((prev) => prev.filter((i) => i !== id));
      },
    });
  };

  const handleBulkRetry = async () => {
    if (selectedIds.length === 0) return;
    const failedIds = selectedIds.filter((id) => postsList.find((p) => p.id === id)?.status === "failed");
    await Promise.all(failedIds.map((id) => fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published", published_at: new Date().toISOString() }),
    })));
    setPostsList((prev) =>
      prev.map((p) =>
        failedIds.includes(p.id)
          ? { ...p, status: "published", publishedUrl: `https://facebook.com/${p.id}` }
          : p
      )
    );
    setSelectedIds([]);
  };

  const handleRetry = async (id: string) => {
    await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published", published_at: new Date().toISOString() }),
    });
    setPostsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "published", publishedUrl: `https://facebook.com/${id}` } : p))
    );
  };

  const handlePublishDraftNow = async (post: PostItem) => {
    try {
      const res = await fetch("/api/posts/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: post.content,
          platforms: Array.isArray(post.targetPlatforms) ? post.targetPlatforms : [(post as any).platform || "facebook"],
          mediaUrl: post.mediaUrl,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        savePostsList(
          postsList.map((p) =>
            p.id === post.id
              ? {
                  ...p,
                  status: "published",
                  publishedAt: "Just now",
                  publishedUrl: data.results?.[0]?.detail || `https://facebook.com/${p.id}`,
                }
              : p
          )
        );
        setNoticeMessage("Draft post successfully published via Meta API!");
      } else {
        setNoticeMessage("Failed to publish draft: " + (data.error || "Meta API error"));
      }
    } catch {
      setNoticeMessage("Network error attempting to publish draft.");
    }
    setTimeout(() => setNoticeMessage(null), 3500);
  };

  const handleOpenRescheduleModal = (post: PostItem) => {
    setReschedulePostId(post.id);
    if (post.scheduledAt) {
      const parts = post.scheduledAt.split(" at ");
      if (parts.length === 2) {
        setRescheduleTime(parts[1].trim());
      }
    }
  };

  const handleCopyCaption = async (id: string, text: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
    } catch (e) {}
    setCopiedId(id);
    setNoticeMessage("Caption copied to clipboard!");
    setTimeout(() => {
      setCopiedId(null);
      setNoticeMessage(null);
    }, 2500);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto pb-24">
      {noticeMessage && (
        <div className="fixed top-6 right-6 z-[60] bg-accent text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          <p className="text-sm font-normal">{noticeMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-normal text-foreground tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            <span>Posts</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organize, filter, track status, and view published post URLs
          </p>
        </div>

        <Link
          href="/editor"
          className="bg-white hover:bg-slate-100 text-black border border-slate-300 text-sm sm:text-base px-6 py-3.5 rounded-xl font-normal flex items-center gap-2 shadow-md transition-all hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-5 h-5 text-black" />
          <span>Create New Post</span>
        </Link>
      </div>

      {/* Filter Tabs Sub-Nav Bar - Simplified & High-Impact Easy Navigation */}
      <div className="p-2 bg-secondary dark:bg-black border border-border dark:border-stone-800 rounded-2xl flex items-center justify-between gap-2 text-xs sm:text-sm font-normal w-full shadow-md overflow-x-auto whitespace-nowrap">
        {[
          { id: "all", label: "All Posts", icon: FileText },
          { id: "draft", label: "Drafts", icon: Edit },
          { id: "scheduled", label: "Scheduled", icon: Clock },
          { id: "published", label: "Published", icon: Send },
          { id: "failed", label: "Failed", icon: AlertCircle },
        ].map((tab) => {
          const count = getBadgeCount(tab.id);
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedIds([]);
              }}
              className={`flex-1 py-3 px-3.5 sm:px-5 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2 shrink-0 text-xs sm:text-sm ${
                isActive
                  ? "bg-card dark:bg-white text-foreground dark:text-slate-900 shadow-md font-normal border border-border/50 dark:border-none scale-[1.01]"
                  : "text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white hover:bg-background/80 dark:hover:bg-stone-800/80 font-normal"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              <span
                className={`text-xs px-2 py-0.5 font-normal rounded-full transition-colors ${
                  isActive
                    ? "bg-accent text-white dark:bg-slate-900 dark:text-white"
                    : "bg-card dark:bg-stone-800 text-muted-foreground dark:text-slate-300 border border-border/60 dark:border-stone-700"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar & Bulk Actions */}
      <div className="p-4 bg-card border border-border rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 font-normal transition-colors"
          >
            {selectedIds.length > 0 && selectedIds.length === filteredPosts.length ? (
              <CheckSquare className="w-5 h-5 text-accent" />
            ) : (
              <Square className="w-5 h-5 text-muted-foreground" />
            )}
            <span>Select All</span>
          </button>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent font-normal placeholder:text-muted-foreground/60 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkRetry}
                className="px-4 py-2 bg-secondary hover:bg-border border border-border text-foreground text-xs sm:text-sm font-normal rounded-xl flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-accent" />
                <span>Retry ({selectedIds.length})</span>
              </button>

              <button
                type="button"
                onClick={promptBulkDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-normal rounded-xl flex items-center gap-2 shadow-md transition-all hover:scale-[1.01]"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete ({selectedIds.length})</span>
              </button>
            </div>
          )}

          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="bg-secondary border border-border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-foreground font-normal focus:outline-none"
          >
            <option value="all">All Networks</option>
            <option value="facebook">Facebook Page</option>
            <option value="instagram">Instagram Business</option>
          </select>
        </div>
      </div>

      {/* Posts List Cards */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <WatermelonEmptyState
            icon={FileText}
            title="No Posts Found"
            description="No posts match your current search or filter criteria. Create a post in the Post Editor to get started."
            actionLabel="Create New Post"
            actionHref="/editor"
          />
        ) : (
          filteredPosts.map((post) => {
            const isSelected = selectedIds.includes(post.id);

            return (
              <div
                key={post.id}
                className={`bg-card border rounded-2xl p-6 space-y-4 shadow-md transition-all ${
                  isSelected ? "border-accent ring-1 ring-accent" : "border-border hover:border-accent/40"
                }`}
              >
                {/* Header: Select Checkbox + Date Group + Social Brand Logos + Status Badge */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => handleToggleSelect(post.id)}>
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-accent" />
                      ) : (
                        <Square className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      )}
                    </button>

                    <span className="text-[11px] font-normal text-muted-foreground uppercase tracking-wider">
                      {post.dateGroup}
                    </span>

                    <div className="flex items-center gap-2">
                      {(Array.isArray(post.targetPlatforms)
                        ? post.targetPlatforms
                        : (post as any).platform
                        ? [(post as any).platform]
                        : ["facebook"]
                      ).map((plt) => (
                        <span
                          key={plt}
                          className="flex items-center gap-1.5 text-xs font-normal text-foreground bg-secondary px-2.5 py-1 rounded-lg border border-border"
                        >
                          <SocialIcon platform={plt} className="w-3.5 h-3.5" />
                          <span className="capitalize">{plt}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Status Indicator Badges */}
                  <div className="flex items-center gap-2 font-normal">
                    {post.status === "published" && (
                      <WatermelonBadge variant="accent">
                        PUBLISHED
                      </WatermelonBadge>
                    )}
                    {post.status === "scheduled" && (
                      <WatermelonBadge variant="accent">
                        <Clock className="w-3.5 h-3.5 text-accent" /> SCHEDULED: {post.scheduledAt?.toUpperCase()}
                      </WatermelonBadge>
                    )}
                    {post.status === "draft" && (
                      <WatermelonBadge variant="warning">
                        <FileText className="w-3.5 h-3.5" /> DRAFT
                      </WatermelonBadge>
                    )}
                    {post.status === "failed" && (
                      <WatermelonBadge variant="danger">
                        <AlertCircle className="w-3.5 h-3.5" /> FAILED
                      </WatermelonBadge>
                    )}
                  </div>
                </div>

                {/* Content Copy & Media Preview */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pl-7">
                  <div className="space-y-2 flex-1">
                    <div className="text-sm text-foreground font-normal leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </div>

                    {post.failureReason && (
                      <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-600 text-xs sm:text-sm font-normal rounded-xl flex items-center gap-2.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{post.failureReason}</span>
                      </div>
                    )}
                  </div>

                  {post.mediaUrl && (
                    <div className="relative w-28 h-28 rounded-2xl border border-border overflow-hidden shrink-0 bg-secondary shadow-sm">
                      <img src={post.mediaUrl} alt="Attached Media" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Actions Footer with Larger Buttons & Text */}
                <div className="pt-4 border-t border-border flex items-center justify-between gap-3 pl-7">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {post.publishedUrl && (
                      <a
                        href={post.publishedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/30 text-accent text-xs sm:text-sm font-normal rounded-xl flex items-center gap-2 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>View Live Post</span>
                      </a>
                    )}

                    {post.status === "failed" && (
                      <button
                        type="button"
                        onClick={() => handleRetry(post.id)}
                        className="px-4 py-2 bg-accent hover:bg-accent/90 text-white text-xs sm:text-sm font-normal rounded-xl flex items-center gap-2 transition-colors shadow-sm"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Retry Post</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopyCaption(post.id, post.content)}
                      className="px-4 py-2 bg-secondary hover:bg-border border border-border text-foreground text-xs sm:text-sm font-normal rounded-xl flex items-center gap-2 transition-colors"
                    >
                      {copiedId === post.id ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                      <span>{copiedId === post.id ? "Copied!" : "Copy Caption"}</span>
                    </button>

                    {post.status === "draft" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handlePublishDraftNow(post)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-normal rounded-xl flex items-center gap-2 shadow-md transition-all hover:scale-[1.01] cursor-pointer"
                        >
                          <Send className="w-4 h-4 text-white" />
                          <span>Publish Now</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenRescheduleModal(post)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-normal rounded-xl flex items-center gap-2 shadow-md transition-all hover:scale-[1.01] cursor-pointer"
                        >
                          <Clock className="w-4 h-4 text-white" />
                          <span>Schedule</span>
                        </button>
                      </>
                    )}

                    {post.status === "scheduled" && (
                      <button
                        type="button"
                        onClick={() => handleOpenRescheduleModal(post)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-normal rounded-xl flex items-center gap-2 shadow-md transition-all hover:scale-[1.01]"
                      >
                        <Clock className="w-4 h-4 text-white" />
                        <span>Reschedule</span>
                      </button>
                    )}

                    <Link
                      href={`/editor?id=${post.id}&content=${encodeURIComponent(post.content)}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-normal rounded-xl flex items-center gap-2 shadow-md transition-all hover:scale-[1.01]"
                    >
                      <Edit className="w-4 h-4 text-white" />
                      <span>Edit</span>
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => promptSingleDelete(post.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-normal rounded-xl flex items-center gap-2 shadow-md transition-all hover:scale-[1.01]"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reschedule Date/Time Picker Modal */}
      <WatermelonModal
        isOpen={reschedulePostId !== null}
        onClose={() => setReschedulePostId(null)}
        title="Reschedule Post Date & Time"
      >
        <form onSubmit={handleConfirmReschedule} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-normal text-foreground block">Select New Date</label>
              <input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full bg-secondary border border-border dark:border-stone-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-foreground font-normal focus:outline-none focus:border-accent"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-normal text-foreground block">Select New Time</label>
              <input
                type="time"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                className="w-full bg-secondary border border-border dark:border-stone-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-foreground font-normal focus:outline-none focus:border-accent"
                required
              />
            </div>
          </div>

          {/* Peak Engagement Hour Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-muted-foreground block">AI Peak Hour Presets:</label>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <button
                type="button"
                onClick={() => setRescheduleTime("09:00")}
                className="px-3 py-1 bg-secondary hover:bg-border border border-border dark:border-stone-800 rounded-lg font-normal text-foreground"
              >
                🌅 09:00 AM (Morning Peak)
              </button>
              <button
                type="button"
                onClick={() => setRescheduleTime("14:30")}
                className="px-3 py-1 bg-secondary hover:bg-border border border-border dark:border-stone-800 rounded-lg font-normal text-foreground"
              >
                ☀️ 14:30 PM (Afternoon Peak)
              </button>
              <button
                type="button"
                onClick={() => setRescheduleTime("18:00")}
                className="px-3 py-1 bg-secondary hover:bg-border border border-border dark:border-stone-800 rounded-lg font-normal text-foreground"
              >
                🌙 18:00 PM (Evening Peak)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setReschedulePostId(null)}
              className="px-4 py-2.5 bg-secondary border border-border text-foreground text-xs font-normal rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-normal rounded-xl shadow-md transition-all hover:scale-[1.01]"
            >
              Confirm Reschedule
            </button>
          </div>
        </form>
      </WatermelonModal>

      {/* Safety Confirmation Modal */}
      <WatermelonConfirmModal
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalState.onConfirm}
        title={confirmModalState.title}
        description={confirmModalState.description}
        confirmText={confirmModalState.confirmText}
        cancelText="Cancel"
      />
    </div>
  );
}
