import { NextResponse } from "next/server";
import { accountsService, activityLogsService } from "@/lib/supabase-service";
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

export async function GET() {
  try {
    const userId = await getUserId();
    const accounts = await accountsService.getAll(userId);
    return NextResponse.json({ accounts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    const body = await req.json();
    await accountsService.upsert(body, userId);
    await activityLogsService.log("account_connected", "Connected account: " + body.account_name, { platform: body.platform }, userId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
