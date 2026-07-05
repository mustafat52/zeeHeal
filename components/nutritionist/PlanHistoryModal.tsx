"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Client } from "@/lib/mock-data/clients";
import { DailyBarStrip } from "./DailyBarStrip";
import { PeriodFlowStrip } from "./PeriodFlowStrip";
import { buildFlowDataForCycle } from "@/lib/period";
import { X, ChevronDown, History } from "lucide-react";

export function PlanHistoryModal({ client, onClose }: { client: Client; onClose: () => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const history = [...(client.cycleHistory ?? [])].reverse(); // most recent cycle first

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
          <p className="text-xs font-medium text-moss-400 flex items-center gap-1.5">
            <History size={13} /> Plan history
          </p>
          <button onClick={onClose} className="tap-scale w-8 h-8 rounded-full bg-white flex items-center justify-center" aria-label="Close">
            <X size={16} className="text-moss-600" />
          </button>
        </div>
        <h2 className="font-display text-2xl text-moss-900 mb-4">{client.name}</h2>

        {history.length === 0 && (
          <p className="text-sm text-moss-400 text-center py-8">No completed cycles yet.</p>
        )}

        <div className="flex flex-col gap-2.5">
          {history.map((cycle, i) => {
            const isOpen = openIndex === i;
            const totalDays = cycle.checkinHistory.length;
            const loggedCount = cycle.checkinHistory.filter((h) => h !== null).length;

            const sleepData = cycle.checkinHistory.map((h) => h?.sleepHours ?? null);
            const waterData = cycle.checkinHistory.map((h) => h?.waterGlasses ?? null);
            const activityData = cycle.checkinHistory.map((h) => h?.activityMinutes ?? null);
            const moodData = cycle.checkinHistory.map((h) => h?.mood ?? null);
            const skinData = cycle.checkinHistory.map((h) => h?.skinCondition ?? null);
            const flowData = buildFlowDataForCycle(client.periodLogs, cycle.startDate, totalDays);

            return (
              <div key={cycle.cycleNumber} className="bg-white rounded-xl border border-sage-100/60 shadow-card overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="tap-scale w-full flex items-center justify-between p-3.5"
                >
                  <div className="text-left">
                    <p className="text-sm font-medium text-moss-900">Cycle {cycle.cycleNumber}</p>
                    <p className="text-xs text-moss-400">
                      Started {cycle.startDate} · {loggedCount}/{totalDays} days logged · streak {cycle.streakAtEnd}
                    </p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-moss-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-3.5 pb-3.5">
                    <DailyBarStrip label="Sleep (hrs)" data={sleepData} totalDays={totalDays} max={9} colorClass="bg-violet-300" />
                    <DailyBarStrip
                      label="Water (glasses)"
                      data={waterData}
                      totalDays={totalDays}
                      max={client.todayPlan.water.goal}
                      colorClass="bg-sage-400"
                    />
                    {client.condition === "weight-loss" && (
                      <DailyBarStrip label="Activity (minutes)" data={activityData} totalDays={totalDays} max={40} colorClass="bg-amber-400" />
                    )}
                    {(client.condition === "pcos" || client.condition === "hormonal") && (
                      <DailyBarStrip
                        label="Mood (1–5)"
                        data={moodData}
                        totalDays={totalDays}
                        max={5}
                        colorClass={client.condition === "pcos" ? "bg-rose-400" : "bg-violet-500"}
                      />
                    )}
                    {client.condition === "skincare" && (
                      <DailyBarStrip label="Skin condition (0–10, lower is clearer)" data={skinData} totalDays={totalDays} max={10} colorClass="bg-teal-400" />
                    )}
                    {client.condition === "pcos" && <PeriodFlowStrip data={flowData} totalDays={totalDays} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}