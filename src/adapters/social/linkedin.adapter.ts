import { SocialPlatformAdapter, PublishPayload, PublishResult, ValidationResult } from "./types";

export class LinkedInAdapter implements SocialPlatformAdapter {
  platform = "linkedin";
  maxCharacterLimit = 3000;
  supportsImages = true;
  supportsVideos = true;

  validatePost(content: string): ValidationResult {
    const len = content ? content.length : 0;
    return {
      valid: len <= this.maxCharacterLimit,
      remainingChars: this.maxCharacterLimit - len,
      error: len > this.maxCharacterLimit ? `Post exceeds LinkedIn character limit of ${this.maxCharacterLimit}.` : undefined,
    };
  }

  async publishPost(payload: PublishPayload): Promise<PublishResult> {
    return {
      success: true,
      platformPostId: `urn:li:share:${Date.now()}`,
      publishedUrl: `https://linkedin.com/feed/update/urn:li:share:${Date.now()}`,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresAt?: Date }> {
    return { accessToken: `li_token_${Date.now()}` };
  }
}
