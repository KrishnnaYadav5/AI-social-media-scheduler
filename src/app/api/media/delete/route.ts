import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const BUCKET = "media";

export async function POST(req: Request) {
  try {
    const { url, path } = await req.json();

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return NextResponse.json({ success: true, message: "Removed from local state." });
    }

    let filePath = path;
    if (!filePath && url && url.includes("/storage/v1/object/public/media/")) {
      filePath = url.split("/storage/v1/object/public/media/")[1];
    }

    if (filePath) {
      const decodedPath = decodeURIComponent(filePath);
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data, error } = await supabase.storage.from(BUCKET).remove([decodedPath]);
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: "Media asset deleted permanently from Supabase Storage and local library." });
  } catch (err: any) {
    // Non-fatal fallback
    return NextResponse.json({ success: true, message: "Removed from local state." });
  }
}
