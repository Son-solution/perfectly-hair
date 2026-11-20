import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/env";
import { requireServerEnv } from "@/lib/env.server";

/**
 * Privileged client that BYPASSES Row Level Security.
 * Only for background jobs (email outbox, reminders) — never for handling a user request.
 */
export function createSupabaseAdminClient() {
  const { url } = getSupabasePublicEnv();
  return createClient(url, requireServerEnv("SUPABASE_SECRET_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
