"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { mapDbClientToStoreClient } from "@/lib/mapDbClient";
import { mapDbPlanTemplateRow } from "@/lib/mapDbPlanTemplate";

/**
 * Runs on every mount of the (nutritionist) layout — every page load and
 * hard refresh within nutritionist routes, not just the dashboard page.
 * Fixes the same refresh-resets-to-mock-data bug as the client side, for
 * BOTH clients and planTemplates (the latter had never been connected to
 * Supabase at all before this — see plan_templates seed migration).
 *
 * Gates rendering of children until both fetches complete, same reasoning
 * as ClientSessionHydrator: without this, mock data (4 fake personas, 4
 * static starter templates) renders for one frame before being replaced.
 */
export function NutritionistSessionHydrator({ children }: { children: React.ReactNode }) {
  const setViewMode = useAppStore((s) => s.setViewMode);
  const setClients = useAppStore((s) => s.setClients);
  const setPlanTemplates = useAppStore((s) => s.setPlanTemplates);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setViewMode("nutritionist");
    let cancelled = false;

    async function loadClients() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (!cancelled && !error && data) {
        setClients(data.map(mapDbClientToStoreClient));
      }
    }

    async function loadPlanTemplates() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("plan_templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (!cancelled && !error && data) {
        setPlanTemplates(data.map(mapDbPlanTemplateRow));
      }
    }

    Promise.all([loadClients(), loadPlanTemplates()]).then(() => {
      if (!cancelled) setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, [setViewMode, setClients, setPlanTemplates]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-moss-400">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}