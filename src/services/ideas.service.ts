import { db } from "@/lib/db";
import { ideas } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { postService } from "./post.service";
import { activityService } from "./activity.service";

export class IdeasService {
  async getIdeas(userId: string) {
    return db.select().from(ideas).where(eq(ideas.userId, userId)).orderBy(desc(ideas.createdAt));
  }

  async createIdea(data: {
    userId: string;
    title: string;
    description?: string;
    tags?: string[];
    images?: string[];
    status?: "idea" | "draft" | "scheduled" | "published";
  }) {
    const ideaId = `idea_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await db.insert(ideas).values({
      id: ideaId,
      userId: data.userId,
      title: data.title,
      description: data.description,
      tags: data.tags || [],
      images: data.images || [],
      status: data.status || "idea",
    });
    return ideaId;
  }

  async updateIdeaStatus(ideaId: string, status: "idea" | "draft" | "scheduled" | "published") {
    return db.update(ideas).set({ status, updatedAt: new Date() }).where(eq(ideas.id, ideaId));
  }

  async convertToDraft(ideaId: string, userId: string, targetPlatforms: string[] = ["facebook", "instagram"]) {
    const [idea] = await db.select().from(ideas).where(and(eq(ideas.id, ideaId), eq(ideas.userId, userId)));
    if (!idea) throw new Error("Idea not found");

    const content = `${idea.title}\n\n${idea.description || ""}`;
    const postId = await postService.createPost({
      userId,
      content,
      mediaUrls: idea.images,
      targetPlatforms,
      status: "draft",
    });

    await db.update(ideas).set({ status: "draft", convertedPostId: postId, updatedAt: new Date() }).where(eq(ideas.id, ideaId));
    await activityService.logEvent(userId, "convert_idea", `Converted idea "${idea.title}" into draft post`, { ideaId, postId });

    return postId;
  }

  async deleteIdea(ideaId: string) {
    try {
      return await db.delete(ideas).where(eq(ideas.id, ideaId));
    } catch (e) {
      console.warn("Database deletion skipped for demo client item", ideaId);
      return null;
    }
  }
}

export const ideasService = new IdeasService();
