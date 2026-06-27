"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { DigestCard } from "@/components/nutritionist/DigestCard";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { generateDigest } from "@/lib/digest";
import { AlertCircle, ChevronRight, Search } from "lucide-react";

const statusLabel: Record<string, string> = {
  "on-track": "On track",
  "needs-attention": "Needs attention",
  new: "New client",
};

export default function NutritionistDashboardPage() {
  const clients = useAppStore((s) => s.clients);
  const [query, setQuery] = useState("");

  const needsAttention = clients.filter((c) => c.status === "needs-attention").length;
  const digestItems = generateDigest(clients);

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="bg-clay-100 px-6 pt-12 pb-6 rounded-b-[28px]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-clay-600/80 text-sm">Good evening</p>
            <h1 className="font-display text-2xl text-moss-900 mt-0.5">Zainab&apos;s clients</h1>
          </div>
          <LogoutButton className="bg-white/70" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/70 rounded-xl p-3.5">
            <p className="text-xs text-moss-600">Active clients</p>
            <p className="font-display text-2xl text-moss-900 mt-1">{clients.length}</p>
          </div>
          <div className="bg-white/70 rounded-xl p-3.5">
            <p className="text-xs text-moss-600">Needs attention</p>
            <p className="font-display text-2xl text-clay-600 mt-1">{needsAttention}</p>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-3">
        <DigestCard items={digestItems} />
      </div>

      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-moss-600">All clients</h2>
          <span className="text-xs text-moss-400">{filteredClients.length} total</span>
        </div>

        <div className="relative mb-4">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-moss-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients"
            className="w-full bg-white border border-sage-100 rounded-xl pl-9 pr-3.5 py-2.5 text-sm outline-none focus:border-sage-400"
          />
        </div>

        <div className="flex flex-col gap-2.5">
          {filteredClients.map((client) => (
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

          {filteredClients.length === 0 && (
            <p className="text-sm text-moss-400 text-center py-8">No clients match &quot;{query}&quot;</p>
          )}
        </div>
      </div>
    </div>
  );
}