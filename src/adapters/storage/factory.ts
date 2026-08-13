import { StorageAdapter } from "./types";
import { CloudflareR2Adapter } from "./r2.adapter";

export class StorageFactory {
  static getAdapter(provider: string = "r2"): StorageAdapter {
    switch (provider.toLowerCase()) {
      case "r2":
      case "cloudflare":
        return new CloudflareR2Adapter();
      default:
        return new CloudflareR2Adapter();
    }
  }
}
