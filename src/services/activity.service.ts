import { db } from "@/lib/db";
import { activityLogs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export class ActivityService {
  async logEvent(
    userId: string,
    eventType: string,
    description: string,
    metadata: Record<string, any> = {}
  ) {
    try {
      const id = `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await db.insert(activityLogs).values({
        id,
        userId,
        eventType,
        description,
        metadata,
      });
    } catch (err) {
      console.error("Failed to insert activity log:", err);
    }
  }

  async getUserLogs(userId: string, limit: number = 50) {
    return db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }
}

export const activityService = new ActivityService();
