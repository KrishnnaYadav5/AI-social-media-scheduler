import { NextRequest, NextResponse } from "next/server";
import { renderCache } from "@/lib/cache/render-cache";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tag, key, purgeAll } = body;

    if (purgeAll) {
      renderCache.purgeAll();
      return NextResponse.json({ success: true, message: "Flushed entire render cache payload." });
    }

    if (tag) {
      const evictedCount = renderCache.invalidateTag(tag);
      return NextResponse.json({ success: true, tag, evictedEntries: evictedCount });
    }

    if (key) {
      const success = renderCache.invalidateKey(key);
      return NextResponse.json({ success, key });
    }

    return NextResponse.json({ error: "Specify 'tag', 'key', or 'purgeAll: true'" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 500 });
  }
}

export async function GET() {
  const stats = renderCache.getStats();
  return NextResponse.json({ success: true, stats });
}
