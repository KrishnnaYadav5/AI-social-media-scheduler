"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 select-none">
      <div className="text-center space-y-2">
        <h1 className="text-base font-normal text-foreground">Loading SocialPulse AI...</h1>
        <p className="text-xs text-muted-foreground">Redirecting to Dashboard Workspace</p>
      </div>
    </div>
  );
}
