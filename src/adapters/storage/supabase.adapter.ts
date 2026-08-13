import { createClient } from "@supabase/supabase-js";
import { StorageAdapter } from "./types";

export class SupabaseStorageAdapter implements StorageAdapter {
  providerName = "supabase";
  private bucket: string = "media";

  private getSupabaseClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
    return createClient(url, key);
  }

  async generatePresignedUploadUrl(fileName: string, mimeType: string): Promise<{ uploadUrl: string; fileKey: string; publicUrl: string }> {
    const supabase = this.getSupabaseClient();
    const ext = fileName.split(".").pop() || "jpg";
    const fileKey = `uploads/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key || url.includes("placeholder")) {
      return {
        uploadUrl: `/api/upload`,
        fileKey,
        publicUrl: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80`,
      };
    }

    const { data } = supabase.storage.from(this.bucket).getPublicUrl(fileKey);
    const publicUrl = data.publicUrl;

    return {
      uploadUrl: `/api/upload`,
      fileKey,
      publicUrl,
    };
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    try {
      const supabase = this.getSupabaseClient();
      const { error } = await supabase.storage.from(this.bucket).remove([fileKey]);
      if (error) {
        console.error("Supabase storage delete error:", error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Failed to delete file from Supabase Storage:", err);
      return false;
    }
  }
}
