"use client";

import React from "react";
import { Zap, RefreshCw } from "lucide-react";
import { WatermelonBadge } from "./watermelon-badge";

interface CacheTelemetryBadgeProps {
  cached: boolean;
  renderTimeMs: number;
  cacheKey: string;
  onRevalidate?: () => void;
}

export function CacheTelemetryBadge({
  cached,
  renderTimeMs,
  cacheKey,
  onRevalidate,
}: CacheTelemetryBadgeProps) {
  return (
    <div className="p-3 bg-secondary border border-border rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-foreground">
      <div className="flex items-center gap-2">
        <Zap className={`w-4 h-4 ${cached ? "text-accent" : "text-warning"}`} />
        <div>
          <span className="font-normal">Server Render Cache:</span>{" "}
          <span className="text-muted-foreground">{cacheKey}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <WatermelonBadge variant={cached ? "accent" : "warning"}>
          {cached ? `CACHE HIT (${renderTimeMs}ms)` : `CACHE MISS / REGENERATED (${renderTimeMs}ms)`}
        </WatermelonBadge>

        {onRevalidate && (
          <button
            onClick={onRevalidate}
            className="p-1.5 bg-card hover:bg-border border border-border rounded text-foreground flex items-center gap-1 font-normal text-[11px]"
            title="Purge & Revalidate Cache Tag"
          >
            <RefreshCw className="w-3 h-3 text-primary" />
            <span>Revalidate Tag</span>
          </button>
        )}
      </div>
    </div>
  );
}
