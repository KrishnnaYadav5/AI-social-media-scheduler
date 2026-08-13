"use client";

import { useEffect, useState } from "react";

export function LiveClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dateString = now.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' });
      const timeString = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      setTime(`${dateString} - ${timeString}`);
    };

    // Set initial time immediately
    updateDateTime();

    const timer = setInterval(updateDateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!time) return null; // Avoid hydration mismatch on first render

  return (
    <span className="text-sm font-medium font-mono bg-white text-black px-4 py-2 rounded-md border border-gray-200 shadow-sm">
      {time}
    </span>
  );
}
