import { supabase, DEMO_USER_ID } from "@/lib/supabase";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface SBPost {
  id: string;
  user_id: string;
  content: string;
  media_urls: string[];
  target_platforms: string[];
  status: "draft" | "scheduled" | "published" | "failed";
  scheduled_at?: string | null;
  published_at?: string | null;
  published_url?: string | null;
  failure_reason?: string | null;
  retry_count: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface SBAccount {
  id: string;
  user_id: string;
  platform: string;
  account_name: string;
  platform_user_id?: string;
  access_token?: string;
  status: "connected" | "expired" | "disconnected";
  app_id?: string;
  page_id?: string;
  business_account_id?: string;
  active_permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface SBActivityLog {
  id: string;
  user_id: string;
  event_type: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
}

// ─── Posts ─────────────────────────────────────────────────────────────────

export const postsService = {
  async getAll(status?: string, userId = DEMO_USER_ID): Promise<SBPost[]> {
    let query = supabase
      .from("posts")
      .select("*")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []) as SBPost[];
  },

  async getById(id: string): Promise<SBPost | null> {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return data as SBPost;
  },

  async create(
    post: {
      content: string;
      media_urls?: string[];
      target_platforms: string[];
      status: "draft" | "scheduled" | "published" | "failed";
      scheduled_at?: string;
    },
    userId = DEMO_USER_ID
  ): Promise<SBPost> {
    const id = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const { data, error } = await supabase
      .from("posts")
      .insert({
        id,
        user_id: userId,
        content: post.content,
        media_urls: post.media_urls || [],
        target_platforms: post.target_platforms,
        status: post.status,
        scheduled_at: post.scheduled_at || null,
        published_at: post.status === "published" ? new Date().toISOString() : null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as SBPost;
  },

  async update(id: string, updates: Partial<SBPost>): Promise<void> {
    const { error } = await supabase
      .from("posts")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};

// ─── Social Accounts ───────────────────────────────────────────────────────

export const accountsService = {
  async getAll(userId = DEMO_USER_ID): Promise<SBAccount[]> {
    const { data, error } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []) as SBAccount[];
  },

  async upsert(
    account: Partial<SBAccount> & { id: string; platform: string; account_name: string },
    userId = DEMO_USER_ID
  ): Promise<void> {
    const { error } = await supabase
      .from("social_accounts")
      .upsert({ user_id: userId, ...account, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
  },

  async updateStatus(id: string, status: "connected" | "expired" | "disconnected"): Promise<void> {
    const { error } = await supabase
      .from("social_accounts")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("social_accounts").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};

// ─── Activity Logs ─────────────────────────────────────────────────────────

export const activityLogsService = {
  async log(
    event_type: string,
    description: string,
    metadata: Record<string, any> = {},
    userId = DEMO_USER_ID
  ): Promise<void> {
    const id = `act_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const { error } = await supabase.from("activity_logs").insert({
      id,
      user_id: userId,
      event_type,
      description,
      metadata,
    });
    if (error) console.error("Activity log error:", error.message);
  },

  async getRecent(limit = 50, userId = DEMO_USER_ID): Promise<SBActivityLog[]> {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data || []) as SBActivityLog[];
  },
};