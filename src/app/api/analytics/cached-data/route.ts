import { NextRequest, NextResponse } from "next/server";
import { getCachedAnalyticsData } from "@/services/cached-analytics.service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") || "en";
  const theme = searchParams.get("theme") || "dark";

  const result = await getCachedAnalyticsData(locale, theme);
  return NextResponse.json(result);
}
