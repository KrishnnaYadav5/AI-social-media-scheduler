import { db } from "@/lib/db";
import { userAiSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { decryptSecret } from "@/lib/encryption";
import { AIFactory } from "@/adapters/ai/factory";
import { AIGenerateOptions } from "@/adapters/ai/types";

const DEFAULT_GEMINI_KEY = "";

export class AIService {
  async getUserApiKey(userId: string): Promise<string> {
    try {
      const [settings] = await db.select().from(userAiSettings).where(eq(userAiSettings.userId, userId));
      if (!settings || !settings.encryptedGeminiKey) {
        return "";
      }
      return decryptSecret(settings.encryptedGeminiKey);
    } catch (e) {
      return "";
    }
  }

  async generateContent(userId: string, options: Omit<AIGenerateOptions, "apiKey">) {
    const apiKey = await this.getUserApiKey(userId);
    const effectiveKey = apiKey || process.env.GEMINI_API_KEY || DEFAULT_GEMINI_KEY;

    const adapter = AIFactory.getAdapter("gemini");
    return adapter.generateText({
      ...options,
      apiKey: effectiveKey,
    });
  }

  async generateIdeas(userId: string, topic: string, count: number = 5) {
    const apiKey = await this.getUserApiKey(userId);
    const effectiveKey = apiKey || process.env.GEMINI_API_KEY || DEFAULT_GEMINI_KEY;

    const adapter = AIFactory.getAdapter("gemini");
    return adapter.generateIdeas(topic, count, effectiveKey);
  }
}

export const aiService = new AIService();
