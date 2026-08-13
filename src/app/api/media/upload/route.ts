import { NextResponse } from "next/server";
import { StorageFactory } from "@/adapters/storage/factory";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

const DEMO_USER_ID = "usr_demo_123456";

export async function GET() {
  try {
    const userMedia = await db.select().from(media).where(eq(media.userId, DEMO_USER_ID)).orderBy(desc(media.createdAt));
    return NextResponse.json({ media: userMedia });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileName, mimeType, fileSize } = body;

    if (!fileName || !mimeType) {
      return NextResponse.json({ error: "fileName and mimeType are required" }, { status: 400 });
    }

    // Validate MIME types for images & videos
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/quicktime"];
    if (!allowedTypes.includes(mimeType)) {
      return NextResponse.json({ error: "Unsupported file type. Only JPEG, PNG, WEBP, GIF, and MP4/MOV videos are permitted." }, { status: 400 });
    }

    const storageAdapter = StorageFactory.getAdapter("r2");
    const presigned = await storageAdapter.generatePresignedUploadUrl(fileName, mimeType);

    // Save record to DB
    const mediaId = `med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const mediaType = mimeType.startsWith("video") ? "video" : "image";

    await db.insert(media).values({
      id: mediaId,
      userId: DEMO_USER_ID,
      fileName,
      fileKey: presigned.fileKey,
      fileUrl: presigned.publicUrl,
      mimeType,
      fileSize: fileSize || 1024 * 1024,
      mediaType,
    });

    return NextResponse.json({
      uploadUrl: presigned.uploadUrl,
      fileKey: presigned.fileKey,
      fileUrl: presigned.publicUrl,
      mediaId,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
