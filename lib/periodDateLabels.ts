/**
 * PeriodLog and its nested dailyFlow entries store dates as relative
 * label strings ("Today", "3 days ago") rather than real dates — a
 * mock-era design PeriodCalendar.tsx, PeriodFlowChart.tsx, and
 * PeriodFlowStrip.tsx are all built around. Rather than rewriting those
 * three working components to operate on real ISO dates, these two
 * functions convert at the boundary: real dates from Supabase become
 * relative labels when loaded, and relative labels become real dates
 * when persisted. Every existing component keeps working unchanged.
 */

export function relativeLabelToISODate(label: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (label === "Today") return today.toISOString().slice(0, 10);
  const m = label.match(/(\d+)\s+days?\s+ago/);
  if (m) {
    const d = new Date(today);
    d.setDate(d.getDate() - parseInt(m[1]));
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