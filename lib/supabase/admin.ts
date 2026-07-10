import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export { normalizePhoneForAuth } from "../phone";

/**
 * Admin client using the SECRET key — bypasses RLS entirely via
 * auth.admin.* methods. NEVER import this into any file that could run in
 * the browser ("use client" component, or anything bundled client-side).
 * Server Actions, Route Handlers, and other server-only files only.
 *
 * Distinct from lib/supabase/server.ts: that one impersonates the signed-in
 * user's session and still respects RLS. This one acts as the platform
 * itself — used specifically for the one operation an RLS-respecting
 * client can't do: creating a pre-confirmed phone+password auth user
 * without triggering an SMS OTP flow (see auth.admin.createUser below).
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "createAdminClient() must never be called in browser code. " +
        "Use lib/supabase/client.ts or lib/supabase/server.ts instead."
    );
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}