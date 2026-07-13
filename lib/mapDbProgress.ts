import type { DailyCheckin, ProgressPoint } from "@/lib/mock-data/clients";
import { mapDbCheckinToDailyCheckin } from "@/lib/mapDbCheckin";

/**
 * Maps progress_weekly view rows (client_id, week_start, avg_weight,
 * avg_bloating, avg_energy) onto ProgressPoint[]. Week label uses a short
 * date ("Jul 6") instead of the mock's "W1"/"W2" — more meaningful once
 * it's real calendar data rather than a fixed 4-week demo window.
 */
export function mapProgressWeeklyRows(rows: any[]): ProgressPoint[] {
  return rows.map((row) => ({
    week: new Date(row.week_start).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    weight: row.avg_weight !== null ? Number(row.avg_weight) : 0,
    bloating: row.avg_bloating !== null ? Number(row.avg_bloating) : 0,
    energy: row.avg_energy !== null ? Number(row.avg_energy) : 0,
  }));
}

/**
 * Rebuilds the mock's 15-slot-array shape (index 0 = day 1 of the current
 * cycle, null = no check-in that day) from real daily_checkins rows, so
 * every consumer already written against that shape (CHART_FIELD_DEFS,
 * ActivityBarStrip, etc) keeps working completely unchanged.
 */
export function buildCheckinHistoryFromRows(
  rows: any[],
  cycleStart: string,
  totalDays: number
): (DailyCheckin | null)[] {
  const history: (DailyCheckin | null)[] = Array.from({ length: totalDays }, () => null);
  const start = new Date(cycleStart + "T00:00:00");

  for (const row of rows) {
    const rowDate = new Date(row.checkin_date + "T00:00:00");
    const dayIndex = Math.round((rowDate.getTime() - start.getTime()) / 86400000);
    if (dayIndex >= 0 && dayIndex < totalDays) {
      history[dayIndex] = mapDbCheckinToDailyCheckin(row);
    }
  }
  return history;
}