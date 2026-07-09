"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { ChevronLeft, Save } from "lucide-react";
import clsx from "clsx";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const defaultMealLabels = ["Breakfast", "Lunch", "Dinner"];

function blankWeek(): Record<string, { label: string; items: string }[]> {
  const week: Record<string, { label: string; items: string }[]> = {};
  for (const day of days) {
    week[day] = defaultMealLabels.map((label) => ({ label, items: "" }));
  }
  return week;
}

export default function ClientPlanEditorPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const client = useAppStore((s) => s.clients.find((c) => c.id === clientId));
  const setClientWeeklyPlan = useAppStore((s) => s.setClientWeeklyPlan);

  const [activeDay, setActiveDay] = useState("Mon");
  const [draft, setDraft] = useState(() => client?.weeklyPlan?.days ?? blankWeek());
  const [dirtyDays, setDirtyDays] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState(false);

  if (!client) return null;

  function updateMeal(day: string, index: number, items: string) {
    setDraft((prev) => ({
      ...prev,
      [day]: prev[day].map((m, i) => (i === index ? { ...m, items } : m)),
    }));
    setDirtyDays((prev) => new Set(prev).add(day));
  }

  function handleSave() {
    setClientWeeklyPlan(client!.id, draft);
    setDirtyDays(new Set());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="pt-12 px-5 pb-10">
      <button onClick={() => router.back()} className="tap-scale flex items-center gap-1 text-moss-600 text-sm mb-4">
        <ChevronLeft size={16} /> Back
      </button>

      <h1 className="font-display text-2xl text-moss-900 mb-1">Edit weekly plan</h1>
      <p className="text-sm text-moss-400 mb-1">{client.name}</p>
      <p className="text-xs text-moss-400 mb-5">
        {client.weeklyPlan?.templateName
          ? `Forked from: ${client.weeklyPlan.templateName} — editing here only changes their plan, not the template.`
          : "No template assigned — building a plan from scratch for this client."}
      </p>

      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={clsx(
              "tap-scale shrink-0 relative px-4 py-2 rounded-full text-sm font-medium border",
              activeDay === day
                ? "bg-sage-600 text-white border-sage-600"
                : "bg-white text-moss-600 border-sage-100"
            )}
          >
            {day}
            {dirtyDays.has(day) && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 border border-white" />
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {draft[activeDay]?.map((meal, i) => (
          <div key={meal.label} className="bg-white rounded-xl border border-sage-100/60 shadow-card p-3.5">
            <p className="text-xs text-moss-400 mb-1.5">{meal.label}</p>
            <input
              value={meal.items}
              onChange={(e) => updateMeal(activeDay, i, e.target.value)}
              placeholder={`What's for ${meal.label.toLowerCase()}?`}
              className="w-full bg-sage-50/60 border border-sage-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-sage-400"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="tap-scale w-full flex items-center justify-center gap-2 bg-sage-600 text-white rounded-xl py-3.5 text-sm font-medium"
      >
        <Save size={16} /> {saved ? "Saved" : "Save plan"}
      </button>
      <p className="text-[11px] text-moss-400 text-center mt-2">
        {dirtyDays.size > 0
          ? `${dirtyDays.size} day${dirtyDays.size === 1 ? "" : "s"} with unsaved changes — saving updates all 7 days at once`
          : "Saving updates all 7 days at once"}
      </p>
    </div>
  );
}