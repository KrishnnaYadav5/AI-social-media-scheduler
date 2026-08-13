import { SocialPlatformAdapter } from "./types";
import { FacebookAdapter } from "./facebook.adapter";
import { InstagramAdapter } from "./instagram.adapter";
import { XAdapter } from "./x.adapter";
import { LinkedInAdapter } from "./linkedin.adapter";

export class SocialPlatformFactory {
  static getAdapter(platform: string): SocialPlatformAdapter {
    switch (platform.toLowerCase()) {
      case "facebook":
        return new FacebookAdapter();
      case "instagram":
        return new InstagramAdapter();
      case "x":
      case "twitter":
        return new XAdapter();
      case "linkedin":
        return new LinkedInAdapter();
      default:
        throw new Error(`Unsupported social platform: ${platform}`);
    }
  }
}
