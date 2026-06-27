"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import clsx from "clsx";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const weekMeals: Record<string, { label: string; items: string }[]> = {
  Mon: [
    { label: "Breakfast", items: "Moong dal chilla, mint chutney" },
    { label: "Lunch", items: "Khichdi, cucumber raita" },
    { label: "Dinner", items: "Vegetable soup, grilled paneer" },
  ],
  Tue: [
    { label: "Breakfast", items: "Vegetable poha, flax seeds" },
    { label: "Lunch", items: "Brown rice, dal, sauteed greens" },
    { label: "Dinner", items: "Grilled fish, steamed vegetables" },
  ],
  Wed: [
    { label: "Breakfast", items: "Oats idli, sambhar" },
    { label: "Lunch", items: "Quinoa pulao, raita" },
    { label: "Dinner", items: "Tofu stir-fry, brown rice" },
  ],
  Thu: [
    { label: "Breakfast", items: "Besan chilla, coriander chutney" },
    { label: "Lunch", items: "Roti, lauki sabzi, dal" },
    { label: "Dinner", items: "Clear soup, grilled chicken" },
  ],
  Fri: [
    { label: "Breakfast", items: "Smoothie bowl, chia seeds" },
    { label: "Lunch", items: "Millet khichdi, salad" },
    { label: "Dinner", items: "Paneer bhurji, multigrain roti" },
  ],
  Sat: [
    { label: "Breakfast", items: "Vegetable upma" },
    { label: "Lunch", items: "Rajma, brown rice, salad" },
    { label: "Dinner", items: "Vegetable soup, grilled tofu" },
  ],
  Sun: [
    { label: "Breakfast", items: "Stuffed paratha (light), curd" },
    { label: "Lunch", items: "Dal, sabzi, roti, salad" },
    { label: "Dinner", items: "Khichdi, ghee" },
  ],
};

export default function ClientPlanPage() {
  const [activeDay, setActiveDay] = useState("Mon");

  return (
    <div className="pt-12 px-5">
      <h1 className="font-display text-2xl text-moss-900 mb-1">Your plan</h1>
      <Pill tone="sage">Gut health reset · week 2</Pill>

      <div className="flex gap-2 mt-5 overflow-x-auto no-scrollbar pb-1">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={clsx(
              "tap-scale shrink-0 px-4 py-2 rounded-full text-sm font-medium border",
              activeDay === day
                ? "bg-sage-600 text-white border-sage-600"
                : "bg-white text-moss-600 border-sage-100"
            )}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2.5 mt-5">
        {weekMeals[activeDay].map((meal) => (
          <Card key={meal.label}>
            <p className="text-xs text-moss-400 mb-1">{meal.label}</p>
            <p className="text-sm font-medium text-moss-900">{meal.items}</p>
          </Card>
        ))}
      </div>

      <p className="text-xs text-moss-400 text-center mt-6">
        Need a swap? Message Zainab from the chat tab.
      </p>
    </div>
  );
}
