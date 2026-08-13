"use client";

import React from "react";
import { Image as ImageIcon, Video as VideoIcon, Trash2, ExternalLink } from "lucide-react";
import { WatermelonBadge } from "./watermelon-badge";

interface WatermelonMediaCardProps {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: string;
  mediaType: "image" | "video";
  uploadedAt: string;
  onDelete?: (id: string) => void;
}

export function WatermelonMediaCard({
  id,
  fileName,
  fileUrl,
  mimeType,
  fileSize,
  mediaType,
  uploadedAt,
  onDelete,
}: WatermelonMediaCardProps) {
  return (
    <div className="bg-card border border-border rounded overflow-hidden flex flex-col justify-between select-none">
      <div className="w-full h-40 bg-secondary relative border-b border-border">
        <img src={fileUrl} alt={fileName} className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2">
          <WatermelonBadge variant={mediaType === "image" ? "primary" : "accent"}>
            {mediaType === "image" ? <ImageIcon className="w-3 h-3" /> : <VideoIcon className="w-3 h-3" />}
            {mediaType.toUpperCase()}
          </WatermelonBadge>
        </div>
      </div>

      <div className="p-3 space-y-2">
        <div className="text-xs font-normal text-foreground truncate">{fileName}</div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{fileSize}</span>
          <span>{uploadedAt}</span>
        </div>

        <div className="pt-2 border-t border-border flex items-center justify-between">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary font-normal hover:underline flex items-center gap-1"
          >
            <span>View R2 Asset</span> <ExternalLink className="w-3 h-3" />
          </a>

          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="text-danger hover:bg-danger/10 p-1 rounded"
              title="Delete File"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
