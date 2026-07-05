import { PeriodLog, FlowIntensity } from "./mock-data/clients";

export function parseRelativeDate(str: string): Date | null {
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

function dayIndexForDate(date: Date, cycleStartDate: string, totalDays: number): number | null {
  const start = parseRelativeDate(cycleStartDate);
  if (!start) return null;
  const a = new Date(date);
  a.setHours(0, 0, 0, 0);
  const b = new Date(start);
  b.setHours(0, 0, 0, 0);
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = Math.round((a.getTime() - b.getTime()) / msPerDay);
  if (diff < 0 || diff >= totalDays) return null;
  return diff;
}

/**
 * Builds a totalDays-length array mapping each cycle day to a logged flow
 * intensity, or null if no flow was logged that day. Entries that fall
 * outside the current cycle's date range are dropped defensively rather
 * than crashing or mis-plotting.
 */
export function buildFlowDataForCycle(
  periodLogs: PeriodLog[] | undefined,
  cycleStartDate: string,
  totalDays: number
): (FlowIntensity | null)[] {
  const result: (FlowIntensity | null)[] = Array.from({ length: totalDays }, () => null);
  if (!periodLogs) return result;
  for (const log of periodLogs) {
    if (!log.dailyFlow) continue;
    for (const entry of log.dailyFlow) {
      const d = parseRelativeDate(entry.date);
      if (!d) continue;
      const idx = dayIndexForDate(d, cycleStartDate, totalDays);
      if (idx !== null) result[idx] = entry.intensity;
    }
  }
  return result;
}