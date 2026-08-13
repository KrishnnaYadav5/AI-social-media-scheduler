"use client";

import React from "react";

interface PlatformShare {
  name: string;
  count: number;
  percentage: number;
  color: string;
  platformKey: "facebook" | "instagram";
}

interface WatermelonPieChartProps {
  data?: PlatformShare[];
}

const defaultData: PlatformShare[] = [
  {
    name: "Facebook Page",
    platformKey: "facebook",
    count: 30,
    percentage: 62.5,
    color: "#1877F2", // Facebook Blue
  },
  {
    name: "Instagram Feed",
    platformKey: "instagram",
    count: 18,
    percentage: 37.5,
    color: "#FF3366", // Instagram Pink
  },
];

export function WatermelonPieChart({ data = defaultData }: WatermelonPieChartProps) {
  // Calculate SVG Pie slice angles
  const totalCount = data.reduce((acc, item) => acc + item.count, 0);

  // SVG Circle Parameters for Pie Chart
  const size = 160;
  const center = size / 2;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercentage = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-2 select-none">
      {/* SVG Pie Chart */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {data.map((item) => {
            const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercentage / 100) * circumference);
            accumulatedPercentage += item.percentage;

            return (
              <circle
                key={item.platformKey}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="32"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
              />
            );
          })}
        </svg>

        {/* Center Total Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-normal text-foreground">{totalCount}</span>
          <span className="text-[10px] font-normal text-muted-foreground uppercase">Total Posts</span>
        </div>
      </div>

      {/* Platform Legend with Pink (Instagram) & Blue (Facebook) */}
      <div className="space-y-3 flex-1 w-full">
        {data.map((item) => (
          <div key={item.platformKey} className="p-3 bg-secondary border border-border rounded space-y-1.5">
            <div className="flex items-center justify-between text-xs font-normal">
              <div className="flex items-center gap-2">
                <span
                  style={{ backgroundColor: item.color }}
                  className="w-3 h-3 rounded-full inline-block"
                ></span>
                <span className="text-foreground">{item.name}</span>
              </div>
              <span className="text-foreground">{item.percentage}% ({item.count} Posts)</span>
            </div>

            <div className="w-full h-2 bg-card border border-border rounded overflow-hidden">
              <div
                style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                className="h-full"
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
