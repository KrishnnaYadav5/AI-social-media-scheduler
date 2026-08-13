export type AIAction = 
  | "generate_post"
  | "generate_caption"
  | "rewrite"
  | "expand"
  | "shorten"
  | "improve_grammar"
  | "refresh_style"
  | "generate_hashtags"
  | "generate_cta"
  | "generate_titles"
  | "generate_ideas"
  | "generate_copy";

export interface AIGenerateOptions {
  action: AIAction;
  prompt: string;
  platform?: string;
  tone?: string;
  apiKey: string;
}

export interface AIProviderAdapter {
  providerName: string;
  generateText(options: AIGenerateOptions): Promise<string>;
  generateIdeas(topic: string, count: number, apiKey: string): Promise<Array<{ title: string; description: string; tags: string[] }>>;
  testConnection(apiKey: string): Promise<boolean>;
}
