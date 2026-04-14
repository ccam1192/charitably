import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/lib/supabase/env";

const serviceRoleOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
} as const;

/**
 * Service-role client when `SUPABASE_SERVICE_ROLE_KEY` is set — server-only.
 * Never import in client code.
 */
export function createServiceRoleClientIfConfigured() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(getSupabaseUrl(), key, serviceRoleOptions);
}

/** Service-role client — server-only (invites, landing form inserts, etc.). */
export function createServiceRoleClient() {
  const client = createServiceRoleClientIfConfigured();
  if (!client) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY (required for volunteer invitations)");
  }
  return client;
}
