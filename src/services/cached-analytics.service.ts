import { renderCache } from "@/lib/cache/render-cache";

export interface AnalyticsPayload {
  monthlyData: Array<{ label: string; count: number }>;
  platformShare: Array<{ name: string; platformKey: "facebook" | "instagram"; count: number; percentage: number; color: string }>;
  kpis: {
    successRate: string;
    mostActivePlatform: string;
    scheduledCount: number;
    avgLatency: string;
  };
}

export async function getCachedAnalyticsData(locale: string = "en", theme: string = "dark"): Promise<{
  payload: AnalyticsPayload;
  cached: boolean;
  renderTimeMs: number;
  cacheKey: string;
}> {
  const cacheKey = renderCache.generateKey("analytics-dashboard", { locale, theme });

  const res = await renderCache.getCachedFragment<AnalyticsPayload>(
    cacheKey,
    async () => {
      // Simulate heavy db aggregation query
      await new Promise((res) => setTimeout(res, 85));

      return {
        monthlyData: [
          { label: "Jan", count: 6 },
          { label: "Feb", count: 8 },
          { label: "Mar", count: 12 },
          { label: "Apr", count: 10 },
          { label: "May", count: 14 },
          { label: "Jun", count: 18 },
          { label: "Jul", count: 22 },
        ],
        platformShare: [
          { name: "Facebook Page", platformKey: "facebook", count: 30, percentage: 62.5, color: "#1877F2" },
          { name: "Instagram Feed", platformKey: "instagram", count: 18, percentage: 37.5, color: "#FF3366" },
        ],
        kpis: {
          successRate: "94.4%",
          mostActivePlatform: "Facebook",
          scheduledCount: 8,
          avgLatency: "< 1.2s",
        },
      };
    },
    { ttlSeconds: 120, tags: ["analytics", "dashboard"] }
  );

  return {
    payload: res.data,
    cached: res.cached,
    renderTimeMs: res.renderTimeMs,
    cacheKey: res.cacheKey,
  };
}
