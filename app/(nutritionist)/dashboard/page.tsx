"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { DigestCard } from "@/components/nutritionist/DigestCard";
import { NewClientFormModal } from "@/components/nutritionist/NewClientFormModal";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { generateDigest } from "@/lib/digest";
import { getDisplayStatus } from "@/lib/clientStatus";
import { AnimatePresence } from "framer-motion";
import { AlertCircle, ChevronRight, Search, Plus, RefreshCw, Archive } from "lucide-react";

const statusLabel: Record<string, string> = {
  "on-track": "On track",
  "needs-attention": "Needs attention",
  new: "New client",
  archived: "Archived",
};

export default function NutritionistDashboardPage() {
  const clients = useAppStore((s) => s.clients);
  const addClient = useAppStore((s) => s.addClient);
  const [query, setQuery] = useState("");
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const activeClients = clients.filter((c) => !c.archived);
  const archivedClients = clients.filter((c) => c.archived);

  const needsAttention = activeClients.filter((c) => getDisplayStatus(c) === "needs-attention").length;
  const cycleReviewDue = activeClients.filter(
    (c) => c.planCycle.totalDays - c.planCycle.currentDay <= 3
  ).length;
  const digestItems = generateDigest(activeClients);

  const listSource = showArchived ? archivedClients : activeClients;
  const filteredClients = listSource.filter((c) =>
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
            <p className="font-display text-2xl text-moss-900 mt-1">{activeClients.length}</p>
          </div>
          <div className="bg-white/70 rounded-xl p-3.5">
            <p className="text-xs text-moss-600">Needs attention</p>
            <p className="font-display text-2xl text-clay-600 mt-1">{needsAttention}</p>
          </div>
        </div>

        {cycleReviewDue > 0 && (
          <div className="mt-3 bg-white/70 rounded-xl p-3 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-clay-100 flex items-center justify-center shrink-0">
              <RefreshCw size={13} className="text-clay-600" />
            </div>
            <p className="text-xs text-moss-700">
              <span className="font-medium text-clay-600">{cycleReviewDue}</span>{" "}
              {cycleReviewDue === 1 ? "client is" : "clients are"} due for a 15-day plan review
            </p>
          </div>
        )}
      </div>

      <div className="px-5 -mt-3">
        <DigestCard items={digestItems} />
      </div>

      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-moss-600">
            {showArchived ? "Archived clients" : "All clients"}
          </h2>
          <span className="text-xs text-moss-400">{filteredClients.length} total</span>
        </div>

        <div className="flex gap-2 mb-2.5">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-moss-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clients"
              className="w-full bg-white border border-sage-100 rounded-xl pl-9 pr-3.5 py-2.5 text-sm outline-none focus:border-sage-400"
            />
          </div>
          <button
            onClick={() => setShowNewClientForm(true)}
            className="tap-scale w-11 h-11 rounded-xl bg-sage-600 flex items-center justify-center shrink-0"
            aria-label="Add new client"
          >
            <Plus size={18} className="text-white" />
          </button>
        </div>

        {archivedClients.length > 0 && (
          <button
            onClick={() => setShowArchived((v) => !v)}
            className="tap-scale flex items-center gap-1.5 text-xs text-moss-500 mb-4"
          >
            <Archive size={12} />
            {showArchived ? "Back to active clients" : `Show archived (${archivedClients.length})`}
          </button>
        )}

        <div className="flex flex-col gap-2.5">
          {filteredClients.map((client) => {
            const daysLeft = client.planCycle.totalDays - client.planCycle.currentDay;
            const nearEnd = daysLeft <= 3;
            const displayStatus = getDisplayStatus(client);

            return (
              <Link key={client.id} href={`/client/${client.id}`}>
                <Card className={`flex items-center gap-3 ${client.archived ? "opacity-60" : ""}`}>
                  <div className="w-11 h-11 rounded-full bg-sage-100 flex items-center justify-center font-medium text-sage-800 shrink-0">
                    {client.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-moss-900 text-sm">{client.name}</p>
                    <p className="text-xs text-moss-400 truncate">{client.planType}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {displayStatus === "needs-attention" ? (
                      <span className="flex items-center gap-1 text-xs text-clay-600 font-medium">
                        <AlertCircle size={12} /> {statusLabel[displayStatus]}
                      </span>
                    ) : (
                      <Pill tone={displayStatus === "new" || displayStatus === "archived" ? "neutral" : "sage"}>
                        {statusLabel[displayStatus]}
                      </Pill>
                    )}
                    <span className="text-[11px] text-moss-400">{client.lastLog}</span>
                    {!client.archived && (
                      <span
                        className={
                          nearEnd
                            ? "text-[10px] font-medium text-clay-600 bg-clay-100 px-2 py-0.5 rounded-full"
                            : "text-[10px] text-moss-400"
                        }
                      >
                        Day {client.planCycle.currentDay}/15{nearEnd ? " · Review due" : ""}
                      </span>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-moss-400 shrink-0" />
                </Card>
              </Link>
            );
          })}

          {filteredClients.length === 0 && (
            <p className="text-sm text-moss-400 text-center py-8">
              {showArchived ? "No archived clients." : `No clients match "${query}"`}
            </p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showNewClientForm && (
          <NewClientFormModal
            onClose={() => setShowNewClientForm(false)}
            onSave={(client) => {
              addClient(client);
              setShowNewClientForm(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}