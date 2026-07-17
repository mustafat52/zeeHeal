import type { DayPlan } from "@/lib/mock-data/clients";
import { createClient } from "@/lib/supabase/client";

/**
 * Maps a real `meals` row onto the shape TodayMeals/LogMealModal expect.
 * log.photo is left undefined here — log_photo_path is a Storage path,
 * not a displayable URL, and generating a signed URL is async while this
 * mapper is a plain sync function. Use mapDbMealRowsWithPhotos below when
 * you actually need the photo to render (e.g. the client's own Today's
 * plan view) — this sync version stays available for any caller that
 * doesn't need the thumbnail.
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
      row.log_note || row.logged_at || row.log_photo_path
        ? {
            note: row.log_note ?? undefined,
            loggedAt: row.logged_at ?? undefined,
          }
        : undefined,
  };
}

/**
 * Fix: previously log.photo was permanently undefined for every reload —
 * upload worked (log_photo_path got saved), but nothing ever generated a
 * signed URL to render it back, so a client who'd logged a photo lost the
 * thumbnail (and the "📷 Photo attached" indicator on Zainab's side) the
 * moment they left and returned. Mirrors the exact pattern already used
 * for voice notes in lib/mapDbMessages.ts (private bucket -> 1hr signed
 * URL per row that has a path).
 */
export async function mapDbMealRowsWithPhotos(rows: any[]): Promise<DayPlan["meals"]> {
  const supabase = createClient();

  return Promise.all(
    rows.map(async (row) => {
      const base = mapDbMealToUiMeal(row);

      if (!row.log_photo_path) return base;

      const { data: signed } = await supabase.storage
        .from("meal-photos")
        .createSignedUrl(row.log_photo_path, 3600);

      return {
        ...base,
        log: {
          ...(base.log ?? {}),
          photo: signed?.signedUrl,
        },
      };
    })
  );
}