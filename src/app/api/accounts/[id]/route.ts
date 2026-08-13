import { NextResponse } from "next/server";
import { accountsService, activityLogsService } from "@/lib/supabase-service";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    await accountsService.updateStatus(params.id, body.status);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await accountsService.delete(params.id);
    await activityLogsService.log("account_disconnected", "Disconnected account " + params.id, { accountId: params.id });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
