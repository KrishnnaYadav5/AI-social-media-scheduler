import { SocialPlatformAdapter, PublishPayload, PublishResult, ValidationResult } from "./types";

export class XAdapter implements SocialPlatformAdapter {
  platform = "x";
  maxCharacterLimit = 280;
  supportsImages = true;
  supportsVideos = true;

  validatePost(content: string): ValidationResult {
    const len = content ? content.length : 0;
    return {
      valid: len <= this.maxCharacterLimit,
      remainingChars: this.maxCharacterLimit - len,
      error: len > this.maxCharacterLimit ? `Post exceeds X character limit of ${this.maxCharacterLimit}.` : undefined,
    };
  }

  async publishPost(payload: PublishPayload): Promise<PublishResult> {
    return {
      success: true,
      platformPostId: `x_post_${Date.now()}`,
      publishedUrl: `https://x.com/user/status/${Date.now()}`,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresAt?: Date }> {
    return { accessToken: `x_token_${Date.now()}` };
  }
}
