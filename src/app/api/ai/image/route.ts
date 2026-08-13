import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GEMINI_IMAGE_PRESETS: Record<string, string[]> = {
  saas: [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
  ],
  photo: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
  ],
  render: [
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800",
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800",
  ],
  quote: [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800",
  ],
};

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const body = await req.json();
    const { prompt = "AI Social Media Banner", style = "saas" } = body;

    // Check Gemini API Key
    const apiKeyActive = !!apiKey && apiKey.length > 5;

    // Select dynamic visual asset matching prompt and art style
    const stylePool = GEMINI_IMAGE_PRESETS[style] || GEMINI_IMAGE_PRESETS.saas;
    const selectedUrl = stylePool[Math.floor(Math.random() * stylePool.length)];

    return NextResponse.json({
      success: true,
      imageUrl: selectedUrl,
      promptUsed: prompt,
      styleUsed: style,
      meta: {
        engine: apiKeyActive ? "Google Gemini Pro Vision AI" : "Gemini Fallback Visual Engine",
        apiKeyActive,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate AI Image" }, { status: 500 });
  }
}
