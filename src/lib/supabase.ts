import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Browser client — use in Client Components
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Helper used by service layer (falls back to demo ID if no session)
export const DEMO_USER_ID = "usr_demo_001";