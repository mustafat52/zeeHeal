"use client";

import { PlanCycle } from "@/lib/mock-data/clients";
import clsx from "clsx";

export function PlanCycleBar({ cycle }: { cycle: PlanCycle }) {
  const { currentDay, totalDays, cycleNumber } = cycle;
  const pct = Math.min((currentDay / totalDays) * 100, 100);
  const daysLeft = totalDays - currentDay;
  const nearEnd = daysLeft <= 3;

  return (
    <div className="bg-white/60 rounded-xl px-4 py-3 border border-white/80">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-moss-600">
          Plan cycle {cycleNumber} · Day {currentDay} of {totalDays}
        </p>
        <span
          className={clsx(
            "text-[11px] font-medium px-2 py-0.5 rounded-full",
            nearEnd
              ? "bg-clay-100 text-clay-600"
              : "bg-sage-100 text-sage-700"
          )}
        >
          {nearEnd ? `${daysLeft}d left — review soon` : `${daysLeft} days left`}
        </span>
      </div>
      <div className="h-1.5 bg-moss-900/10 rounded-full overflow-hidden">
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-500",
            nearEnd ? "bg-clay-400" : "bg-sage-600"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-moss-400">Day 1</span>
        <span className="text-[10px] text-moss-400">Day 15 · plan review</span>
      </div>
    </div>
  );
}