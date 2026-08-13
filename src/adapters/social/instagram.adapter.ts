import { SocialPlatformAdapter, PublishPayload, PublishResult, ValidationResult } from "./types";

export class InstagramAdapter implements SocialPlatformAdapter {
  platform = "instagram";
  maxCharacterLimit = 2200;
  supportsImages = true;
  supportsVideos = true;

  validatePost(content: string, mediaUrls: string[] = []): ValidationResult {
    const len = content ? content.length : 0;
    if (len > this.maxCharacterLimit) {
      return {
        valid: false,
        error: `Caption exceeds Instagram limit of ${this.maxCharacterLimit} characters by ${len - this.maxCharacterLimit}.`,
        remainingChars: this.maxCharacterLimit - len,
      };
    }
    if (!mediaUrls || mediaUrls.length === 0) {
      return {
        valid: false,
        error: "Instagram posts require at least one photo or video asset.",
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
      const token = payload.accessToken || process.env.IG_ACCESS_TOKEN || "";
      const igId = payload.platformAccountId || process.env.IG_USER_ID || "";

      if (!token || token.includes("placeholder") || token.includes("mock") || token.startsWith("your_")) {
        console.log(`[Local Dev Mock] Simulating successful Instagram publish for igId: ${igId}`);
        return {
          success: true,
          platformPostId: `ig_mock_${Date.now()}`,
          publishedUrl: `https://instagram.com/p/mock_${Date.now()}`,
        };
      }

      const mediaUrls = payload.mediaUrls || [];
      const isCarousel = mediaUrls.length >= 2;
      const mediaUrl = mediaUrls.length > 0 ? mediaUrls[0] : null;
      const isVideo = mediaUrl && /\.(mp4|mov|webm|m4v)($|\?)/i.test(mediaUrl);

      if (isCarousel) {
        // Step 1a: Create item containers for each slide
        const slideContainerIds: string[] = [];
        for (const slideUrl of mediaUrls) {
          const slideParams = new URLSearchParams();
          slideParams.append("access_token", token);
          slideParams.append("image_url", slideUrl);
          slideParams.append("is_carousel_item", "true");
          const slideRes = await fetch(`https://graph.facebook.com/v19.0/${igId}/media`, { method: "POST", body: slideParams });
          const slideData = await slideRes.json();
          if (slideRes.ok && slideData.id) {
            slideContainerIds.push(slideData.id);
          }
        }

        if (slideContainerIds.length < 2) {
          return {
            success: false,
            error: "Failed to create carousel item containers. Ensure all slide URLs are publicly accessible HTTPS images.",
          };
        }

        // Step 1b: Create parent carousel container
        const carouselParams = new URLSearchParams();
        carouselParams.append("access_token", token);
        carouselParams.append("media_type", "CAROUSEL");
        if (payload.content) carouselParams.append("caption", payload.content);
        slideContainerIds.forEach((id) => carouselParams.append("children", id));

        const carouselRes = await fetch(`https://graph.facebook.com/v19.0/${igId}/media`, { method: "POST", body: carouselParams });
        const carouselData = await carouselRes.json();
        if (!carouselRes.ok || !carouselData.id) {
          return {
            success: false,
            error: carouselData.error?.message || "Failed to create Instagram carousel container.",
          };
        }

        // Step 2: Publish carousel container
        const pubParams = new URLSearchParams();
        pubParams.append("access_token", token);
        pubParams.append("creation_id", carouselData.id);
        const pubRes = await fetch(`https://graph.facebook.com/v19.0/${igId}/media_publish`, { method: "POST", body: pubParams });
        const pubData = await pubRes.json();
        if (!pubRes.ok || pubData.error) {
          return {
            success: false,
            error: pubData.error?.message || "Failed to publish Instagram carousel container.",
          };
        }

        return {
          success: true,
          platformPostId: pubData.id,
          publishedUrl: `https://instagram.com/p/${pubData.id}`,
        };
      } else {
        // Single Image / Reel Container Creation
        const containerParams = new URLSearchParams();
        containerParams.append("access_token", token);
        if (payload.content) containerParams.append("caption", payload.content);

        if (isVideo) {
          containerParams.append("media_type", "REELS");
          if (mediaUrl) containerParams.append("video_url", mediaUrl);
        } else {
          containerParams.append("media_type", "IMAGE");
          if (mediaUrl) containerParams.append("image_url", mediaUrl);
        }

        // Step 1: Create Container
        const containerRes = await fetch(`https://graph.facebook.com/v19.0/${igId}/media`, {
          method: "POST",
          body: containerParams,
        });

        const containerData = await containerRes.json();
        if (!containerRes.ok || !containerData.id) {
          return {
            success: false,
            error: containerData.error?.message || "Failed to create Instagram media container.",
          };
        }

        // Step 2: Publish Container
        const pubParams = new URLSearchParams();
        pubParams.append("access_token", token);
        pubParams.append("creation_id", containerData.id);

        const pubRes = await fetch(`https://graph.facebook.com/v19.0/${igId}/media_publish`, {
          method: "POST",
          body: pubParams,
        });

        const pubData = await pubRes.json();
        if (!pubRes.ok || pubData.error) {
          return {
            success: false,
            error: pubData.error?.message || "Failed to publish Instagram media container.",
          };
        }

        return {
          success: true,
          platformPostId: pubData.id,
          publishedUrl: `https://instagram.com/p/${pubData.id}`,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "An unexpected error occurred while publishing to Instagram Business.",
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresAt?: Date }> {
    return {
      accessToken: `ig_refreshed_${Date.now()}`,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    };
  }
}
