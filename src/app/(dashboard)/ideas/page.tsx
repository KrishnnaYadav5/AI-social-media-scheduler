"use client";

import React, { useState, useEffect } from "react";
import { Plus, Sparkles, Search, Move, Trash2, Zap, Layers, ChevronRight, Lightbulb, CheckCircle2 } from "lucide-react";
import { WatermelonKanbanCard } from "@/components/ui/watermelon-kanban-card";
import { WatermelonModal } from "@/components/ui/watermelon-modal";
import { WatermelonConfirmModal } from "@/components/ui/watermelon-confirm-modal";

interface IdeaCard {
  id: string;
  title: string;
  description: string;
  status: "idea" | "review" | "approved" | "production";
  tags: string[];
  images?: string[];
  color?: string;
}

const STORAGE_KEY = "watermelonsaas_ideas_clean_v5";

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<IdeaCard[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAiIdeasModal, setShowAiIdeasModal] = useState(false);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [targetColumnForCreate, setTargetColumnForCreate] = useState<"idea" | "review" | "approved" | "production">("idea");
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Confirmation modal state
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Delete",
    onConfirm: () => {},
  });

  // New Idea form
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newColor, setNewColor] = useState("default");

  // Edit Idea Form State
  const [editingIdea, setEditingIdea] = useState<IdeaCard | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState<"idea" | "review" | "approved" | "production">("idea");
  const [editTags, setEditTags] = useState("");
  const [editColor, setEditColor] = useState("default");

  // AI Idea Generator
  const [aiTopic, setAiTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiIdeasResult, setAiIdeasResult] = useState<Array<{ title: string; description: string; tags: string[] }>>([]);

  // Multi-Select Idea Cards State & Handlers
  const [selectedIdeaIds, setSelectedIdeaIds] = useState<string[]>([]);

  const handleToggleSelectIdea = (id: string) => {
    setSelectedIdeaIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const promptDeleteSelectedIdeas = () => {
    if (selectedIdeaIds.length === 0) return;
    setConfirmModalState({
      isOpen: true,
      title: `Delete ${selectedIdeaIds.length} Selected Ideas?`,
      description: `Are you sure you want to delete ${selectedIdeaIds.length} selected idea cards? This action cannot be undone.`,
      confirmText: `Delete ${selectedIdeaIds.length} Ideas`,
      onConfirm: () => {
        const newList = ideas.filter((item) => !selectedIdeaIds.includes(item.id));
        updateAndSaveIdeas(newList);
        setSelectedIdeaIds([]);
        setNoticeMessage(`${selectedIdeaIds.length} idea card(s) permanently removed.`);
        setTimeout(() => setNoticeMessage(null), 3000);
      },
    });
  };

  const columns: Array<{
    id: "idea" | "review" | "approved" | "production";
    label: string;
    color: string;
    badgeStyle: string;
    emptyText: string;
  }> = [
    {
      id: "idea",
      label: "Backlog",
      color: "#64748B",
      badgeStyle: "bg-slate-500/10 border border-slate-500/30 text-slate-600 dark:text-slate-300 font-normal",
      emptyText: "No ideas in backlog. Click + to add an idea.",
    },
    {
      id: "review",
      label: "Review",
      color: "#F59E0B",
      badgeStyle: "bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-normal",
      emptyText: "Drag top ideas here to review with your team.",
    },
    {
      id: "approved",
      label: "Approved",
      color: "#10B981",
      badgeStyle: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-normal",
      emptyText: "Approved concepts ready to convert into live posts.",
    },
    {
      id: "production",
      label: "Post",
      color: "#6366F1",
      badgeStyle: "bg-accent/10 border border-accent/30 text-accent font-normal",
      emptyText: "Approved concepts ready to convert into live posts.",
    },
  ];

  // Load saved user ideas on mount
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY);
      if (savedRaw) {
        setIdeas(JSON.parse(savedRaw));
      } else {
        // Initial mock ideas
        const initialMock: IdeaCard[] = [
          { id: "idea_1", title: "Product Launch Reel", description: "Highlight key SaaS features with fast pace audio", status: "idea", tags: ["launch", "reel"] },
          { id: "idea_2", title: "Customer Success Story", description: "Case study post featuring 350% ROI metrics", status: "review", tags: ["case-study"] },
          { id: "idea_3", title: "AI Prompt Hacks Carousel", description: "5 essential ChatGPT prompts for social copy", status: "approved", tags: ["ai", "carousel"] },
        ];
        setIdeas(initialMock);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const updateAndSaveIdeas = (newList: IdeaCard[]) => {
    setIdeas(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch (e) {}
  };

  const promptDeleteIdea = (id: string) => {
    setConfirmModalState({
      isOpen: true,
      title: "Delete Content Idea?",
      description: "Are you sure you want to delete this content idea? This item will be permanently removed from your board.",
      confirmText: "Delete Idea",
      onConfirm: () => {
        const newList = ideas.filter((item) => item.id !== id);
        updateAndSaveIdeas(newList);
        setNoticeMessage("Idea card removed from board.");
        setTimeout(() => setNoticeMessage(null), 3000);
      },
    });
  };

  const promptClearAllIdeas = () => {
    setConfirmModalState({
      isOpen: true,
      title: "Clear All Ideas from Board?",
      description: "Are you sure you want to clear all ideas? This action cannot be undone and will delete all cards on your board.",
      confirmText: "Clear All Ideas",
      onConfirm: () => {
        updateAndSaveIdeas([]);
        setNoticeMessage("All idea cards cleared.");
        setTimeout(() => setNoticeMessage(null), 3000);
      },
    });
  };

  const handleCreateIdea = () => {
    if (!newTitle) return;
    const card: IdeaCard = {
      id: `idea_${Date.now()}`,
      title: newTitle,
      description: newDesc,
      status: targetColumnForCreate,
      color: newColor,
      tags: newTag.trim() ? newTag.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };
    updateAndSaveIdeas([...ideas, card]);
    setNewTitle("");
    setNewDesc("");
    setNewTag("");
    setNewColor("default");
    setShowCreateModal(false);
    setNoticeMessage(`Added "${newTitle}" to board!`);
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  const handleOpenCreateForCol = (colId: "idea" | "review" | "approved" | "production") => {
    setTargetColumnForCreate(colId);
    setShowCreateModal(true);
  };

  const handleMoveStatus = (id: string, newStatus: "idea" | "review" | "approved" | "production") => {
    updateAndSaveIdeas(ideas.map((i) => (i.id === id ? { ...i, status: newStatus } : i)));
  };

  const handleMoveLeft = (id: string) => {
    const card = ideas.find((i) => i.id === id);
    if (!card) return;
    const order: Array<"idea" | "review" | "approved" | "production"> = ["idea", "review", "approved", "production"];
    const currentIndex = order.indexOf(card.status);
    if (currentIndex > 0) {
      handleMoveStatus(id, order[currentIndex - 1]);
    }
  };

  const handleMoveRight = (id: string) => {
    const card = ideas.find((i) => i.id === id);
    if (!card) return;
    const order: Array<"idea" | "review" | "approved" | "production"> = ["idea", "review", "approved", "production"];
    const currentIndex = order.indexOf(card.status);
    if (currentIndex < order.length - 1) {
      handleMoveStatus(id, order[currentIndex + 1]);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedCardId(id);
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: "idea" | "review" | "approved" | "production") => {
    e.preventDefault();
    setDragOverCol(null);
    const id = e.dataTransfer.getData("text/plain") || draggedCardId;
    if (id) {
      handleMoveStatus(id, targetStatus);
      setDraggedCardId(null);
    }
  };

  const handleGenerateAiIdeas = async () => {
    if (!aiTopic) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic, count: 4 }),
      });
      const data = await res.json();
      if (data.ideas) {
        setAiIdeasResult(data.ideas);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const addAiIdeaToBoard = (idea: { title: string; description: string; tags: string[] }) => {
    const card: IdeaCard = {
      id: `idea_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      title: idea.title,
      description: idea.description,
      status: "idea",
      tags: idea.tags || ["ai-generated"],
    };
    updateAndSaveIdeas([...ideas, card]);
    setNoticeMessage(`Added AI idea "${idea.title}" to Backlog!`);
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  // Re-Edit Idea Card Handlers
  const handleOpenEdit = (id: string) => {
    const card = ideas.find((i) => i.id === id);
    if (!card) return;
    setEditingIdea(card);
    setEditTitle(card.title);
    setEditDesc(card.description);
    setEditStatus(card.status);
    setEditTags(card.tags.join(", "));
    setEditColor(card.color || "default");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIdea || !editTitle.trim()) return;

    const updated = ideas.map((item) =>
      item.id === editingIdea.id
        ? {
            ...item,
            title: editTitle.trim(),
            description: editDesc.trim(),
            status: editStatus,
            color: editColor,
            tags: editTags.trim()
              ? editTags.split(",").map((t) => t.trim()).filter(Boolean)
              : [],
          }
        : item
    );
    updateAndSaveIdeas(updated);
    setEditingIdea(null);
    setNoticeMessage(`Updated content idea "${editTitle.trim()}"!`);
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  // Pipeline Counts
  const totalIdeas = ideas.length || 1;
  const backlogCount = ideas.filter((i) => i.status === "idea").length;
  const reviewCount = ideas.filter((i) => i.status === "review").length;
  const approvedCount = ideas.filter((i) => i.status === "approved").length;
  const productionCount = ideas.filter((i) => i.status === "production").length;

  const [activeColFilter, setActiveColFilter] = useState<"all" | "idea" | "review" | "approved" | "production">("all");

  const visibleColumns = columns.filter((col) => {
    if (activeColFilter === "all") return true;
    return col.id === activeColFilter;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-normal text-foreground tracking-tight flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-accent" />
              <span>Ideas</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-normal">
            Brainstorm, review, and turn ideas into live posts
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {ideas.length > 0 && (
            <>
              {selectedIdeaIds.length > 0 ? (
                <button
                  type="button"
                  onClick={promptDeleteSelectedIdeas}
                  className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-normal rounded-xl flex items-center gap-2 shadow-md transition-all hover:scale-[1.02]"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                  <span>Delete Selected ({selectedIdeaIds.length})</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (selectedIdeaIds.length === ideas.length) {
                      setSelectedIdeaIds([]);
                    } else {
                      setSelectedIdeaIds(ideas.map((i) => i.id));
                    }
                  }}
                  className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white border border-red-600 text-xs sm:text-sm font-normal rounded-xl flex items-center gap-2 shadow-md transition-all hover:scale-[1.02]"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                  <span>Select & Delete</span>
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => setShowAiIdeasModal(true)}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-normal rounded-xl flex items-center gap-2 shadow-md transition-all hover:scale-[1.01]"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>AI Ideas Generator</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenCreateForCol("idea")}
            className="px-5 py-3 bg-white hover:bg-slate-100 text-black border border-slate-300 text-xs sm:text-sm font-normal rounded-xl flex items-center gap-2 shadow-md transition-all hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Create Idea</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {noticeMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs sm:text-sm font-normal flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Sub-Nav Toolbar - Simplified Stage Filters & Search Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl space-y-4 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Stage Navigation Sub-Tabs */}
          <div className="p-1.5 bg-secondary dark:bg-black border border-border dark:border-stone-800 rounded-2xl flex items-center gap-1.5 text-xs sm:text-sm font-normal overflow-x-auto whitespace-nowrap shadow-sm w-full lg:w-auto">
            {[
              { id: "all", label: "All Stages", count: ideas.length },
              { id: "idea", label: "Backlog", count: backlogCount },
              { id: "review", label: "Review", count: reviewCount },
              { id: "approved", label: "Approved", count: approvedCount },
              { id: "production", label: "Post", count: productionCount },
            ].map((tab) => {
              const isActive = activeColFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveColFilter(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2 shrink-0 ${
                    isActive
                      ? "bg-card dark:bg-white text-foreground dark:text-slate-900 shadow-md font-normal border border-border/50 dark:border-none scale-[1.01]"
                      : "text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white font-normal"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-xs px-2 py-0.5 font-normal rounded-full transition-colors ${
                      isActive
                        ? "bg-accent text-white dark:bg-slate-900 dark:text-white"
                        : "bg-card dark:bg-stone-800 text-muted-foreground dark:text-slate-300 border border-border/60 dark:border-stone-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search idea cards..."
              className="w-full bg-secondary dark:bg-black border border-border dark:border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:border-accent font-normal placeholder:text-muted-foreground/60 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Clean Ideas Kanban Grid */}
      <div
        className={`grid gap-5 ${
          activeColFilter === "all"
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
            : "grid-cols-1 max-w-2xl mx-auto"
        }`}
      >
        {visibleColumns.map((col) => {
          const colIdeas = ideas.filter(
            (i) => i.status === col.id && (!searchQuery || i.title.toLowerCase().includes(searchQuery.toLowerCase()))
          );
          const isOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`bg-secondary/40 dark:bg-black p-4.5 rounded-none border-none space-y-4 min-h-[580px] h-full flex flex-col transition-all shadow-sm ${
                isOver ? "ring-2 ring-accent bg-accent/5" : ""
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-border dark:border-stone-800 pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col.color }}></span>
                  <span className="text-xs sm:text-sm font-normal text-foreground dark:text-white tracking-tight">{col.label}</span>
                  <span className="bg-card dark:bg-stone-900 border border-border dark:border-stone-800 text-foreground dark:text-white px-2.5 py-0.5 rounded-full text-xs font-normal shadow-xs">
                    {colIdeas.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenCreateForCol(col.id)}
                  className="p-1.5 bg-card dark:bg-stone-900 border border-border dark:border-stone-800 rounded-xl text-foreground dark:text-white hover:bg-accent hover:text-white transition-all text-xs font-normal flex items-center gap-1 shadow-xs"
                  title={`Add idea to ${col.label}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Cards Container */}
              <div className="space-y-3.5 flex-1">
                {colIdeas.length === 0 ? (
                  <div className="p-8 border border-dashed border-border dark:border-stone-800 rounded-xl text-center text-xs text-muted-foreground bg-card/30 dark:bg-stone-900/30 leading-relaxed font-normal flex-1 flex items-center justify-center min-h-[180px]">
                    {col.emptyText}
                  </div>
                ) : (
                  colIdeas.map((idea) => (
                    <WatermelonKanbanCard
                      key={idea.id}
                      id={idea.id}
                      title={idea.title}
                      description={idea.description}
                      status={idea.status}
                      tags={idea.tags}
                      images={idea.images}
                      color={idea.color || "default"}
                      isSelected={selectedIdeaIds.includes(idea.id)}
                      onToggleSelect={handleToggleSelectIdea}
                      onEdit={handleOpenEdit}
                      onDelete={promptDeleteIdea}
                      onMoveLeft={col.id !== "idea" ? handleMoveLeft : undefined}
                      onMoveRight={col.id !== "production" ? handleMoveRight : undefined}
                      onDragStart={handleDragStart}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Idea Modal */}
      <WatermelonModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Content Idea">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
              <label className="text-xs font-normal text-foreground block">Title</label>
              <span className="text-[11px] text-muted-foreground font-normal">
                (Internal title — will not be converted into post)
              </span>
            </div>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter idea headline..."
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-accent font-normal"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-normal text-foreground block">Description</label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Detailed description of the concept idea..."
              className="w-full h-28 bg-secondary border border-border rounded-xl p-4 text-xs sm:text-sm text-foreground focus:outline-none focus:border-accent font-normal"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-normal text-foreground block">Accent Color</label>
            <div className="flex items-center gap-2.5">
              {[
                { id: "default", bg: "bg-slate-400" },
                { id: "emerald", bg: "bg-emerald-500" },
                { id: "blue", bg: "bg-blue-500" },
                { id: "amber", bg: "bg-amber-500" },
                { id: "rose", bg: "bg-rose-500" },
                { id: "purple", bg: "bg-purple-500" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setNewColor(c.id)}
                  className={`w-7 h-7 rounded-full ${c.bg} transition-all flex items-center justify-center ${
                    newColor === c.id ? "ring-2 ring-foreground scale-110 shadow-md" : "opacity-60 hover:opacity-100"
                  }`}
                  title={`${c.id} accent color`}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateIdea}
            className="w-full py-3.5 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-normal rounded-xl shadow-md transition-all hover:scale-[1.01] mt-2"
          >
            Add Idea to Board
          </button>
        </div>
      </WatermelonModal>

      {/* AI Ideas Generator Modal */}
      <WatermelonModal isOpen={showAiIdeasModal} onClose={() => setShowAiIdeasModal(false)} title="Gemini AI Ideas Generator">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-foreground block">Topic or Niche</label>
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="e.g. AI productivity, E-commerce growth"
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-accent font-normal"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerateAiIdeas}
            disabled={aiLoading}
            className="w-full py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-normal rounded-xl shadow-md transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{aiLoading ? "Generating Ideas..." : "Generate 4 Ideas"}</span>
          </button>

          {aiIdeasResult.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-border">
              <label className="text-xs font-normal text-foreground">Generated Ideas:</label>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {aiIdeasResult.map((idea, idx) => (
                  <div key={idx} className="p-3.5 bg-secondary border border-border rounded-xl flex items-center justify-between gap-3 shadow-sm">
                    <div>
                      <div className="text-xs font-normal text-foreground">{idea.title}</div>
                      <div className="text-[11px] text-muted-foreground font-normal mt-0.5">{idea.description}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => addAiIdeaToBoard(idea)}
                      className="px-3.5 py-1.5 bg-accent hover:bg-accent/90 text-white text-xs font-normal rounded-lg shadow-sm shrink-0"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </WatermelonModal>

      {/* Edit Content Idea Modal (Ultra Clean & Minimal) */}
      <WatermelonModal isOpen={editingIdea !== null} onClose={() => setEditingIdea(null)} title="Edit Content Idea">
        {editingIdea && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                <label className="text-xs font-normal text-foreground block">Idea Title</label>
                <span className="text-[11px] text-muted-foreground font-normal">
                  (Internal title — will not be converted into post)
                </span>
              </div>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Edit idea headline..."
                className="w-full bg-secondary border border-border dark:border-stone-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-accent font-normal shadow-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-normal text-foreground block">Description & Concept</label>
              <textarea
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Edit idea concept outline..."
                className="w-full bg-secondary border border-border dark:border-stone-800 rounded-xl p-3.5 text-xs sm:text-sm text-foreground focus:outline-none focus:border-accent font-normal leading-relaxed shadow-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-normal text-foreground block">Pipeline Stage</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full bg-secondary border border-border dark:border-stone-800 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-foreground font-normal focus:outline-none shadow-xs"
                >
                  <option value="idea">Backlog</option>
                  <option value="review">Review</option>
                  <option value="approved">Approved</option>
                  <option value="production">Post</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-normal text-foreground block">Tags (comma separated)</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="e.g. strategy, campaign, viral"
                  className="w-full bg-secondary border border-border dark:border-stone-800 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-accent font-normal shadow-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-normal text-foreground block">Accent Color</label>
              <div className="flex items-center gap-2.5">
                {[
                  { id: "default", bg: "bg-slate-400" },
                  { id: "emerald", bg: "bg-emerald-500" },
                  { id: "blue", bg: "bg-blue-500" },
                  { id: "amber", bg: "bg-amber-500" },
                  { id: "rose", bg: "bg-rose-500" },
                  { id: "purple", bg: "bg-purple-500" },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setEditColor(c.id)}
                    className={`w-7 h-7 rounded-full ${c.bg} transition-all flex items-center justify-center ${
                      editColor === c.id ? "ring-2 ring-foreground scale-110 shadow-md" : "opacity-60 hover:opacity-100"
                    }`}
                    title={`${c.id} accent color`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border dark:border-stone-800">
              <button
                type="button"
                onClick={() => setEditingIdea(null)}
                className="px-4 py-2.5 bg-secondary border border-border text-foreground text-xs font-normal rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-normal rounded-xl shadow-md transition-all hover:scale-[1.01]"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </WatermelonModal>

      {/* Delete Confirmation Modal */}
      <WatermelonConfirmModal
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalState.onConfirm}
        title={confirmModalState.title}
        description={confirmModalState.description}
        confirmText={confirmModalState.confirmText}
        cancelText="Cancel"
      />
    </div>
  );
}
