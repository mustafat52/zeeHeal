import type { DailyCheckin } from "@/lib/mock-data/clients";

/**
 * Maps a real `daily_checkins` row (snake_case) onto the DailyCheckin
 * shape the UI already reads everywhere (client.todayCheckin, etc).
 * Fields not present on the row (e.g. a client hasn't logged that
 * particular thing today) come through as undefined, same as the mock
 * data's behavior — every consumer already checks `!== undefined` before
 * rendering a field (see ClientDetailPage's "Today's check-in" card).
 */
export function mapDbCheckinToDailyCheckin(row: any): DailyCheckin {
  return {
    weight: row.weight ?? undefined,
    sleepHours: row.sleep_hours ?? undefined,
    mood: row.mood ?? undefined,
    bloating: row.bloating ?? undefined,
    // Fix: energy previously had no UI to capture it, so this column was
    // always null — mapped here now that DailyCheckinModal actually
    // collects it (see lib/mock-data/clients.ts and store.ts's logCheckin
    // for the rest of the chain).
    energy: row.energy ?? undefined,
    activityType: row.activity_type ?? undefined,
    activityMinutes: row.activity_minutes ?? undefined,
    skinCondition: row.skin_condition ?? undefined,
    hairFall: row.hair_fall ?? undefined,
    cycleDay: row.cycle_day ?? undefined,
    waterGlasses: row.water_glasses ?? undefined,
    note: row.note ?? undefined,
    loggedAt: row.logged_at ?? undefined,
  };
}