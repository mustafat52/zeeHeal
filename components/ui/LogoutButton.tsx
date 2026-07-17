"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Loader2 } from "lucide-react";
import clsx from "clsx";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);

    // This is the actual fix — previously this button only navigated to
    // /login while leaving the Supabase session cookie fully valid, so
    // hitting back (or revisiting /home or /dashboard directly) silently
    // logged the person back in. signOut() invalidates the session
    // server-side; router.refresh() forces the server-rendered layout to
    // re-run its auth check immediately rather than trusting stale
    // client-side navigation state.
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Failed to sign out:", error.message);
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loggingOut}
      aria-label="Log out"
      className={clsx(
        "tap-scale w-9 h-9 rounded-full bg-white/70 flex items-center justify-center shrink-0",
        loggingOut && "opacity-60",
        className
      )}
    >
      {loggingOut ? (
        <Loader2 size={15} className="text-moss-600 animate-spin" />
      ) : (
        <LogOut size={15} className="text-moss-600" />
      )}
    </button>
  );
}