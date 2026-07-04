"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { DayPlan, MealLog } from "@/lib/mock-data/clients";
import { LogMealModal } from "./LogMealModal";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sun, Sunrise, Moon, Cookie, Camera, MessageSquareText } from "lucide-react";
import clsx from "clsx";

const mealIcons: Record<string, React.ElementType> = {
  Breakfast: Sunrise,
  Lunch: Sun,
  Snack: Cookie,
  Dinner: Moon,
};

export function TodayMeals({
  clientId,
  plan,
}: {
  clientId: string;
  plan: DayPlan;
}) {
  const logMeal = useAppStore((s) => s.logMeal);
  const [loggingMealId, setLoggingMealId] = useState<string | null>(null);
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);

  const doneCount = plan.meals.filter((m) => m.status === "done").length;
  const loggingMeal = plan.meals.find((m) => m.id === loggingMealId);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-moss-600">Today&apos;s plan</h2>
        <span className="text-xs text-moss-400">{doneCount}/{plan.meals.length} done</span>
      </div>

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

      <AnimatePresence>
        {loggingMeal && (
          <LogMealModal
            mealLabel={loggingMeal.label}
            mealItems={loggingMeal.items}
            onClose={() => setLoggingMealId(null)}
            onSave={(data: MealLog) => {
              logMeal(clientId, loggingMeal.id, data);
              setLoggingMealId(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}