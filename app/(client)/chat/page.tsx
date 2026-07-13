"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { loadMessagesForClient } from "@/lib/mapDbMessages";
import { ZAINAB_PHONE } from "@/lib/mock-data/clients";
import { VoiceRecorder } from "@/components/client/VoiceRecorder";
import { VoiceMessageBubble } from "@/components/client/VoiceMessageBubble";
import { Send, Phone } from "lucide-react";
import clsx from "clsx";

export default function ClientChatPage() {
  const activeClientId = useAppStore((s) => s.activeClientId);
  const messages = useAppStore((s) => s.messagesByClient[activeClientId] ?? []);
  const sendMessage = useAppStore((s) => s.sendMessage);
  const setMessagesForClient = useAppStore((s) => s.setMessagesForClient);
  const [input, setInput] = useState("");

  // Loads real message history on open. Not real-time — a message sent
  // by Zainab while this page is already open won't appear until this
  // effect re-runs (reload/re-navigate), same limitation flagged
  // elsewhere (e.g. the nutritionist's client detail check-in card).
  useEffect(() => {
    if (!activeClientId) return;
    let cancelled = false;
    loadMessagesForClient(activeClientId).then((msgs) => {
      if (!cancelled) setMessagesForClient(activeClientId, msgs);
    });
    return () => {
      cancelled = true;
    };
  }, [activeClientId, setMessagesForClient]);

  function send() {
    if (!input.trim()) return;
    sendMessage(activeClientId, "client", { text: input });
    setInput("");
  }

  async function sendVoice(audioUrl: string, duration: number, blob?: Blob) {
    if (!audioUrl) return;

    let audioStoragePath: string | undefined;
    if (blob) {
      const supabase = createClient();
      const path = `${activeClientId}/${Date.now()}.webm`;
      const { error } = await supabase.storage
        .from("voice-notes")
        .upload(path, blob, { contentType: "audio/webm" });
      if (error) {
        console.error("Failed to upload voice note:", error.message);
      } else {
        audioStoragePath = path;
      }
    }

    // audioUrl (blob URL) is used for the sender's own immediate
    // playback in this session; audioStoragePath is what actually
    // persists — Zainab will get a signed URL from it when she loads
    // this thread, since the blob URL itself never leaves this browser.
    sendMessage(activeClientId, "client", { audioUrl, audioDuration: duration }, audioStoragePath);
  }

  return (
    <div className="pt-12 px-5 flex flex-col" style={{ minHeight: "calc(100vh - 96px)" }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center font-medium text-sage-800">
          ZB
        </div>
        <div className="flex-1">
          <p className="font-medium text-moss-900">Zainab</p>
          <p className="text-xs text-moss-400">Usually replies within a day</p>
        </div>
        <a
          href={`tel:${ZAINAB_PHONE.replace(/\s/g, "")}`}
          className="tap-scale w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center shrink-0"
          aria-label="Call Zainab"
        >
          <Phone size={16} className="text-sage-700" />
        </a>
      </div>

      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto no-scrollbar pb-3">
        {messages.map((m) => {
          const isVoice = m.audioDuration !== undefined;
          return (
            <div
              key={m.id}
              className={clsx("flex flex-col", m.sender === "client" ? "self-end items-end" : "self-start items-start")}
            >
              {isVoice ? (
                <VoiceMessageBubble
                  audioUrl={m.audioUrl ?? ""}
                  duration={m.audioDuration ?? 0}
                  sender={m.sender}
                />
              ) : (
                <div
                  className={clsx(
                    "max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm",
                    m.sender === "client"
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
          placeholder="Message Zainab"
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