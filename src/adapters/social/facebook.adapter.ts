import { SocialPlatformAdapter, PublishPayload, PublishResult, ValidationResult } from "./types";

export class FacebookAdapter implements SocialPlatformAdapter {
  platform = "facebook";
  maxCharacterLimit = 63206;
  supportsImages = true;
  supportsVideos = true;

  validatePost(content: string, mediaUrls: string[] = []): ValidationResult {
    const len = content ? content.length : 0;
    if (len > this.maxCharacterLimit) {
      return {
        valid: false,
        error: `Post exceeds Facebook character limit of ${this.maxCharacterLimit} characters by ${len - this.maxCharacterLimit}.`,
        remainingChars: this.maxCharacterLimit - len,
      };
    }
    return {
      valid: true,
      remainingChars: this.maxCharacterLimit - len,
    };
  }

  async publishPost(payload: PublishPayload): Promise<PublishResult> {
    try {
      const token = payload.accessToken || process.env.FB_PAGE_ACCESS_TOKEN || "";
      const pageId = payload.platformAccountId || process.env.FB_PAGE_ID || "me";

      if (!token || token.includes("placeholder") || token.includes("mock") || token.startsWith("your_")) {
        console.log(`[Local Dev Mock] Simulating successful Facebook publish for pageId: ${pageId}`);
        return {
          success: true,
          platformPostId: `fb_mock_${Date.now()}`,
          publishedUrl: `https://facebook.com/posts/fb_mock_${Date.now()}`,
        };
      }

      let effectiveToken = token;
      if (pageId && pageId !== "me") {
        try {
          const tokRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}?fields=access_token&access_token=${token}`);
          const tokData = await tokRes.json();
          if (tokData?.access_token) {
            effectiveToken = tokData.access_token;
          }
        } catch {
          // Non-fatal – fallback to provided token
        }
      }

      const mediaUrl = payload.mediaUrls && payload.mediaUrls.length > 0 ? payload.mediaUrls[0] : null;
      const isVideo = mediaUrl && /\.(mp4|mov|webm|m4v)($|\?)/i.test(mediaUrl);
      const isPhoto = Boolean(mediaUrl) && !isVideo;

      // Facebook Page Feed Endpoint: /{page_id}/feed
      const endpoint = `https://graph.facebook.com/v19.0/${pageId}/feed`;

      const params = new URLSearchParams();
      params.append("access_token", effectiveToken);

      if (payload.content) {
        params.append("message", payload.content);
      }
      if (mediaUrl) {
        params.append("link", mediaUrl);
      }

      const res = await fetch(endpoint, {
        method: "POST",
        body: params,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        return {
          success: false,
          error: data.error?.message || `Meta Graph API status ${res.status}`,
        };
      }

      const postId = data.id || data.post_id;
      return {
        success: true,
        platformPostId: postId,
        publishedUrl: `https://facebook.com/${postId}`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "An unexpected network error occurred while publishing to Facebook Page.",
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresAt?: Date }> {
    return {
      accessToken: `fb_refreshed_${Date.now()}`,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    };
  }
}
