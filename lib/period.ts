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

/**
 * Indexes a single period's flow by DAY OF THAT PERIOD (Day 1, Day 2, ...),
 * not by day-of-plan-cycle. This is the correct framing for showing the
 * client their own period, as opposed to buildFlowDataForCycle above which
 * answers "how did this 15-day nutrition cycle look" for Zainab's reports.
 * An ongoing period (no endDate) is measured up to today.
 */
export function buildFlowForPeriod(log: PeriodLog): (FlowIntensity | null)[] {
  const start = parseRelativeDate(log.startDate);
  if (!start) return [];
  const end = log.endDate ? parseRelativeDate(log.endDate) : new Date();
  if (!end) return [];

  const a = new Date(start);
  a.setHours(0, 0, 0, 0);
  const b = new Date(end);
  b.setHours(0, 0, 0, 0);
  const msPerDay = 24 * 60 * 60 * 1000;
  const spanDays = Math.max(1, Math.round((b.getTime() - a.getTime()) / msPerDay) + 1);

  const result: (FlowIntensity | null)[] = Array.from({ length: spanDays }, () => null);
  if (!log.dailyFlow) return result;

  for (const entry of log.dailyFlow) {
    const d = parseRelativeDate(entry.date);
    if (!d) continue;
    const dz = new Date(d);
    dz.setHours(0, 0, 0, 0);
    const idx = Math.round((dz.getTime() - a.getTime()) / msPerDay);
    if (idx >= 0 && idx < spanDays) result[idx] = entry.intensity;
  }
  return result;
}