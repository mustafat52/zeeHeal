"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { mapDbMealRowsWithPhotos } from "@/lib/mapDbMeal";
import { enabledMealLabels, labelDefaultTimes } from "@/lib/mealConfig";
import { DayPlan, MealLog } from "@/lib/mock-data/clients";
import { LogMealModal } from "./LogMealModal";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sun, Sunrise, Moon, Cookie, Coffee, Sunset, Camera, MessageSquareText } from "lucide-react";
import clsx from "clsx";

const mealIcons: Record<string, React.ElementType> = {
  "Early Morning": Coffee,
  Breakfast: Sunrise,
  "Mid-Morning": Cookie,
  Lunch: Sun,
  Evening: Sunset,
  Dinner: Moon,
  Snack: Cookie,
};

export function TodayMeals({
  clientId,
  plan,
}: {
  clientId: string;
  plan: DayPlan;
}) {
  const client = useAppStore((s) => s.clients.find((c) => c.id === clientId));
  const logMeal = useAppStore((s) => s.logMeal);
  const setClientTodayPlan = useAppStore((s) => s.setClientTodayPlan);
  const setClientTodayWater = useAppStore((s) => s.setClientTodayWater);
  const [loggingMealId, setLoggingMealId] = useState<string | null>(null);
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);
  const [loadingToday, setLoadingToday] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Runs once per client mount: loads today's real meals if rows already
  // exist, otherwise triggers server-side generation via the
  // generate_todays_meals RPC (security definer — the client has no
  // insert privilege on `meals` at all; Zainab's plan editor is the only
  // real source of meal content, this just copies today's slice of it
  // into real rows, including each slot's default time). If no plan is
  // assigned yet, the RPC returns nothing and TodayMeals shows a "no plan
  // assigned" message. Also syncs the water counter from daily_checkins,
  // since addWater persists there but nothing was reading it back until
  // now — without this, a page refresh would show 0/8 even after real
  // taps earlier in the day.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    async function loadToday() {
      setLoadingToday(true);
      const supabase = createClient();
      const todayStr = new Date().toISOString().slice(0, 10);

      const { data: checkinRow } = await supabase
        .from("daily_checkins")
        .select("water_current, water_goal")
        .eq("client_id", clientId)
        .eq("checkin_date", todayStr)
        .maybeSingle();

      const water = {
        current: checkinRow?.water_current ?? 0,
        goal: checkinRow?.water_goal ?? 8,
      };

      if (cancelled) return;

      if (plan.meals.length > 0) {
        // Meals already present in store from an earlier hydration this
        // session — just sync water and stop here.
        setClientTodayWater(clientId, water);
        setLoadingToday(false);
        return;
      }

      const enabledLabels = enabledMealLabels(client?.mealConfig);

      const { data: rows, error: rpcError } = await supabase.rpc("generate_todays_meals", {
        target_client_id: clientId,
        enabled_labels: enabledLabels,
        label_times: labelDefaultTimes(),
      });

      if (cancelled) return;

      if (rpcError) {
        console.error("Failed to load/generate today's meals:", rpcError.message);
        setClientTodayPlan(clientId, { date: "Today", meals: [], water });
        setLoadingToday(false);
        return;
      }

      const mealsWithPhotos = await mapDbMealRowsWithPhotos(rows ?? []);
      if (cancelled) return;

      setClientTodayPlan(clientId, {
        date: "Today",
        meals: mealsWithPhotos,
        water,
      });
      setLoadingToday(false);
    }

    loadToday();
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const doneCount = plan.meals.filter((m) => m.status === "done").length;
  const loggingMeal = plan.meals.find((m) => m.id === loggingMealId);

  async function handleLogMealSave(data: { photo?: string; file?: File; note?: string }) {
    if (!loggingMeal) return;

    let photoStoragePath: string | undefined;
    if (data.file) {
      setUploadingPhoto(true);
      const supabase = createClient();
      const ext = data.file.type === "image/png" ? "png" : "jpg";
      const path = `${clientId}/${loggingMeal.id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("meal-photos")
        .upload(path, data.file, { contentType: data.file.type });
      setUploadingPhoto(false);
      if (uploadError) {
        console.error("Failed to upload meal photo:", uploadError.message);
      } else {
        photoStoragePath = path;
      }
    }

    const log: MealLog = { photo: data.photo, note: data.note, loggedAt: "Just now" };
    logMeal(clientId, loggingMeal.id, log, photoStoragePath);
    setLoggingMealId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-moss-600">Today&apos;s plan</h2>
        <span className="text-xs text-moss-400">{doneCount}/{plan.meals.length} done</span>
      </div>

      {loadingToday && (
        <p className="text-xs text-moss-400 text-center py-6">Loading today&apos;s plan...</p>
      )}

      {!loadingToday && plan.meals.length === 0 && (
        <p className="text-xs text-moss-400 text-center py-6">
          No meal plan assigned yet — check back once Zainab sets one up.
        </p>
      )}

      {!loadingToday && plan.meals.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {plan.meals.map((meal, i) => {
            const Icon = mealIcons[meal.label] ?? Sun;
            const done = meal.status === "done";
            const expanded = expandedMealId === meal.id;
            return (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="bg-white rounded-xl border border-sage-100/60 shadow-card px-3.5 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "w-9 h-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden",
                    done ? "bg-sage-100" : "bg-moss-900/[0.04]"
                  )}>
                    {meal.log?.photo
                      ? <img src={meal.log.photo} alt="" className="w-full h-full object-cover" />
                      : <Icon size={16} className={done ? "text-sage-600" : "text-moss-400"} />
                    }
                  </div>
                  <div className="flex-1">
                    <p className={clsx("text-sm font-medium", done ? "text-moss-400" : "text-moss-900")}>
                      {meal.label} · {meal.time}
                    </p>
                    <p className={clsx("text-xs mt-0.5", done ? "text-moss-400/70" : "text-moss-400")}>
                      {meal.log?.note ? meal.log.note : meal.items}
                    </p>
                  </div>
                  {done ? (
                    <div className="w-6 h-6 rounded-full bg-sage-600 flex items-center justify-center shrink-0">
                      <Check size={13} className="text-white" />
                    </div>
                  ) : (
                    <button
                      onClick={() => setLoggingMealId(meal.id)}
                      className="tap-scale shrink-0 flex items-center gap-1.5 bg-sage-600 text-white text-xs font-medium px-3 py-2 rounded-full"
                    >
                      <Camera size={13} /> Log
                    </button>
                  )}
                </div>

                {meal.reasoning && (
                  <div className="mt-2 pt-2 border-t border-sage-100/80">
                    <button
                      onClick={() => setExpandedMealId(expanded ? null : meal.id)}
                      className="tap-scale flex items-center gap-1.5 text-xs font-medium text-sage-600"
                    >
                      <MessageSquareText size={12} />
                      {expanded ? "Hide why Zainab picked this" : "Why did Zainab pick this?"}
                    </button>
                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 bg-sage-50 rounded-lg p-3 flex gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-sage-100 flex items-center justify-center text-[10px] font-medium text-sage-800 shrink-0">
                              ZB
                            </div>
                            <p className="text-xs text-moss-600 leading-relaxed italic">
                              {meal.reasoning}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {loggingMeal && (
          <LogMealModal
            mealLabel={loggingMeal.label}
            mealItems={loggingMeal.items}
            onClose={() => setLoggingMealId(null)}
            onSave={handleLogMealSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}