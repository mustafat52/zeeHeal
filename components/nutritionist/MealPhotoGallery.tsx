"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapDbMealRowsWithPhotos } from "@/lib/mapDbMeal";
import type { DayPlan } from "@/lib/mock-data/clients";
import { Loader2 } from "lucide-react";

type GalleryMeal = DayPlan["meals"][number] & { mealDate: string };

/**
 * Multi-day meal photo history for Zainab's side. Unlike TodayMeals.tsx
 * (today only, client-facing), this pulls every meal row this client has
 * ever logged a photo for, across all dates — a real gallery rather than
 * a single-day view.
 *
 * Richer than SkinPhotoGallery.tsx by design: meals rows already carry
 * structured data (label, meal_date, log_note) that skin photos don't
 * have any equivalent of, so each tile shows what was logged and when,
 * not just a bare thumbnail. Reuses mapDbMealRowsWithPhotos (same signed-
 * URL resolution already powering TodayMeals.tsx) rather than
 * reimplementing photo-URL logic a third time.
 */
export function MealPhotoGallery({ clientId }: { clientId: string }) {
  const [meals, setMeals] = useState<GalleryMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    async function loadMealPhotos() {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const { data: rows, error: fetchError } = await supabase
        .from("meals")
        .select("*")
        .eq("client_id", clientId)
        .not("log_photo_path", "is", null)
        .order("meal_date", { ascending: false });

      if (cancelled) return;

      if (fetchError) {
        setError("Couldn't load meal photos.");
        setLoading(false);
        return;
      }

      if (!rows || rows.length === 0) {
        setMeals([]);
        setLoading(false);
        return;
      }

      const mapped = await mapDbMealRowsWithPhotos(rows);
      if (cancelled) return;

      const withDates: GalleryMeal[] = mapped.map((m, i) => ({
        ...m,
        mealDate: rows[i].meal_date,
      }));

      setMeals(withDates);
      setLoading(false);
    }

    loadMealPhotos();
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-moss-400 text-xs">
        <Loader2 size={14} className="animate-spin" /> Loading meal photos...
      </div>
    );
  }

  if (error) {
    return <p className="text-xs text-clay-600 text-center py-4">{error}</p>;
  }

  if (meals.length === 0) {
    return (
      <p className="text-xs text-moss-400 text-center py-4">
        No meal photos logged yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {meals.map((meal) => (
        <a
          key={meal.id}
          href={meal.log?.photo}
          target="_blank"
          rel="noopener noreferrer"
          className="tap-scale rounded-xl overflow-hidden bg-white border border-sage-100/60"
        >
          <div className="relative aspect-square bg-moss-900/5">
            {meal.log?.photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={meal.log.photo} alt={meal.label} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="p-2">
            <p className="text-[11px] font-medium text-moss-900">{meal.label}</p>
            <p className="text-[10px] text-moss-400">
              {new Date(meal.mealDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
            {meal.log?.note && (
              <p className="text-[10px] text-moss-600 italic mt-1 line-clamp-2">&quot;{meal.log.note}&quot;</p>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}