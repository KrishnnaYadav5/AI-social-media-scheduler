import { db } from "@/lib/db";
import { posts, platformPostVariants, socialAccounts, schedules } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { SocialPlatformFactory } from "@/adapters/social/factory";
import { schedulerService } from "./scheduler.service";
import { activityService } from "./activity.service";

export class PostService {
  async createPost(data: {
    userId: string;
    content: string;
    mediaUrls?: string[];
    targetPlatforms: string[];
    status: "draft" | "scheduled" | "published";
    scheduledAt?: Date;
    variants?: Record<string, { content: string; mediaUrls?: string[] }>;
  }) {
    const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await db.insert(posts).values({
      id: postId,
      userId: data.userId,
      content: data.content,
      mediaUrls: data.mediaUrls || [],
      targetPlatforms: data.targetPlatforms,
      status: data.status,
      scheduledAt: data.scheduledAt,
      publishedAt: data.status === "published" ? new Date() : undefined,
    });

    if (data.variants) {
      for (const [platform, variant] of Object.entries(data.variants)) {
        await db.insert(platformPostVariants).values({
          id: `var_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          postId,
          platform,
          content: variant.content,
          mediaUrls: variant.mediaUrls || [],
        });
      }
    }

    if (data.status === "scheduled" && data.scheduledAt) {
      const { qstashMessageId } = await schedulerService.schedulePostPublish(postId, data.scheduledAt);
      await db.insert(schedules).values({
        id: `sched_${Date.now()}`,
        postId,
        qstashMessageId,
        scheduledAt: data.scheduledAt,
        status: "pending",
      });
      await activityService.logEvent(data.userId, "schedule", `Scheduled post for ${data.scheduledAt.toISOString()}`, { postId, platforms: data.targetPlatforms });
    } else if (data.status === "draft") {
      await activityService.logEvent(data.userId, "draft_saved", "Saved post draft", { postId });
    }

    return postId;
  }

  async executePublish(postId: string) {
    const { supabase } = require("@/lib/supabase");
    
    const { data: postsData } = await supabase.from("posts").select("*").eq("id", postId);
    const post = postsData?.[0];
    if (!post) throw new Error("Post not found");

    const { data: userAccounts } = await supabase.from("social_accounts").select("*").eq("user_id", post.user_id);

    let overallSuccess = true;
    let publishedUrl = "";
    let failureReasons: string[] = [];

    for (const platform of post.target_platforms || []) {
      const account = (userAccounts || []).find((acc: any) => acc.platform.toLowerCase() === platform.toLowerCase());
      const adapter = SocialPlatformFactory.getAdapter(platform);

      const { data: variants } = await supabase
        .from("platform_post_variants")
        .select("*")
        .eq("post_id", postId)
        .eq("platform", platform);
      
      const variant = variants?.[0];

      const contentToPublish = variant ? variant.content : post.content;
      const mediaToPublish = variant ? variant.media_urls : post.media_urls;

      const result = await adapter.publishPost({
        content: contentToPublish,
        mediaUrls: mediaToPublish,
        accessToken: account?.access_token || "",
        platformAccountId: account?.platform_user_id || "",
      });

      if (result.success) {
        if (!publishedUrl && result.publishedUrl) publishedUrl = result.publishedUrl;
      } else {
        overallSuccess = false;
        failureReasons.push(`${platform}: ${result.error || "Unknown error"}`);
      }
    }

    if (overallSuccess) {
      await supabase
        .from("posts")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
          published_url: publishedUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", postId);

      await activityService.logEvent(post.user_id, "publish", "Successfully published post to all target platforms", { postId, platforms: post.target_platforms });
    } else {
      await supabase
        .from("posts")
        .update({
          status: "failed",
          failure_reason: failureReasons.join(" | "),
          retry_count: (post.retry_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", postId);

      await activityService.logEvent(post.user_id, "error", `Failed to publish post: ${failureReasons.join(" | ")}`, { postId });
    }

    return overallSuccess;
  }

  async getUserPosts(userId: string, status?: string) {
    if (status) {
      return db
        .select()
        .from(posts)
        .where(and(eq(posts.userId, userId), eq(posts.status, status)))
        .orderBy(desc(posts.createdAt));
    }
    return db.select().from(posts).where(eq(posts.userId, userId)).orderBy(desc(posts.createdAt));
  }

  async archivePost(postId: string) {
    return db.update(posts).set({ isArchived: true, updatedAt: new Date() }).where(eq(posts.id, postId));
  }

  async deletePost(postId: string) {
    return db.delete(posts).where(eq(posts.id, postId));
  }
}

export const postService = new PostService();
