import { NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { postService } from "@/services/post.service";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("upstash-signature");

    const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
    const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;
    const qstashRegion = process.env.QSTASH_REGION || "US_EAST_1";

    // Verify signature if keys are populated and not placeholders
    if (
      signature &&
      currentSigningKey &&
      !currentSigningKey.includes("placeholder") &&
      nextSigningKey &&
      !nextSigningKey.includes("placeholder")
    ) {
      const receiver = new Receiver({
        currentSigningKey,
        nextSigningKey,
      });

      const isValid = await receiver.verify({
        signature,
        body: rawBody,
      });

      if (!isValid) {
        return NextResponse.json({ error: "Invalid QStash Webhook Signature" }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);
    const { postId, action } = body;

    if (!postId || action !== "execute_publish") {
      return NextResponse.json({ error: "Invalid QStash payload" }, { status: 400 });
    }

    console.log(`[QStash Webhook] Region (${qstashRegion}) - Triggered publishing execution for Post ID: ${postId}`);
    const success = await postService.executePublish(postId);

    return NextResponse.json({ success, postId, region: qstashRegion });
  } catch (err: any) {
    console.error("QStash Webhook Error:", err);
    return NextResponse.json({ error: err.message || "Webhook processing failed" }, { status: 500 });
  }
}
