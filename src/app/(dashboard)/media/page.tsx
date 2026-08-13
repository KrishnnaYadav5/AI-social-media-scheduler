"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Upload,
  Trash2,
  ImageIcon,
  Search,
  CheckCircle2,
  ExternalLink,
  Plus,
  Layers,
  Video,
  Play,
  Loader2,
  Send,
} from "lucide-react";
import { WatermelonModal } from "@/components/ui/watermelon-modal";
import { WatermelonConfirmModal } from "@/components/ui/watermelon-confirm-modal";
import { WatermelonSubNav } from "@/components/ui/watermelon-sub-nav";
import { WatermelonEmptyState } from "@/components/ui/watermelon-empty-state";
import { WatermelonBadge } from "@/components/ui/watermelon-badge";

export type MediaFormat = "image" | "video";

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  size: string;
  uploadedAt: string;
  format: "image" | "video";
  aspectRatio: "1:1" | "9:16" | "16:9";
}

const STORAGE_KEY = "social_media_library_v2";

const initialMockMedia: MediaAsset[] = [
  {
    id: "media_1",
    name: "ai_social_hero.png",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
    size: "1.2 MB",
    uploadedAt: "Today",
    format: "image",
    aspectRatio: "1:1",
  },
  {
    id: "media_2",
    name: "meta_story_vertical_banner.png",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800",
    size: "1.4 MB",
    uploadedAt: "Today",
    format: "image",
    aspectRatio: "9:16",
  },
  {
    id: "media_3",
    name: "reels_launch_teaser.mp4",
    url: "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800",
    size: "8.5 MB",
    uploadedAt: "Yesterday",
    format: "video",
    aspectRatio: "9:16",
  },
  {
    id: "media_4",
    name: "product_demo_explainer.mp4",
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    size: "12.4 MB",
    uploadedAt: "2 days ago",
    format: "video",
    aspectRatio: "16:9",
  },
  {
    id: "media_5",
    name: "growth_analytics_chart.png",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
    size: "850 KB",
    uploadedAt: "5 days ago",
    format: "image",
    aspectRatio: "1:1",
  },
];

const sampleUploads = [
  {
    name: "instagram_story_ad.png",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
    size: "1.8 MB",
    format: "image" as const,
    aspectRatio: "9:16" as const,
  },
  {
    name: "facebook_launch_video.mp4",
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800",
    size: "14.2 MB",
    format: "video" as const,
    aspectRatio: "16:9" as const,
  },
  {
    name: "brand_logo_square.png",
    url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800",
    size: "620 KB",
    format: "image" as const,
    aspectRatio: "1:1" as const,
  },
];

export default function MediaLibraryPage() {
  const [activeFormat, setActiveFormat] = useState<MediaFormat>("image");
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedUploadFormat, setSelectedUploadFormat] = useState<"image" | "video">("image");
  const [isUploading, setIsUploading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setMediaList(JSON.parse(saved));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockMedia));
        setMediaList(initialMockMedia);
      }
    } catch {
      setMediaList(initialMockMedia);
    }
  }, []);

  const saveMediaList = (newList: MediaAsset[]) => {
    setMediaList(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch {}
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;

    if (confirmDeleteId === "ALL") {
      const toDelete = [...mediaList];
      saveMediaList([]);
      setConfirmDeleteId(null);
      setNoticeMessage("All media assets permanently deleted from library.");
      setTimeout(() => setNoticeMessage(null), 3000);

      for (const item of toDelete) {
        if (item.url.includes("supabase.co")) {
          fetch("/api/media/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: item.url }),
          }).catch(() => {});
        }
      }
      return;
    }

    const targetAsset = mediaList.find((m) => m.id === confirmDeleteId);
    const updated = mediaList.filter((m) => m.id !== confirmDeleteId);
    saveMediaList(updated);
    setConfirmDeleteId(null);
    setNoticeMessage(`Media asset ${targetAsset ? `"${targetAsset.name}"` : ""} permanently deleted.`);
    setTimeout(() => setNoticeMessage(null), 3000);

    if (targetAsset && targetAsset.url.includes("supabase.co")) {
      fetch("/api/media/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetAsset.url }),
      }).catch(() => {});
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("format", selectedUploadFormat);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        const isVideoFile = file.type.startsWith("video/");
        const detectedFormat: "image" | "video" = isVideoFile ? "video" : selectedUploadFormat;
        const newAsset: MediaAsset = {
          id: `media_${Date.now()}`,
          name: file.name,
          url: data.url,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          uploadedAt: "Just now",
          format: detectedFormat,
          aspectRatio: detectedFormat === "video" ? "16:9" : "1:1",
        };

        saveMediaList([newAsset, ...mediaList]);
        setNoticeMessage(`File "${file.name}" uploaded successfully!`);
        setTimeout(() => setNoticeMessage(null), 3000);
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch {
      const isVideoFile = file.type.startsWith("video/");
      const detectedFormat: "image" | "video" = isVideoFile ? "video" : selectedUploadFormat;
      const fallbackAsset: MediaAsset = {
        id: `media_${Date.now()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: "Just now",
        format: detectedFormat,
        aspectRatio: detectedFormat === "video" ? "16:9" : "1:1",
      };

      saveMediaList([fallbackAsset, ...mediaList]);
      setNoticeMessage(`Asset "${file.name}" added to local library.`);
      setTimeout(() => setNoticeMessage(null), 3000);
    } finally {
      setIsUploading(false);
      setShowUploadModal(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUploadSample = (sample: (typeof sampleUploads)[0]) => {
    const newAsset: MediaAsset = {
      id: `media_${Date.now()}`,
      name: sample.name,
      url: sample.url,
      size: sample.size,
      uploadedAt: "Just now",
      format: sample.format,
      aspectRatio: sample.aspectRatio,
    };
    saveMediaList([newAsset, ...mediaList]);
    setShowUploadModal(false);
    setNoticeMessage(`Sample asset "${sample.name}" added to library.`);
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  const filteredMedia = mediaList.filter((m) => {
    const matchesFormat = m.format === activeFormat;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFormat && matchesSearch;
  });

  const imageCount = mediaList.filter((m) => m.format === "image").length;
  const videoCount = mediaList.filter((m) => m.format === "video").length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-normal text-foreground tracking-tight flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-accent" />
              <span>Media Library</span>
            </h1>
            <WatermelonBadge variant="accent">
              <span>{mediaList.length} ASSETS</span>
            </WatermelonBadge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-normal">
            Upload, store, and manage images and video files for Facebook Page and Instagram Business posts
          </p>
        </div>

        <div className="flex items-center gap-3">
          {mediaList.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirmDeleteId("ALL")}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white border border-red-600 text-xs sm:text-sm font-normal rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              title="Delete All Media Assets"
            >
              <Trash2 className="w-4 h-4 text-white" />
              <span>Clear Library</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 text-xs sm:text-sm px-5 py-2.5 rounded-xl font-normal flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-900" />
            <span>Upload Asset</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {noticeMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-md text-xs sm:text-sm font-normal flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* 1. Format Filter Sub-Nav Bar (Images & Videos) */}
      <WatermelonSubNav
        items={[
          { id: "image", label: "Images", icon: ImageIcon, count: imageCount },
          { id: "video", label: "Videos", icon: Video, count: videoCount },
        ]}
        activeTab={activeFormat}
        onTabChange={(tab) => setActiveFormat(tab as any)}
        size="md"
      />

      {/* Search Toolbar */}
      <div className="bg-card border border-border p-4 rounded-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media assets by name..."
            className="w-full bg-secondary border border-border rounded-md pl-10 pr-4 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-accent font-normal placeholder:text-muted-foreground/60 transition-colors"
          />
        </div>

        <span className="text-xs sm:text-sm font-normal text-foreground bg-secondary px-4 py-2 rounded-md border border-border">
          {filteredMedia.length} Assets Found
        </span>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredMedia.length === 0 ? (
          <div className="col-span-full">
            <WatermelonEmptyState
              icon={ImageIcon}
              title={mediaList.length === 0 ? "No Media Assets in Library" : "No Matching Assets Found"}
              description="Upload image or video files to build your asset library for Facebook and Instagram posts."
              actionLabel="Upload Asset"
              onAction={() => setShowUploadModal(true)}
            />
          </div>
        ) : (
          filteredMedia.map((asset) => (
            <div key={asset.id} className="bg-card border border-border rounded-md overflow-hidden group space-y-3 p-4 shadow-sm transition-all hover:border-accent/50">
              {/* Asset Preview Container */}
              <div className={`relative w-full ${asset.aspectRatio === "9:16" ? "h-64" : asset.aspectRatio === "16:9" ? "h-40" : "h-48"} bg-secondary rounded-md overflow-hidden shadow-xs flex items-center justify-center`}>
                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

                {/* Video Play Overlay Badge */}
                {asset.format === "video" && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                )}

                {/* Format Pill Overlay Badge */}
                <div className="absolute top-2.5 left-2.5">
                  <span
                    className={`text-[10px] font-normal px-2.5 py-1 rounded-md border shadow-xs backdrop-blur-md uppercase ${
                      asset.format === "video"
                        ? "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/40"
                        : "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/40"
                    }`}
                  >
                    {asset.format === "video" ? "VIDEO" : "IMAGE"}
                  </span>
                </div>

                {/* Aspect Ratio Badge */}
                <div className="absolute bottom-2.5 right-2.5">
                  <span className="text-[10px] bg-black/70 text-white font-normal px-2 py-0.5 rounded-md border border-white/20">
                    {asset.aspectRatio}
                  </span>
                </div>
              </div>

              {/* Asset Metadata */}
              <div className="space-y-1">
                <div className="text-xs sm:text-sm font-normal text-foreground truncate" title={asset.name}>
                  {asset.name}
                </div>
                <div className="text-[11px] text-muted-foreground font-normal flex items-center justify-between">
                  <span>{asset.size}</span>
                  <span>{asset.uploadedAt}</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2 border-t border-border flex items-center justify-between gap-2.5">
                <Link
                  href={`/editor?mediaUrl=${encodeURIComponent(asset.url)}&mediaType=${encodeURIComponent(asset.format)}`}
                  className="flex-1 py-2 bg-[#1877F2] hover:bg-blue-600 text-white text-xs sm:text-sm font-normal rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>Post</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(asset.id)}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md shadow-xs transition-all cursor-pointer border border-red-600 shrink-0 flex items-center justify-center"
                  title="Delete Asset Permanently"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Hidden Device File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png,image/jpeg,image/webp,video/mp4,video/quicktime,video/webm"
        className="hidden"
      />

      {/* Upload New Asset Modal */}
      <WatermelonModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload New Media Asset"
      >
        <div className="space-y-5">
          {/* Format Selector Dropdown (Images vs Videos) */}
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-foreground block">Target Media Format</label>
            <select
              value={selectedUploadFormat}
              onChange={(e) => setSelectedUploadFormat(e.target.value as any)}
              className="w-full bg-secondary border border-border rounded-md px-4 py-3 text-xs sm:text-sm text-foreground font-normal focus:outline-none focus:border-accent"
            >
              <option value="image">Image (PNG, JPG, WEBP, GIF)</option>
              <option value="video">Video (MP4, MOV, WebM Clip / Reel)</option>
            </select>
          </div>

          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-8 border-2 border-dashed border-border rounded-md text-center space-y-3 bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer block"
          >
            {isUploading ? (
              <div className="space-y-2">
                <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto" />
                <p className="text-xs sm:text-sm font-normal text-foreground">Uploading file to storage...</p>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-accent mx-auto" />
                <div>
                  <p className="text-xs sm:text-sm font-normal text-foreground">Click to browse & upload file from device</p>
                  <p className="text-xs text-muted-foreground mt-1 font-normal">Supports PNG, JPG, WEBP, MP4, WebM (Images & Videos only)</p>
                </div>
              </>
            )}
          </button>

          <div className="space-y-2">
            <label className="text-xs font-normal text-foreground block">Or Add Sample Media Asset</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sampleUploads.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => handleUploadSample(sample)}
                  className="p-3 bg-secondary border border-border hover:border-accent rounded-md cursor-pointer flex items-center gap-3 transition-all hover:scale-[1.01] shadow-xs"
                >
                  <div className="w-12 h-12 rounded-md overflow-hidden shrink-0">
                    <img src={sample.url} alt={sample.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-xs font-normal text-foreground truncate max-w-[130px]">{sample.name}</div>
                    <div className="text-[11px] text-muted-foreground font-normal">{sample.size} • {sample.format.toUpperCase()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </WatermelonModal>

      {/* Delete Asset Confirmation Modal */}
      <WatermelonConfirmModal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title={confirmDeleteId === "ALL" ? "Delete All Media Assets?" : "Delete Media Asset?"}
        description={
          confirmDeleteId === "ALL"
            ? "Are you sure you want to permanently delete ALL media assets from your cloud library? This action cannot be undone."
            : "Are you sure you want to delete this media asset permanently? It will be removed from your cloud library."
        }
        confirmText={confirmDeleteId === "ALL" ? "Delete All Media" : "Delete Asset"}
        cancelText="Cancel"
      />
    </div>
  );
}
