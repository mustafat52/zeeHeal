"use client";

import { useState, useRef } from "react";
import { Mic, Square } from "lucide-react";
import clsx from "clsx";

export function VoiceRecorder({
  onRecorded,
}: {
  onRecorded: (audioUrl: string, duration: number) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        onRecorded(url, seconds);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      onRecorded("", 0);
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  }

  return (
    <button
      onClick={recording ? stopRecording : startRecording}
      className={clsx(
        "tap-scale w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
        recording ? "bg-clay-600" : "bg-sage-100"
      )}
      aria-label={recording ? "Stop recording" : "Record voice note"}
    >
      {recording ? (
        <Square size={14} className="text-white" />
      ) : (
        <Mic size={16} className="text-sage-700" />
      )}
    </button>
  );
}
