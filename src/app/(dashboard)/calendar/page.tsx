"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Trash2,
  Plus,
  CheckCircle2,
  Sun,
  SunMedium,
  Moon,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { SocialIcon } from "@/components/ui/social-icons";
import { WatermelonModal } from "@/components/ui/watermelon-modal";
import { WatermelonConfirmModal } from "@/components/ui/watermelon-confirm-modal";
import { WatermelonBadge } from "@/components/ui/watermelon-badge";
import { WatermelonSubNav } from "@/components/ui/watermelon-sub-nav";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CalendarPost {
  id: string;
  content: string;
  target_platforms: string[];
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function toLocalISO(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}
function primaryPlatform(post: CalendarPost): "facebook" | "instagram" {
  if (post.target_platforms?.includes("instagram")) return "instagram";
  return "facebook";
}
function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const today = new Date();
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

  // Posts
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Schedule new
  const [scheduleForDate, setScheduleForDate] = useState<Date | null>(null);
  const [newContent, setNewContent] = useState("");
  const [newTime, setNewTime] = useState("12:00");
  const [newPlatforms, setNewPlatforms] = useState<("facebook" | "instagram")[]>(["facebook"]);
  const [saving, setSaving] = useState(false);

  // Reschedule
  const [rescheduling, setRescheduling] = useState<CalendarPost | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("12:00");
  const [rescheduleSaving, setRescheduleSaving] = useState(false);

  // Delete
  const [deleting, setDeleting] = useState<CalendarPost | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteSaving, setDeleteSaving] = useState(false);

  // View event detail
  const [viewEvent, setViewEvent] = useState<CalendarPost | null>(null);

  // Notice
  const [notice, setNotice] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showNotice = (msg: string, type: "success" | "error" = "success") => {
    setNotice({ msg, type });
    setTimeout(() => setNotice(null), 3500);
  };

  // ─── Load posts ──────────────────────────────────────────────────────────────
  const loadPosts = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/posts");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setPosts((json.posts ?? []).filter((p: CalendarPost) => p.scheduled_at));
    } catch (err: any) {
      setApiError(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  // ─── Derived calendar state ───────────────────────────────────────────────────
  const totalDays = daysInMonth(currentYear, currentMonth);
  const startDay = firstDayOfMonth(currentYear, currentMonth);

  // Posts for current month
  const monthPosts = posts.filter((p) => {
    if (!p.scheduled_at) return false;
    const d = new Date(p.scheduled_at);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  function postsForDay(day: number) {
    return monthPosts.filter((p) => {
      const d = new Date(p.scheduled_at!);
      return d.getDate() === day;
    });
  }

  // Week view: 7 days starting from current week's Sunday
  const weekStart = (() => {
    const t = new Date(today);
    t.setDate(t.getDate() - t.getDay());
    return t;
  })();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  // ─── Schedule new post ────────────────────────────────────────────────────────
  const openScheduleModal = (day: number) => {
    const d = new Date(currentYear, currentMonth, day, 12, 0);
    setScheduleForDate(d);
    setNewContent("");
    setNewTime("12:00");
    setNewPlatforms(["facebook"]);
  };

  const toggleNewPlatform = (platform: "facebook" | "instagram") => {
    setNewPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForDate || !newContent.trim() || newPlatforms.length === 0) return;
    setSaving(true);
    try {
      const [h, m] = newTime.split(":").map(Number);
      const dt = new Date(scheduleForDate);
      dt.setHours(h, m, 0, 0);
      const iso = toLocalISO(dt);

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newContent.trim(),
          target_platforms: newPlatforms,
          status: "scheduled",
          scheduled_at: iso,
        }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      await loadPosts();
      setScheduleForDate(null);
      showNotice(`Post scheduled for ${dt.toLocaleDateString()} at ${newTime}`);
    } catch (err: any) {
      showNotice(err.message || "Failed to schedule post", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Reschedule ───────────────────────────────────────────────────────────────
  const openReschedule = (post: CalendarPost) => {
    setViewEvent(null);
    setRescheduling(post);
    if (post.scheduled_at) {
      const d = new Date(post.scheduled_at);
      const pad = (n: number) => String(n).padStart(2, "0");
      setRescheduleDate(
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
      );
      setRescheduleTime(
        `${pad(d.getHours())}:${pad(d.getMinutes())}`
      );
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduling || !rescheduleDate) return;
    setRescheduleSaving(true);
    try {
      const [h, m] = rescheduleTime.split(":").map(Number);
      const dt = new Date(rescheduleDate);
      dt.setHours(h, m, 0, 0);
      const iso = toLocalISO(dt);

      const res = await fetch(`/api/posts/${rescheduling.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduled_at: iso }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      await loadPosts();
      setRescheduling(null);
      showNotice(`Post rescheduled to ${dt.toLocaleDateString()} at ${rescheduleTime}`);
    } catch (err: any) {
      showNotice(err.message || "Failed to reschedule", "error");
    } finally {
      setRescheduleSaving(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────────
  const openDelete = (post: CalendarPost) => {
    setViewEvent(null);
    setDeleting(post);
    setDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteSaving(true);
    try {
      const res = await fetch(`/api/posts/${deleting.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      await loadPosts();
      setDeleteConfirm(false);
      setDeleting(null);
      showNotice("Scheduled post removed from calendar.");
    } catch (err: any) {
      showNotice(err.message || "Failed to delete post", "error");
    } finally {
      setDeleteSaving(false);
    }
  };

  // ─── Render helpers ───────────────────────────────────────────────────────────
  const platformColor = (p: "facebook" | "instagram") =>
    p === "facebook" ? "#1877F2" : "#E4405F";

  const PostChip = ({ post, compact = false }: { post: CalendarPost; compact?: boolean }) => {
    const plat = primaryPlatform(post);
    const color = platformColor(plat);
    return (
      <div
        onClick={(e) => { e.stopPropagation(); setViewEvent(post); }}
        className="p-1.5 rounded-lg border text-[10px] space-y-0.5 transition-all hover:scale-[1.02] shadow-sm cursor-pointer"
        style={{ background: `${color}12`, borderColor: `${color}40` }}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="flex items-center gap-0.5" style={{ color }}>
            <SocialIcon platform={plat} className="w-3 h-3" />
            {!compact && <span className="capitalize">{plat}</span>}
          </span>
          <span className="text-muted-foreground">{formatTime(post.scheduled_at!)}</span>
        </div>
        <div className="truncate text-foreground">{post.content}</div>
      </div>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-24">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl text-foreground tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-accent" />
              <span>Calendar</span>
            </h1>
            <WatermelonBadge variant={posts.length > 0 ? "accent" : "secondary"}>
              {posts.length} SCHEDULED
            </WatermelonBadge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Schedule, reschedule, and manage all queued posts
          </p>
        </div>
        <button
          type="button"
          onClick={loadPosts}
          disabled={loading}
          className="px-4 py-2.5 bg-secondary hover:bg-border border border-border text-foreground text-xs flex items-center gap-2 rounded-md transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 text-accent ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-3 bg-card border border-border rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <WatermelonSubNav
            items={[{ id: "month", label: "Month" }, { id: "week", label: "Week" }, { id: "day", label: "Day" }]}
            activeTab={viewMode}
            onTabChange={(t) => setViewMode(t as any)}
            fullWidth={false}
            size="sm"
          />
          {/* Month Navigation */}
          <div className="flex items-center gap-2 p-1.5 bg-secondary border border-border rounded-xl">
            <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-border transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs px-2 text-foreground min-w-[110px] text-center">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-border transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <Link
          href="/editor"
          className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 text-xs px-5 py-2.5 rounded-xl font-normal flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-slate-900" />
          <span>New Post</span>
        </Link>
      </div>

      {/* API Error */}
      {apiError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-md text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Notice */}
      {notice && (
        <div className={`p-4 border rounded-md text-xs flex items-center gap-2.5 ${
          notice.type === "error"
            ? "bg-red-500/10 border-red-500/30 text-red-500"
            : "bg-accent/10 border-accent/30 text-accent"
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice.msg}</span>
        </div>
      )}

      {/* ── MONTH VIEW ─────────────────────────────────────────────────────── */}
      {viewMode === "month" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          {/* Day headers */}
          <div className="grid grid-cols-7 bg-secondary/70 border-b border-border text-center text-xs text-muted-foreground py-2.5">
            {DAY_NAMES.map((d) => <div key={d}>{d}</div>)}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-border">
            {/* Leading empty cells */}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[110px] bg-secondary/20" />
            ))}

            {/* Day cells */}
            {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
              const dayPosts = postsForDay(day);
              const isToday =
                day === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear();

              return (
                <div
                  key={day}
                  onClick={() => openScheduleModal(day)}
                  className={`min-h-[110px] p-2 transition-colors cursor-pointer group hover:bg-secondary/40 relative ${
                    isToday ? "bg-accent/5" : "bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs ${isToday ? "text-accent" : "text-foreground"}`}>{day}</span>
                    {isToday && (
                      <span className="text-[9px] bg-accent text-white px-1.5 py-0.5 rounded-full">TODAY</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayPosts.slice(0, 3).map((p) => (
                      <PostChip key={p.id} post={p} />
                    ))}
                    {dayPosts.length > 3 && (
                      <div className="text-[9px] text-muted-foreground pl-1">
                        +{dayPosts.length - 3} more
                      </div>
                    )}
                  </div>

                  {/* Add hint */}
                  {dayPosts.length === 0 && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 right-2 text-[9px] text-accent bg-accent/10 px-1.5 py-0.5 rounded-full border border-accent/30">
                      + Add
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── WEEK VIEW ──────────────────────────────────────────────────────── */}
      {viewMode === "week" && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <p className="text-xs text-muted-foreground">
            Week of {weekDays[0].toLocaleDateString()} — {weekDays[6].toLocaleDateString()}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const dayPosts = posts.filter((p) => {
                if (!p.scheduled_at) return false;
                const d = new Date(p.scheduled_at);
                return (
                  d.getFullYear() === day.getFullYear() &&
                  d.getMonth() === day.getMonth() &&
                  d.getDate() === day.getDate()
                );
              });
              const isToday = day.toDateString() === today.toDateString();
              return (
                <div
                  key={day.toISOString()}
                  className={`p-3 border rounded-xl space-y-2 min-h-[130px] ${
                    isToday ? "border-accent/40 bg-accent/5" : "border-border bg-secondary/40"
                  }`}
                >
                  <div className={`text-xs pb-1.5 border-b border-border flex justify-between ${isToday ? "text-accent" : "text-foreground"}`}>
                    <span>{DAY_NAMES[day.getDay()]}</span>
                    <span>{day.getDate()}</span>
                  </div>
                  {dayPosts.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentYear(day.getFullYear());
                        setCurrentMonth(day.getMonth());
                        openScheduleModal(day.getDate());
                      }}
                      className="text-[10px] text-muted-foreground hover:text-accent transition-colors"
                    >
                      + Add post
                    </button>
                  ) : (
                    dayPosts.map((p) => <PostChip key={p.id} post={p} compact />)
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── DAY VIEW ───────────────────────────────────────────────────────── */}
      {viewMode === "day" && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              All scheduled posts — click to manage
            </p>
            <button
              type="button"
              onClick={() => openScheduleModal(today.getDate())}
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Schedule Today
            </button>
          </div>
          {posts.length === 0 ? (
            <div className="p-10 border border-dashed border-border rounded-xl text-center text-xs text-muted-foreground">
              No scheduled posts yet. Create one in the Post Editor.
            </div>
          ) : (
            <div className="space-y-2">
              {[...posts]
                .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
                .map((p) => {
                  const plat = primaryPlatform(p);
                  const color = platformColor(plat);
                  const d = new Date(p.scheduled_at!);
                  return (
                    <div
                      key={p.id}
                      onClick={() => setViewEvent(p)}
                      className="p-4 bg-secondary/50 border border-border rounded-xl flex items-center justify-between cursor-pointer hover:border-accent transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                          style={{ background: color }}
                        >
                          <SocialIcon platform={plat} className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs text-foreground line-clamp-1">{p.content}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {d.toLocaleDateString()} • {formatTime(p.scheduled_at!)} • {plat.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); openReschedule(p); }}
                          className="p-1.5 rounded-lg hover:bg-border transition-colors text-muted-foreground hover:text-foreground"
                          title="Reschedule"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); openDelete(p); }}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: View Event Detail ─────────────────────────────────────────── */}
      <WatermelonModal
        isOpen={viewEvent !== null}
        onClose={() => setViewEvent(null)}
        title="Scheduled Post"
      >
        {viewEvent && (() => {
          const plat = primaryPlatform(viewEvent);
          const color = platformColor(plat);
          const d = viewEvent.scheduled_at ? new Date(viewEvent.scheduled_at) : null;
          return (
            <div className="space-y-4">
              {/* Meta bar */}
              <div className="p-3 bg-secondary border border-border rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg border" style={{ background: `${color}15`, borderColor: `${color}40`, color }}>
                    <SocialIcon platform={plat} className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="text-xs text-foreground capitalize">{plat} Post</div>
                    {d && (
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {d.toLocaleDateString()} at {formatTime(viewEvent.scheduled_at!)}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  SCHEDULED
                </span>
              </div>

              {/* Content preview */}
              <div className="p-4 bg-secondary/60 border border-border rounded-xl text-sm text-foreground leading-relaxed">
                {viewEvent.content}
              </div>

              {/* Platforms */}
              {viewEvent.target_platforms?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {viewEvent.target_platforms.map((pl) => (
                    <span key={pl} className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-secondary text-foreground capitalize flex items-center gap-1">
                      <SocialIcon platform={pl as any} className="w-3 h-3" />
                      {pl}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => openDelete(viewEvent)}
                  className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Post
                </button>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => openReschedule(viewEvent)}
                    className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white text-xs rounded-xl flex items-center gap-2 transition-all"
                  >
                    <Clock className="w-3.5 h-3.5" /> Reschedule
                  </button>
                  <Link
                    href={`/editor?id=${viewEvent.id}`}
                    onClick={() => setViewEvent(null)}
                    className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-xl flex items-center gap-2 transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </Link>
                </div>
              </div>
            </div>
          );
        })()}
      </WatermelonModal>

      {/* ── MODAL: Schedule New Post ─────────────────────────────────────────── */}
      <WatermelonModal
        isOpen={scheduleForDate !== null}
        onClose={() => setScheduleForDate(null)}
        title={
          scheduleForDate
            ? `Schedule Post — ${scheduleForDate.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}`
            : "Schedule Post"
        }
      >
        <form onSubmit={handleSchedule} className="space-y-4">
          {/* Platform selector */}
          <div className="space-y-1.5">
            <label className="text-xs text-foreground block">Target Platform</label>
            <div className="grid grid-cols-2 gap-2">
              {(["facebook", "instagram"] as const).map((pl) => {
                const active = newPlatforms.includes(pl);
                const color = platformColor(pl);
                return (
                  <button
                    key={pl}
                    type="button"
                    onClick={() => toggleNewPlatform(pl)}
                    className="p-3 rounded-xl border text-xs flex items-center justify-center gap-2 transition-all"
                    style={active
                      ? { background: color, borderColor: color, color: "#fff" }
                      : { background: "var(--secondary)", borderColor: "var(--border)", color: "var(--muted-foreground)" }
                    }
                  >
                    <SocialIcon platform={pl} className="w-4 h-4" />
                    <span className="capitalize">{pl}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time picker */}
          <div className="space-y-1.5">
            <label className="text-xs text-foreground block">Publication Time</label>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:border-accent"
            />
            {/* Peak presets */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { label: "09:00 Morning", time: "09:00", icon: <Sun className="w-3 h-3 text-amber-500" /> },
                { label: "14:30 Afternoon", time: "14:30", icon: <SunMedium className="w-3 h-3 text-amber-500" /> },
                { label: "18:00 Evening", time: "18:00", icon: <Moon className="w-3 h-3 text-indigo-400" /> },
              ].map((preset) => (
                <button
                  key={preset.time}
                  type="button"
                  onClick={() => setNewTime(preset.time)}
                  className={`px-2.5 py-1 rounded-lg border text-[10px] flex items-center gap-1 transition-colors ${
                    newTime === preset.time
                      ? "bg-accent/10 border-accent/40 text-accent"
                      : "bg-secondary border-border text-muted-foreground hover:border-accent/40"
                  }`}
                >
                  {preset.icon} {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-xs text-foreground block">Post Content</label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write your post caption..."
              rows={4}
              className="w-full bg-secondary border border-border rounded-xl p-4 text-xs text-foreground focus:outline-none focus:border-accent placeholder:text-muted-foreground/60 resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setScheduleForDate(null)}
              className="px-4 py-2.5 bg-secondary hover:bg-border border border-border text-foreground text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || newPlatforms.length === 0}
              className="px-5 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white text-xs rounded-xl shadow-sm transition-all"
            >
              {saving ? "Scheduling…" : "Schedule Post"}
            </button>
          </div>
        </form>
      </WatermelonModal>

      {/* ── MODAL: Reschedule ────────────────────────────────────────────────── */}
      <WatermelonModal
        isOpen={rescheduling !== null}
        onClose={() => setRescheduling(null)}
        title="Reschedule Post"
      >
        {rescheduling && (
          <form onSubmit={handleReschedule} className="space-y-4">
            {/* Content preview */}
            <div className="p-3 bg-secondary border border-border rounded-xl text-xs text-muted-foreground line-clamp-2">
              {rescheduling.content}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-foreground block">New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-accent"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-foreground block">New Time</label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-accent"
                  required
                />
              </div>
            </div>

            {/* Peak presets */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground block">Peak Hour Presets</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "09:00 Morning", time: "09:00", icon: <Sun className="w-3 h-3 text-amber-500" /> },
                  { label: "14:30 Afternoon", time: "14:30", icon: <SunMedium className="w-3 h-3 text-amber-500" /> },
                  { label: "18:00 Evening", time: "18:00", icon: <Moon className="w-3 h-3 text-indigo-400" /> },
                ].map((p) => (
                  <button
                    key={p.time}
                    type="button"
                    onClick={() => setRescheduleTime(p.time)}
                    className={`px-2.5 py-1 rounded-lg border text-[10px] flex items-center gap-1 transition-colors ${
                      rescheduleTime === p.time
                        ? "bg-accent/10 border-accent/40 text-accent"
                        : "bg-secondary border-border text-muted-foreground hover:border-accent/40"
                    }`}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setRescheduling(null)}
                className="px-4 py-2.5 bg-secondary border border-border text-foreground text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={rescheduleSaving}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs rounded-xl shadow-sm transition-all"
              >
                {rescheduleSaving ? "Saving…" : "Confirm Reschedule"}
              </button>
            </div>
          </form>
        )}
      </WatermelonModal>

      {/* ── CONFIRM: Delete ──────────────────────────────────────────────────── */}
      <WatermelonConfirmModal
        isOpen={deleteConfirm}
        onClose={() => { setDeleteConfirm(false); setDeleting(null); }}
        onConfirm={handleDelete}
        title="Remove Scheduled Post?"
        description={deleting ? `"${deleting.content.substring(0, 80)}…" will be permanently deleted.` : "This scheduled post will be permanently removed."}
        confirmText={deleteSaving ? "Removing…" : "Remove Post"}
        cancelText="Cancel"
      />
    </div>
  );
}
