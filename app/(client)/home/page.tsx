"use client";

import { useAppStore } from "@/lib/store";
import { WeightLossHome } from "@/components/client/homes/WeightLossHome";
import { PCOSHome } from "@/components/client/homes/PCOSHome";
import { HormonalHome } from "@/components/client/homes/HormonalHome";
import { SkincareHome } from "@/components/client/homes/SkincareHome";

export default function ClientHomePage() {
  const activeClientId = useAppStore((s) => s.activeClientId);
  const client = useAppStore((s) => s.clients.find((c) => c.id === activeClientId));

  if (!client) return null;

  switch (client.condition) {
    case "weight-loss": return <WeightLossHome client={client} />;
    case "pcos":        return <PCOSHome client={client} />;
    case "hormonal":    return <HormonalHome client={client} />;
    case "skincare":    return <SkincareHome client={client} />;
    default:            return <HormonalHome client={client} />;
  }
}