"use client";

import { useRef, useState } from "react";
import { Client } from "@/lib/mock-data/clients";
import { useAppStore } from "@/lib/store";
import { getTimeBasedGreeting } from "@/lib/greetings";
import { createClient } from "@/lib/supabase/client";
import { PlanCycleBar } from "../PlanCycleBar";
import { TodayMeals } from "../TodayMeals";
import { CheckinCard } from "../CheckinCard";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { Droplets, Flame, Camera, Sparkles, Check, Loader2 } from "lucide-react";
import clsx from "clsx";

const skinLabels = ["Clear", "Mostly clear", "Mild", "Moderate", "Severe"];
const skinColors = ["bg-sage-400", "bg-sage-300", "bg-clay-200", "bg-clay-400", "bg-red-400"];

export function SkincareHome({ client }: { client: Client }) {
  const addWater = useAppStore((s) => s.addWater);
  const logCheckin = useAppStore((s) => s.logCheckin);
  const [skinScore, setSkinScore] = useState<number | null>(
    client.todayCheckin?.skinCondition ?? null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoSaved, setPhotoSaved] = useState(false);

  const scoreIndex = skinScore !== null ? Math.min(Math.floor(skinScore / 2.5), 4) : null;

  // Fix: this selector previously only updated local useState — it looked
  // functional (showed an immediate tip message) but never persisted
  // anywhere, so a refresh silently lost it and Zainab never saw it.
  // logCheckin does a FULL overwrite of today's check-in both locally and
  // in daily_checkins, so we merge with whatever's already logged today
  // rather than passing a bare { skinCondition } object — otherwise this
  // quick selector would null out weight/mood/etc if the client had
  // already done a full check-in via DailyCheckinModal today.
  function handleSkinScoreSelect(val: number) {
    setSkinScore(val);
    logCheckin(client.id, { ...(client.todayCheckin ?? {}), skinCondition: val });
  }

  // Fix: this button previously had no onClick at all, despite the
  // skin-photos storage bucket already being fully provisioned with RLS
  // (client upload/read own, nutritionist read-all) since the backend
  // migration — the frontend side of this feature was just never wired.
  // Mirrors TodayMeals.tsx's meal-photo upload pattern: {clientId}/
  // {timestamp}.{ext} path convention already matches what the storage
  // policies expect. NOTE: there's currently no viewer on Zainab's side
  // for these photos (no DB column references them — Storage's own
  // {client_id}/ folder listing is the natural way to browse them later,
  // but building that viewer is a separate, not-yet-scoped feature; this
  // fix only makes the upload itself actually work).
  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    const supabase = createClient();
    const ext = file.type === "image/png" ? "png" : "jpg";
    const path = `${client.id}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("skin-photos")
      .upload(path, file, { contentType: file.type });

    setUploadingPhoto(false);
    e.target.value = "";

    if (error) {
      console.error("Failed to upload skin photo:", error.message);
      return;
    }

    setPhotoSaved(true);
    setTimeout(() => setPhotoSaved(false), 2000);
  }

  // Real data only: checkinHistory is indexed by cycle day, so we show the
  // last (up to) 7 real logged days rather than the previous fabricated
  // array that faked 5 days of history regardless of what actually happened.
  const history = client.checkinHistory ?? [];
  const currentDay = client.planCycle.currentDay;
  const startIdx = Math.max(0, currentDay - 7);
  const recentSlice = history.slice(startIdx, currentDay);
  const recentSkin = recentSlice.map((h) => h?.skinCondition ?? null);
  const recentDayLabels = recentSlice.map((_, i) => `D${startIdx + i + 1}`);

  return (
    <div>
      <div className="bg-teal-50 px-6 pt-12 pb-6 rounded-b-[28px]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-teal-800 text-sm">{getTimeBasedGreeting()}, {client.name.split(" ")[0]}</p>
            <h1 className="font-display text-2xl text-moss-900 mt-0.5">Skin & gut reset</h1>
          </div>
          <LogoutButton className="mt-1" />
        </div>
        <PlanCycleBar cycle={client.planCycle} accent="teal" />
      </div>

      <div className="px-5 mt-4 flex flex-col gap-3">
        <div className="bg-white rounded-xl border border-sage-100/60 shadow-card p-4">
          <p className="text-xs font-medium text-moss-600 mb-3">How&apos;s your skin today?</p>
          <div className="flex gap-2 mb-3">
            {[0, 2, 5, 7, 10].map((val, i) => (
              <button
                key={val}
                onClick={() => handleSkinScoreSelect(val)}
                className={clsx(
                  "tap-scale flex-1 py-2 rounded-lg text-[10px] font-medium border",
                  skinScore === val
                    ? `${skinColors[i]} text-white border-transparent`
                    : "bg-white text-moss-600 border-sage-100"
                )}
              >
                {skinLabels[i]}
              </button>
            ))}
          </div>
          {scoreIndex !== null && (
            <div className="flex items-center gap-2 bg-teal-50 rounded-lg px-3 py-2">
              <Sparkles size={12} className="text-teal-600" />
              <p className="text-xs text-moss-600">
                {scoreIndex <= 1
                  ? "Skin is looking good — keep up the plan."
                  : scoreIndex === 2
                  ? "Mild flare-up. Make sure you're hitting your water goal today."
                  : "Breakout detected. Zainab can see this in your check-in."}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-sage-100/60 shadow-card p-3.5">
          <p className="text-xs font-medium text-moss-600 mb-2">Skin condition, recent days</p>
          <div className="flex items-end gap-1 h-12">
            {recentSkin.map((v, i) => {
              if (v === null) {
                return (
                  <div key={i} className="flex-1 flex flex-col justify-end">
                    <div className="h-1 rounded-full bg-moss-900/10" />
                  </div>
                );
              }
              const idx = Math.min(Math.floor(v / 2.5), 4);
              return (
                <div key={i} className="flex-1 flex flex-col justify-end">
                  <div
                    className={clsx("rounded-t-sm", skinColors[idx])}
                    style={{ height: `${(v / 10) * 100}%`, minHeight: 4 }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex gap-1 mt-1">
            {recentDayLabels.map((d) => (
              <p key={d} className="flex-1 text-center text-[9px] text-moss-400">{d}</p>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => addWater(client.id)}
            className="tap-scale bg-white rounded-xl border border-sage-100/60 shadow-card p-3.5 text-left"
          >
            <p className="text-xs text-moss-400 flex items-center gap-1">
              <Droplets size={11} /> Hydration
            </p>
            <p className="font-display text-xl text-moss-900 mt-1">
              {client.todayPlan.water.current}/{client.todayPlan.water.goal}
            </p>
            <p className="text-[10px] text-moss-400">glasses — tap to add</p>
          </button>
          <div className="bg-white rounded-xl border border-sage-100/60 shadow-card p-3.5">
            <p className="text-xs text-moss-400 flex items-center gap-1">
              <Flame size={11} className="text-clay-600" /> Streak
            </p>
            <p className="font-display text-xl text-moss-900 mt-1">{client.streak} days</p>
            <p className="text-[10px] text-moss-400">on the skin plan</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-sage-100/60 shadow-card p-3.5">
          <p className="text-xs font-medium text-moss-600 mb-2">Skin photo log</p>
          <p className="text-xs text-moss-400 mb-3">
            Take a photo for Zainab to track your progress visually.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className={clsx(
              "tap-scale w-full flex items-center justify-center gap-2 border border-dashed rounded-xl py-3 text-sm font-medium",
              photoSaved
                ? "border-sage-300 text-sage-700 bg-sage-50"
                : "border-teal-200 text-teal-700"
            )}
          >
            {uploadingPhoto ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving photo...
              </>
            ) : photoSaved ? (
              <>
                <Check size={16} /> Photo saved
              </>
            ) : (
              <>
                <Camera size={16} /> Take today&apos;s photo
              </>
            )}
          </button>
        </div>

        <CheckinCard client={client} accent="teal" />
        <TodayMeals clientId={client.id} plan={client.todayPlan} />
      </div>
    </div>
  );
}