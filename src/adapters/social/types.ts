export interface PublishPayload {
  content: string;
  mediaUrls?: string[];
  accessToken: string;
  platformAccountId: string;
}

export interface PublishResult {
  success: boolean;
  publishedUrl?: string;
  platformPostId?: string;
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  remainingChars: number;
}

export interface SocialPlatformAdapter {
  platform: string;
  maxCharacterLimit: number;
  supportsImages: boolean;
  supportsVideos: boolean;
  validatePost(content: string, mediaUrls?: string[]): ValidationResult;
  publishPost(payload: PublishPayload): Promise<PublishResult>;
  refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresAt?: Date }>;
}
