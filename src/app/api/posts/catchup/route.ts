import { NextResponse } from "next/server";
import { postsService } from "@/lib/supabase-service";
import { postService } from "@/services/post.service";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { DEMO_USER_ID } from "@/lib/supabase";

async function getUserId(): Promise<string> {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? DEMO_USER_ID;
  } catch {
    return DEMO_USER_ID;
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    const posts = await postsService.getAll("scheduled", userId);
    const overduePosts = posts.filter(p => p.status === "scheduled" && p.scheduled_at && new Date(p.scheduled_at).getTime() <= Date.now());
    
    const executed: string[] = [];
    const failed: string[] = [];

    for (const p of overduePosts) {
      try {
        const success = await postService.executePublish(p.id);
        if (success) {
          executed.push(p.id);
        } else {
          failed.push(p.id);
        }
      } catch (e) {
        console.error(`Failed to execute catchup for ${p.id}:`, e);
        failed.push(p.id);
      }
    }

    return NextResponse.json({ executed, failed, totalFound: overduePosts.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
