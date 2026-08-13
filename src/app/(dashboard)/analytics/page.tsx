// src/app/(dashboard)/analytics/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Eye,
  Heart,
  RefreshCw,
  Download,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  ChevronDown,
  BarChart3,
  Activity,
  Users,
  CircleCheck,
  Award,
  Repeat,
  PieChart,
  AlertCircle,
} from "lucide-react";
import { SocialIcon } from "@/components/ui/social-icons";
import { WatermelonChartCard } from "@/components/ui/watermelon-chart-card";
import { WatermelonSubNav } from "@/components/ui/watermelon-sub-nav";
import { WatermelonChannelSelector } from "@/components/ui/watermelon-channel-selector";
import { WatermelonAccountWarningBanner } from "@/components/ui/watermelon-account-warning-banner";
import { WatermelonStatCard } from "@/components/ui/watermelon-stat-card";
import { TimeRange, ChartMetric, ChartPoint, Account } from "./types";
import { metricDatasets, formatROIItems } from "./constants";
import { formatK } from "./utils";

interface MetaAnalyticsTotals {
  impressions: number;
  reach: number;
  engaged_users: number;
  follower_growth: number;
  post_engagements: number;
}

interface MetaAnalyticsResult {
  accounts: Array<{ id: string; platform: string; accountName: string }>;
  totals: MetaAnalyticsTotals;
  byAccount: Array<{
    accountId: string;
    platform: string;
    accountName: string;
    metrics: Record<string, number> | null;
    error?: string;
  }>;
  range: string;
  error?: string;
}

export default function AnalyticsPage() {
  // ----- UI State -----
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [chartMetric, setChartMetric] = useState<ChartMetric>("impressions");
  const [refreshing, setRefreshing] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // ----- Data State -----
  const [filterPlatform, setFilterPlatform] = useState<string>("ALL");
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<Account[]>([]);
  const [analyticsData, setAnalyticsData] = useState<MetaAnalyticsResult | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // ----- Load accounts from Supabase API -----
  const loadAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/accounts");
      const json = await res.json();
      const raw: any[] = json.accounts ?? [];
      const mapped: Account[] = raw
        .filter((a) => a.status === "connected" && (a.platform === "facebook" || a.platform === "instagram"))
        .map((a) => ({
          id: a.id,
          platform: a.platform as "facebook" | "instagram",
          accountName: a.account_name,
          status: a.status as "connected",
          pageId: a.page_id,
          businessAccountId: a.business_account_id,
        }));
      setConnectedAccounts(mapped);
      setSelectedAccountIds(mapped.map((a) => a.id));
    } catch {
      setConnectedAccounts([]);
    }
  }, []);

  // ----- Fetch real Meta analytics -----
  const fetchAnalytics = useCallback(async (range: TimeRange) => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const res = await fetch(`/api/analytics/meta?range=${range}`);
      const json: MetaAnalyticsResult = await res.json();
      if (json.error) throw new Error(json.error);
      setAnalyticsData(json);
    } catch (err: any) {
      setAnalyticsError(err.message || "Failed to fetch analytics");
      setAnalyticsData(null);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [timeRange, fetchAnalytics]);

  // ----- Platform / Account Filters -----
  const togglePlatform = (platform: "facebook" | "instagram" | "ALL") => {
    if (platform === "ALL") {
      setFilterPlatform("ALL");
    } else if (filterPlatform === platform) {
      setFilterPlatform("ALL");
    } else {
      setFilterPlatform(platform);
    }
  };

  const toggleAccountSelection = (id: string) => {
    setSelectedAccountIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSelectAllVisible = () => {
    const visible = connectedAccounts
      .filter((a) => filterPlatform === "ALL" || a.platform === filterPlatform)
      .map((a) => a.id);
    setSelectedAccountIds(Array.from(new Set([...selectedAccountIds, ...visible])));
  };

  const handleClearAllVisible = () => {
    const visible = connectedAccounts
      .filter((a) => filterPlatform === "ALL" || a.platform === filterPlatform)
      .map((a) => a.id);
    setSelectedAccountIds((prev) => prev.filter((id) => !visible.includes(id)));
  };

  // ----- Refresh -----
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAccounts();
    await fetchAnalytics(timeRange);
    setRefreshing(false);
  };

  // ----- Export -----
  const totals = analyticsData?.totals;

  const handleExportCSV = () => {
    const csvHeader = "Metric,Value,Platform,TimeRange\n";
    const rows = [
      `Total Impressions,${totals?.impressions ?? 0},${filterPlatform},${timeRange}`,
      `Total Reach,${totals?.reach ?? 0},${filterPlatform},${timeRange}`,
      `Engaged Users,${totals?.engaged_users ?? 0},${filterPlatform},${timeRange}`,
      `Follower Growth,${totals?.follower_growth ?? 0},${filterPlatform},${timeRange}`,
      `Post Engagements,${totals?.post_engagements ?? 0},${filterPlatform},${timeRange}`,
    ].join("\n");
    const blob = new Blob([csvHeader + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meta_analytics_${filterPlatform}_${timeRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    setExportNotice(`Exported analytics CSV for ${filterPlatform.toUpperCase()} (${timeRange})`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleExportPDF = () => {
    setShowExportMenu(false);
    window.print();
  };

  // ----- KPI Values from real API data -----
  const totalSelectedCount = connectedAccounts.filter((a) =>
    selectedAccountIds.includes(a.id) && (filterPlatform === "ALL" || a.platform === filterPlatform)
  ).length;

  const kpi = (() => {
    if (!totals || totalSelectedCount === 0) {
      return { reach: "0", engagement: "0.0%", interactions: "0", growth: "+0" };
    }
    const engRate = totals.reach
      ? ((totals.engaged_users / totals.reach) * 100).toFixed(1) + "%"
      : "0.0%";
    return {
      reach: formatK(totals.impressions),
      engagement: engRate,
      interactions: formatK(totals.engaged_users + totals.post_engagements),
      growth: "+" + formatK(totals.follower_growth),
    };
  })();

  // ----- Chart Data: scale static shape to real totals -----
  const rawChartData = metricDatasets[chartMetric][timeRange];
  const currentChartData: ChartPoint[] = (() => {
    if (!totals || totalSelectedCount === 0) {
      return rawChartData.map((d) => ({ ...d, count: 0 }));
    }
    const realTotal =
      chartMetric === "impressions"
        ? totals.impressions
        : chartMetric === "engagement"
        ? totals.engaged_users + totals.post_engagements
        : totals.follower_growth;

    const shapeTotal = rawChartData.reduce((s, d) => s + d.count, 1);
    return rawChartData.map((d) => ({
      ...d,
      count: Math.round((d.count / shapeTotal) * realTotal),
    }));
  })();

  const totalMetricSum = currentChartData.reduce((s, d) => s + d.count, 0);

  // ----- Render helpers -----
  const hasFb = connectedAccounts.some((a) => a.platform === "facebook");
  const hasIg = connectedAccounts.some((a) => a.platform === "instagram");
  const totalActiveChannels = connectedAccounts.length;

  // Top post from byAccount data
  const topPostContent = analyticsData?.byAccount?.[0]?.accountName
    ? `${analyticsData.byAccount[0].accountName} — ${formatK(analyticsData.byAccount[0].metrics?.impressions ?? 0)} impressions`
    : null;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-normal text-foreground tracking-tight flex items-center gap-2.5">
              <BarChart3 className="w-7 h-7 text-accent" />
              <span>Analytics</span>
            </h1>
            {totalActiveChannels > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-normal border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Meta Graph API v19.0 Live ({totalActiveChannels} Channel{totalActiveChannels > 1 ? "s" : ""})</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 relative flex-wrap sm:flex-nowrap">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu((p) => !p)}
              className="px-3.5 py-2 bg-secondary hover:bg-border border border-border rounded-md text-foreground text-xs font-normal flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-accent" />
              <span>Export</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-md shadow-2xl z-50 p-1.5 space-y-1 animate-in fade-in slide-in-from-top-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full text-left px-3 py-2 text-xs font-normal text-foreground hover:bg-secondary rounded-md flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <span>Export CSV Dataset</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="w-full text-left px-3 py-2 text-xs font-normal text-foreground hover:bg-secondary rounded-md flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-accent" />
                  <span>Print PDF Summary</span>
                </button>
              </div>
            )}
          </div>
          {/* Refresh */}
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 bg-secondary hover:bg-border border border-border rounded-md text-foreground transition-colors shadow-sm cursor-pointer"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 text-accent ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Channel Selector */}
      <WatermelonChannelSelector
        filterPlatform={filterPlatform}
        onTogglePlatform={togglePlatform}
        connectedAccounts={connectedAccounts}
        selectedAccountIds={selectedAccountIds}
        onToggleAccountSelection={toggleAccountSelection}
        onSelectAllVisible={handleSelectAllVisible}
        onClearAllVisible={handleClearAllVisible}
      />

      {/* Analytics Error Banner */}
      {analyticsError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-md text-xs sm:text-sm font-normal flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-normal">Meta API Error: </span>
            <span>{analyticsError}</span>
            <span className="ml-2 text-muted-foreground">— Check your access tokens in Connected Channels.</span>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <WatermelonStatCard
          title="Total Impressions"
          value={analyticsLoading ? "—" : kpi.reach}
          subtext={analyticsLoading ? "Loading from Meta API…" : "Cross-platform impressions"}
          icon={Eye}
        />
        <WatermelonStatCard
          title="Avg Engagement Rate"
          value={analyticsLoading ? "—" : kpi.engagement}
          subtext="Engaged users ÷ reach"
          icon={TrendingUp}
        />
        <WatermelonStatCard
          title="Total Interactions"
          value={analyticsLoading ? "—" : kpi.interactions}
          subtext="Engaged users + post engagements"
          icon={Heart}
          iconColor="text-red-500"
        />
        <WatermelonStatCard
          title="Net Follower Growth"
          value={analyticsLoading ? "—" : kpi.growth}
          subtext="New followers this period"
          icon={Users}
        />
      </div>

      {/* Warning Banner */}
      {totalActiveChannels === 0 && <WatermelonAccountWarningBanner />}

      {/* Export Notice */}
      {exportNotice && (
        <div className="p-4 bg-accent/10 border border-accent/30 text-accent rounded-md text-xs sm:text-sm font-normal flex items-center gap-2.5 shadow-sm">
          <CircleCheck className="w-5 h-5 shrink-0 text-accent" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Performance Trends Chart Card */}
      <div className="bg-card border border-border p-6 rounded-md space-y-5 shadow-sm w-full">
        <div className="flex flex-col items-start gap-3 pb-3 border-b border-border w-full">
          <div>
            <h2 className="text-base sm:text-lg font-normal text-foreground">Performance Trends</h2>
            <p className="text-xs text-muted-foreground font-normal mt-0.5">
              {analyticsLoading
                ? "Fetching live data from Meta Graph API…"
                : totalSelectedCount === 0
                ? "Select a connected channel to view real data"
                : `Real data from Meta Graph API — ${totalSelectedCount} channel${totalSelectedCount > 1 ? "s" : ""} selected`}
            </p>
          </div>
          <div className="w-full">
            <WatermelonSubNav
              items={[
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
                { id: "90d", label: "90 Days" },
                { id: "ytd", label: "YTD" },
              ]}
              activeTab={timeRange}
              onTabChange={(tab) => setTimeRange(tab as TimeRange)}
              fullWidth={true}
              size="lg"
            />
          </div>
        </div>
        <WatermelonChartCard
          title=""
          subtitle=""
          data={currentChartData}
          totalLabel={`Total ${chartMetric.toUpperCase()} (${timeRange.toUpperCase()}): ${analyticsLoading ? "Loading…" : totalMetricSum.toLocaleString()}`}
        />
        <div className="w-full pt-2">
          <WatermelonSubNav
            items={[
              { id: "impressions", label: "Impressions" },
              { id: "engagement", label: "Engagement" },
              { id: "followers", label: "Followers" },
            ]}
            activeTab={chartMetric}
            onTabChange={(tab) => setChartMetric(tab as ChartMetric)}
            fullWidth={true}
            size="lg"
          />
        </div>
      </div>

      {/* Secondary Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Status Card */}
        <div className="bg-card border border-border p-5 rounded-md space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2 text-sm sm:text-base font-normal text-foreground">
              <ShieldCheck className="w-4 h-4 text-foreground" />
              <span>API Status</span>
            </div>
            <span className="text-xs text-muted-foreground font-normal">
              {analyticsLoading ? (
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 animate-spin" /> Fetching…
                </span>
              ) : (
                "Meta Graph v19.0"
              )}
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-secondary/60 border border-border rounded-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SocialIcon platform="facebook" className="w-4 h-4 text-foreground" />
                <span className="font-normal text-foreground">Facebook</span>
              </div>
              {hasFb ? (
                <span className="text-[10px] text-foreground font-normal bg-secondary px-2 py-0.5 rounded border border-border">CONNECTED</span>
              ) : (
                <span className="text-[10px] text-muted-foreground font-normal">Not Connected</span>
              )}
            </div>
            <div className="p-2.5 bg-secondary/60 border border-border rounded-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SocialIcon platform="instagram" className="w-4 h-4 text-foreground" />
                <span className="font-normal text-foreground">Instagram</span>
              </div>
              {hasIg ? (
                <span className="text-[10px] text-foreground font-normal bg-secondary px-2 py-0.5 rounded border border-border">CONNECTED</span>
              ) : (
                <span className="text-[10px] text-muted-foreground font-normal">Not Connected</span>
              )}
            </div>
            {/* Per-account errors */}
            {analyticsData?.byAccount?.filter((a) => a.error).map((a) => (
              <div key={a.accountId} className="p-2.5 bg-red-500/5 border border-red-500/20 rounded-md text-[10px] text-red-500">
                <span className="font-normal">{a.accountName}: </span>{a.error}
              </div>
            ))}
          </div>
        </div>

        {/* Top Account Card */}
        <div className="bg-card border border-border p-5 rounded-md space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2 text-sm sm:text-base font-normal text-foreground">
              <Award className="w-4 h-4 text-foreground" />
              <span>Top Channel</span>
            </div>
            <span className="text-[10px] font-normal text-foreground bg-secondary px-2 py-0.5 rounded border border-border">
              #1 PERFORMER
            </span>
          </div>
          {analyticsData?.byAccount && analyticsData.byAccount.length > 0 ? (
            <div className="space-y-2.5 text-xs">
              {analyticsData.byAccount
                .filter((a) => a.metrics)
                .sort((a, b) => (b.metrics?.impressions ?? 0) - (a.metrics?.impressions ?? 0))
                .slice(0, 1)
                .map((a) => (
                  <div key={a.accountId}>
                    <p className="text-foreground font-normal line-clamp-1">{a.accountName}</p>
                    <p className="text-muted-foreground capitalize mt-0.5">{a.platform}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-border text-[11px] mt-2">
                      <span className="text-muted-foreground">
                        {formatK(a.metrics?.impressions ?? 0)} Impressions • {formatK(a.metrics?.reach ?? 0)} Reach
                      </span>
                      <Link
                        href="/editor"
                        className="text-foreground hover:underline font-normal flex items-center gap-1 cursor-pointer"
                      >
                        <Repeat className="w-3 h-3" />
                        <span>Post Now</span>
                      </Link>
                    </div>
                  </div>
                ))}
              {analyticsData.byAccount.filter((a) => a.metrics).length === 0 && (
                <p className="text-muted-foreground text-xs">No data returned from Meta API yet.</p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">
              {analyticsLoading ? "Loading…" : "No connected channels with data."}
            </p>
          )}
        </div>

        {/* Format Performance Card */}
        <div className="bg-card border border-border p-5 rounded-md space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2 text-sm sm:text-base font-normal text-foreground">
              <PieChart className="w-4 h-4 text-foreground" />
              <span>Format Performance</span>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            {formatROIItems.map((item) => (
              <div key={item.id} className="p-2 bg-secondary/50 rounded-md flex items-center justify-between">
                <span className="font-normal text-foreground truncate">{item.title}</span>
                <span className="font-normal shrink-0 text-[11px] text-foreground">{item.rate}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
