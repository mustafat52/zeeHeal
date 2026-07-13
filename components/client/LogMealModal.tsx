"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Check, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import clsx from "clsx";

const symptomTags = ["Felt great", "Bloated", "Low energy", "Skipped a bit", "Craved sugar"];

export function LogMealModal({
  mealLabel,
  mealItems,
  onClose,
  onSave,
}: {
  mealLabel: string;
  mealItems: string;
  onClose: () => void;
  onSave: (data: { photo?: string; file?: File; note?: string }) => void;
}) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  function toggleTag(tag: string) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleSave() {
    const combinedNote = [note, activeTags.join(", ")].filter(Boolean).join(" · ");
    onSave({ photo: photo ?? undefined, file: photoFile ?? undefined, note: combinedNote || undefined });
  }

  return (
    <div
      style={{ minHeight: "100vh" }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-moss-900/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-ivory rounded-t-[28px] px-5 pt-5 pb-[calc(env(safe-area-inset-bottom)+24px)] max-h-[88vh] overflow-y-auto no-scrollbar"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-moss-400">{mealLabel}</p>
            <h2 className="font-display text-lg text-moss-900">{mealItems}</h2>
          </div>
          <button onClick={onClose} className="tap-scale w-8 h-8 rounded-full bg-white flex items-center justify-center" aria-label="Close">
            <X size={16} className="text-moss-600" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFile}
        />

        {photo ? (
          <div className="relative mb-4">
            <img src={photo} alt="Logged meal" className="w-full h-44 object-cover rounded-xl" />
            <button
              onClick={() => {
                setPhoto(null);
                setPhotoFile(null);
              }}
              className="tap-scale absolute top-2 right-2 w-7 h-7 rounded-full bg-moss-900/60 flex items-center justify-center"
              aria-label="Remove photo"
            >
              <X size={14} className="text-white" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="tap-scale w-full h-36 rounded-xl border border-dashed border-sage-200 bg-sage-50 flex flex-col items-center justify-center gap-2 mb-4"
          >
            <Camera size={22} className="text-sage-600" />
            <span className="text-sm text-sage-800 font-medium">Snap your plate</span>
            <span className="text-xs text-moss-400">Takes 5 seconds, no typing needed</span>
          </button>
        )}

        <p className="text-xs font-medium text-moss-600 mb-2">How did it feel?</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {symptomTags.map((tag) => {
            const active = activeTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={clsx(
                  "tap-scale px-3 py-1.5 rounded-full text-xs font-medium border",
                  active
                    ? "bg-sage-600 text-white border-sage-600"
                    : "bg-white text-moss-600 border-sage-100"
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note (optional)"
          rows={2}
          className="w-full bg-white border border-sage-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-sage-400 mb-5 resize-none"
        />

        <Button variant="primary" className="w-full py-3.5" onClick={handleSave}>
          <Check size={16} /> Log this meal
        </Button>
      </motion.div>
    </div>
  );
}