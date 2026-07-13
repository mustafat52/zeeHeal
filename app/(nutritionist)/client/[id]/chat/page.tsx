"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { loadMessagesForClient } from "@/lib/mapDbMessages";
import { VoiceRecorder } from "@/components/client/VoiceRecorder";
import { VoiceMessageBubble } from "@/components/client/VoiceMessageBubble";
import { ChevronLeft, Send, Phone } from "lucide-react";
import clsx from "clsx";

export default function NutritionistChatPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const client = useAppStore((s) => s.clients.find((c) => c.id === clientId));
  const messages = useAppStore((s) => s.messagesByClient[clientId] ?? []);
  const sendMessage = useAppStore((s) => s.sendMessage);
  const setMessagesForClient = useAppStore((s) => s.setMessagesForClient);
  const [input, setInput] = useState("");

  // Same not-real-time caveat as the client chat page — loads on open,
  // won't reflect a message the client sends while this page stays open.
  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    loadMessagesForClient(clientId).then((msgs) => {
      if (!cancelled) setMessagesForClient(clientId, msgs);
    });
    return () => {
      cancelled = true;
    };
  }, [clientId, setMessagesForClient]);

  if (!client) return null;

  function send() {
    if (!input.trim()) return;
    sendMessage(clientId, "nutritionist", { text: input });
    setInput("");
  }

  async function sendVoice(audioUrl: string, duration: number, blob?: Blob) {
    if (!audioUrl) return;

    let audioStoragePath: string | undefined;
    if (blob) {
      const supabase = createClient();
      const path = `${clientId}/${Date.now()}.webm`;
      const { error } = await supabase.storage
        .from("voice-notes")
        .upload(path, blob, { contentType: "audio/webm" });
      if (error) {
        console.error("Failed to upload voice note:", error.message);
      } else {
        audioStoragePath = path;
      }
    }

    sendMessage(clientId, "nutritionist", { audioUrl, audioDuration: duration }, audioStoragePath);
  }

  return (
    <div className="pt-12 px-5 flex flex-col" style={{ minHeight: "calc(100vh - 96px)" }}>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()} className="tap-scale" aria-label="Back">
          <ChevronLeft size={20} className="text-moss-600" />
        </button>
        <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center font-medium text-sage-800">
          {client.initials}
        </div>
        <div className="flex-1">
          <p className="font-medium text-moss-900">{client.name}</p>
          <p className="text-xs text-moss-400">{client.planType}</p>
        </div>
        <a
          href={`tel:${client.phone.replace(/\s/g, "")}`}
          className="tap-scale w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center shrink-0"
          aria-label={`Call ${client.name}`}
        >
          <Phone size={16} className="text-sage-700" />
        </a>
      </div>

      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto no-scrollbar pb-3">
        {messages.map((m) => {
          const isVoice = m.audioDuration !== undefined;
          const isMe = m.sender === "nutritionist";
          return (
            <div
              key={m.id}
              className={clsx("flex flex-col", isMe ? "self-end items-end" : "self-start items-start")}
            >
              {isVoice ? (
                <VoiceMessageBubble
                  audioUrl={m.audioUrl ?? ""}
                  duration={m.audioDuration ?? 0}
                  sender={isMe ? "client" : "nutritionist"}
                />
              ) : (
                <div
                  className={clsx(
                    "max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm",
                    isMe
                      ? "bg-sage-600 text-white rounded-br-md"
                      : "bg-white border border-sage-100 text-moss-900 rounded-bl-md"
                  )}
                >
                  {m.text}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 sticky bottom-0 bg-ivory pt-2 pb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={`Message ${client.name.split(" ")[0]}`}
          className="flex-1 bg-white border border-sage-100 rounded-full px-4 py-2.5 text-sm outline-none focus:border-sage-400"
        />
        <VoiceRecorder onRecorded={sendVoice} />
        <button
          onClick={send}
          className="tap-scale w-10 h-10 rounded-full bg-sage-600 flex items-center justify-center shrink-0"
        >
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}