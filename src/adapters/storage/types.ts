export interface UploadResult {
  fileKey: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export interface StorageAdapter {
  providerName: string;
  generatePresignedUploadUrl(fileName: string, mimeType: string): Promise<{ uploadUrl: string; fileKey: string; publicUrl: string }>;
  deleteFile(fileKey: string): Promise<boolean>;
}
