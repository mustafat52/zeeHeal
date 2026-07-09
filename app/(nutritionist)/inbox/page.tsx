"use client";

import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Mic, Phone } from "lucide-react";

export default function InboxPage() {
  const clients = useAppStore((s) => s.clients);
  const messagesByClient = useAppStore((s) => s.messagesByClient);

  const activeClients = clients.filter((c) => !c.archived);

  return (
    <div>
      <div className="bg-sage-100 px-6 pt-12 pb-6 rounded-b-[28px]">
        <h1 className="font-display text-2xl text-moss-900 mb-1">Inbox</h1>
        <p className="text-sm text-sage-800/80">
          Every client conversation, all in zeeheal
        </p>
      </div>

      <div className="px-5 -mt-3">
        <div className="flex flex-col gap-2.5">
          {activeClients.map((client) => {
            const thread = messagesByClient[client.id] ?? [];
            const lastMessage = thread[thread.length - 1];
            const isVoice = lastMessage?.audioDuration !== undefined;
            const preview = lastMessage ? (isVoice ? "Voice note" : lastMessage.text) : "No messages yet";

            return (
              <Card key={client.id} className="flex items-center gap-3">
                <Link href={`/client/${client.id}/chat`} className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-sage-100 flex items-center justify-center font-medium text-sage-800 shrink-0">
                    {client.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-moss-900 text-sm">{client.name}</p>
                    <p className="text-xs text-moss-400 truncate flex items-center gap-1">
                      {isVoice && <Mic size={11} />}
                      {preview}
                    </p>
                  </div>
                </Link>
                <a
                  href={`tel:${client.phone.replace(/\s/g, "")}`}
                  className="tap-scale w-9 h-9 rounded-full bg-sage-50 flex items-center justify-center shrink-0"
                  aria-label={`Call ${client.name}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone size={14} className="text-sage-700" />
                </a>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}