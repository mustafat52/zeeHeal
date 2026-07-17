"use client";

import { useEffect, useState } from "react";
import { PeriodLog, FlowIntensity } from "@/lib/mock-data/clients";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { mapDbPeriodLogRows } from "@/lib/mapDbPeriod";
import { parseRelativeDate } from "@/lib/period";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import clsx from "clsx";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const FLOW_BG: Record<FlowIntensity, string> = {
  light: "bg-rose-200",
  medium: "bg-rose-400",
  heavy: "bg-rose-600",
};

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

// Fix: this file previously had its own local copy of parseRelativeDate,
// identical to the one in lib/period.ts — now imported from there instead
// (see period.ts and periodDateLabels.ts, which shared this exact
// duplication problem). One canonical implementation, three consumers.

/** Converts an actual Date back into the app's relative-string format. */
function labelForDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function isPeriodDay(day: number, month: number, year: number, logs: PeriodLog[]): boolean {
  const target = new Date(year, month, day);
  for (const log of logs) {
    const start = parseRelativeDate(log.startDate);
    const end = log.endDate ? parseRelativeDate(log.endDate) : null;
    if (!start) continue;
    if (end) {
      if (target >= start && target <= end) return true;
    } else {
      if (target.toDateString() === start.toDateString()) return true;
    }
  }
  return false;
}

function flowForDay(day: number, month: number, year: number, logs: PeriodLog[]): FlowIntensity | null {
  const target = new Date(year, month, day);
  for (const log of logs) {
    if (!log.dailyFlow) continue;
    for (const entry of log.dailyFlow) {
      const d = parseRelativeDate(entry.date);
      if (d && isSameDay(d, target)) return entry.intensity;
    }
  }
  return null;
}

export function PeriodCalendar({
  clientId,
  periodLogs,
}: {
  clientId: string;
  periodLogs: PeriodLog[];
}) {
  const logPeriodStart = useAppStore((s) => s.logPeriodStart);
  const logPeriodEnd = useAppStore((s) => s.logPeriodEnd);
  const logPeriodFlow = useAppStore((s) => s.logPeriodFlow);
  const setClientPeriodLogs = useAppStore((s) => s.setClientPeriodLogs);

  // Loads real period_logs + their nested period_flow_logs on mount,
  // converting real dates back into the relative-label PeriodLog[] shape
  // this component (and PeriodFlowChart/PeriodFlowStrip) already expect.
  // Nothing else in this file changes — the periodLogs prop just starts
  // reflecting real data once the parent (PCOSHome) re-renders with the
  // updated store value.
  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    async function loadPeriods() {
      const supabase = createClient();
      const { data: logs, error } = await supabase
        .from("period_logs")
        .select("*, period_flow_logs(*)")
        .eq("client_id", clientId)
        .order("start_date", { ascending: true });

      if (cancelled || error || !logs) return;
      setClientPeriodLogs(clientId, mapDbPeriodLogRows(logs));
    }

    loadPeriods();
    return () => {
      cancelled = true;
    };
  }, [clientId, setClientPeriodLogs]);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // Unified sheet state for both the fixed "today" pill button AND tapping
  // any individual calendar day.
  const [sheet, setSheet] = useState<
    | null
    | { kind: "startEnd"; label: string }
    | { kind: "flow"; label: string }
  >(null);

  const totalDays = daysInMonth(viewYear, viewMonth);
  const firstDay = firstDayOfMonth(viewYear, viewMonth);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const hasActiveLog = periodLogs.length > 0 && !periodLogs[periodLogs.length - 1].endDate;
  const lastLog = periodLogs[periodLogs.length - 1];
  const activeStart = hasActiveLog ? parseRelativeDate(lastLog.startDate) : null;

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function handleDayTap(day: number) {
    const clicked = new Date(viewYear, viewMonth, day);
    clicked.setHours(0, 0, 0, 0);
    const todayZero = new Date();
    todayZero.setHours(0, 0, 0, 0);

    if (clicked > todayZero) return; // no logging future dates

    const label = labelForDate(clicked);

    if (hasActiveLog && activeStart && clicked >= activeStart) {
      // Within the ongoing period — log/edit that day's flow.
      setSheet({ kind: "flow", label });
    } else if (!hasActiveLog) {
      // No active period — offer to start one on the tapped day.
      setSheet({ kind: "startEnd", label });
    }
    // Tapping a day inside an already-closed past period is a no-op for now.
  }

  const todaysFlowForSheet =
    sheet?.kind === "flow"
      ? lastLog?.dailyFlow?.find((f) => f.date === sheet.label)?.intensity
      : undefined;

  return (
    <div className="bg-white rounded-xl border border-rose-100/70 shadow-card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-moss-900">Cycle tracker</p>
        <button
          onClick={() => setSheet({ kind: "startEnd", label: "Today" })}
          className={clsx(
            "tap-scale text-xs font-medium px-3 py-1.5 rounded-full",
            hasActiveLog
              ? "bg-rose-100 text-rose-700"
              : "bg-rose-50 text-rose-600"
          )}
        >
          {hasActiveLog ? "Log period end" : "Log period start"}
        </button>
      </div>

      {lastLog && (
        <div className="flex items-center gap-2 mb-3 bg-rose-50 rounded-lg px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
          <p className="text-xs text-moss-600">
            {hasActiveLog
              ? `Period started ${lastLog.startDate}`
              : `Last period: ${lastLog.startDate}${lastLog.endDate ? ` – ${lastLog.endDate}` : ""}`}
          </p>
        </div>
      )}

      {hasActiveLog && (
        <div className="mb-3">
          <p className="text-[11px] font-medium text-moss-500 mb-1.5">Today&apos;s flow</p>
          <div className="flex gap-2">
            {(["light", "medium", "heavy"] as const).map((level) => {
              const todaysFlow = lastLog?.dailyFlow?.find((f) => f.date === "Today")?.intensity;
              const selected = todaysFlow === level;
              return (
                <button
                  key={level}
                  onClick={() => logPeriodFlow(clientId, level)}
                  className={clsx(
                    "tap-scale flex-1 py-1.5 rounded-lg text-[11px] font-medium capitalize border",
                    selected && level === "light" && "bg-rose-200 border-rose-200 text-rose-800",
                    selected && level === "medium" && "bg-rose-400 border-rose-400 text-white",
                    selected && level === "heavy" && "bg-rose-600 border-rose-600 text-white",
                    !selected && "bg-white border-sage-100 text-moss-600"
                  )}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-[10px] text-moss-400 mb-2">Tap any past day to log or edit it directly</p>

      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="tap-scale p-1" aria-label="Previous month">
          <ChevronLeft size={16} className="text-moss-400" />
        </button>
        <p className="text-xs font-medium text-moss-700">
          {MONTHS[viewMonth]} {viewYear}
        </p>
        <button onClick={nextMonth} className="tap-scale p-1" aria-label="Next month">
          <ChevronRight size={16} className="text-moss-400" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-[10px] text-moss-400 font-medium py-1">
            {d}
          </div>
        ))}
        {blanks.map((b) => <div key={`b${b}`} />)}
        {days.map((day) => {
          const cellDate = new Date(viewYear, viewMonth, day);
          const isFuture = cellDate.setHours(0,0,0,0) > new Date().setHours(0,0,0,0);
          const isToday =
            day === today.getDate() &&
            viewMonth === today.getMonth() &&
            viewYear === today.getFullYear();
          const isPeriod = isPeriodDay(day, viewMonth, viewYear, periodLogs);
          const flow = isPeriod ? flowForDay(day, viewMonth, viewYear, periodLogs) : null;
          return (
            <button
              key={day}
              onClick={() => handleDayTap(day)}
              disabled={isFuture}
              className={clsx(
                "aspect-square flex items-center justify-center rounded-full text-[11px] font-medium mx-auto w-7 h-7 tap-scale",
                isFuture && "opacity-30 cursor-not-allowed",
                isPeriod && (flow ? FLOW_BG[flow] : "bg-rose-400") && "text-white",
                isPeriod && (flow ? FLOW_BG[flow] : "bg-rose-400"),
                isToday && !isPeriod && "bg-rose-100 text-rose-700 font-semibold",
                !isPeriod && !isToday && "text-moss-600"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {sheet && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-moss-900/40"
            style={{ minHeight: "100vh" }}
            onClick={() => setSheet(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-ivory rounded-t-[28px] px-5 pt-5 pb-10"
            >
              {sheet.kind === "startEnd" ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg text-moss-900">
                      {hasActiveLog ? "Log period end" : "Log period start"}
                    </h3>
                    <button onClick={() => setSheet(null)} className="tap-scale w-8 h-8 rounded-full bg-white flex items-center justify-center" aria-label="Close">
                      <X size={15} className="text-moss-600" />
                    </button>
                  </div>
                  <p className="text-sm text-moss-400 mb-5">
                    {hasActiveLog
                      ? `Mark ${sheet.label === "Today" ? "today" : sheet.label} as the last day of your period. Zainab will see this automatically.`
                      : `Mark ${sheet.label === "Today" ? "today" : sheet.label} as the start of your period. Zainab will be notified to check your plan.`}
                  </p>
                  <button
                    onClick={() => {
                      if (hasActiveLog) logPeriodEnd(clientId, sheet.label);
                      else logPeriodStart(clientId, sheet.label);
                      setSheet(null);
                    }}
                    className="tap-scale w-full flex items-center justify-center gap-2 bg-rose-500 text-white rounded-xl py-3.5 text-sm font-medium"
                  >
                    <Check size={16} />
                    {hasActiveLog ? "Confirm period end" : "Confirm period start"}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg text-moss-900">
                      Log flow · {sheet.label === "Today" ? "Today" : sheet.label}
                    </h3>
                    <button onClick={() => setSheet(null)} className="tap-scale w-8 h-8 rounded-full bg-white flex items-center justify-center" aria-label="Close">
                      <X size={15} className="text-moss-600" />
                    </button>
                  </div>
                  <div className="flex gap-2 mb-2">
                    {(["light", "medium", "heavy"] as const).map((level) => {
                      const selected = todaysFlowForSheet === level;
                      return (
                        <button
                          key={level}
                          onClick={() => {
                            logPeriodFlow(clientId, level, sheet.label);
                            setSheet(null);
                          }}
                          className={clsx(
                            "tap-scale flex-1 py-3 rounded-xl text-sm font-medium capitalize border",
                            selected && level === "light" && "bg-rose-200 border-rose-200 text-rose-800",
                            selected && level === "medium" && "bg-rose-400 border-rose-400 text-white",
                            selected && level === "heavy" && "bg-rose-600 border-rose-600 text-white",
                            !selected && "bg-white border-sage-100 text-moss-600"
                          )}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}