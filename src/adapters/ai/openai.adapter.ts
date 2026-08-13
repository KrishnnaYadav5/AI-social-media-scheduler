import { AIProviderAdapter, AIGenerateOptions } from "./types";

export class OpenAIAdapter implements AIProviderAdapter {
  providerName = "openai";

  async generateText(options: AIGenerateOptions): Promise<string> {
    throw new Error("OpenAI Provider is a future-ready stub. Currently Google Gemini is active.");
  }

  async generateIdeas(topic: string, count: number, apiKey: string): Promise<Array<{ title: string; description: string; tags: string[] }>> {
    throw new Error("OpenAI Provider is a future-ready stub.");
  }

  async testConnection(apiKey: string): Promise<boolean> {
    return false;
  }
}
