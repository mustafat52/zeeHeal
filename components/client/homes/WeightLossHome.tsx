"use client";

import { Client } from "@/lib/mock-data/clients";
import { useAppStore } from "@/lib/store";
import { getTimeBasedGreeting } from "@/lib/greetings";
import { PlanCycleBar } from "../PlanCycleBar";
import { TodayMeals } from "../TodayMeals";
import { CheckinCard } from "../CheckinCard";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { Droplets, Flame, TrendingDown, Target } from "lucide-react";

export function WeightLossHome({ client }: { client: Client }) {
  const addWater = useAppStore((s) => s.addWater);

  const currentWeight = client.progress[client.progress.length - 1]?.weight ?? 0;
  const startWeight = client.progress[0]?.weight ?? currentWeight;
  const lost = parseFloat((startWeight - currentWeight).toFixed(1));
  const toGo = client.goalWeight
    ? parseFloat((currentWeight - client.goalWeight).toFixed(1))
    : null;
  const progressPct = client.goalWeight
    ? Math.min(Math.round((lost / (startWeight - client.goalWeight)) * 100), 100)
    : 0;

  return (
    <div>
      <div className="bg-amber-50 px-6 pt-12 pb-6 rounded-b-[28px]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-amber-800 text-sm">{getTimeBasedGreeting()}, {client.name.split(" ")[0]}</p>
            <h1 className="font-display text-2xl text-moss-900 mt-0.5">Your weight loss plan</h1>
          </div>
          <LogoutButton className="mt-1" />
        </div>
        <PlanCycleBar cycle={client.planCycle} accent="amber" />
      </div>

      <div className="px-5 mt-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-sage-100/60 shadow-card p-3.5">
            <p className="text-xs text-moss-400 mb-1">Lost so far</p>
            <p className="font-display text-xl text-moss-900">
              {lost > 0 ? `-${lost}` : "0"} kg
            </p>
            {lost > 0 && (
              <p className="text-xs text-sage-600 flex items-center gap-1 mt-1">
                <TrendingDown size={12} /> great progress
              </p>
            )}
          </div>
          <div className="bg-white rounded-xl border border-sage-100/60 shadow-card p-3.5">
            <p className="text-xs text-moss-400 mb-1">Goal weight</p>
            <p className="font-display text-xl text-moss-900">
              {client.goalWeight ?? "—"} kg
            </p>
            {toGo !== null && toGo > 0 && (
              <p className="text-xs text-moss-400 mt-1">{toGo} kg to go</p>
            )}
          </div>
        </div>

        {client.goalWeight && (
          <div className="bg-white rounded-xl border border-sage-100/60 shadow-card p-3.5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-moss-600 flex items-center gap-1.5">
                <Target size={13} className="text-amber-600" /> Goal progress
              </p>
              <span className="text-xs text-moss-400">{progressPct}%</span>
            </div>
            <div className="h-2 bg-moss-900/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-moss-400">
              <span>{startWeight} kg</span>
              <span>{client.goalWeight} kg</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-sage-100/60 shadow-card p-3.5">
            <p className="text-xs text-moss-400">Streak</p>
            <p className="font-display text-xl text-moss-900 mt-0.5 flex items-center gap-1.5">
              <Flame size={16} className="text-clay-600" /> {client.streak} days
            </p>
          </div>
          <button
            onClick={() => addWater(client.id)}
            className="tap-scale bg-white rounded-xl border border-sage-100/60 shadow-card p-3.5 text-left"
          >
            <p className="text-xs text-moss-400">Water</p>
            <p className="font-display text-xl text-moss-900 mt-0.5 flex items-center gap-1.5">
              <Droplets size={16} className="text-sage-600" />
              {client.todayPlan.water.current}/{client.todayPlan.water.goal}
            </p>
          </button>
        </div>

        <CheckinCard client={client} accent="amber" />
        <TodayMeals clientId={client.id} plan={client.todayPlan} />
      </div>
    </div>
  );
}