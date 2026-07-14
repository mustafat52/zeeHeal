"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import type { Client } from "@/lib/mock-data/clients";

/**
 * Runs on every mount of the (client) layout — every page load AND every
 * hard refresh, not just the one-time hydration that happens at login.
 * This is what fixes the "refresh shows mock Priya data" bug: Zustand is
 * pure in-memory state and resets to its hardcoded defaults
 * (activeClientId: "priya", clients: initialClients) on every full page
 * reload, and nothing was re-establishing the real session afterward.
 *
 * Gates rendering of children until hydration completes — without this,
 * mock data renders for one frame before being replaced, which reads as
 * "still showing mock data" even though it self-corrects almost
 * immediately. Deliberately replaces the whole clients array with just
 * this one real client (setClients([client]), not addClient) — same
 * reasoning as the nutritionist dashboard's fetch: the mock array's only
 * job was making the app browsable before a real backend existed.
 */
export function ClientSessionHydrator({
  client,
  children,
}: {
  client: Client;
  children: React.ReactNode;
}) {
  const setClients = useAppStore((s) => s.setClients);
  const setActiveClientId = useAppStore((s) => s.setActiveClientId);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setClients([client]);
    setActiveClientId(client.id);
    setViewMode("client");
    setHydrated(true);
  }, [client, setClients, setActiveClientId, setViewMode]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-moss-400">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}