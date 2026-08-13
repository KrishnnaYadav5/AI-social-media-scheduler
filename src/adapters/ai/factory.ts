import { AIProviderAdapter } from "./types";
import { GeminiAdapter } from "./gemini.adapter";
import { OpenAIAdapter } from "./openai.adapter";

export class AIFactory {
  static getAdapter(provider: string = "gemini"): AIProviderAdapter {
    switch (provider.toLowerCase()) {
      case "gemini":
        return new GeminiAdapter();
      case "openai":
        return new OpenAIAdapter();
      default:
        return new GeminiAdapter();
    }
  }
}
