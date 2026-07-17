import type { CycleSnapshot } from "@/lib/mock-data/clients";
import { buildCheckinHistoryFromRows } from "@/lib/mapDbProgress";
import { isoDateToRelativeLabel } from "@/lib/periodDateLabels";

/**
 * Builds CycleSnapshot[] from the real cycle_history table plus the
 * client's FULL daily_checkins history (not pre-filtered per cycle).
 *
 * cycle_history only stores cycle_number/start_date/end_date/streak_at_end
 * — never a frozen checkinHistory array, since with real dates a past
 * cycle's day-by-day data is always recoverable as a date-range query
 * rather than something that needs separate storage (matches
 * 0001_init.sql's own comment on why the table is shaped this way).
 *
 * buildCheckinHistoryFromRows already bounds-checks each row's date
 * against the given cycle's range, so passing the same full checkin list
 * for every past cycle and letting it filter is simpler and cheaper than
 * a separate query per cycle.
 */
export function buildCycleHistoryFromRows(
  cycleRows: any[],
  checkinRows: any[]
): CycleSnapshot[] {
  return cycleRows.map((row) => {
    const start = new Date(row.start_date + "T00:00:00");
    const end = new Date(row.end_date + "T00:00:00");
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);

    return {
      cycleNumber: row.cycle_number,
      // Converted to the relative-label format PlanHistoryModal expects —
      // it passes this straight into buildFlowDataForCycle, which
      // internally parses via parseRelativeDate ("Today"/"N days ago"
      // only). Same conversion-boundary pattern as periodDateLabels.ts
      // and CycleReportModal's identical conversion for planCycle.startDate.
      startDate: isoDateToRelativeLabel(row.start_date),
      // buildCheckinHistoryFromRows needs the RAW ISO date here, not the
      // relative label above — it does real Date arithmetic against it.
      checkinHistory: buildCheckinHistoryFromRows(checkinRows, row.start_date, totalDays),
      streakAtEnd: row.streak_at_end,
    };
  });
}