import type { PeriodLog, FlowIntensity } from "@/lib/mock-data/clients";
import { isoDateToRelativeLabel } from "./periodDateLabels";

/**
 * Maps period_logs rows (each with nested period_flow_logs via Supabase's
 * relationship join) into the relative-label PeriodLog[] shape used
 * throughout the UI. Shared between PeriodCalendar.tsx's load effect
 * (client side) and ClientDetailPage's load effect (nutritionist side) so
 * both stay in sync automatically rather than maintaining two copies of
 * the same mapping logic.
 */
export function mapDbPeriodLogRows(rows: any[]): PeriodLog[] {
  return rows.map((row) => ({
    startDate: isoDateToRelativeLabel(row.start_date),
    endDate: row.end_date ? isoDateToRelativeLabel(row.end_date) : undefined,
    cycleLength: row.cycle_length ?? undefined,
    dailyFlow: (row.period_flow_logs ?? []).map((f: any) => ({
      date: isoDateToRelativeLabel(f.flow_date),
      intensity: f.intensity as FlowIntensity,
    })),
  }));
}