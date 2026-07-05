"use client";

import { FlowIntensity } from "@/lib/mock-data/clients";

const FLOW_HEIGHT: Record<FlowIntensity, number> = { light: 35, medium: 65, heavy: 100 };
const FLOW_COLOR: Record<FlowIntensity, string> = {
  light: "bg-rose-200",
  medium: "bg-rose-400",
  heavy: "bg-rose-600",
};

export function PeriodFlowStrip({
  data,
  totalDays,
}: {
  data: (FlowIntensity | null)[];
  totalDays: number;
}) {
  const loggedCount = data.slice(0, totalDays).filter((v) => v !== null).length;

  return (
    <div className="bg-white rounded-xl border border-sage-100/60 p-3.5 mb-3">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-xs font-medium text-moss-600">Period flow</p>
        <span className="text-[10px] text-moss-400">
          {loggedCount} day{loggedCount === 1 ? "" : "s"} logged
        </span>
      </div>
      <div className="flex items-end gap-[3px] h-14">
        {Array.from({ length: totalDays }, (_, i) => {
          const v = data[i];
          return (
            <div key={i} className="flex-1 flex flex-col justify-end h-full">
              {v ? (
                <div className={`rounded-t-sm ${FLOW_COLOR[v]}`} style={{ height: `${FLOW_HEIGHT[v]}%` }} />
              ) : (
                <div className="h-[3px] rounded-full bg-moss-900/5" />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1.5 mb-2">
        <span className="text-[9px] text-moss-400">Day 1</span>
        <span className="text-[9px] text-moss-400">Day {totalDays}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 text-[9px] text-moss-400">
          <span className="w-2 h-2 rounded-sm bg-rose-200 inline-block" /> Light
        </span>
        <span className="flex items-center gap-1 text-[9px] text-moss-400">
          <span className="w-2 h-2 rounded-sm bg-rose-400 inline-block" /> Medium
        </span>
        <span className="flex items-center gap-1 text-[9px] text-moss-400">
          <span className="w-2 h-2 rounded-sm bg-rose-600 inline-block" /> Heavy
        </span>
      </div>
    </div>
  );
}