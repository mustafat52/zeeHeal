"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { LogMealModal } from "@/components/client/LogMealModal";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Droplets, Flame, Sun, Sunrise, Moon, Cookie, Camera, MessageSquareText } from "lucide-react";
import clsx from "clsx";

const mealIcons: Record<string, any> = {
  Breakfast: Sunrise,
  Lunch: Sun,
  Snack: Cookie,
  Dinner: Moon,
};

export default function ClientHomePage() {
  const activeClientId = useAppStore((s) => s.activeClientId);
  const client = useAppStore((s) => s.clients.find((c) => c.id === activeClientId));
  const logMeal = useAppStore((s) => s.logMeal);
  const addWater = useAppStore((s) => s.addWater);
  const [loggingMealId, setLoggingMealId] = useState<string | null>(null);
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);

  if (!client) return null;

  const doneCount = client.todayPlan.meals.filter((m) => m.status === "done").length;
  const loggingMeal = client.todayPlan.meals.find((m) => m.id === loggingMealId);

  return (
    <div>
      <div className="bg-sage-100 px-6 pt-12 pb-6 rounded-b-[28px]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sage-800 text-sm">Good evening, {client.name.split(" ")[0]}</p>
            <h1 className="font-display text-2xl text-moss-900 mt-1">
              Day {client.streak} of your plan
            </h1>
            <Pill tone="sage">{client.planType}</Pill>
          </div>
          <LogoutButton className="mt-1" />
        </div>
      </div>

      <div className="px-5 -mt-3">
        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-clay-600" />
            <div>
              <p className="text-xs text-moss-400">Streak</p>
              <p className="font-medium text-moss-900">{client.streak} days</p>
            </div>
          </div>
          <div className="w-px h-8 bg-sage-100" />
          <button
            onClick={() => addWater(client.id)}
            className="flex items-center gap-2 tap-scale"
          >
            <Droplets size={18} className="text-sage-600" />
            <div className="text-left">
              <p className="text-xs text-moss-400">Water</p>
              <p className="font-medium text-moss-900">
                {client.todayPlan.water.current}/{client.todayPlan.water.goal} glasses
              </p>
            </div>
          </button>
        </Card>
      </div>

      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-moss-600">Today&apos;s plan</h2>
          <span className="text-xs text-moss-400">
            {doneCount}/{client.todayPlan.meals.length} done
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {client.todayPlan.meals.map((meal, i) => {
            const Icon = mealIcons[meal.label] ?? Sun;
            const done = meal.status === "done";
            const expanded = expandedMealId === meal.id;
            return (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card className="py-3">
                  <div
                    onClick={() => setLoggingMealId(meal.id)}
                    className="flex items-center gap-3 tap-scale cursor-pointer"
                  >
                    <div
                      className={clsx(
                        "w-9 h-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden",
                        done ? "bg-sage-100" : "bg-moss-900/[0.04]"
                      )}
                    >
                      {meal.log?.photo ? (
                        <img src={meal.log.photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Icon size={16} className={done ? "text-sage-600" : "text-moss-400"} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={clsx(
                          "text-sm font-medium",
                          done ? "text-moss-400" : "text-moss-900"
                        )}
                      >
                        {meal.label} · {meal.time}
                      </p>
                      <p
                        className={clsx(
                          "text-xs mt-0.5",
                          done ? "text-moss-400/70" : "text-moss-400"
                        )}
                      >
                        {meal.log?.note ? meal.log.note : meal.items}
                      </p>
                    </div>
                    {done ? (
                      <div className="w-6 h-6 rounded-full bg-sage-600 border-sage-600 flex items-center justify-center shrink-0">
                        <Check size={13} className="text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-sage-200 flex items-center justify-center shrink-0">
                        <Camera size={12} className="text-sage-400" />
                      </div>
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
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {loggingMeal && (
          <LogMealModal
            mealLabel={loggingMeal.label}
            mealItems={loggingMeal.items}
            onClose={() => setLoggingMealId(null)}
            onSave={(data) => {
              logMeal(client.id, loggingMeal.id, data);
              setLoggingMealId(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}