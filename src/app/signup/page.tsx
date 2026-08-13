"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bot, ShieldCheck, Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/providers/auth.provider";

export default function SignUpPage() {
  const { signUp, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordStrength = (() => {
    if (password.length === 0) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passwordStrength];
  const strengthColor = ["", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-emerald-500"][passwordStrength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const result = await signUp(email.trim(), password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const signInResult = await signIn(email.trim(), password);
    if (signInResult.error) {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black text-foreground flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[400px] text-center space-y-6 bg-zinc-950 border border-zinc-800 p-6 sm:p-7 rounded-2xl shadow-2xl">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-normal text-white tracking-tight">Check your email</h1>
            <p className="text-zinc-400 text-xs sm:text-sm font-normal leading-relaxed">
              We sent a confirmation link to <span className="text-white font-normal">{email}</span>. Click it to activate your account.
            </p>
          </div>
          <Link href="/login" className="inline-flex items-center gap-2 text-white hover:underline text-xs sm:text-sm font-normal transition-colors pt-2">
            <ArrowRight className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col items-center justify-center p-4 sm:p-6 relative selection:bg-white selection:text-black">
      <div className="w-full max-w-[400px] space-y-6 relative z-10">

        {/* Header Block */}
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center justify-center gap-2.5 px-3 py-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 mb-1">
            <Bot className="w-4 h-4 text-white" />
            <span className="text-white font-normal text-xs sm:text-sm tracking-tight">SocialPulse AI</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-normal text-white tracking-tight">Create an account</h1>
          <p className="text-zinc-400 text-xs sm:text-sm font-normal">Start scheduling your content for free</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm p-4 rounded-xl">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-zinc-950 border border-zinc-800 p-6 sm:p-7 rounded-2xl space-y-4 shadow-2xl">
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
            <label className="text-zinc-300 text-xs sm:text-sm font-normal block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
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
            {/* Password strength meter */}
            {password.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex gap-1">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength ? strengthColor : "bg-zinc-800"}`} />
                  ))}
                </div>
                <span className={`text-[11px] font-normal ${["","text-red-400","text-yellow-400","text-blue-400","text-emerald-400"][passwordStrength]}`}>
                  {strengthLabel} password
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label className="text-zinc-300 text-xs sm:text-sm font-normal block">Confirm password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
                className={`w-full bg-zinc-900 border text-white placeholder:text-zinc-600 text-xs sm:text-sm pl-10 pr-11 py-3 rounded-xl outline-none transition-colors font-normal ${
                  confirmPassword && confirmPassword !== password
                    ? "border-red-500/40 focus:border-red-500/60"
                    : confirmPassword && confirmPassword === password
                    ? "border-emerald-500/40 focus:border-emerald-500/60"
                    : "border-zinc-800 focus:border-zinc-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {confirmPassword && confirmPassword === password && (
                <CheckCircle2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
              )}
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
              <span>{loading ? "Creating account..." : "Create Account"}</span>
            </button>
          </div>
        </form>

        {/* Divider & Switch Link */}
        <div className="space-y-4 text-center">
          <p className="text-zinc-400 text-xs sm:text-sm font-normal">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:underline font-normal transition-colors">
              Sign in
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