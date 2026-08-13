"use client";

import { useEffect, useState } from "react";

export function LiveQueueManager() {
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" }[]>([]);

  useEffect(() => {
    // Check every 10 seconds for overdue posts to simulate a live daemon
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/posts/catchup", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          if (data.executed && data.executed.length > 0) {
            const newToasts = data.executed.map((id: string) => ({
              id: `success_${id}_${Date.now()}`,
              message: "Scheduled post was just published live to your social media!",
              type: "success" as const,
            }));
            setToasts((prev) => [...prev, ...newToasts]);
            
            // Auto-refresh the page slightly after to update the feeds
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          }
          if (data.failed && data.failed.length > 0) {
            const newToasts = data.failed.map((id: string) => ({
              id: `error_${id}_${Date.now()}`,
              message: "A scheduled post failed to publish. Check analytics or logs.",
              type: "error" as const,
            }));
            setToasts((prev) => [...prev, ...newToasts]);
          }
        }
      } catch (err) {
        // Silently fail if network is down
      }
      setLastCheck(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Remove toasts after 5 seconds
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-xl text-sm font-medium border animate-in slide-in-from-bottom-5 fade-in duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800"
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
