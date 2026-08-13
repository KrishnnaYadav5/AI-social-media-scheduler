"use client";

import React, { useState } from "react";
import { WatermelonCard } from "./watermelon-card";
import { WatermelonBadge } from "./watermelon-badge";

interface PointData {
  label: string;
  count: number;
}

interface WatermelonChartCardProps {
  title: string;
  subtitle?: string;
  data: PointData[];
  totalLabel?: string;
}

export function WatermelonChartCard({
  title,
  subtitle,
  data,
  totalLabel = "Total Volume",
}: WatermelonChartCardProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const viewBoxWidth = 500;
  const viewBoxHeight = 180;
  const paddingX = 35;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = viewBoxWidth - paddingX * 2;
  const chartHeight = viewBoxHeight - paddingTop - paddingBottom;

  const points = data.map((item, i) => {
    const x =
      data.length > 1
        ? paddingX + (i / (data.length - 1)) * chartWidth
        : viewBoxWidth / 2;
    const ratio = item.count / maxCount;
    const y = viewBoxHeight - paddingBottom - ratio * chartHeight;
    return { x, y, label: item.label, count: item.count };
  });

  // Construct smooth cubic bezier curve path
  let curvePath = "";
  if (points.length > 0) {
    curvePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      curvePath += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
  }

  const fillPath = points.length > 0
    ? `${curvePath} L ${points[points.length - 1].x} ${viewBoxHeight - paddingBottom} L ${points[0].x} ${viewBoxHeight - paddingBottom} Z`
    : "";

  return (
    <WatermelonCard
      title={title}
      subtitle={subtitle}
      action={<WatermelonBadge variant="accent">{totalLabel}</WatermelonBadge>}
    >
      <div className="relative w-full h-56 pt-2">
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent, #1877F2)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--accent, #1877F2)" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Baseline Lines */}
          <line
            x1={paddingX}
            y1={viewBoxHeight - paddingBottom}
            x2={viewBoxWidth - paddingX}
            y2={viewBoxHeight - paddingBottom}
            stroke="var(--border, #e5e7eb)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={viewBoxWidth - paddingX}
            y2={paddingTop}
            stroke="var(--border, #e5e7eb)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Area Gradient Fill Under Curve */}
          {fillPath && (
            <path d={fillPath} fill="url(#curveGradient)" className="transition-all duration-300" />
          )}

          {/* Smooth Curve Line */}
          {curvePath && (
            <path
              d={curvePath}
              fill="none"
              stroke="var(--accent, #1877F2)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              className="transition-all duration-300"
            />
          )}

          {/* Data Points Dots & Labels */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g
                key={pt.label}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer group"
              >
                {/* Outer halo on hover */}
                {isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="8"
                    fill="var(--accent, #1877F2)"
                    fillOpacity="0.2"
                    className="animate-ping"
                  />
                )}

                {/* Point Dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? "5.5" : "4"}
                  fill="var(--accent, #1877F2)"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />

                {/* Tooltip value callout */}
                <text
                  x={pt.x}
                  y={pt.y - 10}
                  textAnchor="middle"
                  className={`text-[10px] font-normal transition-opacity duration-200 ${
                    isHovered ? "fill-accent font-normal" : "fill-foreground/80"
                  }`}
                >
                  {pt.count.toLocaleString()}
                </text>

                {/* X-Axis Label */}
                <text
                  x={pt.x}
                  y={viewBoxHeight - 10}
                  textAnchor="middle"
                  className="text-[10px] fill-muted-foreground font-normal"
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </WatermelonCard>
  );
}
