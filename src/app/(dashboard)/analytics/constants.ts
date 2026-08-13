// src/app/(dashboard)/analytics/constants.ts

import { ChartMetric, ChartPoint, FormatROIItem, TimeRange } from "./types";
import { Video, Layers, Image as ImageIcon, MessageSquareText } from "lucide-react";

export const metricDatasets: Record<ChartMetric, Record<TimeRange, ChartPoint[]>> = {
  impressions: {
    "7d": [
      { label: "Mon", count: 1840 },
      { label: "Tue", count: 2150 },
      { label: "Wed", count: 2900 },
      { label: "Thu", count: 3400 },
      { label: "Fri", count: 4100 },
      { label: "Sat", count: 4800 },
      { label: "Sun", count: 5200 },
    ],
    "30d": [
      { label: "Week 1", count: 12400 },
      { label: "Week 2", count: 18600 },
      { label: "Week 3", count: 24500 },
      { label: "Week 4", count: 31200 },
    ],
    "90d": [
      { label: "Month 1", count: 45000 },
      { label: "Month 2", count: 68000 },
      { label: "Month 3", count: 92000 },
    ],
    ytd: [
      { label: "Q1", count: 140000 },
      { label: "Q2", count: 210000 },
      { label: "Q3", count: 285000 },
      { label: "Q4", count: 360000 },
    ],
  },
  engagement: {
    "7d": [
      { label: "Mon", count: 140 },
      { label: "Tue", count: 180 },
      { label: "Wed", count: 260 },
      { label: "Thu", count: 310 },
      { label: "Fri", count: 420 },
      { label: "Sat", count: 490 },
      { label: "Sun", count: 580 },
    ],
    "30d": [
      { label: "Week 1", count: 1250 },
      { label: "Week 2", count: 1890 },
      { label: "Week 3", count: 2450 },
      { label: "Week 4", count: 3120 },
    ],
    "90d": [
      { label: "Month 1", count: 4500 },
      { label: "Month 2", count: 6800 },
      { label: "Month 3", count: 9200 },
    ],
    ytd: [
      { label: "Q1", count: 14000 },
      { label: "Q2", count: 21000 },
      { label: "Q3", count: 28500 },
      { label: "Q4", count: 36000 },
    ],
  },
  followers: {
    "7d": [
      { label: "Mon", count: 42 },
      { label: "Tue", count: 58 },
      { label: "Wed", count: 85 },
      { label: "Thu", count: 110 },
      { label: "Fri", count: 145 },
      { label: "Sat", count: 180 },
      { label: "Sun", count: 220 },
    ],
    "30d": [
      { label: "Week 1", count: 340 },
      { label: "Week 2", count: 580 },
      { label: "Week 3", count: 890 },
      { label: "Week 4", count: 1420 },
    ],
    "90d": [
      { label: "Month 1", count: 1800 },
      { label: "Month 2", count: 3400 },
      { label: "Month 3", count: 5200 },
    ],
    ytd: [
      { label: "Q1", count: 6400 },
      { label: "Q2", count: 11200 },
      { label: "Q3", count: 16800 },
      { label: "Q4", count: 22400 },
    ],
  },
};

export const formatROIItems: FormatROIItem[] = [
  {
    id: "roi_1",
    title: "Reels & Video Clips",
    subtitle: "Highest Engagement Rate",
    rate: "6.2% Avg Rate",
    metric: "42.8k Views",
    icon: Video,
    iconBg: "bg-red-500/10 text-red-500",
    iconColor: "text-red-500",
    rateColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "roi_2",
    title: "Carousel Multi-Image Posts",
    subtitle: "Highest Save & Bookmark Rate",
    rate: "5.8% Avg Rate",
    metric: "1.4k Saves",
    icon: Layers,
    iconBg: "bg-accent/10 text-accent",
    iconColor: "text-accent",
    rateColor: "text-accent",
  },
  {
    id: "roi_3",
    title: "Single Image Posts",
    subtitle: "Highest Direct Feed Reach",
    rate: "4.1% Avg Rate",
    metric: "18.4k Reach",
    icon: ImageIcon,
    iconBg: "bg-amber-500/10 text-amber-500",
    iconColor: "text-amber-500",
    rateColor: "text-amber-500",
  },
  {
    id: "roi_4",
    title: "Text & Link Announcements",
    subtitle: "Highest Referral Clicks",
    rate: "2.9% Avg Rate",
    metric: "8.9k Clicks",
    icon: MessageSquareText,
    iconBg: "bg-indigo-500/10 text-indigo-500",
    iconColor: "text-indigo-500",
    rateColor: "text-indigo-500",
  },
];
