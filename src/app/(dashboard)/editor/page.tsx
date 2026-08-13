"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Save,
  Trash2,
  Paperclip,
  Zap,
  Check,
  ShieldCheck,
  ImageIcon,
  Globe,
  Smile,
  Briefcase,
  Flame,
  Smartphone,
  Monitor,
  Heart,
  MessageCircle,
  Share2,
  ThumbsUp,
  Bookmark,
  MoreHorizontal,
  Upload,
  Hash,
  RefreshCw,
  Plus,
  Sliders,
  Calendar as CalendarIcon,
  Clock,
  Copy,
  PenTool,
  Loader2,
  Key,
  Info,
  Film,
  Video,
  Images,
  Play,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  AlertCircle,
} from "lucide-react";
import { SocialIcon } from "@/components/ui/social-icons";
import { WatermelonModal } from "@/components/ui/watermelon-modal";
import { WatermelonConfirmModal } from "@/components/ui/watermelon-confirm-modal";
import { WatermelonSubNav } from "@/components/ui/watermelon-sub-nav";
import { WatermelonSectionHeader } from "@/components/ui/watermelon-section-header";
import { WatermelonPlatformToggle } from "@/components/ui/watermelon-platform-toggle";
import { LiveClock } from "@/components/ui/live-clock";

const isVideoMedia = (url: string | null, formatType: string) => {
  if (!url) return false;
  const isVideoExt = /\.(mp4|mov|webm|m4v)($|\?)/i.test(url);
  const isVideoFormat = formatType === "story_video" || formatType === "video_post";
  return isVideoExt || isVideoFormat;
};

const MOCK_MEDIA_LIBRARY = [
  { id: "m1", name: "AI Product Hero", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800", format: "image_post" as const },
  { id: "m2", name: "Meta Story Vertical", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800", format: "story_image" as const },
  { id: "m3", name: "Reels Vertical Teaser", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", format: "story_video" as const },
  { id: "m4", name: "Product Reel Demo", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", format: "video_post" as const },
  { id: "m5", name: "Feature Carousel Pack", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800", format: "carousel" as const },
];

export default function PostEditorPage() {
  const [prompt, setPrompt] = useState("");
  const [generatedOutput, setGeneratedOutput] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["facebook", "instagram"]);

  // Unified AI Composer Easy Navigation Tab State
  const [composerTab, setComposerTab] = useState<"all" | "prompt" | "hashtags" | "media" | "schedule">("all");

  // Copywriting Tones including Custom
  const [aiTone, setAiTone] = useState<"casual" | "professional" | "viral" | "storytelling" | "sales" | "custom">("casual");
  const [customToneInput, setCustomToneInput] = useState("");

  // Inner Text Panel Horizontal Navigation State
  const [textSubTab, setTextSubTab] = useState<"custom" | "ai_prompt">("ai_prompt");
  const [customTopicText, setCustomTopicText] = useState("");
  const [aiGeneratedCopy, setAiGeneratedCopy] = useState("");

  // Inner Post/Scheduled Panel Horizontal Navigation State
  const [postActionMode, setPostActionMode] = useState<"publish_now" | "schedule">("publish_now");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [publishResult, setPublishResult] = useState<{ postId?: string; results?: { platform: string; status: string; detail: string }[] } | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaIsPublic, setMediaIsPublic] = useState<boolean | null>(null);
  const [mediaAssetUrl, setMediaAssetUrl] = useState<string | null>(null);
  const [mediaAssetName, setMediaAssetName] = useState<string | null>(null);
  const [mediaFormatType, setMediaFormatType] = useState<"image_post" | "story_image" | "story_video" | "video_post" | "carousel">("image_post");
  const [carouselSlides, setCarouselSlides] = useState<string[]>([]);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Cloud Library State hydrated from localStorage (v2 and v1)
  const [cloudMediaList, setCloudMediaList] = useState<any[]>(MOCK_MEDIA_LIBRARY);

  // Sync Cloud Library from localStorage on mount and when modal opens
  const syncCloudLibrary = () => {
    try {
      let combined: any[] = [];
      const savedV2 = localStorage.getItem("social_media_library_v2");
      const savedV1 = localStorage.getItem("social_media_library_v1");

      if (savedV2) {
        try { combined = [...combined, ...JSON.parse(savedV2)]; } catch {}
      }
      if (savedV1) {
        try { combined = [...combined, ...JSON.parse(savedV1)]; } catch {}
      }

      if (combined.length === 0) {
        combined = MOCK_MEDIA_LIBRARY;
        try { localStorage.setItem("social_media_library_v2", JSON.stringify(MOCK_MEDIA_LIBRARY)); } catch {}
      }

      // De-duplicate items by id or url
      const unique = combined.reduce((acc: any[], current: any) => {
        const exists = acc.some((item: any) => item.id === current.id || item.url === current.url);
        if (!exists) return [...acc, current];
        return acc;
      }, []);

      setCloudMediaList(unique.length > 0 ? unique : MOCK_MEDIA_LIBRARY);
    } catch {
      setCloudMediaList(MOCK_MEDIA_LIBRARY);
    }
  };

  useEffect(() => {
    syncCloudLibrary();
  }, []);

  // Live Feed Simulator Drag-to-Scroll State
  const carouselContainerRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const [copiedStatus, setCopiedStatus] = useState(false);

  // Drag and Drop Drag Reorder Helper
  const handleReorderSlides = (fromIndex: number, toIndex: number) => {
    setCarouselSlides((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      setActiveCarouselIndex(toIndex);
      setMediaAssetUrl(updated[toIndex]);
      return updated;
    });
  };

  // Carousel Slide Management Helpers (Reordering & Deleting)
  const moveCarouselSlideLeft = (index: number) => {
    if (index <= 0) return;
    setCarouselSlides((prev) => {
      const updated = [...prev];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      setActiveCarouselIndex(index - 1);
      setMediaAssetUrl(updated[index - 1]);
      return updated;
    });
  };

  const moveCarouselSlideRight = (index: number) => {
    if (index >= carouselSlides.length - 1) return;
    setCarouselSlides((prev) => {
      const updated = [...prev];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      setActiveCarouselIndex(index + 1);
      setMediaAssetUrl(updated[index + 1]);
      return updated;
    });
  };

  const removeCarouselSlide = (index: number) => {
    setCarouselSlides((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0) {
        setMediaAssetUrl(null);
        setMediaAssetName(null);
        setActiveCarouselIndex(0);
      } else {
        const newIdx = Math.min(index, updated.length - 1);
        setActiveCarouselIndex(newIdx);
        setMediaAssetUrl(updated[newIdx]);
        setMediaAssetName(`${updated.length} Multi-Slide Carousel Assets Attached`);
      }
      return updated;
    });
  };

  // Live Feed Simulator Interactive Reaction State
  const [simulatedLiked, setSimulatedLiked] = useState(false);
  const [simulatedSaved, setSimulatedSaved] = useState(false);
  const [simulatedLikesCount, setSimulatedLikesCount] = useState(128);

  // Schedule State
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  // Inner AI Hashtags Panel Navigation State
  const [hashtagSubTab, setHashtagSubTab] = useState<"custom" | "ai">("ai");
  const [customHashtagsInput, setCustomHashtagsInput] = useState("");

  // Simplified AI Hashtag Generator State
  const [hashtagTopic, setHashtagTopic] = useState("");
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([
    "#Growth", "#SocialMedia", "#AI", "#Productivity", "#SaaS", "#Marketing", "#Startup", "#Automation"
  ]);
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);

  // Device View State for Live Feed Simulator
  const [deviceView, setDeviceView] = useState<"mobile" | "desktop">("mobile");

  // Helper to ensure clean hashtags with single '#' and proper spacing while preserving newlines
  const cleanHashtagFormatting = (str: string): string => {
    if (!str) return "";
    return str
      .replace(/#+/g, "#") // Replace '##' or '###' with single '#'
      .replace(/([a-zA-Z0-9_])#/g, "$1 #") // Insert space before '#' if attached to word e.g. 'saas#startup' -> 'saas #startup'
      .replace(/[ \t]+/g, " ") // Collapse multiple spaces/tabs while preserving newlines (\n)
      .trim();
  };

  // Compute active post copy text for Live Feed Simulator Preview
  const activeCopyText = (() => {
    const mainText = textSubTab === "custom"
      ? customTopicText
      : (generatedOutput || prompt || aiGeneratedCopy);
    let raw = "";
    if (mainText && customHashtagsInput) {
      raw = `${mainText}\n${customHashtagsInput}`;
    } else {
      raw = mainText || customHashtagsInput;
    }
    return cleanHashtagFormatting(raw);
  })();

  // Local File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Media Picker Modal State
  const [showMediaPickerModal, setShowMediaPickerModal] = useState(false);

  // Confirmation Modal State
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // LocalStorage Auto-Save State
  const [draftSaved, setDraftSaved] = useState(false);

  // Auto-Save Draft to LocalStorage
  useEffect(() => {
    if (generatedOutput || prompt) {
      try {
        localStorage.setItem(
          "watermelonsaas_editor_draft",
          JSON.stringify({ prompt, generatedOutput, selectedPlatforms, mediaAssetUrl, mediaAssetName, scheduledDate, scheduledTime })
        );
        setDraftSaved(true);
        const timer = setTimeout(() => setDraftSaved(false), 2000);
        return () => clearTimeout(timer);
      } catch (e) {}
    }
  }, [prompt, generatedOutput, selectedPlatforms, mediaAssetUrl, mediaAssetName, scheduledDate, scheduledTime]);

  // Load Saved Draft or URL Edit Query Params on Mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);
        const urlContent = searchParams.get("content") || searchParams.get("prompt");
        const urlMedia = searchParams.get("mediaUrl");
        const urlMediaType = searchParams.get("mediaType");
        const urlTags = searchParams.get("tags");

        if (urlContent) {
          setGeneratedOutput(urlContent);
          setCustomTopicText(urlContent);
          setPrompt(urlContent);
        }
        if (urlMedia) {
          setMediaAssetUrl(urlMedia);
          setMediaAssetName("Attached Media Asset");
        }
        if (urlMediaType) {
          setMediaFormatType(urlMediaType as any);
        }
        if (urlTags) {
          const formattedHashtags = urlTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .map((t) => (t.startsWith("#") ? t : `#${t}`))
            .join(" ");
          setCustomHashtagsInput(formattedHashtags);
        }

        if (!urlContent && !urlMedia && !urlTags) {
          const saved = localStorage.getItem("watermelonsaas_editor_draft");
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.prompt) setPrompt(parsed.prompt);
            if (parsed.generatedOutput) setGeneratedOutput(parsed.generatedOutput);
            if (parsed.selectedPlatforms) setSelectedPlatforms(parsed.selectedPlatforms);
            if (parsed.mediaAssetUrl) setMediaAssetUrl(parsed.mediaAssetUrl);
            if (parsed.mediaAssetName) setMediaAssetName(parsed.mediaAssetName);
            if (parsed.scheduledDate) setScheduledDate(parsed.scheduledDate);
            if (parsed.scheduledTime) setScheduledTime(parsed.scheduledTime);
          }
        }
      }
    } catch (e) {}
  }, []);

  const togglePlatform = (p: string) => {
    if (selectedPlatforms.includes(p)) {
      setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const generateSmartFallbackCopy = (topic: string, tone: string): string => {
    const toneMap: Record<string, string> = {
      casual: `Hey everyone! We are excited to share something special about ${topic}. This is going to change how you think about social media. Drop a comment if you are interested!\n\n#${topic.replace(/\s+/g, "")} #SocialMedia #Community`,
      professional: `We are pleased to announce an exciting update regarding ${topic}.\n\nOur team has been working to deliver results that matter. Stay tuned for more details.\n\n#${topic.replace(/\s+/g, "")} #Business #Innovation`,
      viral: `STOP SCROLLING! You need to see this about ${topic}!\n\nThis changes EVERYTHING. Share this with someone who needs to hear it.\n\n#${topic.replace(/\s+/g, "")} #Viral #MustSee`,
      storytelling: `It all started with a simple idea about ${topic}.\n\nWhat happened next surprised everyone. Here is the full story...\n\n#${topic.replace(/\s+/g, "")} #Story #Journey`,
      sales: `LIMITED TIME: Discover what makes ${topic} the best choice for you.\n\nDon't miss out on this exclusive opportunity. Link in bio!\n\n#${topic.replace(/\s+/g, "")} #Exclusive #DealAlert`,
    };
    return toneMap[tone] || `${topic}\n\nStay connected for the latest updates and insights.\n\n#${topic.replace(/\s+/g, "")} #Updates`;
  };

  const handleGenerateAI = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setPublishStatus(null);

    const activeToneToUse = aiTone === "custom" ? (customToneInput.trim() || "custom") : aiTone;
    const platformNames = selectedPlatforms.map((p) => p === "facebook" ? "Facebook" : "Instagram").join(" and ");

    const aiPrompt = `Write a high-performing ${activeToneToUse} tone social media post for ${platformNames} about: ${prompt}. Include a strong hook, clear message body, and a call-to-action. Keep it concise and engaging.`;

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, tone: activeToneToUse }),
      });
      const data = await res.json();
      const output = data.result ? data.result : generateSmartFallbackCopy(prompt, activeToneToUse);
      setAiGeneratedCopy(output);
      if (textSubTab === "ai_prompt") {
        setGeneratedOutput(output);
      }
    } catch (err) {
      const fallback = generateSmartFallbackCopy(prompt, activeToneToUse);
      setAiGeneratedCopy(fallback);
      if (textSubTab === "ai_prompt") {
        setGeneratedOutput(fallback);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!generatedOutput.trim()) return;
    navigator.clipboard.writeText(generatedOutput);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  // Generate Smart Topic-Aware Fallback Hashtags
  const generateSmartFallbackHashtags = (topic: string): string[] => {
    const words = topic.split(/\s+/).filter((w) => w.length > 2);
    const baseTag = `#${topic.replace(/\s+/g, "")}`;
    const wordTags = words.slice(0, 3).map((w) => `#${w.charAt(0).toUpperCase()}${w.slice(1)}`);
    const contextTags = [
      `${baseTag}Tips`,
      `${baseTag}Strategy`,
      "#DigitalMarketing",
      "#ContentStrategy",
      "#BrandGrowth",
      "#OnlinePresence",
      "#MarketingTips",
      "#SocialMediaMarketing",
    ];
    const combined = [baseTag, ...wordTags, ...contextTags];
    const unique = [...new Set(combined)];
    return unique.slice(0, 8);
  };

  // Handle Dynamic AI Hashtag Generation
  const handleGenerateHashtags = async () => {
    const topicToUse = hashtagTopic.trim() || prompt.trim() || "Social Media Growth";
    setIsGeneratingHashtags(true);

    const hashtagPrompt = `Generate exactly 8 unique, high-engagement hashtags for the topic: "${topicToUse}". Mix broad reach hashtags with niche-specific ones. Return only the hashtags separated by spaces, nothing else.`;

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: hashtagPrompt, tone: "viral" }),
      });
      const data = await res.json();
      if (data.result) {
        const extracted = (data.result.match(/#[a-zA-Z0-9_]+/g) || []);
        if (extracted.length > 0) {
          setGeneratedHashtags(extracted.slice(0, 8));
        } else {
          setGeneratedHashtags(generateSmartFallbackHashtags(topicToUse));
        }
      } else {
        setGeneratedHashtags(generateSmartFallbackHashtags(topicToUse));
      }
    } catch (err) {
      setGeneratedHashtags(generateSmartFallbackHashtags(topicToUse));
    } finally {
      setIsGeneratingHashtags(false);
    }
  };

  const handleInsertSingleHashtag = (tag: string) => {
    if (textSubTab === "custom") {
      setCustomTopicText((prev) => (prev ? `${prev} ${tag}` : tag));
      setGeneratedOutput((prev) => (prev ? `${prev} ${tag}` : tag));
    } else {
      setGeneratedOutput((prev) => (prev ? `${prev} ${tag}` : tag));
    }
  };

  const handleInsertAllHashtags = () => {
    const allTags = generatedHashtags.join(" ");
    if (textSubTab === "custom") {
      setCustomTopicText((prev) => (prev ? `${prev}\n\n${allTags}` : allTags));
      setGeneratedOutput((prev) => (prev ? `${prev}\n\n${allTags}` : allTags));
    } else {
      setGeneratedOutput((prev) => (prev ? `${prev}\n\n${allTags}` : allTags));
    }
  };

  // Upload a file to /api/upload and return a public URL
  const uploadFileToServer = async (file: File): Promise<{ url: string; isPublic: boolean; warning?: string }> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return { url: data.url, isPublic: data.isPublic ?? true, warning: data.warning };
  };

  // Local Device File Upload Handler (single file — non-carousel)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show instant local preview
    const previewUrl = URL.createObjectURL(file);
    setMediaAssetUrl(previewUrl);
    setMediaAssetName(file.name);
    setMediaIsPublic(null);
    setIsUploadingMedia(true);
    try {
      const { url, isPublic, warning } = await uploadFileToServer(file);
      setMediaAssetUrl(url);
      setMediaIsPublic(isPublic);
      if (warning) console.warn("[Upload]", warning);
    } catch (err: any) {
      // Keep local preview but mark not public
      setMediaIsPublic(false);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const promptClearEditor = () => {
    setConfirmState({
      isOpen: true,
      title: "Clear Post Content?",
      description: "Are you sure you want to clear your current prompt and post draft? This action cannot be undone.",
      onConfirm: () => {
        setPrompt("");
        setGeneratedOutput("");
        setMediaAssetUrl(null);
        setMediaAssetName(null);
        localStorage.removeItem("watermelonsaas_editor_draft");
      },
    });
  };

  const promptRemoveMedia = () => {
    setConfirmState({
      isOpen: true,
      title: "Remove Media Asset?",
      description: "Are you sure you want to remove the attached media image from this post?",
      onConfirm: () => {
        setMediaAssetUrl(null);
        setMediaAssetName(null);
      },
    });
  };

  const handlePublishNow = async () => {
    const contentToPublish = generatedOutput || prompt || customTopicText;
    if (!contentToPublish.trim() && !mediaAssetUrl && carouselSlides.length === 0) {
      setPublishStatus({ type: "error", message: "Please enter post copy or attach media before publishing." });
      return;
    }

    if (selectedPlatforms.length === 0) {
      setPublishStatus({ type: "error", message: "Please select at least one Target Social Channel (Facebook Page or Instagram Business) before publishing." });
      return;
    }

    // Read stored accounts from localStorage
    let storedAccounts: any[] = [];
    try {
      const raw = localStorage.getItem("social_accounts_v1");
      if (raw) storedAccounts = JSON.parse(raw);
    } catch {
      // Ignore parse error
    }

    setIsPublishing(true);
    setPublishStatus(null);
    try {
      const res = await fetch("/api/posts/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: contentToPublish,
          platforms: selectedPlatforms,
          mediaUrl: mediaAssetUrl,
          mediaFormatType,
          carouselSlides,
          accounts: storedAccounts,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPublishStatus({
          type: "success",
          message: data.message || `Post successfully published via Meta Graph API v19.0!`,
        });
        setPublishResult({ postId: data.postId, results: data.results });
        setShowPublishModal(true);

        // Save published post to Supabase
        try {
          await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: contentToPublish,
              target_platforms: selectedPlatforms,
              status: "published",
              media_urls: mediaAssetUrl ? [mediaAssetUrl] : [],
            }),
          });
        } catch {}
      } else {
        setPublishStatus({ type: "error", message: data.error || "Publication failed via Meta API." });
      }
    } catch (err) {
      setPublishStatus({ type: "error", message: "Network error attempting to publish post." });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleScheduleForLater = async () => {
    const contentToPublish = activeCopyText || generatedOutput || prompt || customTopicText;
    if (!contentToPublish.trim() && !mediaAssetUrl && carouselSlides.length === 0) {
      setPublishStatus({ type: "error", message: "Please enter post copy or attach media before scheduling." });
      return;
    }
    if (!scheduledDate || !scheduledTime) {
      setPublishStatus({ type: "error", message: "Please select both date and time for scheduling." });
      return;
    }

    setIsPublishing(true);
    setPublishStatus(null);

    try {
      const schedIso = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
      const mediaList = carouselSlides.length > 0 ? carouselSlides : (mediaAssetUrl ? [mediaAssetUrl] : []);

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: contentToPublish,
          target_platforms: selectedPlatforms,
          media_urls: mediaList,
          status: "scheduled",
          scheduledAt: schedIso,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPublishStatus({
          type: "success",
          message: `Post successfully scheduled for ${scheduledDate} at ${scheduledTime} EST via QStash Queue!`,
        });
        setTimeout(() => {
          window.location.href = "/calendar";
        }, 1500);
      } else {
        setPublishStatus({ type: "error", message: data.error || "Failed to schedule post." });
      }
    } catch (err) {
      setPublishStatus({ type: "error", message: "Network error attempting to schedule post." });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    const contentToSave = activeCopyText || generatedOutput || prompt || customTopicText;
    if (!contentToSave.trim() && !mediaAssetUrl && carouselSlides.length === 0) {
      setPublishStatus({ type: "error", message: "Please enter post copy or attach media before saving a draft." });
      return;
    }

    try {
      await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: contentToSave,
          target_platforms: selectedPlatforms,
          status: "draft",
          media_urls: mediaAssetUrl ? [mediaAssetUrl] : [],
        }),
      });
      setDraftSaved(true);
      setPublishStatus({
        type: "success",
        message: "Draft saved to Supabase! You can view and manage it in the Posts page under Drafts tab.",
      });
    } catch (e) {
      setPublishStatus({ type: "error", message: "Failed to save draft to Supabase." });
    }
  };

  // Dynamic Mode-Specific Character & Hashtag Telemetry
  const charCount = activeCopyText.length;
  const hashtagCount = (activeCopyText.match(/#[a-zA-Z0-9_]+/g) || []).length;
  const igCharLimit = 2200;
  const isIgOverLimit = charCount > igCharLimit;

  const filteredPickerItems = cloudMediaList.filter((item) => {
    const fmt = (item.format || "").toLowerCase();
    const url = item.url || "";
    const isVideo = fmt === "video" || fmt === "video_post" || fmt === "story_video" || /\.(mp4|mov|webm|m4v)($|\?)/i.test(url);
    if (mediaFormatType === "video_post" || mediaFormatType === "story_video") {
      return isVideo;
    }
    return !isVideo;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Hidden Local File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* 1. Modern Minimalist Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-normal text-foreground tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <span>Post Editor</span>
            </h1>
            {draftSaved && (
              <span className="text-[10px] bg-secondary text-muted-foreground font-normal px-2 py-0.5 rounded border border-border flex items-center gap-1">
                <Save className="w-3 h-3 text-accent" /> Auto-Saved
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Compose AI social posts, attach media, and publish via Meta Graph API v19.0
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={promptClearEditor}
            className="w-32 sm:w-36 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-normal rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] cursor-pointer shrink-0"
          >
            <Trash2 className="w-4 h-4 text-white" />
            <span>Clear</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            className="w-32 sm:w-36 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-normal rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] cursor-pointer shrink-0"
          >
            <Save className="w-4 h-4 text-white" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={handlePublishNow}
            className="w-32 sm:w-36 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-normal rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
            <span>Publish Now</span>
          </button>
        </div>
      </div>



      {/* Notification Banner */}
      {publishStatus && publishStatus.type === "error" && (
        <div className="p-3.5 rounded-xl border text-xs font-normal flex items-center gap-2 bg-danger/10 border-danger/30 text-danger">
          <Zap className="w-4 h-4 shrink-0" />
          <span className="flex-1">{publishStatus.message}</span>
          <button onClick={() => setPublishStatus(null)} className="ml-auto text-danger hover:text-danger/70 transition-colors"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Publish Success Modal */}
      {showPublishModal && publishResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in-0 zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-base font-normal text-foreground">Post Published!</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Live on Meta Graph API v19.0</p>
                </div>
              </div>
              <button onClick={() => setShowPublishModal(false)} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Per-platform Results */}
            <div className="space-y-3">
              {(publishResult.results || []).map((r, i) => {
                // Derive a direct post URL if we have a real numeric post ID
                const rawId = r.detail.match(/[0-9]+_[0-9]+/);
                const singleId = r.detail.match(/\b(\d{10,})\b/);
                const fbPostId = rawId ? rawId[0] : singleId ? singleId[1] : null;
                const isLive = r.status === "success";
                const isFacebook = r.platform.toLowerCase().includes("facebook");
                const isInstagram = r.platform.toLowerCase().includes("instagram");
                const viewUrl = isFacebook && fbPostId
                  ? `https://www.facebook.com/${fbPostId}`
                  : isInstagram && fbPostId
                  ? `https://www.instagram.com/p/${fbPostId}/`
                  : null;
                return (
                  <div key={i} className={`p-4 rounded-xl border space-y-2 ${
                    isLive ? "bg-emerald-500/8 border-emerald-500/25" : "bg-secondary border-border"
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <SocialIcon platform={isFacebook ? "facebook" : "instagram"} className="w-4 h-4" />
                        <span className="text-sm font-normal text-foreground">{r.platform}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-normal ${
                        isLive ? "bg-emerald-500/15 text-emerald-500" : "bg-blue-500/15 text-blue-400"
                      }`}>
                        {isLive ? "Live" : "Published"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.detail}</p>
                    {viewUrl && (
                      <a
                        href={viewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-normal text-accent hover:text-accent/80 transition-colors mt-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Post on {isFacebook ? "Facebook" : "Instagram"}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Note if no live post ID */}
            {(publishResult.results || []).every(r => r.status !== "success") && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs text-amber-600 dark:text-amber-400 space-y-1">
                <p className="font-normal">To see your post, visit your Facebook Page directly:</p>
                <a
                  href="https://www.facebook.com/me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  <ExternalLink className="w-3 h-3" /> Open Facebook Page
                </a>
              </div>
            )}

            <button
              onClick={() => setShowPublishModal(false)}
              className="w-full py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-normal rounded-xl transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 4. Modern Minimalist 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: UNIFIED AI Content & Post Copy Studio (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-card border border-border p-5 rounded-xl space-y-4">
            {/* Merged Card Header with 2-Tier Stacked Navigation Bar */}
            <div className="pb-3 border-b border-border space-y-2.5">
              {/* Top Row: Full Composer Button (100% Full Width) */}
              <button
                type="button"
                onClick={() => setComposerTab("all")}
                className={`w-full py-3 px-5 rounded-2xl transition-all font-normal text-sm sm:text-base flex items-center justify-center gap-2 shadow-md ${
                  composerTab === "all"
                    ? "bg-white text-slate-900 shadow-md font-normal border-none"
                    : "bg-stone-800/80 text-stone-400 hover:text-white hover:bg-stone-700 border border-stone-700/60 font-normal"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Full Composer</span>
              </button>

              {/* Bottom Row: Step Navigation Tabs (Text > AI Hashtags > Media > Post/Scheduled) */}
              <div className="p-1 border border-border dark:border-stone-800 rounded-2xl bg-secondary dark:bg-black flex items-center justify-between gap-1 text-xs sm:text-sm font-normal w-full shadow-md flex-nowrap overflow-hidden">
                {[
                  { id: "prompt", label: "AI Caption" },
                  { id: "hashtags", label: "AI Hashtags" },
                  { id: "media", label: "Media" },
                  { id: "schedule", label: "Post/Scheduled" },
                ].map((st, idx) => (
                  <React.Fragment key={st.id}>
                    {idx > 0 && <span className="text-muted-foreground dark:text-white text-xs font-normal shrink-0">&gt;</span>}
                    <button
                      type="button"
                      onClick={() => setComposerTab(st.id as any)}
                      className={`flex-1 min-w-0 px-2.5 sm:px-3 py-2 rounded-xl transition-colors shrink-0 text-center truncate ${
                        composerTab === st.id
                          ? "bg-white text-slate-900 shadow-md font-normal border-none"
                          : "bg-stone-800/80 text-stone-400 hover:text-white hover:bg-stone-700 border border-stone-700/60 font-normal"
                      }`}
                    >
                      {st.label}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {/* Panel 1: AI Prompt & Copywriting Tones */}
              {(composerTab === "all" || composerTab === "prompt") && (
                <div className="space-y-3">
                  {/* Inner Horizontal Navigation Bar (Prominent Large Size) */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-normal uppercase tracking-wider text-muted-foreground block">
                      Caption Type
                    </label>
                    <WatermelonSubNav
                      items={[
                        { id: "custom", label: "Custom Caption", icon: PenTool },
                        { id: "ai_prompt", label: "AI Caption", icon: Sparkles },
                      ]}
                      activeTab={textSubTab}
                      onTabChange={(tab) => {
                        setTextSubTab(tab as any);
                        if (tab === "custom") setGeneratedOutput(customTopicText);
                        else setGeneratedOutput(aiGeneratedCopy || prompt);
                      }}
                      divider
                    />
                  </div>

                  {/* Mode 1: Custom Post Topic */}
                  {textSubTab === "custom" && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-base sm:text-lg font-normal text-foreground block">Custom Caption</label>
                        <textarea
                          value={customTopicText}
                          onChange={(e) => {
                            setCustomTopicText(e.target.value);
                            setGeneratedOutput(e.target.value);
                          }}
                          placeholder="Write your custom caption directly here..."
                          className="w-full h-44 bg-secondary dark:bg-black border border-border dark:border-stone-800 rounded-2xl p-4 sm:p-5 text-sm sm:text-base font-normal text-foreground focus:outline-none focus:border-accent placeholder:text-muted-foreground/60 leading-relaxed shadow-sm"
                        />

                        {/* Inline Character Telemetry Counter */}
                        <div className="pt-1 flex items-center justify-between text-xs sm:text-sm font-normal">
                          <div className="flex items-center gap-3">
                            <span className={isIgOverLimit ? "text-danger" : "text-muted-foreground"}>
                              {charCount} / {igCharLimit} chars (Instagram Limit)
                            </span>
                            <span>&bull;</span>
                            <span className="text-muted-foreground">{hashtagCount} / 30 Hashtags</span>
                          </div>

                          {isIgOverLimit && (
                            <span className="text-xs bg-danger/10 text-danger px-2.5 py-1 rounded font-normal">
                              Exceeds Instagram Limit
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-secondary/60 border border-border rounded-xl gap-2">
                        <span className="text-xs sm:text-sm text-muted-foreground font-normal truncate">Instantly updates post copy & live feed preview.</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (customTopicText.trim()) {
                              setGeneratedOutput(customTopicText);
                            }
                          }}
                          className="px-3.5 py-2 bg-accent hover:bg-accent/90 text-white text-xs sm:text-sm font-normal rounded-lg flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                        >
                          <Check className="w-4 h-4" />
                          <span>Use as Post Copy</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode 2: AI Caption / Post Topic */}
                  {textSubTab === "ai_prompt" && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between pb-2 mb-1">
                          <label className="text-base sm:text-lg font-normal text-foreground block">AI Caption</label>
                          <Link
                            href="/settings"
                            className="text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-normal px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                            title="Configure Google Gemini Studio API Key in Settings"
                          >
                            <Key className="w-4 h-4 text-white" />
                            <span>Gemini API Key</span>
                          </Link>
                        </div>
                        <textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="e.g. Announce a 20% discount on our AI Social Media Scheduler for early adopters..."
                          className="w-full h-36 bg-secondary dark:bg-black border border-border dark:border-stone-800 rounded-2xl p-4 sm:p-5 text-sm sm:text-base font-normal text-foreground focus:outline-none focus:border-accent placeholder:text-muted-foreground/60 leading-relaxed shadow-sm"
                        />

                        {/* Inline Character Telemetry Counter */}
                        <div className="pt-1 flex items-center justify-between text-xs sm:text-sm font-normal">
                          <div className="flex items-center gap-3">
                            <span className={isIgOverLimit ? "text-danger" : "text-muted-foreground"}>
                              {charCount} / {igCharLimit} chars (Instagram Limit)
                            </span>
                            <span>&bull;</span>
                            <span className="text-muted-foreground">{hashtagCount} / 30 Hashtags</span>
                          </div>

                          {isIgOverLimit && (
                            <span className="text-xs bg-danger/10 text-danger px-2.5 py-1 rounded font-normal">
                              Exceeds Instagram Limit
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Copywriting Tone Dropdown */}
                      <div className="p-3 bg-secondary border border-border rounded-lg flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <label htmlFor="ai-tone-select" className="text-xs sm:text-sm font-normal text-muted-foreground">Select Copywriting Tone:</label>
                          <span className="text-xs sm:text-sm text-accent font-normal capitalize">
                            {aiTone === "custom" ? (customToneInput || "Custom Tone") : `${aiTone} Tone`} Active
                          </span>
                        </div>

                        <select
                          id="ai-tone-select"
                          value={aiTone}
                          onChange={(e) => setAiTone(e.target.value as any)}
                          className="w-full bg-card dark:bg-stone-900 border border-border dark:border-stone-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-foreground font-normal focus:outline-none focus:border-accent shadow-xs cursor-pointer transition-colors"
                        >
                          <option value="casual">Casual</option>
                          <option value="professional">Professional</option>
                          <option value="viral">Viral</option>
                          <option value="storytelling">Storytelling</option>
                          <option value="sales">Sales</option>
                          <option value="custom">Custom Tone...</option>
                        </select>

                        {aiTone === "custom" && (
                          <div className="p-3 bg-card border border-accent/40 rounded-xl space-y-1.5 shadow-sm">
                            <label className="text-xs sm:text-sm font-normal text-foreground flex items-center gap-1.5">
                              <Sliders className="w-4 h-4 text-accent" />
                              <span>Custom Tone:</span>
                            </label>
                            <input
                              type="text"
                              value={customToneInput}
                              onChange={(e) => setCustomToneInput(e.target.value)}
                              placeholder="e.g. Luxury Realtor, Humorous & Witty..."
                              className="w-full bg-secondary border border-border rounded-lg px-3.5 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-accent font-normal"
                            />
                          </div>
                        )}

                        <div className="pt-2 w-full">
                          <button
                            type="button"
                            onClick={handleGenerateAI}
                            disabled={isGenerating}
                            className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-normal rounded-xl flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] disabled:opacity-50"
                          >
                            <Sparkles className="w-4 h-4 animate-spin-none" />
                            <span>{isGenerating ? "Generating..." : "Generate AI Copy"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Divider Line at the Bottom of AI Prompt Section */}
                      <div className="pt-3 border-b border-border dark:border-stone-800" />
                    </div>
                  )}
                </div>
              )}

              {/* Panel 3: Dedicated AI Hashtags Sub-Nav Bar (Custom Hashtags | AI Hashtag Generator) */}
              {(composerTab === "all" || composerTab === "hashtags") && (
                <div className="space-y-4">
                  {/* Section Header Prompting User to Select / Choose Mode */}
                  <div className="pb-1">
                    <h3 className="text-base sm:text-lg font-normal text-foreground tracking-tight flex items-center gap-2">
                      <Hash className="w-5 h-5 text-accent" />
                      <span>Select Hashtag Source: Custom Hashtags or AI Generator</span>
                    </h3>
                  </div>

                  {/* AI Hashtags Inner Horizontal Navigation Bar */}
                  <WatermelonSubNav
                    items={[
                      { id: "custom", label: "Custom Hashtags", icon: Hash },
                      { id: "ai", label: "AI Hashtag Generator", icon: Sparkles },
                    ]}
                    activeTab={hashtagSubTab}
                    onTabChange={(tab) => setHashtagSubTab(tab as any)}
                    divider
                  />

                  {/* Single Shared Hashtags Textbox (Visible across BOTH Custom Hashtags & AI Generator sub-tabs!) */}
                  <div className="p-4 bg-secondary dark:bg-black border border-border dark:border-stone-800 rounded-2xl space-y-3.5 shadow-sm">
                    <label className="text-base sm:text-lg font-normal text-foreground block flex items-center gap-1.5">
                      <Hash className="w-5 h-5 text-accent" />
                      <span>Shared Hashtags Bank & Textbox</span>
                    </label>

                    <textarea
                      value={customHashtagsInput}
                      onChange={(e) => setCustomHashtagsInput(e.target.value)}
                      placeholder="Type or generate hashtags (e.g. #saas #growth #startup)... Text stays 100% synced across Custom & AI tabs!"
                      className="w-full h-28 bg-card dark:bg-stone-900 border border-border dark:border-stone-800 rounded-xl p-4 text-sm sm:text-base text-foreground font-normal focus:outline-none focus:border-accent placeholder:text-muted-foreground/60 shadow-xs"
                    />



                    {/* Mode B Sub-Controls: AI Topic Generator & Chips */}
                    {hashtagSubTab === "ai" && (
                      <div className="space-y-3.5 pt-2 border-t border-border/40 dark:border-stone-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-base sm:text-lg font-normal text-foreground">
                            <Sparkles className="w-5 h-5 text-accent" />
                            <span>AI Generator Controls</span>
                          </div>

                          <Link
                            href="/settings"
                            className="text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-normal px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                            title="Configure Google Gemini Studio API Key in Settings"
                          >
                            <Key className="w-4 h-4 text-white" />
                            <span>Gemini API Key</span>
                          </Link>
                        </div>

                        <div className="space-y-2.5">
                          <input
                            type="text"
                            value={hashtagTopic}
                            onChange={(e) => setHashtagTopic(e.target.value)}
                            placeholder="Enter topic or leave blank for auto-detect..."
                            className="w-full bg-card dark:bg-stone-900 border border-border dark:border-stone-800 rounded-xl px-4 py-3.5 text-sm sm:text-base text-foreground font-normal focus:outline-none focus:border-accent placeholder:text-muted-foreground/60 shadow-sm transition-colors"
                          />

                          <button
                            type="button"
                            onClick={handleGenerateHashtags}
                            disabled={isGeneratingHashtags}
                            className="w-full py-3.5 px-5 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-normal rounded-xl flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] disabled:opacity-50"
                          >
                            <RefreshCw className={`w-4 h-4 ${isGeneratingHashtags ? "animate-spin" : ""}`} />
                            <span>{isGeneratingHashtags ? "Generating..." : "Generate AI Hashtags"}</span>
                          </button>
                        </div>

                        {generatedHashtags.length > 0 && (
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm font-normal text-muted-foreground">Click to add to shared textbox & caption:</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const tagsStr = generatedHashtags.join(" ");
                                  setCustomHashtagsInput((prev) => cleanHashtagFormatting(prev ? `${prev} ${tagsStr}` : tagsStr));
                                }}
                                className="text-xs sm:text-sm text-accent hover:underline font-normal"
                              >
                                + Add All AI Tags
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {generatedHashtags.map((tag, idx) => {
                                const cleanTag = cleanHashtagFormatting(tag.startsWith("#") ? tag : `#${tag}`);
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      setCustomHashtagsInput((prev) => {
                                        if (prev.includes(cleanTag)) return prev;
                                        return cleanHashtagFormatting(prev ? `${prev} ${cleanTag}` : cleanTag);
                                      });
                                    }}
                                    className="px-3 py-1.5 bg-card dark:bg-stone-900 border border-border dark:border-stone-800 hover:border-accent text-foreground text-xs sm:text-sm font-normal rounded-xl transition-colors shadow-xs"
                                  >
                                    + {cleanTag}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Panel 4: Dual Media Attachment Bar & Media Format Selector */}
              {(composerTab === "all" || composerTab === "media") && (
                <div className="pt-4 border-t border-border space-y-4">
                  {/* Target Social Channels Section */}
                  <div className="p-4 bg-secondary/30 border border-border rounded-xl space-y-3 shadow-xs">
                    <WatermelonSectionHeader title="Target Social Channels:" icon={Globe} />
                    <WatermelonPlatformToggle selectedPlatforms={selectedPlatforms} onToggle={togglePlatform} />
                  </div>

                  {/* Prominent Large Square Button Cards for Media Format / Post Type */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-normal text-foreground block">Select Media Format / Post Type:</span>
                      <span className="text-xs text-accent font-normal capitalize flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{mediaFormatType.replace("_", " ")}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {[
                        { id: "image_post", label: "Image Post", subtitle: "1:1 Feed Image", perm: "instagram_content_publish", icon: ImageIcon, iconBg: "bg-blue-600", border: "border-blue-500", cardBg: "bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400" },
                        { id: "story_image", label: "Story (Image)", subtitle: "9:16 Vertical", perm: "instagram_content_publish", icon: Smartphone, iconBg: "bg-purple-600", border: "border-purple-500", cardBg: "bg-purple-50/80 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400" },
                        { id: "story_video", label: "Story (Video)", subtitle: "9:16 Reel/Video", perm: "instagram_content_publish", icon: Film, iconBg: "bg-pink-600", border: "border-pink-500", cardBg: "bg-pink-50/80 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400" },
                        { id: "video_post", label: "Video Post", subtitle: "16:9 Feed Video", perm: "pages_read_engagement", icon: Video, iconBg: "bg-amber-600", border: "border-amber-500", cardBg: "bg-amber-50/80 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" },
                        { id: "carousel", label: "Carousel", subtitle: "Multi-Slide Pack", perm: "instagram_content_publish", icon: Images, iconBg: "bg-emerald-600", border: "border-emerald-500", cardBg: "bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" },
                      ].map((fmt) => {
                        const IconComp = fmt.icon;
                        const isSelected = mediaFormatType === fmt.id;
                        return (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => setMediaFormatType(fmt.id as any)}
                            className={`aspect-square p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all shadow-md group cursor-pointer relative ${
                              isSelected
                                ? `${fmt.border} ${fmt.cardBg} ring-2 ring-accent/30 scale-[1.02] shadow-lg font-normal`
                                : "border-border bg-card hover:border-slate-400 text-foreground"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 shadow-sm transition-transform group-hover:scale-110 ${
                              isSelected
                                ? `${fmt.iconBg} text-white shadow-md`
                                : "bg-secondary text-foreground border border-border"
                            }`}>
                              <IconComp className={`w-5 h-5 stroke-[2] ${isSelected ? "text-white" : ""}`} />
                            </div>
                            <span className="text-xs font-normal leading-tight">{fmt.label}</span>
                            <span className={`text-[10px] font-normal mt-0.5 ${isSelected ? "opacity-90" : "text-muted-foreground"}`}>{fmt.subtitle}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>



                  {/* Hidden Format-Restricted File Input (Supports Multiple Files & Sequential Addition for Carousel) */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple={mediaFormatType === "carousel"}
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      const fileArray = Array.from(files);

                      setIsUploadingMedia(true);
                      setMediaIsPublic(null);

                      if (mediaFormatType === "carousel") {
                        // Show instant previews first
                        const previews = fileArray.map((f) => URL.createObjectURL(f));
                        setCarouselSlides((prev) => {
                          const updated = [...prev, ...previews];
                          setActiveCarouselIndex(updated.length - 1);
                          setMediaAssetUrl(updated[updated.length - 1]);
                          setMediaAssetName(`${updated.length} Carousel Items Attached`);
                          return updated;
                        });
                        // Upload each file and replace previews with public URLs
                        const publicUrls: string[] = [];
                        let allPublic = true;
                        for (const file of fileArray) {
                          try {
                            const { url, isPublic } = await uploadFileToServer(file);
                            publicUrls.push(url);
                            if (!isPublic) allPublic = false;
                          } catch {
                            publicUrls.push(URL.createObjectURL(file));
                            allPublic = false;
                          }
                        }
                        setCarouselSlides((prev) => {
                          const nonPreview = prev.filter(u => !u.startsWith("blob:"));
                          const updated = [...nonPreview, ...publicUrls];
                          setActiveCarouselIndex(updated.length - 1);
                          setMediaAssetUrl(updated[updated.length - 1]);
                          setMediaAssetName(`${updated.length} Carousel Items Attached`);
                          return updated;
                        });
                        setMediaIsPublic(allPublic);
                      } else {
                        const file = fileArray[0];
                        const previewUrl = URL.createObjectURL(file);
                        setMediaAssetUrl(previewUrl);
                        setMediaAssetName(file.name);
                        setCarouselSlides([previewUrl]);
                        setActiveCarouselIndex(0);
                        try {
                          const { url, isPublic } = await uploadFileToServer(file);
                          setMediaAssetUrl(url);
                          setCarouselSlides([url]);
                          setMediaIsPublic(isPublic);
                        } catch {
                          setMediaIsPublic(false);
                        }
                      }

                      setIsUploadingMedia(false);
                      // Reset file input value so sequential uploads always trigger onChange
                      e.target.value = "";
                    }}
                    accept={
                      mediaFormatType === "carousel" || mediaFormatType === "story_image" || mediaFormatType === "story_video"
                        ? "image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime"
                        : mediaFormatType === "image_post"
                        ? "image/png,image/jpeg,image/webp"
                        : "video/mp4,video/webm,video/quicktime"
                    }
                    className="hidden"
                  />

                  {/* Format-Based Dynamic Upload & Cloud Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-3.5 px-5 bg-card hover:bg-secondary border border-border text-foreground text-xs sm:text-sm font-normal rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm group cursor-pointer"
                    >
                      {mediaFormatType === "video_post" ? (
                        <Video className="w-4.5 h-4.5 text-accent group-hover:scale-110 transition-transform" />
                      ) : mediaFormatType === "image_post" ? (
                        <ImageIcon className="w-4.5 h-4.5 text-accent group-hover:scale-110 transition-transform" />
                      ) : (
                        <Images className="w-4.5 h-4.5 text-accent group-hover:scale-110 transition-transform" />
                      )}
                      <span>
                        {mediaFormatType === "carousel"
                          ? "Upload Multi-Slide Images / Videos"
                          : mediaFormatType === "story_image" || mediaFormatType === "story_video"
                          ? "Upload Story (Image / Video)"
                          : mediaFormatType === "image_post"
                          ? "Upload Image"
                          : "Upload Video"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        syncCloudLibrary();
                        setShowMediaPickerModal(true);
                      }}
                      className="py-3.5 px-5 bg-card hover:bg-secondary border border-border text-foreground text-xs sm:text-sm font-normal rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm group cursor-pointer"
                    >
                      <Paperclip className="w-4.5 h-4.5 text-primary group-hover:scale-110 transition-transform" />
                      <span>
                        {mediaFormatType === "carousel"
                          ? "Media Library (Carousel)"
                          : mediaFormatType === "story_image" || mediaFormatType === "story_video"
                          ? "Media Library (Story Image / Video)"
                          : mediaFormatType === "image_post"
                          ? "Media Library (Image Post)"
                          : "Media Library (Video Post)"}
                      </span>
                    </button>
                  </div>

                  {/* Upload Status Banner */}
                  {isUploadingMedia && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 border border-border rounded-xl px-4 py-2.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-accent shrink-0" />
                      <span>Uploading to public server for Meta posting…</span>
                    </div>
                  )}
                  {!isUploadingMedia && mediaIsPublic === true && mediaAssetUrl && (
                    <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-4 py-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Media uploaded — ready for Facebook and Instagram posting.</span>
                    </div>
                  )}
                  {!isUploadingMedia && mediaIsPublic === false && mediaAssetUrl && (
                    <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-2.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Local preview only — configure <code className="bg-secondary px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> in <code className="bg-secondary px-1 rounded">.env.local</code> for media posting.</span>
                    </div>
                  )}

                  {/* Multi-Slide Carousel Studio & Reordering Manager */}
                  {mediaFormatType === "carousel" && (
                    <div className="space-y-3 pt-3 border-t border-border bg-secondary/30 p-3.5 rounded-2xl">
                      <div className="text-xs">
                        <span className="font-normal text-foreground flex items-center gap-1.5">
                          <Images className="w-4 h-4 text-accent" />
                          <span>Carousel Slide Pack ({carouselSlides.length} Slides)</span>
                        </span>
                      </div>

                      {carouselSlides.length > 0 ? (
                        <div className="space-y-2">
                          {carouselSlides.map((slideUrl, idx) => (
                            <div
                              key={idx}
                              draggable
                              onDragStart={(e) => {
                                setDraggedIndex(idx);
                                e.dataTransfer.effectAllowed = "move";
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = "move";
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (draggedIndex !== null && draggedIndex !== idx) {
                                  handleReorderSlides(draggedIndex, idx);
                                  setDraggedIndex(null);
                                }
                              }}
                              onClick={() => {
                                setActiveCarouselIndex(idx);
                                setMediaAssetUrl(slideUrl);
                              }}
                              className={`p-2.5 rounded-xl border-2 flex items-center justify-between gap-3 transition-all cursor-grab active:cursor-grabbing select-none ${
                                draggedIndex === idx ? "opacity-40 border-dashed border-accent scale-98" : ""
                              } ${
                                activeCarouselIndex === idx
                                  ? "border-accent bg-card dark:bg-stone-900 ring-2 ring-accent/30 shadow-md"
                                  : "border-border bg-card hover:border-accent/40"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {/* Hamburger / Grip Handle Icon */}
                                <div className="p-1 rounded text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing shrink-0" title="Drag / Reorder Handle">
                                  <GripVertical className="w-4.5 h-4.5" />
                                </div>
                                <span className="text-xs font-normal text-muted-foreground shrink-0 w-6">#{idx + 1}</span>
                                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-border shadow-2xs">
                                  <img src={slideUrl} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-normal text-foreground truncate">Carousel Slide #{idx + 1}</div>
                                  <div className="text-[10px] text-muted-foreground font-normal">Click to preview in Live Simulator</div>
                                </div>
                              </div>

                              {/* Vertical Reorder (Up ↑ / Down ↓) & Delete Controls */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveCarouselSlideLeft(idx);
                                  }}
                                  className="p-1.5 rounded-lg bg-secondary hover:bg-border text-foreground disabled:opacity-30 disabled:hover:bg-secondary cursor-pointer"
                                  title="Move Up (↑)"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  disabled={idx === carouselSlides.length - 1}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveCarouselSlideRight(idx);
                                  }}
                                  className="p-1.5 rounded-lg bg-secondary hover:bg-border text-foreground disabled:opacity-30 disabled:hover:bg-secondary cursor-pointer"
                                  title="Move Down (↓)"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeCarouselSlide(idx);
                                  }}
                                  className="p-1.5 rounded-lg bg-danger/10 hover:bg-danger text-danger hover:text-white transition-colors cursor-pointer"
                                  title="Remove Slide"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="p-6 border-2 border-dashed border-border rounded-xl text-center space-y-1.5 cursor-pointer hover:bg-secondary transition-colors"
                        >
                          <Plus className="w-6 h-6 text-accent mx-auto" />
                          <div className="text-xs font-normal text-foreground">No slides in carousel yet</div>
                          <p className="text-[11px] text-muted-foreground font-normal">Click + Add Slide below to add items one by one</p>
                        </div>
                      )}

                      {/* Prominent White + Add Slide Button Placed Below */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 px-4 bg-card hover:bg-secondary border border-border text-foreground text-xs sm:text-sm font-normal rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01] cursor-pointer mt-2"
                      >
                        <Plus className="w-4 h-4 text-accent" />
                        <span>+ Add Slide</span>
                      </button>
                    </div>
                  )}



                  {mediaAssetUrl && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={promptRemoveMedia}
                        className="text-xs text-danger font-normal hover:underline"
                      >
                        Remove Attached Media
                      </button>
                    </div>
                  )}

                  {mediaAssetUrl && (
                    <div className="p-3 bg-secondary border border-border rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5 truncate">
                        <ImageIcon className="w-4 h-4 text-accent shrink-0" />
                        <span className="text-xs font-normal text-foreground truncate">
                          {mediaAssetName || "Attached Media Image"}
                        </span>
                      </div>
                      <span className="text-[10px] bg-accent/10 text-accent font-normal px-2.5 py-1 rounded-lg border border-accent/30 shrink-0">
                        Active Attachment
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Panel 5: Post / Scheduled Controls */}
              {(composerTab === "all" || composerTab === "schedule") && (
                <div className="pt-4 border-t border-border space-y-4">
                  {/* Common Target Social Channels Selector (Prominent High-Impact Sizing) */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-base sm:text-lg font-normal text-foreground flex items-center gap-1.5">
                        <Globe className="w-4.5 h-4.5 text-accent" />
                        <span>Target Social Channels:</span>
                      </span>
                      <span className="text-xs text-muted-foreground font-normal">Meta Graph API v19.0</span>
                    </div>

                    <div className="p-2 bg-secondary dark:bg-black border border-border dark:border-stone-800 rounded-2xl flex items-center gap-2.5 text-sm sm:text-base font-normal w-full shadow-md">
                      <button
                        type="button"
                        onClick={() => togglePlatform("facebook")}
                        className={`flex-1 py-3.5 px-6 rounded-xl border text-sm sm:text-base font-normal flex items-center justify-center gap-2.5 transition-all ${
                          selectedPlatforms.includes("facebook")
                            ? "bg-[#1877F2] text-white border-[#1877F2] shadow-md scale-[1.01]"
                            : "bg-card dark:bg-stone-900 text-muted-foreground dark:text-slate-300 border-border dark:border-stone-800 hover:border-[#1877F2]/50"
                        }`}
                      >
                        <SocialIcon platform="facebook" className="w-5 h-5" />
                        <span>Facebook Page</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => togglePlatform("instagram")}
                        className={`flex-1 py-3.5 px-6 rounded-xl border text-sm sm:text-base font-normal flex items-center justify-center gap-2.5 transition-all ${
                          selectedPlatforms.includes("instagram")
                            ? "bg-[#E4405F] text-white border-[#E4405F] shadow-md scale-[1.01]"
                            : "bg-card dark:bg-stone-900 text-muted-foreground dark:text-slate-300 border-border dark:border-stone-800 hover:border-[#E4405F]/50"
                        }`}
                      >
                        <SocialIcon platform="instagram" className="w-5 h-5" />
                        <span>Instagram Business</span>
                      </button>
                    </div>
                  </div>

                  {/* Divider Line with Spacing Above Post Now / Scheduled Post Nav Bar */}
                  <div className="pt-2 border-t border-border dark:border-stone-800" />

                  {/* Section Label: Posting Type */}
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-sm sm:text-base font-normal text-foreground flex items-center gap-1.5">
                      <Clock className="w-4.5 h-4.5 text-accent" />
                      <span>Posting Type:</span>
                    </span>
                    <span className="text-xs text-accent font-normal capitalize">
                      {postActionMode === "publish_now" ? "Immediate Post" : "Scheduled Post"} Active
                    </span>
                  </div>

                  {/* Inner Horizontal Navigation Bar: Post Now vs Scheduled Post */}
                  <WatermelonSubNav
                    items={[
                      { id: "publish_now", label: "Post Now", icon: Send },
                      { id: "schedule", label: "Scheduled Post", icon: CalendarIcon },
                    ]}
                    activeTab={postActionMode}
                    onTabChange={(tab) => setPostActionMode(tab as any)}
                    divider
                  />

                  {/* Mode 1: Post Now Action View */}
                  {postActionMode === "publish_now" && (
                    <div className="p-4 bg-secondary border border-border rounded-xl space-y-3">
                      <div className="flex items-center justify-between text-base sm:text-lg font-normal text-foreground">
                        <span className="flex items-center gap-1.5">
                          <Send className="w-5 h-5 text-accent" />
                          <span>Publish Live Now:</span>
                        </span>
                        <span className="text-xs text-accent font-normal">Instant Queue</span>
                      </div>

                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Publish active post copy and attached media instantly to selected social channels.
                      </p>

                      <button
                        type="button"
                        onClick={handlePublishNow}
                        disabled={isPublishing}
                        className="w-full py-4 px-6 bg-danger hover:bg-danger/90 text-white text-sm sm:text-base font-normal rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-md hover:scale-[1.01] disabled:opacity-50"
                      >
                        {isPublishing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        <span>{isPublishing ? "Publishing..." : "Publish Now"}</span>
                      </button>
                    </div>
                  )}

                  {/* Mode 2: Scheduled Post Action View */}
                  {postActionMode === "schedule" && (
                    <div className="p-4 bg-secondary border border-border rounded-xl space-y-3">
                      <div className="flex items-center justify-between text-base sm:text-lg font-normal text-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-5 h-5 text-accent" />
                          <span>Schedule Post Queue:</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <LiveClock />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-normal text-muted-foreground block">Select Date</label>
                          <input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            className="bg-card border border-border dark:border-stone-800 rounded-xl px-4 py-3 text-sm sm:text-base text-foreground font-normal focus:outline-none focus:border-accent shadow-sm w-full transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-normal text-muted-foreground block">Select Time</label>
                          <input
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="bg-card border border-border dark:border-stone-800 rounded-xl px-4 py-3 text-sm sm:text-base text-foreground font-normal focus:outline-none focus:border-accent shadow-sm w-full transition-colors"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleScheduleForLater}
                        className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-normal rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-md hover:scale-[1.01]"
                      >
                        <CalendarIcon className="w-5 h-5" />
                        <span>Schedule Post</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Social Feed Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card border border-border p-5 rounded-xl space-y-4">
            <div className="space-y-3 pb-3 border-b border-border">
              <div>
                <h2 className="text-base sm:text-lg font-normal text-foreground">Live Feed Simulator</h2>
                <p className="text-xs text-muted-foreground mt-0.5 font-normal">Preview how your post will render live on social feeds</p>
              </div>

              {/* Mobile / PC Viewport Toggle Navigation Bar Below Text (Prominent High-Impact Size) */}
              <WatermelonSubNav
                items={[
                  { id: "mobile", label: "Mobile View", icon: Smartphone },
                  { id: "desktop", label: "PC View", icon: Monitor },
                ]}
                activeTab={deviceView}
                onTabChange={(tab) => setDeviceView(tab as any)}
              />
            </div>

            {/* Feed Container - Dynamically Render Only Selected Channels from Target Social Channels */}
            <div className="space-y-4">
              {selectedPlatforms.length === 0 && (
                <div className="p-6 bg-secondary border border-dashed border-border rounded-xl text-center space-y-2">
                  <Globe className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-xs font-normal text-foreground">No Target Social Channels Selected</p>
                  <p className="text-[11px] text-muted-foreground">Select Facebook Page or Instagram Business above to enable live feed preview.</p>
                </div>
              )}

              {/* TOP VIEW: Instagram App View (Rendered if Instagram is selected) */}
              {selectedPlatforms.includes("instagram") && (
                <div
                  className={`p-4 bg-secondary border border-border rounded-xl space-y-3 transition-all duration-300 ${
                    deviceView === "mobile" ? "max-w-xs mx-auto shadow-md" : "w-full"
                  }`}
                >
                  {/* Instagram App Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-normal text-white text-xs bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-sm">
                        <SocialIcon platform="instagram" className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-normal text-foreground">
                          <span>socialpulse_official</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <span>Just now</span>
                          <span>&bull;</span>
                          <span>Original Audio</span>
                        </div>
                      </div>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground cursor-pointer" />
                  </div>

                  {/* Feed Copy Content */}
                  <div className="text-xs sm:text-sm text-foreground font-normal leading-relaxed whitespace-pre-wrap p-1">
                    {activeCopyText || "Your live post copy preview will appear here as you type..."}
                  </div>

                  {/* Media Container with Format Specific Ratio & Badge */}
                  <div className={`relative w-full ${mediaFormatType === "story_image" || mediaFormatType === "story_video" ? "h-64 sm:h-72" : mediaFormatType === "video_post" ? "h-44" : "h-52"} bg-card border border-border rounded-xl overflow-hidden flex items-center justify-center shadow-sm group`}>
                    {mediaFormatType === "carousel" && carouselSlides.length > 0 ? (
                      /* Clean Single-Slide Active View with Navigation Arrows & Dots (Zero Scrollbars / Horizontal Slider) */
                      <div className="relative w-full h-full flex items-center justify-center">
                        {isVideoMedia(carouselSlides[activeCarouselIndex] || mediaAssetUrl, mediaFormatType) ? (
                          <video
                            src={carouselSlides[activeCarouselIndex] || mediaAssetUrl || ""}
                            controls
                            playsInline
                            preload="metadata"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={carouselSlides[activeCarouselIndex] || mediaAssetUrl || carouselSlides[0]}
                            alt={`Carousel Slide ${activeCarouselIndex + 1}`}
                            className="w-full h-full object-cover transition-opacity duration-200"
                          />
                        )}

                        {/* Interactive Navigation Arrows */}
                        {carouselSlides.length > 1 && (
                          <>
                            <button
                              type="button"
                              disabled={activeCarouselIndex === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                const newIdx = Math.max(0, activeCarouselIndex - 1);
                                setActiveCarouselIndex(newIdx);
                                setMediaAssetUrl(carouselSlides[newIdx]);
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center shadow-md disabled:opacity-20 transition-all cursor-pointer z-10"
                              title="Previous Slide"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              disabled={activeCarouselIndex === carouselSlides.length - 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                const newIdx = Math.min(carouselSlides.length - 1, activeCarouselIndex + 1);
                                setActiveCarouselIndex(newIdx);
                                setMediaAssetUrl(carouselSlides[newIdx]);
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center shadow-md disabled:opacity-20 transition-all cursor-pointer z-10"
                              title="Next Slide"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    ) : mediaAssetUrl ? (
                      isVideoMedia(mediaAssetUrl, mediaFormatType) ? (
                        <video
                          src={mediaAssetUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img src={mediaAssetUrl} alt="Attached Preview" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="text-center text-xs text-muted-foreground space-y-1.5">
                        <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto" />
                        <span className="font-normal">No media attached</span>
                      </div>
                    )}

                    {/* Format Pill Overlay Badge */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="text-[10px] font-normal px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-md bg-black/70 text-white border-white/20">
                        {mediaFormatType === "image_post"
                          ? "Image Post (1:1)"
                          : mediaFormatType === "story_image"
                          ? "Story Image (9:16)"
                          : mediaFormatType === "story_video"
                          ? "Story Video (9:16)"
                          : mediaFormatType === "video_post"
                          ? "Video Post (16:9)"
                          : `Carousel (Slide ${activeCarouselIndex + 1}/${carouselSlides.length || 1})`}
                      </span>
                    </div>

                    {/* Carousel Multi-Slide Interactive Dots Overlay */}
                    {mediaFormatType === "carousel" && (
                      <div className="absolute bottom-2.5 inset-x-0 flex justify-center items-center gap-1.5 z-10">
                        {(carouselSlides.length > 0 ? carouselSlides : [1, 2, 3, 4]).map((_, idx) => (
                          <span
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (carouselSlides[idx]) {
                                setActiveCarouselIndex(idx);
                                setMediaAssetUrl(carouselSlides[idx]);
                                if (carouselContainerRef.current) {
                                  carouselContainerRef.current.scrollTo({
                                    left: idx * carouselContainerRef.current.clientWidth,
                                    behavior: "smooth",
                                  });
                                }
                              }
                            }}
                            className={`rounded-full transition-all cursor-pointer ${
                              activeCarouselIndex === idx
                                ? "w-2.5 h-2.5 bg-white shadow-md scale-110"
                                : "w-1.5 h-1.5 bg-white/60 hover:bg-white"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Instagram Interaction Bar */}
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <Heart
                        onClick={() => {
                          setSimulatedLiked(!simulatedLiked);
                          setSimulatedLikesCount(simulatedLiked ? simulatedLikesCount - 1 : simulatedLikesCount + 1);
                        }}
                        className={`w-5 h-5 cursor-pointer hover:scale-110 transition-transform ${
                          simulatedLiked ? "fill-current text-[#E4405F]" : "text-muted-foreground hover:text-[#E4405F]"
                        }`}
                      />
                      <MessageCircle className="w-5 h-5 cursor-pointer hover:text-foreground transition-colors" />
                      <Share2 className="w-5 h-5 cursor-pointer hover:text-foreground transition-colors" />
                    </div>
                    <Bookmark
                      onClick={() => setSimulatedSaved(!simulatedSaved)}
                      className={`w-5 h-5 cursor-pointer hover:scale-110 transition-transform ${
                        simulatedSaved ? "fill-current text-accent" : "text-muted-foreground hover:text-foreground"
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* BOTTOM VIEW: Facebook App View (Rendered if Facebook is selected) */}
              {selectedPlatforms.includes("facebook") && (
                <div
                  className={`p-4 bg-secondary border border-border rounded-xl space-y-3 transition-all duration-300 ${
                    deviceView === "mobile" ? "max-w-xs mx-auto shadow-md" : "w-full"
                  }`}
                >
                  {/* Facebook App Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-normal text-white text-xs bg-[#1877F2] shadow-sm">
                        <SocialIcon platform="facebook" className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-normal text-foreground">
                          <span>SocialPulse AI Page</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <span>Just now</span>
                          <span>&bull;</span>
                          <span>Public 🌐</span>
                        </div>
                      </div>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground cursor-pointer" />
                  </div>

                  {/* Feed Copy Content */}
                  <div className="text-xs sm:text-sm text-foreground font-normal leading-relaxed whitespace-pre-wrap p-1">
                    {activeCopyText || "Your live post copy preview will appear here as you type..."}
                  </div>

                  {/* Media Container */}
                  <div className="relative w-full h-52 bg-card border border-border rounded-xl overflow-hidden flex items-center justify-center shadow-sm">
                    {mediaAssetUrl ? (
                      isVideoMedia(mediaAssetUrl, mediaFormatType) ? (
                        <video
                          src={mediaAssetUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img src={mediaAssetUrl} alt="Attached Preview" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="text-center text-xs text-muted-foreground space-y-1.5">
                        <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto" />
                        <span className="font-normal">No media attached</span>
                      </div>
                    )}
                  </div>

                  {/* Facebook Interaction Bar */}
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs sm:text-sm text-muted-foreground font-normal">
                    <button
                      type="button"
                      onClick={() => {
                        setSimulatedLiked(!simulatedLiked);
                        setSimulatedLikesCount(simulatedLiked ? simulatedLikesCount - 1 : simulatedLikesCount + 1);
                      }}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
                        simulatedLiked ? "bg-[#1877F2]/10 text-[#1877F2]" : "hover:bg-card"
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${simulatedLiked ? "fill-current text-[#1877F2]" : "text-[#1877F2]"}`} />
                      <span>{simulatedLiked ? "Liked" : "Like"}</span>
                    </button>
                    <button type="button" className="px-3 py-1.5 hover:bg-card rounded-lg flex items-center gap-2 transition-colors">
                      <MessageCircle className="w-4 h-4 text-accent" />
                      <span>Comment</span>
                    </button>
                    <button type="button" className="px-3 py-1.5 hover:bg-card rounded-lg flex items-center gap-2 transition-colors">
                      <Share2 className="w-4 h-4 text-accent" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attach Media from Library Modal */}
      <WatermelonModal
        isOpen={showMediaPickerModal}
        onClose={() => setShowMediaPickerModal(false)}
        title={`Select ${mediaFormatType.replace("_", " ").toUpperCase()} Asset`}
      >
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Showing cloud assets matching format <strong className="text-accent font-normal capitalize">{mediaFormatType.replace("_", " ")}</strong>:
          </p>
          <div className="grid grid-cols-2 gap-3">
            {filteredPickerItems.length === 0 ? (
              <div className="col-span-2 p-6 border border-dashed border-border rounded-xl text-center text-xs text-muted-foreground">
                No media assets found matching {mediaFormatType.replace("_", " ")} format.
              </div>
            ) : (
              filteredPickerItems.map((item) => (
                <div
                  key={item.id}
                  className="p-2 bg-secondary border border-border hover:border-accent rounded-xl space-y-2 group shadow-sm transition-all relative"
                >
                  <div
                    onClick={() => {
                      if (mediaFormatType === "carousel") {
                        setCarouselSlides((prev) => {
                          const updated = [...prev, item.url];
                          setActiveCarouselIndex(updated.length - 1);
                          setMediaAssetUrl(item.url);
                          setMediaAssetName(`${updated.length} Carousel Items Attached`);
                          return updated;
                        });
                      } else {
                        setMediaAssetUrl(item.url);
                        setMediaAssetName(item.name);
                        setCarouselSlides([item.url]);
                        setActiveCarouselIndex(0);
                      }
                      setShowMediaPickerModal(false);
                    }}
                    className="cursor-pointer"
                  >
                    <div className="w-full h-24 rounded-lg overflow-hidden relative">
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      {(item.format === "story_video" || item.format === "video_post" || item.format === "video") && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="w-7 h-7 rounded-full bg-white/90 text-slate-900 flex items-center justify-center">
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-normal text-foreground truncate mt-1">{item.name}</div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const updated = cloudMediaList.filter((m) => m.id !== item.id);
                      setCloudMediaList(updated);
                      try {
                        localStorage.setItem("social_media_library_v2", JSON.stringify(updated));
                        localStorage.setItem("social_media_library_v1", JSON.stringify(updated));
                      } catch {}
                      if (item.url.includes("supabase.co")) {
                        fetch("/api/media/delete", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ url: item.url }),
                        }).catch(() => {});
                      }
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-danger text-white rounded-lg shadow-md hover:scale-110 transition-transform"
                    title="Delete Asset Permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </WatermelonModal>

      {/* Delete Confirmation Modal */}
      <WatermelonConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        description={confirmState.description}
        confirmText="Clear / Remove"
        cancelText="Cancel"
      />
    </div>
  );
}
