import { StorageAdapter } from "./types";
import { SupabaseStorageAdapter } from "./supabase.adapter";
import { CloudflareR2Adapter } from "./r2.adapter";

export class StorageFactory {
  static getAdapter(provider: string = "supabase"): StorageAdapter {
    switch (provider.toLowerCase()) {
      case "supabase":
        return new SupabaseStorageAdapter();
      case "r2":
      case "cloudflare":
        return new CloudflareR2Adapter();
      default:
        return new SupabaseStorageAdapter();
    }
  }
}
