"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bot, ShieldCheck, Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/providers/auth.provider";

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setError(null);
    setLoading(true);
    const result = await signIn(email.trim(), password);
    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col items-center justify-center p-4 sm:p-6 relative selection:bg-white selection:text-black">
      <div className="w-full max-w-[400px] space-y-6 relative z-10">
        
        {/* Header Block */}
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center justify-center gap-2.5 px-3 py-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 mb-1">
            <Bot className="w-4 h-4 text-white" />
            <span className="text-white font-normal text-xs sm:text-sm tracking-tight">SocialPulse AI</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-normal text-white tracking-tight">Welcome back</h1>
          <p className="text-zinc-400 text-xs sm:text-sm font-normal">Sign in to access your social media dashboard</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm p-4 rounded-xl">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-zinc-950 border border-zinc-800 p-6 sm:p-7 rounded-2xl space-y-5 shadow-2xl">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-zinc-300 text-xs sm:text-sm font-normal block">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                required
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white placeholder:text-zinc-600 text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl outline-none transition-colors font-normal"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-zinc-300 text-xs sm:text-sm font-normal block">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 text-white placeholder:text-zinc-600 text-xs sm:text-sm pl-10 pr-11 py-3 rounded-xl outline-none transition-colors font-normal"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 active:bg-zinc-300 text-black font-normal text-xs sm:text-sm py-3.5 rounded-xl shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              <span>{loading ? "Signing in..." : "Sign In"}</span>
            </button>
          </div>
        </form>

        {/* Divider & Switch Link */}
        <div className="space-y-4 text-center">
          <p className="text-zinc-400 text-xs sm:text-sm font-normal">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-white hover:underline font-normal transition-colors">
              Create one free
            </Link>
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-zinc-500 text-[11px] font-normal pt-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>End-to-end encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span>Secured by Supabase</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}