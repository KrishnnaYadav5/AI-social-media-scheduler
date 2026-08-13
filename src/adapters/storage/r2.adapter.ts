import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { StorageAdapter } from "./types";

export class CloudflareR2Adapter implements StorageAdapter {
  providerName = "cloudflare-r2";
  private client: S3Client;
  private bucket: string;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID || "placeholder_account_id";
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || "placeholder_access_key";
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "placeholder_secret_key";
    this.bucket = process.env.R2_BUCKET_NAME || "social-media-assets";

    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async generatePresignedUploadUrl(fileName: string, mimeType: string): Promise<{ uploadUrl: string; fileKey: string; publicUrl: string }> {
    const fileKey = `uploads/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    
    // If credentials are placeholders, return mock URL structure for demo/dev
    if (!process.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID.includes("placeholder")) {
      return {
        uploadUrl: `/api/media/mock-upload?key=${encodeURIComponent(fileKey)}`,
        fileKey,
        publicUrl: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80`,
      };
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 3600 });
    const publicDomain = process.env.R2_PUBLIC_DOMAIN || `https://${this.bucket}.r2.cloudflarestorage.com`;
    const publicUrl = `${publicDomain}/${fileKey}`;

    return { uploadUrl, fileKey, publicUrl };
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    try {
      if (!process.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID.includes("placeholder")) {
        return true;
      }
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
      });
      await this.client.send(command);
      return true;
    } catch (err) {
      console.error("Failed to delete file from R2:", err);
      return false;
    }
  }
}
