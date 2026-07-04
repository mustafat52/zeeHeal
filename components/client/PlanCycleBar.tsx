"use client";

import { PlanCycle } from "@/lib/mock-data/clients";
import clsx from "clsx";

type Accent = "amber" | "rose" | "violet" | "teal";

const ACCENT_STYLES: Record<Accent, { pillBg: string; pillText: string; barFill: string }> = {
  amber: { pillBg: "bg-amber-100", pillText: "text-amber-700", barFill: "bg-amber-500" },
  rose: { pillBg: "bg-rose-100", pillText: "text-rose-700", barFill: "bg-rose-500" },
  violet: { pillBg: "bg-violet-100", pillText: "text-violet-700", barFill: "bg-violet-500" },
  teal: { pillBg: "bg-teal-100", pillText: "text-teal-700", barFill: "bg-teal-500" },
};

export function PlanCycleBar({ cycle, accent }: { cycle: PlanCycle; accent?: Accent }) {
  const { currentDay, totalDays, cycleNumber } = cycle;
  const pct = Math.min((currentDay / totalDays) * 100, 100);
  const daysLeft = totalDays - currentDay;
  const nearEnd = daysLeft <= 3;
  const style = accent
    ? ACCENT_STYLES[accent]
    : { pillBg: "bg-sage-100", pillText: "text-sage-700", barFill: "bg-sage-600" };

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
              : `${style.pillBg} ${style.pillText}`
          )}
        >
          {nearEnd ? `${daysLeft}d left — review soon` : `${daysLeft} days left`}
        </span>
      </div>
      <div className="h-1.5 bg-moss-900/10 rounded-full overflow-hidden">
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-500",
            nearEnd ? "bg-clay-400" : style.barFill
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