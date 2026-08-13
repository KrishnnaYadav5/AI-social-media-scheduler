import { NextResponse } from "next/server";
import { postService } from "@/services/post.service";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const postId = params.id;
    const success = await postService.executePublish(postId);
    return NextResponse.json({ success, postId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
