"use client";

import { Client } from "@/lib/mock-data/clients";
import { useAppStore } from "@/lib/store";
import { PlanCycleBar } from "../PlanCycleBar";
import { TodayMeals } from "../TodayMeals";
import { CheckinCard } from "../CheckinCard";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { Droplets, Flame, TrendingUp, TrendingDown, Minus } from "lucide-react";

const moodEmojis = ["😞", "😕", "🙂", "😊", "🤩"];
const mockMoodHistory = [3, 4, 2, 3, 4, 4, 3];
const mockEnergyHistory = [4, 5, 3, 4, 5, 6, 5];
const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1">
      <div className="w-full h-16 flex items-end justify-center">
        <div
          className={`w-3 rounded-t-sm ${color}`}
          style={{ height: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );
}

export function HormonalHome({ client }: { client: Client }) {
  const addWater = useAppStore((s) => s.addWater);

  const todayMood = client.todayCheckin?.mood;
  const todayEnergy = client.progress[client.progress.length - 1]?.energy ?? 5;
  const energyChange = client.progress.length >= 2
    ? client.progress[client.progress.length - 1].energy - client.progress[client.progress.length - 2].energy
    : 0;

  const EnergyIcon = energyChange > 0 ? TrendingUp : energyChange < 0 ? TrendingDown : Minus;
  const energyColor = energyChange > 0 ? "text-sage-600" : energyChange < 0 ? "text-clay-600" : "text-moss-400";

  return (
    <div>
      <div className="bg-sage-100 px-6 pt-12 pb-6 rounded-b-[28px]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sage-800 text-sm">Good morning, {client.name.split(" ")[0]}</p>
            <h1 className="font-display text-2xl text-moss-900 mt-0.5">Hormone balance plan</h1>
          </div>
          <LogoutButton className="mt-1" />
        </div>
        <PlanCycleBar cycle={client.planCycle} />
      </div>

      <div className="px-5 mt-4 flex flex-col gap-3">
        <div className="bg-white rounded-xl border border-sage-100/60 shadow-card p-3.5">
          <p className="text-xs font-medium text-moss-600 mb-3">Mood & energy this week</p>
          <div className="flex gap-1 mb-1">
            {mockMoodHistory.map((v, i) => (
              <MiniBar key={i} value={v} max={5} color="bg-clay-200" />
            ))}
          </div>
          <div className="flex gap-1 mb-2">
            {mockEnergyHistory.map((v, i) => (
              <MiniBar key={i} value={v} max={7} color="bg-sage-200" />
            ))}
          </div>
          <div className="flex gap-1">
            {dayLabels.map((d) => (
              <p key={d} className="flex-1 text-center text-[9px] text-moss-400">{d}</p>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-2.5">
            <span className="flex items-center gap-1 text-[10px] text-moss-400">
              <span className="w-2 h-2 rounded-sm bg-clay-200 inline-block" /> Mood
            </span>
            <span className="flex items-center gap-1 text-[10px] text-moss-400">
              <span className="w-2 h-2 rounded-sm bg-sage-200 inline-block" /> Energy
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-sage-100/60 shadow-card p-3">
            <p className="text-[10px] text-moss-400">Today mood</p>
            <p className="text-xl mt-0.5">{todayMood ? moodEmojis[todayMood - 1] : "—"}</p>
          </div>
          <div className="bg-white rounded-xl border border-sage-100/60 shadow-card p-3">
            <p className="text-[10px] text-moss-400">Energy</p>
            <p className="font-display text-lg text-moss-900 mt-0.5 flex items-center gap-1">
              {todayEnergy}
              <EnergyIcon size={12} className={energyColor} />
            </p>
          </div>
          <div className="bg-white rounded-xl border border-sage-100/60 shadow-card p-3">
            <p className="text-[10px] text-moss-400">Streak</p>
            <p className="font-display text-lg text-moss-900 mt-0.5 flex items-center gap-1">
              <Flame size={13} className="text-clay-600" />{client.streak}d
            </p>
          </div>
        </div>

        <button
          onClick={() => addWater(client.id)}
          className="tap-scale bg-white rounded-xl border border-sage-100/60 shadow-card p-3.5 text-left flex items-center gap-3"
        >
          <Droplets size={20} className="text-sage-600" />
          <div className="flex-1">
            <p className="text-xs text-moss-400">Water today</p>
            <p className="text-sm font-medium text-moss-900">
              {client.todayPlan.water.current} of {client.todayPlan.water.goal} glasses
            </p>
          </div>
          <div className="h-2 flex-1 max-w-[80px] bg-moss-900/8 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage-400 rounded-full"
              style={{ width: `${(client.todayPlan.water.current / client.todayPlan.water.goal) * 100}%` }}
            />
          </div>
        </button>

        <CheckinCard client={client} />
        <TodayMeals clientId={client.id} plan={client.todayPlan} />
      </div>
    </div>
  );
}