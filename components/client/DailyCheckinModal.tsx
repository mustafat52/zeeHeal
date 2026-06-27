"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check, Minus, Plus, Moon, Footprints } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DailyCheckin, CheckinConfig } from "@/lib/mock-data/clients";
import clsx from "clsx";

const moods = [
  { value: 1, emoji: "😞", label: "Low" },
  { value: 2, emoji: "😕", label: "Meh" },
  { value: 3, emoji: "🙂", label: "Okay" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "🤩", label: "Great" },
];

const activityTypes = ["None", "Walk", "Yoga", "Gym", "Run", "Other"];

function isOn(config: CheckinConfig | undefined, key: keyof CheckinConfig) {
  // If a nutritionist hasn't set up a config yet, default to showing everything
  // so the feature is never invisible during onboarding.
  if (!config || Object.keys(config).length === 0) return true;
  return !!config[key];
}

export function DailyCheckinModal({
  config,
  onClose,
  onSave,
}: {
  config?: CheckinConfig;
  onClose: () => void;
  onSave: (data: DailyCheckin) => void;
}) {
  const [weight, setWeight] = useState(68.4);
  const [sleepHours, setSleepHours] = useState(7);
  const [mood, setMood] = useState<number | null>(null);
  const [bloating, setBloating] = useState(3);
  const [skinCondition, setSkinCondition] = useState(3);
  const [hairFall, setHairFall] = useState(3);
  const [cycleDay, setCycleDay] = useState(1);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [activityType, setActivityType] = useState("None");
  const [activityMinutes, setActivityMinutes] = useState(0);
  const [note, setNote] = useState("");

  const showWeight = isOn(config, "weight");
  const showSleep = isOn(config, "sleepHours");
  const showMood = isOn(config, "mood");
  const showBloating = isOn(config, "bloating");
  const showActivity = isOn(config, "activity");
  const showSkin = isOn(config, "skinCondition");
  const showHair = isOn(config, "hairFall");
  const showCycle = isOn(config, "cycleDay");
  const showWater = isOn(config, "waterGlasses");

  function handleSave() {
    onSave({
      weight: showWeight ? weight : undefined,
      sleepHours: showSleep ? sleepHours : undefined,
      mood: showMood ? mood ?? undefined : undefined,
      bloating: showBloating ? bloating : undefined,
      activityType: showActivity ? activityType : undefined,
      activityMinutes: showActivity ? activityMinutes : undefined,
      skinCondition: showSkin ? skinCondition : undefined,
      hairFall: showHair ? hairFall : undefined,
      cycleDay: showCycle ? cycleDay : undefined,
      waterGlasses: showWater ? waterGlasses : undefined,
      note: note || undefined,
    });
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
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl text-moss-900">Daily check-in</h2>
          <button onClick={onClose} className="tap-scale w-8 h-8 rounded-full bg-white flex items-center justify-center" aria-label="Close">
            <X size={16} className="text-moss-600" />
          </button>
        </div>

        {showMood && (
          <>
            <p className="text-xs font-medium text-moss-600 mb-2">How are you feeling today?</p>
            <div className="flex justify-between mb-5">
              {moods.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className={clsx(
                    "tap-scale flex flex-col items-center gap-1 px-2 py-2 rounded-xl",
                    mood === m.value ? "bg-sage-100" : "bg-transparent"
                  )}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] text-moss-500">{m.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {showWeight && (
          <div className="bg-white rounded-xl border border-sage-100/60 p-3.5 mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-moss-900">Weight</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setWeight((w) => Math.round((w - 0.1) * 10) / 10)}
                className="tap-scale w-7 h-7 rounded-full bg-sage-100 flex items-center justify-center"
                aria-label="Decrease weight"
              >
                <Minus size={13} className="text-sage-700" />
              </button>
              <span className="text-sm font-medium text-moss-900 w-14 text-center">{weight.toFixed(1)} kg</span>
              <button
                onClick={() => setWeight((w) => Math.round((w + 0.1) * 10) / 10)}
                className="tap-scale w-7 h-7 rounded-full bg-sage-100 flex items-center justify-center"
                aria-label="Increase weight"
              >
                <Plus size={13} className="text-sage-700" />
              </button>
            </div>
          </div>
        )}

        {showSleep && (
          <div className="bg-white rounded-xl border border-sage-100/60 p-3.5 mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-moss-900 flex items-center gap-2">
              <Moon size={14} className="text-sage-600" /> Sleep
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSleepHours((h) => Math.max(0, h - 0.5))}
                className="tap-scale w-7 h-7 rounded-full bg-sage-100 flex items-center justify-center"
                aria-label="Decrease sleep hours"
              >
                <Minus size={13} className="text-sage-700" />
              </button>
              <span className="text-sm font-medium text-moss-900 w-14 text-center">{sleepHours} hrs</span>
              <button
                onClick={() => setSleepHours((h) => Math.min(14, h + 0.5))}
                className="tap-scale w-7 h-7 rounded-full bg-sage-100 flex items-center justify-center"
                aria-label="Increase sleep hours"
              >
                <Plus size={13} className="text-sage-700" />
              </button>
            </div>
          </div>
        )}

        {showWater && (
          <div className="bg-white rounded-xl border border-sage-100/60 p-3.5 mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-moss-900">Water</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setWaterGlasses((w) => Math.max(0, w - 1))}
                className="tap-scale w-7 h-7 rounded-full bg-sage-100 flex items-center justify-center"
                aria-label="Decrease water glasses"
              >
                <Minus size={13} className="text-sage-700" />
              </button>
              <span className="text-sm font-medium text-moss-900 w-20 text-center">{waterGlasses} glasses</span>
              <button
                onClick={() => setWaterGlasses((w) => w + 1)}
                className="tap-scale w-7 h-7 rounded-full bg-sage-100 flex items-center justify-center"
                aria-label="Increase water glasses"
              >
                <Plus size={13} className="text-sage-700" />
              </button>
            </div>
          </div>
        )}

        {showBloating && (
          <div className="bg-white rounded-xl border border-sage-100/60 p-3.5 mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-moss-900">Bloating today</p>
              <span className="text-sm font-medium text-sage-600">{bloating}/10</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={bloating}
              onChange={(e) => setBloating(Number(e.target.value))}
              className="w-full accent-sage-600"
            />
            <div className="flex justify-between text-[10px] text-moss-400 mt-1">
              <span>None</span>
              <span>Severe</span>
            </div>
          </div>
        )}

        {showSkin && (
          <div className="bg-white rounded-xl border border-sage-100/60 p-3.5 mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-moss-900">Skin condition</p>
              <span className="text-sm font-medium text-sage-600">{skinCondition}/10</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={skinCondition}
              onChange={(e) => setSkinCondition(Number(e.target.value))}
              className="w-full accent-sage-600"
            />
            <div className="flex justify-between text-[10px] text-moss-400 mt-1">
              <span>Clear</span>
              <span>Breaking out</span>
            </div>
          </div>
        )}

        {showHair && (
          <div className="bg-white rounded-xl border border-sage-100/60 p-3.5 mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-moss-900">Hair fall</p>
              <span className="text-sm font-medium text-sage-600">{hairFall}/10</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={hairFall}
              onChange={(e) => setHairFall(Number(e.target.value))}
              className="w-full accent-sage-600"
            />
            <div className="flex justify-between text-[10px] text-moss-400 mt-1">
              <span>Normal</span>
              <span>Excessive</span>
            </div>
          </div>
        )}

        {showCycle && (
          <div className="bg-white rounded-xl border border-sage-100/60 p-3.5 mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-moss-900">Cycle day</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCycleDay((d) => Math.max(1, d - 1))}
                className="tap-scale w-7 h-7 rounded-full bg-sage-100 flex items-center justify-center"
                aria-label="Decrease cycle day"
              >
                <Minus size={13} className="text-sage-700" />
              </button>
              <span className="text-sm font-medium text-moss-900 w-16 text-center">Day {cycleDay}</span>
              <button
                onClick={() => setCycleDay((d) => Math.min(40, d + 1))}
                className="tap-scale w-7 h-7 rounded-full bg-sage-100 flex items-center justify-center"
                aria-label="Increase cycle day"
              >
                <Plus size={13} className="text-sage-700" />
              </button>
            </div>
          </div>
        )}

        {showActivity && (
          <div className="bg-white rounded-xl border border-sage-100/60 p-3.5 mb-5">
            <p className="text-sm font-medium text-moss-900 flex items-center gap-2 mb-2.5">
              <Footprints size={14} className="text-sage-600" /> Activity
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {activityTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setActivityType(type)}
                  className={clsx(
                    "tap-scale px-3 py-1.5 rounded-full text-xs font-medium border",
                    activityType === type
                      ? "bg-sage-600 text-white border-sage-600"
                      : "bg-white text-moss-600 border-sage-100"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
            {activityType !== "None" && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-moss-400">Duration</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActivityMinutes((m) => Math.max(0, m - 5))}
                    className="tap-scale w-7 h-7 rounded-full bg-sage-100 flex items-center justify-center"
                    aria-label="Decrease minutes"
                  >
                    <Minus size={13} className="text-sage-700" />
                  </button>
                  <span className="text-sm font-medium text-moss-900 w-16 text-center">{activityMinutes} min</span>
                  <button
                    onClick={() => setActivityMinutes((m) => m + 5)}
                    className="tap-scale w-7 h-7 rounded-full bg-sage-100 flex items-center justify-center"
                    aria-label="Increase minutes"
                  >
                    <Plus size={13} className="text-sage-700" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Anything else Zainab should know? (optional)"
          rows={2}
          className="w-full bg-white border border-sage-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-sage-400 mb-5 resize-none"
        />

        <Button variant="primary" className="w-full py-3.5" onClick={handleSave}>
          <Check size={16} /> Save today&apos;s check-in
        </Button>
      </motion.div>
    </div>
  );
}