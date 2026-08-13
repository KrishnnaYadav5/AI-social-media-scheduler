import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const BUCKET = "media";

/**
 * POST /api/upload
 * Accepts: multipart/form-data with a "file" field
 * Uploads to Supabase Storage "media" bucket (public)
 * Returns: { url: string, isPublic: true } — a publicly accessible URL Meta Graph API can fetch
 */
export async function POST(req: Request) {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const allowedTypes = [
      "image/jpeg", "image/png", "image/webp", "image/gif",
      "video/mp4", "video/quicktime", "video/webm",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Use JPEG, PNG, WebP, GIF, or MP4.` },
        { status: 400 }
      );
    }

    const maxSize = 50 * 1024 * 1024; // 50 MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 50 MB." },
        { status: 400 }
      );
    }

    // ── Upload to Supabase Storage ─────────────────────────────────────────────
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `uploads/${filename}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Supabase upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // ── Get the public URL ─────────────────────────────────────────────────────
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const publicUrl = data.publicUrl;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path,
      provider: "supabase",
      isPublic: true,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Upload failed." },
      { status: 500 }
    );
  }
}
