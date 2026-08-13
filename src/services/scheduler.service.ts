import { Client } from "@upstash/qstash";

export class SchedulerService {
  private client: Client | null = null;
  private appUrl: string;
  private region: string;

  constructor() {
    const token = process.env.QSTASH_TOKEN;
    const baseUrl = process.env.QSTASH_URL;
    this.appUrl = process.env.APP_URL || "http://localhost:3000";
    this.region = process.env.QSTASH_REGION || "US_EAST_1";

    if (token && !token.includes("placeholder")) {
      this.client = new Client({
        token,
        baseUrl: baseUrl && baseUrl.startsWith("http") ? baseUrl : undefined,
      });
    }
  }

  async schedulePostPublish(postId: string, scheduledAt: Date): Promise<{ qstashMessageId: string }> {
    const destinationUrl = `${this.appUrl}/api/webhooks/qstash`;
    const delaySeconds = Math.max(0, Math.floor((scheduledAt.getTime() - Date.now()) / 1000));

    if (!this.client) {
      console.log(`[QStash Scheduling Mock] Region: ${this.region} | Post ID ${postId} scheduled for ${scheduledAt.toISOString()} (delay: ${delaySeconds}s)`);
      return { qstashMessageId: `mock_qstash_${Date.now()}` };
    }

    const res = await this.client.publishJSON({
      url: destinationUrl,
      body: { postId, action: "execute_publish" },
      delay: delaySeconds,
    });

    return { qstashMessageId: res.messageId };
  }

  async cancelScheduledPublish(qstashMessageId: string): Promise<boolean> {
    if (!this.client || qstashMessageId.startsWith("mock_")) {
      console.log(`[QStash Scheduling Mock] Cancelled message ${qstashMessageId}`);
      return true;
    }
    try {
      await this.client.messages.delete(qstashMessageId);
      return true;
    } catch (err) {
      console.error("Failed to cancel QStash message:", err);
      return false;
    }
  }
}

export const schedulerService = new SchedulerService();
