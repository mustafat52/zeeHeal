import { parseRelativeDate } from "./period";

/**
 * PeriodLog and its nested dailyFlow entries store dates as relative
 * label strings ("Today", "3 days ago") rather than real dates — a
 * mock-era design PeriodCalendar.tsx, PeriodFlowChart.tsx, and
 * PeriodFlowStrip.tsx are all built around. Rather than rewriting those
 * three working components to operate on real ISO dates, these two
 * functions convert at the boundary: real dates from Supabase become
 * relative labels when loaded, and relative labels become real dates
 * when persisted. Every existing component keeps working unchanged.
 *
 * Fix: relativeLabelToISODate previously had its own inline regex-based
 * parsing, duplicating the exact same "Today"/"N days ago" logic already
 * living in lib/period.ts's parseRelativeDate (and, until this same
 * cleanup, a THIRD copy inside PeriodCalendar.tsx). Now reuses that one
 * canonical parser instead of maintaining a second copy that could drift
 * out of sync with it.
 */

export function relativeLabelToISODate(label: string): string {
  const parsed = parseRelativeDate(label);
  if (parsed) {
    const d = new Date(parsed);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }
  // Fallback — if it's already ISO-shaped, trust it as-is rather than
  // silently dropping the value.
  return label;
}

export function isoDateToRelativeLabel(isoDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(isoDate + "T00:00:00");
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}