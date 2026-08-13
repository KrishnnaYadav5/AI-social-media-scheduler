import { NextResponse } from "next/server";
import { postsService, activityLogsService } from "@/lib/supabase-service";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const post = await postsService.getById(params.id);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json({ post });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    await postsService.update(params.id, body);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await postsService.delete(params.id);
    await activityLogsService.log("delete_post", "Deleted post " + params.id, { postId: params.id });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
