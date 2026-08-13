import { NextResponse } from "next/server";
import { aiService } from "@/services/ai.service";

const DEMO_USER_ID = "usr_demo_123456";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { topic, count } = body;

    const sanitizedTopic = typeof topic === "string" && topic.trim() ? topic.trim() : "Social Media Growth";
    const sanitizedCount = Math.min(Math.max(Number(count) || 4, 1), 10);

    const ideas = await aiService.generateIdeas(DEMO_USER_ID, sanitizedTopic, sanitizedCount);
    return NextResponse.json({ ideas, topic: sanitizedTopic, count: ideas.length });
  } catch (err: any) {
    console.error("[API Error /api/ai/ideas]:", err);
    return NextResponse.json(
      { error: err?.message || "AI idea generation failed" },
      { status: 500 }
    );
  }
}
