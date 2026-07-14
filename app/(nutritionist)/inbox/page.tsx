"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Mic, Phone } from "lucide-react";

export default function InboxPage() {
  const clients = useAppStore((s) => s.clients);
  const messagesByClient = useAppStore((s) => s.messagesByClient);
  const setMessagesForClient = useAppStore((s) => s.setMessagesForClient);

  const activeClients = clients.filter((c) => !c.archived);

  // messagesByClient only gets populated for a given client once someone
  // actually opens THAT specific chat thread — Inbox needs a preview for
  // every client regardless, so it does its own lightweight fetch here
  // (one query, most recent row per client, no signed URL generation
  // since a preview never needs to actually play the audio).
  useEffect(() => {
    const ids = activeClients.map((c) => c.id);
    if (ids.length === 0) return;
    let cancelled = false;

    async function loadPreviews() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .in("client_id", ids)
        .order("sent_at", { ascending: false });

      if (cancelled || error || !data) return;

      const latestByClient: Record<string, any> = {};
      for (const row of data) {
        if (!latestByClient[row.client_id]) latestByClient[row.client_id] = row;
      }

      for (const [clientId, row] of Object.entries(latestByClient)) {
        setMessagesForClient(clientId, [
          {
            id: row.id,
            sender: row.sender,
            text: row.text ?? "",
            time: new Date(row.sent_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
            audioDuration: row.audio_duration ?? undefined,
            // audioUrl intentionally omitted here — this preview only
            // needs to know IF it's a voice note (via audioDuration) to
            // show the mic icon, not actually play it. The real signed
            // URL gets generated once the client opens that thread.
          },
        ]);
      }
    }

    loadPreviews();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClients.map((c) => c.id).join(",")]);

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