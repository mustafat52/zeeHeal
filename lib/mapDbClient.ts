import type { Client } from "@/lib/mock-data/clients";

/**
 * Maps a real `clients` table row (snake_case, real dates) onto the
 * Client shape the rest of the app still reads from Zustand. Deliberate
 * bridge, not a finished data layer — see the field-by-field notes below.
 * Shared between login (hydrating an existing client on sign-in) and
 * client creation (hydrating a brand-new client immediately after
 * NewClientFormModal creates them) so both stay in sync automatically.
 */
export function mapDbClientToStoreClient(row: any): Client {
  return {
    id: row.id,
    name: row.name,
    initials: row.initials,
    phone: row.phone,
    condition: row.condition,
    planType: row.plan_type,
    startDate: row.start_date,
    streak: row.streak,
    status: row.status,
    archived: row.archived ?? false,
    lastLog: row.last_log_at ?? "Never",
    planCycle: {
      cycleNumber: row.current_cycle_number,
      startDate: row.current_cycle_start,
      currentDay: row.current_cycle_day,
      totalDays: 15,
    },
    programDurationMonths: row.program_duration_months ?? undefined,
    goalWeight: row.goal_weight ?? undefined,
    monthlyRecap: row.monthly_recap ?? undefined,
    checkinConfig: row.checkin_config ?? {},
    mealConfig: row.meal_config ?? {},
    weeklyPlan: row.weekly_plan_days
      ? {
          templateId: row.weekly_plan_template_id ?? undefined,
          templateName: row.weekly_plan_template_name ?? undefined,
          days: row.weekly_plan_days,
        }
      : undefined,
    // TODO(next session): query meals for today's date, replace this placeholder
    todayPlan: { date: "Today", meals: [], water: { current: 0, goal: 8 } },
    // TODO(next session): query progress_weekly view
    progress: [],
    // Permanently empty for clients — session_notes is nutritionist-only (RLS)
    notes: [],
    // TODO(next session): query daily_checkins for the current cycle range
    checkinHistory: undefined,
    // TODO(next session): query period_logs + period_flow_logs (PCOS clients)
    periodLogs: undefined,
    // TODO(next session): query cycle_history
    cycleHistory: undefined,
    // TODO(next session): query today's daily_checkins row
    todayCheckin: undefined,
  };
}