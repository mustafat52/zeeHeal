"use client";

import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { chatThreads } from "@/lib/mock-data/messages";
import { Card } from "@/components/ui/Card";

export default function InboxPage() {
  const clients = useAppStore((s) => s.clients);

  return (
    <div className="pt-12 px-5">
      <h1 className="font-display text-2xl text-moss-900 mb-5">Inbox</h1>

      <div className="flex flex-col gap-2.5">
        {clients.map((client) => {
          const thread = chatThreads[client.id] ?? [];
          const lastMessage = thread[thread.length - 1];
          return (
            <Link key={client.id} href={`/client/${client.id}`}>
              <Card className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-sage-100 flex items-center justify-center font-medium text-sage-800 shrink-0">
                  {client.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-moss-900 text-sm">{client.name}</p>
                  <p className="text-xs text-moss-400 truncate">
                    {lastMessage ? lastMessage.text : "No messages yet"}
                  </p>
                </div>
                <span className="text-[11px] text-moss-400 shrink-0">
                  {lastMessage?.time ?? ""}
                </span>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
