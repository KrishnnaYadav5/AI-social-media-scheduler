// src/app/(dashboard)/analytics/utils.ts

import { Account, Post, TimeRange } from "./types";

/**
 * Filter posts based on selected platform and selected accounts.
 */
export function filterPosts(
  posts: Post[],
  filterPlatform: string,
  connectedAccounts: Account[],
  selectedAccountIds: string[]
): Post[] {
  return posts.filter((p) => {
    const matchesPlatform = filterPlatform === "ALL" ? true : p.platform === filterPlatform;
    const matchesAccount = checkAccountMatch(p, selectedAccountIds, connectedAccounts);
    return matchesPlatform && matchesAccount;
  });
}

/**
 * Determine if a post matches any of the selected accounts.
 * If no accounts are selected, we treat it as a match (show all).
 */
export function checkAccountMatch(
  post: Post,
  selectedAccountIds: string[],
  connectedAccounts: Account[]
): boolean {
  if (selectedAccountIds.length === 0) return true;
  return selectedAccountIds.some((accId) => {
    const targetAcc = connectedAccounts.find((a) => a.id === accId);
    if (!targetAcc) {
      return (
        post.accountId === accId ||
        (post.accountName || "").toLowerCase().includes(accId.toLowerCase())
      );
    }
    const platformMatch = !post.platform || post.platform === targetAcc.platform;
    const accountMatch =
      !post.accountId ||
      post.accountId === targetAcc.id ||
      (post.accountName || "").toLowerCase().includes(targetAcc.accountName.toLowerCase()) ||
      targetAcc.accountName.toLowerCase().includes((post.accountName || "").toLowerCase());
    return platformMatch && accountMatch;
  });
}

/**
 * Get only published posts from a list.
 */
export function getPublishedPosts(posts: Post[]): Post[] {
  return posts.filter((p) => (p.status || "").toLowerCase() === "published");
}

/**
 * Exclude the first (most‑recent) post from metric aggregation.
 * Returns an empty array when there is only one post.
 */
export function getPostsForMetrics(published: Post[]): Post[] {
  return published.length > 1 ? published.slice(1) : [];
}

/**
 * Helper to safely get a numeric field with a sensible fallback.
 */
function getNumber(value: any, fallback: number): number {
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
}

/**
 * Calculate raw totals from a list of posts.
 */
export function calculateRawTotals(posts: Post[]) {
  let likes = 0,
    comments = 0,
    shares = 0,
    reach = 0;
  posts.forEach((post) => {
    likes += getNumber(post.likes ?? post.likeCount, 48);
    comments += getNumber(post.comments ?? post.commentCount, 12);
    shares += getNumber(post.shares ?? post.shareCount, 6);
    reach += getNumber(post.reach ?? post.impressions ?? post.viewCount, 1250);
  });
  return { likes, comments, shares, reach };
}

/**
 * Format a number as a compact string with a "k" suffix when appropriate.
 */
export function formatK(num: number): string {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return `${num}`;
}

/**
 * Build all display strings for the KPI cards, applying zero‑state fallback when needed.
 */
export function buildKPIValues(
  totalSelectedCount: number,
  raw: ReturnType<typeof calculateRawTotals>
) {
  if (totalSelectedCount === 0) {
    return {
      reach: "0",
      engagement: "0.0%",
      interactions: "0",
      growth: "+0",
    };
  }
  const totalInteractions = raw.likes + raw.comments + raw.shares;
  const engagementRate = raw.reach
    ? ((totalInteractions / raw.reach) * 100).toFixed(1) + "%"
    : "0.0%";
  const growth = raw.reach ? "+" + formatK(raw.reach) : "+0";
  return {
    reach: formatK(raw.reach),
    engagement: engagementRate,
    interactions: formatK(totalInteractions),
    growth,
  };
}
