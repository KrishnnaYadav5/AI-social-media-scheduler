import { NextResponse } from "next/server";
import { ideasService } from "@/services/ideas.service";

const DEMO_USER_ID = "usr_demo_123456";

export async function GET(req: Request) {
  try {
    const list = await ideasService.getIdeas(DEMO_USER_ID);
    return NextResponse.json({ ideas: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, tags, images, action, ideaId, targetPlatforms } = body;

    if (action === "convert" && ideaId) {
      const postId = await ideasService.convertToDraft(ideaId, DEMO_USER_ID, targetPlatforms);
      return NextResponse.json({ success: true, postId });
    }

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const id = await ideasService.createIdea({
      userId: DEMO_USER_ID,
      title,
      description,
      tags,
      images,
    });

    return NextResponse.json({ success: true, ideaId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { ideaId, status } = body;
    await ideasService.updateIdeaStatus(ideaId, status);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ideaId = searchParams.get("id");
    if (!ideaId) {
      return NextResponse.json({ error: "Idea ID is required" }, { status: 400 });
    }
    await ideasService.deleteIdea(ideaId);
    return NextResponse.json({ success: true, ideaId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
