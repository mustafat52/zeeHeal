import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapDbClientToStoreClient } from "@/lib/mapDbClient";
import { ClientSessionHydrator } from "@/components/client/ClientSessionHydrator";
import { ClientBottomNav } from "@/components/client/ClientBottomNav";

/**
 * Server Component — re-runs on every request to a (client) route,
 * including hard refreshes (unlike client-side navigation between pages
 * that share this layout, which doesn't remount it). This is what
 * actually enforces "must be logged in" for every page under here, and
 * what re-hydrates real data on every refresh instead of just at login.
 */
export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: clientRow } = await supabase
    .from("clients")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  // Logged in, but not linked to a client row — e.g. Zainab's own
  // account somehow hit a client-only route. Safer to bounce to login
  // than render with no data.
  if (!clientRow) redirect("/login");

  const client = mapDbClientToStoreClient(clientRow);

  return (
    <div className="pb-24">
      <ClientSessionHydrator client={client}>
        {children}
      </ClientSessionHydrator>
      <ClientBottomNav />
    </div>
  );
}