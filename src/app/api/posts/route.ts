import { NextResponse } from "next/server";
import { postsService, activityLogsService } from "@/lib/supabase-service";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { DEMO_USER_ID } from "@/lib/supabase";

async function getUserId(): Promise<string> {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? DEMO_USER_ID;
  } catch {
    return DEMO_USER_ID;
  }
}

export async function GET(req: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    let posts = await postsService.getAll(status, userId);

    const host = req.headers.get("host");
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || (host ? `${protocol}://${host}` : "");
    if (appUrl.includes("localhost") || appUrl.includes("127.0.0.1")) {
      const overduePosts = posts.filter(p => p.status === "scheduled" && p.scheduled_at && new Date(p.scheduled_at).getTime() <= Date.now());
      
      if (overduePosts.length > 0) {
        console.log(`[Local Catch-up] Found ${overduePosts.length} overdue scheduled posts. Executing...`);
        const { postService } = require("@/services/post.service");
        
        for (const p of overduePosts) {
          try {
            await postService.executePublish(p.id);
          } catch (e) {
            console.error(`[Local Catch-up] Failed to publish ${p.id}:`, e);
          }
        }
        
        // Re-fetch to return the updated statuses to the frontend
        posts = await postsService.getAll(status, userId);
      }
    }

    return NextResponse.json({ posts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    const body = await req.json();
    const { content, media_urls, mediaUrls, targetPlatforms, target_platforms, status, scheduledAt, scheduled_at } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const platforms = targetPlatforms || target_platforms || ["facebook", "instagram"];
    const mediaList = media_urls || mediaUrls || [];
    const schedDate = scheduledAt || scheduled_at || undefined;

    const post = await postsService.create({
      content,
      media_urls: mediaList,
      target_platforms: platforms,
      status: status || "draft",
      scheduled_at: schedDate,
    }, userId);

    await activityLogsService.log(
      status === "published" ? "publish" : status === "scheduled" ? "schedule" : "draft_saved",
      `Post ${status || "draft"}: ${content.substring(0, 60)}`,
      { postId: post.id, platforms },
      userId
    );

    // QStash Automated Queue Dispatch
    if (status === "scheduled" && schedDate) {
      const host = req.headers.get("host");
      const protocol = req.headers.get("x-forwarded-proto") || "https";
      const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || (host ? `${protocol}://${host}` : "");
      const qstashToken = process.env.QSTASH_TOKEN;

      if (qstashToken && !qstashToken.includes("placeholder")) {
        try {
          const { Client } = require("@upstash/qstash");
          const qstash = new Client({ token: qstashToken });
          const delayTimestamp = Math.floor(new Date(schedDate).getTime() / 1000);

          // QStash rejects loopback URLs (localhost). If testing locally, simulate it with setTimeout.
          if (appUrl.includes("localhost") || appUrl.includes("127.0.0.1")) {
            console.log(`[Local Dev] Simulating QStash webhook for ${appUrl} in ${Math.max(0, delayTimestamp * 1000 - Date.now())}ms`);
            setTimeout(async () => {
              try {
                console.log(`[Local Dev] Executing simulated QStash webhook for Post ID: ${post.id}`);
                const { postService } = require("@/services/post.service");
                await postService.executePublish(post.id);
              } catch (simErr) {
                console.error("[Local Dev] Simulated webhook failed:", simErr);
              }
            }, Math.max(0, delayTimestamp * 1000 - Date.now()));
            
          } else {
            const qstashRes = await qstash.publishJSON({
              url: `${appUrl}/api/webhooks/qstash`,
              body: { postId: post.id, action: "execute_publish" },
              notBefore: delayTimestamp,
            });

            if (qstashRes?.messageId) {
              await postsService.update(post.id, { qstash_message_id: qstashRes.messageId } as any);
            }
          }
        } catch (qstashErr) {
          console.error("Failed to enqueue QStash message:", qstashErr);
          // Do not fail the request; the post is still saved as 'scheduled' in the DB
        }
      } else {
        console.warn("QStash token is missing or placeholder. Post saved as scheduled, but no webhook queued.");
      }
    }

    return NextResponse.json({ success: true, postId: post.id, post });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
