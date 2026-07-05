"use client";

import { useState } from "react";
import { PeriodLog } from "@/lib/mock-data/clients";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import clsx from "clsx";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function parseRelativeDate(str: string): Date | null {
  const today = new Date();
  if (str === "Today") return today;
  const m = str.match(/(\d+)\s+days?\s+ago/);
  if (m) {
    const d = new Date(today);
    d.setDate(d.getDate() - parseInt(m[1]));
    return d;
  }
  return null;
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

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [showModal, setShowModal] = useState(false);

  const totalDays = daysInMonth(viewYear, viewMonth);
  const firstDay = firstDayOfMonth(viewYear, viewMonth);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const hasActiveLog = periodLogs.length > 0 && !periodLogs[periodLogs.length - 1].endDate;
  const lastLog = periodLogs[periodLogs.length - 1];

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  return (
    <div className="bg-white rounded-xl border border-rose-100/70 shadow-card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-moss-900">Cycle tracker</p>
        <button
          onClick={() => setShowModal(true)}
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
          const isToday =
            day === today.getDate() &&
            viewMonth === today.getMonth() &&
            viewYear === today.getFullYear();
          const isPeriod = isPeriodDay(day, viewMonth, viewYear, periodLogs);
          return (
            <div
              key={day}
              className={clsx(
                "aspect-square flex items-center justify-center rounded-full text-[11px] font-medium mx-auto w-7 h-7",
                isPeriod && "bg-rose-400 text-white",
                isToday && !isPeriod && "bg-rose-100 text-rose-700 font-semibold",
                !isPeriod && !isToday && "text-moss-600"
              )}
            >
              {day}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-moss-900/40"
            style={{ minHeight: "100vh" }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-ivory rounded-t-[28px] px-5 pt-5 pb-10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg text-moss-900">
                  {hasActiveLog ? "Log period end" : "Log period start"}
                </h3>
                <button onClick={() => setShowModal(false)} className="tap-scale w-8 h-8 rounded-full bg-white flex items-center justify-center" aria-label="Close">
                  <X size={15} className="text-moss-600" />
                </button>
              </div>
              <p className="text-sm text-moss-400 mb-5">
                {hasActiveLog
                  ? "Mark today as the last day of your period. Zainab will see this automatically."
                  : "Mark today as the start of your period. Zainab will be notified to check your plan."}
              </p>
              <button
                onClick={() => {
                  if (hasActiveLog) logPeriodEnd(clientId);
                  else logPeriodStart(clientId);
                  setShowModal(false);
                }}
                className="tap-scale w-full flex items-center justify-center gap-2 bg-rose-500 text-white rounded-xl py-3.5 text-sm font-medium"
              >
                <Check size={16} />
                {hasActiveLog ? "Confirm period end" : "Confirm period start"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}