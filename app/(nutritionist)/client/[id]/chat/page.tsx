"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { chatThreads, Message } from "@/lib/mock-data/messages";
import { VoiceRecorder } from "@/components/client/VoiceRecorder";
import { VoiceMessageBubble } from "@/components/client/VoiceMessageBubble";
import { ChevronLeft, Send } from "lucide-react";
import clsx from "clsx";

export default function NutritionistChatPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const client = useAppStore((s) => s.clients.find((c) => c.id === clientId));
  const initialMessages = chatThreads[clientId] ?? [];
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  if (!client) return null;

  function send() {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), sender: "nutritionist", text: input, time: "now" },
    ]);
    setInput("");
  }

  function sendVoice(audioUrl: string, duration: number) {
    if (!audioUrl) return;
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: "nutritionist",
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
        <button onClick={() => router.back()} className="tap-scale" aria-label="Back">
          <ChevronLeft size={20} className="text-moss-600" />
        </button>
        <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center font-medium text-sage-800">
          {client.initials}
        </div>
        <div>
          <p className="font-medium text-moss-900">{client.name}</p>
          <p className="text-xs text-moss-400">{client.planType}</p>
        </div>
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
