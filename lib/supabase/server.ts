import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for use in Server Components, Route Handlers, and Server
 * Actions. Must be created fresh on every request (never hoisted to a
 * module-level singleton) since it's bound to that request's cookies.
 *
 * The try/catch around cookieStore.set is intentional, not defensive
 * boilerplate: Server Components can call this to READ the session, but
 * they're not allowed to WRITE cookies (Next.js throws if you try). That's
 * fine as long as a Route Handler or Server Action refreshes the session
 * elsewhere — middleware.ts (next file) is what actually handles that
 * refresh, so this catch just no-ops in the contexts where it doesn't apply.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — no-op, middleware handles
            // session refresh instead. See comment above.
          }
        },
      },
    }
  );
}