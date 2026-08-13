"use client";

import React, { useState } from "react";
import { Sparkles, Wand2, Hash, FileText, RefreshCw, Maximize2, MessageSquare } from "lucide-react";
import { WatermelonButton } from "./watermelon-button";

interface WatermelonPromptBoxProps {
  onGenerate: (prompt: string, action: string, tone: string) => void;
  currentContent?: string;
  loading?: boolean;
}

export function WatermelonPromptBox({ onGenerate, currentContent = "", loading = false }: WatermelonPromptBoxProps) {
  const [prompt, setPrompt] = useState("");
  const [action, setAction] = useState("generate_post");
  const [tone, setTone] = useState("professional");

  const executeGeneration = (targetAction?: string, targetPrompt?: string) => {
    const finalAction = targetAction || action;
    const finalPrompt = targetPrompt || prompt.trim() || currentContent.trim() || "social media strategy and growth tips";
    onGenerate(finalPrompt, finalAction, tone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeGeneration();
  };

  const handleChipClick = (chipAction: string) => {
    setAction(chipAction);
    executeGeneration(chipAction);
  };

  return (
    <div className="bg-card border border-border py-6 px-6 rounded space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-normal text-foreground">Watermelon.io AI Caption Engine</span>
        </div>
        <span className="text-[10px] bg-accent/20 text-accent font-normal px-2.5 py-1 rounded border border-accent/30 uppercase">
          Google Gemini AI
        </span>
      </div>

      {/* Quick Action Chips */}
      <div className="grid grid-cols-2 sm:flex sm:items-center sm:overflow-x-auto gap-2 py-1">
        {[
          { id: "generate_post", label: "Complete Post", icon: FileText },
          { id: "generate_caption", label: "Catchy Caption", icon: MessageSquare },
          { id: "rewrite", label: "Instant Rewrite", icon: RefreshCw },
          { id: "expand", label: "Expand Copy", icon: Maximize2 },
          { id: "generate_hashtags", label: "Top 10 Hashtags", icon: Hash },
        ].map((chip) => {
          const Icon = chip.icon;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => handleChipClick(chip.id)}
              className={`px-3 py-2 rounded text-[11px] font-normal border text-center flex items-center justify-center gap-1.5 transition-colors ${
                action === chip.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-muted-foreground border-border hover:border-primary hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type any text or prompt here (e.g. 'write 10 hashtags for fitness tips' or 'launching new software')..."
          className="w-full h-28 bg-secondary border border-border rounded p-3 text-xs text-foreground focus:outline-none placeholder:text-muted-foreground/60"
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground font-normal">Tone:</span>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full sm:w-auto bg-secondary border border-border rounded p-2 text-xs text-foreground font-normal"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual & Friendly</option>
              <option value="bold">Bold & Direct</option>
              <option value="persuasive">Persuasive Sales</option>
            </select>
          </div>

          <WatermelonButton variant="primary" size="md" type="submit" disabled={loading} className="w-full sm:w-auto">
            <Wand2 className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Generating..." : "Generate AI Copy"}</span>
          </WatermelonButton>
        </div>
      </form>
    </div>
  );
}
