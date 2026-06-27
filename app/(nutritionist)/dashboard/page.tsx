"use client";

import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { DigestCard } from "@/components/nutritionist/DigestCard";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { generateDigest } from "@/lib/digest";
import { AlertCircle, ChevronRight } from "lucide-react";

const statusLabel: Record<string, string> = {
  "on-track": "On track",
  "needs-attention": "Needs attention",
  new: "New client",
};

export default function NutritionistDashboardPage() {
  const clients = useAppStore((s) => s.clients);

  const needsAttention = clients.filter((c) => c.status === "needs-attention").length;
  const digestItems = generateDigest(clients);

  return (
    <div className="pt-12 px-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-moss-400">Good evening</p>
          <h1 className="font-display text-2xl text-moss-900">Zainab&apos;s clients</h1>
        </div>
        <LogoutButton className="bg-sage-100" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Card>
          <p className="text-xs text-moss-400">Active clients</p>
          <p className="font-display text-2xl text-moss-900 mt-1">{clients.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-moss-400">Needs attention</p>
          <p className="font-display text-2xl text-clay-600 mt-1">{needsAttention}</p>
        </Card>
      </div>

      <DigestCard items={digestItems} />

      <h2 className="text-sm font-medium text-moss-600 mb-3">All clients</h2>
      <div className="flex flex-col gap-2.5">
        {clients.map((client) => (
          <Link key={client.id} href={`/client/${client.id}`}>
            <Card className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-sage-100 flex items-center justify-center font-medium text-sage-800 shrink-0">
                {client.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-moss-900 text-sm">{client.name}</p>
                <p className="text-xs text-moss-400 truncate">{client.planType}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {client.status === "needs-attention" ? (
                  <span className="flex items-center gap-1 text-xs text-clay-600 font-medium">
                    <AlertCircle size={12} /> {statusLabel[client.status]}
                  </span>
                ) : (
                  <Pill tone={client.status === "new" ? "neutral" : "sage"}>
                    {statusLabel[client.status]}
                  </Pill>
                )}
                <span className="text-[11px] text-moss-400">{client.lastLog}</span>
              </div>
              <ChevronRight size={16} className="text-moss-400 shrink-0" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}