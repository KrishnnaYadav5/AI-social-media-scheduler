// src/app/(dashboard)/analytics/types.ts

export type TimeRange = "7d" | "30d" | "90d" | "ytd";
export type ChartMetric = "impressions" | "engagement" | "followers";
export type DemoTab = "countries" | "demographics";

export interface ChartPoint {
  label: string;
  count: number;
}

export interface FormatROIItem {
  id: string;
  title: string;
  subtitle: string;
  rate: string;
  metric: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  rateColor: string;
}

export interface Account {
  id: string;
  platform: "facebook" | "instagram"; // restrict platform
  accountName: string;
  status: "connected" | "disconnected"; // restrict status
  pageId?: string;
  businessAccountId?: string;
}

export interface Post {
  status?: string;
  platform?: string;
  accountId?: string;
  accountName?: string;
  likes?: number;
  likeCount?: number;
  comments?: number;
  commentCount?: number;
  shares?: number;
  shareCount?: number;
  reach?: number;
  impressions?: number;
  viewCount?: number;
  // Additional fields used in UI
  publishedAt?: string;
  content?: string;
  prompt?: string;
}
