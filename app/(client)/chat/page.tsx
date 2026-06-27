"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { chatThreads, Message } from "@/lib/mock-data/messages";
import { VoiceRecorder } from "@/components/client/VoiceRecorder";
import { VoiceMessageBubble } from "@/components/client/VoiceMessageBubble";
import { Send } from "lucide-react";
import clsx from "clsx";

export default function ClientChatPage() {
  const activeClientId = useAppStore((s) => s.activeClientId);
  const initialMessages = chatThreads[activeClientId] ?? [];
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  function send() {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), sender: "client", text: input, time: "now" },
    ]);
    setInput("");
  }

  function sendVoice(audioUrl: string, duration: number) {
    if (!audioUrl) return;
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: "client",
        text: "",
        time: "now",
        audioUrl,
        audioDuration: duration,
      },
    ]);
  }

  return (
    <div className="pt-12 px-5 flex flex-col" style={{ minHeight: "calc(100vh - 96px)" }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center font-medium text-sage-800">
          ZB
        </div>
        <div>
          <p className="font-medium text-moss-900">Zainab</p>
          <p className="text-xs text-moss-400">Usually replies within a day</p>
        </div>
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
