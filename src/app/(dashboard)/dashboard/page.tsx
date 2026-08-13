"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  History,
  PenSquare,
  Calendar,
  ShieldCheck,
  RefreshCw,
  Plus,
  Lightbulb,
  BarChart3,
  Users,
  ArrowUpRight,
  Eye,
  TrendingUp,
  Heart,
} from "lucide-react";
import { WatermelonBadge } from "@/components/ui/watermelon-badge";
import { SocialIcon } from "@/components/ui/social-icons";
import { WatermelonAccountWarningBanner } from "@/components/ui/watermelon-account-warning-banner";
import { WatermelonChannelSelector, AccountItem } from "@/components/ui/watermelon-channel-selector";
import { WatermelonStatCard } from "@/components/ui/watermelon-stat-card";
import { WatermelonPostRow, ActivityItem } from "@/components/ui/watermelon-post-row";

interface MetaTotals {
  impressions: number;
  reach: number;
  engaged_users: number;
  follower_growth: number;
  post_engagements: number;
}

function fmtK(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return String(n);
}

export default function DashboardOverviewPage() {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterPlatform, setFilterPlatform] = useState<string>("ALL");
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<AccountItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [syncing, setSyncing] = useState(false);

  // Meta API analytics state
  const [metaTotals, setMetaTotals] = useState<MetaTotals | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);

  // Load accounts & posts from Supabase via API
  const loadAccountsAndPosts = useCallback(async () => {
    try {
      const [accRes, postsRes] = await Promise.all([
        fetch("/api/accounts"),
        fetch("/api/posts"),
      ]);
      const accData = await accRes.json();
      const postsData = await postsRes.json();

      if (accData.accounts) {
        const activeAccounts: AccountItem[] = accData.accounts
          .filter((a: any) => a.status === "connected")
          .map((a: any) => ({
            id: a.id,
            platform: a.platform as "facebook" | "instagram",
            accountName: a.account_name,
            status: a.status,
            tokenExpiresIn: "Token Active",
            pageId: a.page_id,
            businessAccountId: a.business_account_id,
          }));
        setConnectedAccounts(activeAccounts);
        const matching = activeAccounts.filter(
          (a) => filterPlatform === "ALL" || a.platform === filterPlatform
        );
        setSelectedAccountIds((matching.length > 0 ? matching : activeAccounts).map((a) => a.id));
      } else {
        setConnectedAccounts([]);
        setSelectedAccountIds([]);
      }

      if (postsData.posts) {
        const mapped: ActivityItem[] = postsData.posts.map((p: any) => ({
          id: p.id,
          content: p.content,
          target_platforms: p.target_platforms,
          targetPlatforms: p.target_platforms,
          status: p.status,
          scheduled_at: p.scheduled_at,
          scheduledAt: p.scheduled_at,
          published_at: p.published_at,
          publishedAt: p.published_at,
          platform: p.target_platforms?.[0] || "facebook",
        }));
        setActivities(mapped);
      } else {
        setActivities([]);
      }
    } catch {
      setConnectedAccounts([]);
      setSelectedAccountIds([]);
      setActivities([]);
    }
  }, [filterPlatform]);

  // Fetch Meta API analytics
  const fetchMetaAnalytics = useCallback(async () => {
    setMetaLoading(true);
    setMetaError(null);
    try {
      const res = await fetch("/api/analytics/meta?range=30d");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setMetaTotals(json.totals ?? null);
    } catch (err: any) {
      setMetaError(err.message || "Failed to fetch Meta data");
      setMetaTotals(null);
    } finally {
      setMetaLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccountsAndPosts();
    fetchMetaAnalytics();
  }, []);

  const handleSyncNow = async () => {
    setSyncing(true);
    await Promise.all([loadAccountsAndPosts(), fetchMetaAnalytics()]);
    setSyncing(false);
  };

  const handleClearFilters = () => {
    setFilterStatus("ALL");
    setFilterPlatform("ALL");
    setSelectedAccountIds(connectedAccounts.map((a) => a.id));
  };

  const handlePlatformChange = (platform: string) => {
    setFilterPlatform(platform);
    const matching = connectedAccounts.filter(
      (a) => platform === "ALL" || a.platform === platform
    );
    setSelectedAccountIds(matching.map((a) => a.id));
  };

  const togglePlatform = (platform: "facebook" | "instagram" | "ALL") => {
    let next: string;
    if (platform === "ALL") {
      next = "ALL";
    } else if (filterPlatform === platform) {
      next = "ALL";
    } else {
      next = platform;
    }
    setFilterPlatform(next);
    const matching = connectedAccounts.filter(
      (a) => next === "ALL" || a.platform === next
    );
    setSelectedAccountIds(matching.map((a) => a.id));
  };

  const toggleAccountSelection = (accId: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(accId) ? prev.filter((id) => id !== accId) : [...prev, accId]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = connectedAccounts
      .filter((acc) => filterPlatform === "ALL" || acc.platform === filterPlatform)
      .map((a) => a.id);
    setSelectedAccountIds(Array.from(new Set([...selectedAccountIds, ...visibleIds])));
  };

  const handleClearAllVisible = () => {
    const visibleIds = connectedAccounts
      .filter((acc) => filterPlatform === "ALL" || acc.platform === filterPlatform)
      .map((a) => a.id);
    setSelectedAccountIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
  };

  const getPostPlatforms = (act: any): string[] => {
    if (Array.isArray(act.targetPlatforms) && act.targetPlatforms.length > 0) {
      return act.targetPlatforms;
    }
    if (act.platform) return [act.platform];
    return ["facebook"];
  };

  const checkAccountMatch = (act: ActivityItem) => {
    if (connectedAccounts.length === 0) return true;
    if (selectedAccountIds.length === 0) return false;

    const selectedPlatforms = connectedAccounts
      .filter((acc) => selectedAccountIds.includes(acc.id))
      .map((acc) => acc.platform);

    const postPlatforms = getPostPlatforms(act);
    const matchesPlatform = postPlatforms.some((plt) => selectedPlatforms.includes(plt as any));
    const matchesAccountId = act.accountId ? selectedAccountIds.includes(act.accountId) : false;

    return matchesPlatform || matchesAccountId;
  };

  const filteredActivities = activities.filter((act) => {
    const actStatus = (act.status || "").toLowerCase();
    const targetStatus = filterStatus.toLowerCase();
    const matchesStatus =
      filterStatus === "ALL"
        ? true
        : targetStatus === "queued" || targetStatus === "scheduled"
        ? actStatus === "queued" || actStatus === "scheduled"
        : actStatus === targetStatus;

    const postPlatforms = getPostPlatforms(act);
    const matchesPlatform =
      filterPlatform === "ALL"
        ? true
        : postPlatforms.includes(filterPlatform);

    const matchesAccount = checkAccountMatch(act);

    return matchesStatus && matchesPlatform && matchesAccount;
  });

  const baseFilteredForStats = activities.filter((act) => {
    const postPlatforms = getPostPlatforms(act);
    const matchesPlatform =
      filterPlatform === "ALL"
        ? true
        : postPlatforms.includes(filterPlatform);

    const matchesAccount = checkAccountMatch(act);

    return matchesPlatform && matchesAccount;
  });

  const totalCount = baseFilteredForStats.length;
  const publishedCount = baseFilteredForStats.filter(
    (a) => (a.status || "").toLowerCase() === "published"
  ).length;
  const queuedCount = baseFilteredForStats.filter(
    (a) => (a.status || "").toLowerCase() === "queued" || (a.status || "").toLowerCase() === "scheduled"
  ).length;
  const failedCount = baseFilteredForStats.filter(
    (a) => (a.status || "").toLowerCase() === "failed"
  ).length;
  const liveRate = totalCount > 0 ? Math.round((publishedCount / totalCount) * 100) : 0;

  const fbCount = baseFilteredForStats.filter((a) => a.platform === "facebook").length;
  const igCount = baseFilteredForStats.filter((a) => a.platform === "instagram").length;
  const fbPercent = totalCount > 0 ? Math.round((fbCount / totalCount) * 100) : 0;
  const igPercent = totalCount > 0 ? 100 - fbPercent : 0;

  const hasActiveFilter = filterStatus !== "ALL" || filterPlatform !== "ALL" || selectedAccountIds.length < connectedAccounts.length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-24">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-normal text-foreground tracking-tight">Dashboard Overview</h1>
            <WatermelonBadge variant={connectedAccounts.length > 0 ? "accent" : "secondary"}>
              <ShieldCheck className="w-3.5 h-3.5" /> {connectedAccounts.length > 0 ? `${connectedAccounts.length} ACCOUNTS CONNECTED` : "NOT CONNECTED"}
            </WatermelonBadge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-normal">
            Real-time Meta Graph API status, account metrics, and multi-channel publication queue
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleSyncNow}
            disabled={syncing}
            className="px-4 py-2.5 bg-secondary hover:bg-border border border-border text-foreground text-xs sm:text-sm font-normal rounded-md flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            title="Sync Meta API Data"
          >
            <RefreshCw className={`w-4 h-4 text-accent ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Syncing..." : "Sync Now"}</span>
          </button>

          <Link
            href="/editor"
            className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 text-xs sm:text-sm px-5 py-2.5 rounded-xl font-normal flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-900" />
            <span>Create Post</span>
          </Link>
        </div>
      </div>

      {/* 2. Reusable 0 Account Warning Banner Component */}
      {connectedAccounts.length === 0 && <WatermelonAccountWarningBanner />}

      {/* 3. Reusable Multi-Account Channel Selector Component */}
      <WatermelonChannelSelector
        filterPlatform={filterPlatform}
        onTogglePlatform={togglePlatform}
        connectedAccounts={connectedAccounts}
        selectedAccountIds={selectedAccountIds}
        onToggleAccountSelection={toggleAccountSelection}
        onSelectAllVisible={handleSelectAllVisible}
        onClearAllVisible={handleClearAllVisible}
      />

      {/* 3b. Quick Actions Workspace (Directly Below Connected Channels) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link
          href="/editor"
          className="p-4 bg-card border border-border hover:border-accent rounded-md flex items-center gap-3 transition-all shadow-sm group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-md bg-blue-600/10 text-[#1877F2] flex items-center justify-center font-normal shrink-0">
            <PenSquare className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-normal text-foreground group-hover:text-accent transition-colors">Create New Post</div>
            <div className="text-[11px] text-muted-foreground font-normal">Post engine & schedule</div>
          </div>
        </Link>

        <Link
          href="/calendar"
          className="p-4 bg-card border border-border hover:border-accent rounded-md flex items-center gap-3 transition-all shadow-sm group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-md bg-cyan-600/10 text-cyan-600 flex items-center justify-center font-normal shrink-0">
            <Calendar className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-normal text-foreground group-hover:text-accent transition-colors">Content Calendar</div>
            <div className="text-[11px] text-muted-foreground font-normal">Drag & drop schedule</div>
          </div>
        </Link>

        <Link
          href="/ideas"
          className="p-4 bg-card border border-border hover:border-accent rounded-md flex items-center gap-3 transition-all shadow-sm group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-md bg-pink-600/10 text-[#E4405F] flex items-center justify-center font-normal shrink-0">
            <Lightbulb className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-normal text-foreground group-hover:text-accent transition-colors">Idea Board</div>
            <div className="text-[11px] text-muted-foreground font-normal">Brainstorm & Kanban</div>
          </div>
        </Link>

        <Link
          href="/analytics"
          className="p-4 bg-card border border-border hover:border-accent rounded-md flex items-center gap-3 transition-all shadow-sm group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-md bg-purple-600/10 text-purple-600 flex items-center justify-center font-normal shrink-0">
            <BarChart3 className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-normal text-foreground group-hover:text-accent transition-colors">Analytics</div>
            <div className="text-[11px] text-muted-foreground font-normal">Reach & insights</div>
          </div>
        </Link>

        <Link
          href="/accounts"
          className="p-4 bg-card border border-border hover:border-accent rounded-md flex items-center gap-3 transition-all shadow-sm group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-md bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-normal shrink-0">
            <Users className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-normal text-foreground group-hover:text-accent transition-colors">Accounts</div>
            <div className="text-[11px] text-muted-foreground font-normal">Meta page connections</div>
          </div>
        </Link>
      </div>

      {/* 4. Reusable Stat Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <WatermelonStatCard
          title="Total Posts"
          value={totalCount}
          subtext={filterPlatform !== "ALL" ? `${filterPlatform.toUpperCase()} Posts` : "Across Facebook & Instagram"}
          icon={FileText}
          isActive={filterStatus === "ALL"}
          onClick={() => setFilterStatus("ALL")}
        />
        <WatermelonStatCard
          title="Published"
          value={publishedCount}
          subtext={`${liveRate}% Live Rate`}
          icon={CheckCircle2}
          iconColor="text-emerald-500"
          isActive={filterStatus.toLowerCase() === "published"}
          onClick={() => setFilterStatus("published")}
        />
        <WatermelonStatCard
          title="Queued"
          value={queuedCount}
          subtext="Scheduled Queue"
          icon={Clock}
          isActive={filterStatus.toLowerCase() === "queued" || filterStatus.toLowerCase() === "scheduled"}
          onClick={() => setFilterStatus("scheduled")}
        />
        <WatermelonStatCard
          title="Failed"
          value={failedCount}
          subtext={failedCount > 0 ? "Action Required" : "0 API Errors"}
          icon={AlertCircle}
          iconColor="text-red-500"
          isActive={filterStatus.toLowerCase() === "failed"}
          onClick={() => setFilterStatus("failed")}
        />
      </div>

      {/* 4b. Meta API Live Performance Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <WatermelonStatCard
          title="Impressions (30d)"
          value={metaLoading ? "—" : metaTotals ? fmtK(metaTotals.impressions) : "0"}
          subtext={metaError ? "Meta API error" : metaLoading ? "Fetching from Meta API…" : "From Meta Graph API"}
          icon={Eye}
        />
        <WatermelonStatCard
          title="Reach (30d)"
          value={metaLoading ? "—" : metaTotals ? fmtK(metaTotals.reach) : "0"}
          subtext="Unique accounts reached"
          icon={BarChart3}
        />
        <WatermelonStatCard
          title="Engagement Rate"
          value={
            metaLoading
              ? "—"
              : metaTotals && metaTotals.reach > 0
              ? ((metaTotals.engaged_users / metaTotals.reach) * 100).toFixed(1) + "%"
              : "0.0%"
          }
          subtext="Engaged users ÷ reach"
          icon={TrendingUp}
        />
        <WatermelonStatCard
          title="Follower Growth"
          value={metaLoading ? "—" : metaTotals ? "+" + fmtK(metaTotals.follower_growth) : "+0"}
          subtext="New followers this month"
          icon={Users}
        />
      </div>

      {/* 6. 2-Column Split: Donut Chart Card & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Platform Distribution SVG Donut Chart Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card border border-border p-6 rounded-md space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-sm font-normal text-foreground">Platform Distribution</h2>
                <p className="text-xs text-muted-foreground font-normal mt-0.5">Click arc to filter activity feed</p>
              </div>

              {filterPlatform !== "ALL" && (
                <button
                  type="button"
                  onClick={() => handlePlatformChange("ALL")}
                  className="text-xs font-normal text-accent hover:underline cursor-pointer"
                >
                  Clear Filter
                </button>
              )}
            </div>

            {/* SVG Donut Chart */}
            <div className="flex flex-col items-center justify-center py-2 space-y-5">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-secondary stroke-current"
                    strokeWidth="4"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {totalCount > 0 && (
                    <>
                      <path
                        className="stroke-[#1877F2] transition-all hover:opacity-85 cursor-pointer"
                        strokeWidth="4.5"
                        strokeDasharray={`${fbPercent}, 100`}
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        onClick={() => handlePlatformChange(filterPlatform === "facebook" ? "ALL" : "facebook")}
                      />
                      <path
                        className="stroke-[#E4405F] transition-all hover:opacity-85 cursor-pointer"
                        strokeWidth="4.5"
                        strokeDasharray={`${igPercent}, 100`}
                        strokeDashoffset={`-${fbPercent}`}
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        onClick={() => handlePlatformChange(filterPlatform === "instagram" ? "ALL" : "instagram")}
                      />
                    </>
                  )}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-normal text-foreground leading-none">{totalCount}</span>
                  <span className="text-xs text-muted-foreground font-normal mt-1">Posts Total</span>
                </div>
              </div>

              {/* Legend Badges */}
              <div className="flex items-center justify-center gap-4 text-xs font-normal">
                <button
                  type="button"
                  onClick={() => handlePlatformChange(filterPlatform === "facebook" ? "ALL" : "facebook")}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md border transition-all cursor-pointer ${
                    filterPlatform === "facebook"
                      ? "bg-[#1877F2]/10 border-[#1877F2] text-[#1877F2]"
                      : "bg-secondary border-border text-foreground hover:border-[#1877F2]"
                  }`}
                >
                  <SocialIcon platform="facebook" className="w-4 h-4" />
                  <span>Facebook ({fbPercent}%)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePlatformChange(filterPlatform === "instagram" ? "ALL" : "instagram")}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md border transition-all cursor-pointer ${
                    filterPlatform === "instagram"
                      ? "bg-[#E4405F]/10 border-[#E4405F] text-[#E4405F]"
                      : "bg-secondary border-border text-foreground hover:border-[#E4405F]"
                  }`}
                >
                  <SocialIcon platform="instagram" className="w-4 h-4" />
                  <span>Instagram ({igPercent}%)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity Feed using WatermelonPostRow Component */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-card border border-border p-6 rounded-md space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-accent" />
                <h2 className="text-sm font-normal text-foreground">Recent Activity Feed</h2>
                {hasActiveFilter && (
                  <span className="text-xs bg-accent/10 border border-accent/30 text-accent font-normal px-2.5 py-0.5 rounded-md">
                    Filtered
                  </span>
                )}
              </div>

              <Link href="/posts" className="text-xs text-accent font-normal hover:underline flex items-center gap-1">
                <span>View All Posts</span> <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {filteredActivities.length === 0 ? (
                <div className="p-8 border border-dashed border-border rounded-md text-center space-y-2">
                  <p className="text-xs font-normal text-foreground">
                    {activities.length === 0 ? "No real post activity recorded yet." : "No activity found for selected filter criteria."}
                  </p>
                  <p className="text-xs text-muted-foreground font-normal">
                    {activities.length === 0
                      ? "Create and publish a post in the Post Editor to generate real-time Meta analytics."
                      : "Try clearing or selecting another platform or account above."}
                  </p>
                  {activities.length === 0 ? (
                    <Link
                      href="/editor"
                      className="mt-3 px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 text-xs font-normal rounded-xl inline-flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-900" />
                      <span>Create New Post</span>
                    </Link>
                  ) : (
                    hasActiveFilter && (
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="mt-2 text-xs font-normal text-accent hover:underline cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    )
                  )}
                </div>
              ) : (
                filteredActivities.map((act) => (
                  <WatermelonPostRow key={act.id} post={act} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
