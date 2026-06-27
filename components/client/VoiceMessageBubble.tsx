"use client";

import { useState, useRef } from "react";
import { Play, Pause } from "lucide-react";
import clsx from "clsx";

export function VoiceMessageBubble({
  audioUrl,
  duration,
  sender,
}: {
  audioUrl: string;
  duration: number;
  sender: "client" | "nutritionist";
}) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function toggle() {
    if (!audioUrl || !audioRef.current) {
      setPlaying((p) => !p);
      return;
    }
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  }

  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  const label = `${mins}:${secs.toString().padStart(2, "0")}`;
  const bars = [6, 10, 14, 8, 16, 10, 12, 7, 14, 9, 11, 6];

  return (
    <div
      className={clsx(
        "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl min-w-[180px]",
        sender === "client"
          ? "bg-sage-600 text-white rounded-br-md"
          : "bg-white border border-sage-100 text-moss-900 rounded-bl-md"
      )}
    >
      <button
        onClick={toggle}
        className={clsx(
          "tap-scale w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          sender === "client" ? "bg-white/20" : "bg-sage-100"
        )}
        aria-label={playing ? "Pause voice note" : "Play voice note"}
      >
        {playing ? (
          <Pause size={13} className={sender === "client" ? "text-white" : "text-sage-700"} />
        ) : (
          <Play size={13} className={sender === "client" ? "text-white" : "text-sage-700"} />
        )}
      </button>
      <div className="flex items-end gap-[2px] h-5 flex-1">
        {bars.map((h, i) => (
          <div
            key={i}
            className={clsx(
              "w-[3px] rounded-full",
              sender === "client" ? "bg-white/60" : "bg-sage-300"
            )}
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
      <span className="text-[11px] opacity-80 shrink-0">{label}</span>
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setPlaying(false)}
          className="hidden"
        />
      )}
    </div>
  );
}
