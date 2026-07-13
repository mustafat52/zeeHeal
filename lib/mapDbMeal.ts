import type { DayPlan } from "@/lib/mock-data/clients";

/**
 * Maps a real `meals` row onto the shape TodayMeals/LogMealModal expect.
 * log.photo is intentionally left undefined here — log_photo_path is a
 * Storage path, not a displayable URL. Rendering a previously-logged
 * photo needs a signed URL fetch (supabase.storage.from(...).createSignedUrl),
 * which isn't wired yet. The note and timestamp still show correctly;
 * only the inline photo thumbnail is the gap, flagged for a follow-up.
 */
export function mapDbMealToUiMeal(row: any): DayPlan["meals"][number] {
  return {
    id: row.id,
    label: row.label,
    time: row.time ?? "",
    items: row.items,
    status: row.status,
    reasoning: row.reasoning ?? undefined,
    log:
      row.log_note || row.logged_at
        ? {
            note: row.log_note ?? undefined,
            loggedAt: row.logged_at ?? undefined,
          }
        : undefined,
  };
}