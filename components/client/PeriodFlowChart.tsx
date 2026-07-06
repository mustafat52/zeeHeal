"use client";

import { PeriodLog, FlowIntensity } from "@/lib/mock-data/clients";
import { buildFlowForPeriod } from "@/lib/period";

const FLOW_HEIGHT: Record<FlowIntensity, number> = { light: 35, medium: 65, heavy: 100 };
const FLOW_COLOR: Record<FlowIntensity, string> = {
  light: "bg-rose-200",
  medium: "bg-rose-400",
  heavy: "bg-rose-600",
};

export function PeriodFlowChart({ log }: { log: PeriodLog }) {
  const data = buildFlowForPeriod(log);
  if (data.length === 0) return null;

  const loggedCount = data.filter((v) => v !== null).length;

  return (
    <div className="mt-3 pt-3 border-t border-sage-100">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-moss-600">
          Flow {log.endDate ? "this period" : "so far"}
        </p>
        <span className="text-[10px] text-moss-400">
          {loggedCount}/{data.length} days logged
        </span>
      </div>
      <div className="flex items-end gap-1 h-10">
        {data.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end h-full">
            {v ? (
              <div className={`rounded-t-sm ${FLOW_COLOR[v]}`} style={{ height: `${FLOW_HEIGHT[v]}%` }} />
            ) : (
              <div className="h-[3px] rounded-full bg-moss-900/10" />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-moss-400">Day 1</span>
        <span className="text-[9px] text-moss-400">Day {data.length}</span>
      </div>
    </div>
  );
}