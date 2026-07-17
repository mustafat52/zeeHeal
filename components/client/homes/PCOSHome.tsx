"use client";

import { Client } from "@/lib/mock-data/clients";
import { useAppStore } from "@/lib/store";
import { getTimeBasedGreeting } from "@/lib/greetings";
import { PlanCycleBar } from "../PlanCycleBar";
import { TodayMeals } from "../TodayMeals";
import { CheckinCard } from "../CheckinCard";
import { PeriodCalendar } from "../PeriodCalendar";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { Droplets, Flame, Activity } from "lucide-react";

export function PCOSHome({ client }: { client: Client }) {
  const addWater = useAppStore((s) => s.addWater);
  const todayCheckin = client.todayCheckin;
  // Fix: hasActivePeriod / lastPeriod were computed here but never used —
  // PeriodCalendar below already surfaces active-period status internally
  // ("Period started X days ago" banner), so this was dead code left over
  // from an earlier version, not a missing feature. Removed rather than
  // wired to something new, since there's nothing else on this screen
  // that needs it.

  return (
    <div>
      <div className="bg-rose-50 px-6 pt-12 pb-6 rounded-b-[28px]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-rose-800 text-sm">{getTimeBasedGreeting()}, {client.name.split(" ")[0]}</p>
            <h1 className="font-display text-2xl text-moss-900 mt-0.5">PCOS care plan</h1>
          </div>
          <LogoutButton className="mt-1" />
        </div>
        <PlanCycleBar cycle={client.planCycle} accent="rose" />
      </div>

      <div className="px-5 mt-4 flex flex-col gap-3">
        <PeriodCalendar
          clientId={client.id}
          periodLogs={client.periodLogs ?? []}
        />

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

        {(todayCheckin?.bloating !== undefined || todayCheckin?.mood !== undefined || todayCheckin?.hairFall !== undefined) && (
          <div className="bg-white rounded-xl border border-sage-100/60 shadow-card p-3.5">
            <p className="text-xs font-medium text-moss-600 mb-2.5 flex items-center gap-1.5">
              <Activity size={13} className="text-rose-600" /> Today&apos;s symptoms
            </p>
            <div className="flex gap-3 flex-wrap">
              {todayCheckin?.bloating !== undefined && (
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-moss-400">Bloating</p>
                  <p className="text-sm font-medium text-moss-900">{todayCheckin.bloating}/10</p>
                </div>
              )}
              {todayCheckin?.mood !== undefined && (
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-moss-400">Mood</p>
                  <p className="text-sm font-medium text-moss-900">{["😞","😕","🙂","😊","🤩"][todayCheckin.mood - 1]}</p>
                </div>
              )}
              {todayCheckin?.hairFall !== undefined && (
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-moss-400">Hair fall</p>
                  <p className="text-sm font-medium text-moss-900">{todayCheckin.hairFall}/10</p>
                </div>
              )}
              {todayCheckin?.skinCondition !== undefined && (
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-moss-400">Skin</p>
                  <p className="text-sm font-medium text-moss-900">{todayCheckin.skinCondition}/10</p>
                </div>
              )}
            </div>
          </div>
        )}

        <CheckinCard client={client} accent="rose" />
        <TodayMeals clientId={client.id} plan={client.todayPlan} />
      </div>
    </div>
  );
}