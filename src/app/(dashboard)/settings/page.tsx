"use client";

import React, { useState } from "react";
import { useTheme } from "@/components/providers/theme.provider";
import {
  User,
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Shield,
  Trash2,
  Sparkles,
  Settings as SettingsIcon,
  RefreshCw,
} from "lucide-react";
import { WatermelonConfirmModal } from "@/components/ui/watermelon-confirm-modal";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  // User Profile State
  const [displayName, setDisplayName] = useState("Demo SaaS Admin");
  const [email, setEmail] = useState("admin@socialpulse.ai");
  const [timezone, setTimezone] = useState("UTC");

  // Gemini API Key state
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [savedKeyExists, setSavedKeyExists] = useState(true);
  const [testingKey, setTestingKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [keyStatusMessage, setKeyStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const handleTestKey = async () => {
    const keyToTest = geminiApiKey.trim();
    setTestingKey(true);
    setKeyStatusMessage(null);
    try {
      const res = await fetch("/api/settings/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: keyToTest, action: "test" }),
      });
      const data = await res.json();
      if (data.valid) {
        setKeyStatusMessage({ type: "success", text: "Google Gemini API Key connection verified successfully!" });
      } else {
        setKeyStatusMessage({ type: "error", text: "Invalid Gemini API Key or connection failed." });
      }
    } catch (err: any) {
      setKeyStatusMessage({ type: "error", text: err.message });
    } finally {
      setTestingKey(false);
    }
  };

  const handleSaveKey = async () => {
    const keyToSave = geminiApiKey.trim();

    if (!keyToSave) {
      setKeyStatusMessage({ type: "error", text: "Please enter your Gemini API key before saving." });
      return;
    }

    setSavingKey(true);
    setKeyStatusMessage(null);
    try {
      const res = await fetch("/api/settings/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: keyToSave, action: "save" }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedKeyExists(true);
        setKeyStatusMessage({ type: "success", text: "API Key encrypted (AES-256-GCM) and saved to database!" });
      } else {
        setKeyStatusMessage({ type: "error", text: data.error || "Failed to save key." });
      }
    } catch (err: any) {
      setKeyStatusMessage({ type: "error", text: err.message });
    } finally {
      setSavingKey(false);
    }
  };

  const handleConfirmRemoveKey = async () => {
    setShowRemoveConfirm(false);
    try {
      await fetch("/api/settings/ai", { method: "DELETE" });
      setSavedKeyExists(false);
      setGeminiApiKey("");
      setKeyStatusMessage({ type: "success", text: "API Key removed from database." });
    } catch (err: any) {
      setKeyStatusMessage({ type: "error", text: err.message });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto pb-24">
      {/* Title */}
      <div className="pb-4 border-b border-border">
        <h1 className="text-xl sm:text-2xl font-normal text-foreground tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-accent" />
          <span>Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-normal">
          Manage user profile, Gemini API keys, appearance theme, and integration credentials
        </p>
      </div>

      {/* Profile Settings */}
      <div className="bg-card border border-border p-6 rounded-2xl space-y-5 shadow-md">
        <h2 className="text-sm sm:text-base font-normal text-foreground flex items-center gap-2 pb-2 border-b border-border">
          <User className="w-5 h-5 text-accent" />
          <span>User Profile</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-normal text-foreground block">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent font-normal transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-normal text-foreground block">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent font-normal transition-colors"
            />
          </div>

          <div className="space-y-2 sm:col-span-1">
            <label className="text-sm font-normal text-foreground block">Default Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent font-normal transition-colors"
            >
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="America/New_York">EST (Eastern Standard Time)</option>
              <option value="Europe/London">GMT (Greenwich Mean Time)</option>
              <option value="Asia/Tokyo">JST (Japan Standard Time)</option>
            </select>
          </div>

          <div className="space-y-2 sm:col-span-1">
            <label className="text-sm font-normal text-foreground block">QStash Queue Timezone</label>
            <div className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground font-normal flex items-center justify-between cursor-not-allowed">
              <span>{Intl.DateTimeFormat().resolvedOptions().timeZone} (Auto-Detected)</span>
              <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full border border-accent/20">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Appearance & Theme Settings */}
      <div className="bg-card border border-border p-6 rounded-2xl space-y-5 shadow-md">
        <h2 className="text-sm sm:text-base font-normal text-foreground pb-2 border-b border-border">
          Appearance Theme
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`py-3.5 px-4 rounded-xl text-xs sm:text-sm font-normal flex items-center justify-center gap-2 border transition-all shadow-sm ${
              theme === "dark"
                ? "bg-accent text-white border-accent shadow-md"
                : "bg-secondary text-foreground border-border hover:border-accent/50"
            }`}
          >
            <Moon className="w-4 h-4" /> <span>Dark Mode</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`py-3.5 px-4 rounded-xl text-xs sm:text-sm font-normal flex items-center justify-center gap-2 border transition-all shadow-sm ${
              theme === "light"
                ? "bg-accent text-white border-accent shadow-md"
                : "bg-secondary text-foreground border-border hover:border-accent/50"
            }`}
          >
            <Sun className="w-4 h-4" /> <span>Light Mode</span>
          </button>
        </div>
      </div>

      {/* Encrypted Gemini API Key Settings */}
      <div className="bg-card border border-border p-6 rounded-2xl space-y-5 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <h2 className="text-sm sm:text-base font-normal text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <span>Google Gemini Studio API Key</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1 font-normal">
              Key is encrypted with AES-256-GCM before storage in Neon DB and never exposed to client
            </p>
          </div>

          {savedKeyExists && (
            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs px-3 py-1.5 rounded-full font-normal flex items-center gap-1.5 shrink-0">
              <Shield className="w-4 h-4 text-emerald-500" /> Key Saved & Encrypted
            </span>
          )}
        </div>

        {keyStatusMessage && (
          <div
            className={`p-4 rounded-xl border text-xs sm:text-sm font-normal flex items-center gap-2.5 ${
              keyStatusMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-danger/10 border-danger/30 text-danger"
            }`}
          >
            {keyStatusMessage.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span>{keyStatusMessage.text}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-normal text-foreground block">Enter Gemini API Key</label>
            <input
              type="text"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder={savedKeyExists ? "••••••••••••••••••••" : "AIzaSy..."}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent font-mono transition-colors"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSaveKey}
              disabled={savingKey}
              className="py-3 px-5 bg-accent hover:bg-accent/90 text-white text-xs sm:text-sm font-normal rounded-xl flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01]"
            >
              <RefreshCw className={`w-4 h-4 ${savingKey ? "animate-spin" : ""}`} />
              <span>{savingKey ? "Encrypting & Saving..." : "Save Encrypted Key"}</span>
            </button>

            <button
              type="button"
              onClick={handleTestKey}
              disabled={testingKey}
              className="py-3 px-5 bg-secondary hover:bg-border border border-border text-foreground text-xs sm:text-sm font-normal rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-accent ${testingKey ? "animate-spin" : ""}`} />
              <span>{testingKey ? "Testing..." : "Test Connection"}</span>
            </button>

            {savedKeyExists && (
              <button
                type="button"
                onClick={() => setShowRemoveConfirm(true)}
                className="py-3 px-5 bg-danger hover:bg-danger/90 text-white text-xs sm:text-sm font-normal rounded-xl flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01]"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Stored Key</span>
              </button>
            )}
          </div>
        </div>
      </div>





      {/* Safety Confirmation Modal */}
      <WatermelonConfirmModal
        isOpen={showRemoveConfirm}
        onClose={() => setShowRemoveConfirm(false)}
        onConfirm={handleConfirmRemoveKey}
        title="Remove Gemini API Key?"
        description="Are you sure you want to remove your saved Gemini API Key? AI copy generation features will revert to system defaults."
        confirmText="Remove Key"
        cancelText="Cancel"
      />
    </div>
  );
}
