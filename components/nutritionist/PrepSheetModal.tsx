"use client";

import { motion } from "framer-motion";
import { Client } from "@/lib/mock-data/clients";
import { X, TrendingDown, TrendingUp, Minus } from "lucide-react";

function trendIcon(change: number) {
  if (change < -0.2) return TrendingDown;
  if (change > 0.2) return TrendingUp;
  return Minus;
}

export function PrepSheetModal({ client, onClose }: { client: Client; onClose: () => void }) {
  const progress = client.progress;
  const first = progress[0];
  const last = progress[progress.length - 1];
  const weightChange = last.weight - first.weight;
  const bloatingChange = last.bloating - first.bloating;
  const WeightTrend = trendIcon(weightChange);
  const BloatTrend = trendIcon(bloatingChange);

  const totalMeals = client.todayPlan.meals.length;
  const doneMeals = client.todayPlan.meals.filter((m) => m.status === "done").length;
  const adherence = totalMeals > 0 ? Math.round((doneMeals / totalMeals) * 100) : 0;

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
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-moss-400">Before your call with</p>
          <button onClick={onClose} className="tap-scale w-8 h-8 rounded-full bg-white flex items-center justify-center" aria-label="Close">
            <X size={16} className="text-moss-600" />
          </button>
        </div>
        <h2 className="font-display text-2xl text-moss-900 mb-4">{client.name}</h2>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-xl border border-sage-100/60 p-3.5">
            <p className="text-xs text-moss-400 mb-1">Today&apos;s adherence</p>
            <p className="font-display text-xl text-moss-900">{adherence}%</p>
          </div>
          <div className="bg-white rounded-xl border border-sage-100/60 p-3.5">
            <p className="text-xs text-moss-400 mb-1">Days on plan</p>
            <p className="font-display text-xl text-moss-900">{client.streak}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-sage-100/60 p-3.5 mb-4">
          <p className="text-xs font-medium text-moss-600 mb-3">Since {client.startDate}</p>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-moss-900">Weight</span>
            <span className="flex items-center gap-1 text-sm font-medium text-moss-900">
              <WeightTrend size={13} className={weightChange < 0 ? "text-sage-600" : "text-clay-600"} />
              {Math.abs(weightChange).toFixed(1)} kg {weightChange < 0 ? "down" : weightChange > 0 ? "up" : "no change"}
            </span>
          </div>
          <div className="h-px bg-sage-100" />
          <div className="flex items-center justify-between py-1.5 pt-2.5">
            <span className="text-sm text-moss-900">Bloating</span>
            <span className="flex items-center gap-1 text-sm font-medium text-moss-900">
              <BloatTrend size={13} className={bloatingChange < 0 ? "text-sage-600" : "text-clay-600"} />
              {bloatingChange < 0 ? "Improving" : bloatingChange > 0 ? "Worsening" : "Stable"}
            </span>
          </div>
        </div>

        <p className="text-xs font-medium text-moss-600 mb-2">Recent notes</p>
        <div className="flex flex-col gap-2 mb-1">
          {client.notes.slice(0, 3).map((note, i) => (
            <div key={i} className="bg-white rounded-xl border border-sage-100/60 p-3">
              <p className="text-[11px] text-moss-400 mb-0.5">{note.date}</p>
              <p className="text-sm text-moss-900">{note.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
