"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Droplet, Target } from "lucide-react";
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

const weightLossWeekMeals: Record<string, { label: string; items: string }[]> = {
  Mon: [
    { label: "Breakfast", items: "Vegetable oats, boiled egg" },
    { label: "Lunch", items: "Multigrain roti, dal, salad" },
    { label: "Dinner", items: "Grilled chicken, sauteed vegetables" },
  ],
  Tue: [
    { label: "Breakfast", items: "Moong dal chilla, mint chutney" },
    { label: "Lunch", items: "Brown rice, rajma, salad" },
    { label: "Dinner", items: "Grilled fish, steamed vegetables" },
  ],
  Wed: [
    { label: "Breakfast", items: "Besan chilla, coriander chutney" },
    { label: "Lunch", items: "Quinoa salad, grilled tofu" },
    { label: "Dinner", items: "Vegetable soup, grilled chicken" },
  ],
  Thu: [
    { label: "Breakfast", items: "Sprouts salad, boiled egg" },
    { label: "Lunch", items: "Multigrain roti, chana, salad" },
    { label: "Dinner", items: "Tofu stir-fry, brown rice" },
  ],
  Fri: [
    { label: "Breakfast", items: "Vegetable poha, flax seeds" },
    { label: "Lunch", items: "Brown rice, dal, sauteed greens" },
    { label: "Dinner", items: "Grilled fish, salad" },
  ],
  Sat: [
    { label: "Breakfast", items: "Oats idli, sambhar" },
    { label: "Lunch", items: "Rajma, brown rice, salad" },
    { label: "Dinner", items: "Grilled chicken, multigrain roti" },
  ],
  Sun: [
    { label: "Breakfast", items: "Egg bhurji, multigrain toast" },
    { label: "Lunch", items: "Dal, sabzi, roti, salad" },
    { label: "Dinner", items: "Clear soup, grilled fish" },
  ],
};

/**
 * Real numbers only — no calorie/macro estimates. This app has stayed
 * qualitative everywhere (reasoning text, not numeric targets), and
 * weight-loss is exactly the condition where introducing calorie-counting
 * for the first time carries real risk. kg progress is the one number
 * already used throughout the app, so it's kept as the only figure here.
 */
function getWeightLossSummary(client: { progress: { weight: number }[]; goalWeight?: number }) {
  if (client.goalWeight === undefined || client.progress.length === 0) return null;
  const start = client.progress[0].weight;
  const current = client.progress[client.progress.length - 1].weight;
  const lost = parseFloat((start - current).toFixed(1));
  const toGo = parseFloat((current - client.goalWeight).toFixed(1));
  return { lost, toGo };
}

/**
 * Real, data-driven only — computed from the client's actual last few
 * logged check-ins (checkinHistory), not fabricated. Priority: a dipped
 * mood matters more than short sleep, so it's checked first. Returns null
 * if there isn't enough logged history yet to say anything meaningful.
 */
function getHormonalSummary(client: { checkinHistory?: ({ mood?: number; sleepHours?: number } | null)[] }) {
  const logged = (client.checkinHistory ?? []).filter((h): h is { mood?: number; sleepHours?: number } => h !== null);
  const recent = logged.slice(-5); // last up to 5 real logged days
  if (recent.length === 0) return null;

  const moods = recent.map((h) => h.mood).filter((v): v is number => v !== undefined);
  const sleeps = recent.map((h) => h.sleepHours).filter((v): v is number => v !== undefined);
  const avgMood = moods.length ? moods.reduce((a, b) => a + b, 0) / moods.length : null;
  const avgSleep = sleeps.length ? sleeps.reduce((a, b) => a + b, 0) / sleeps.length : null;

  if (avgMood !== null && avgMood < 3.5) {
    return {
      headline: "Mood's dipped a bit recently",
      tip: "Magnesium-rich foods — leafy greens, nuts, seeds — and steady blood sugar meals can help support mood balance.",
    };
  }
  if (avgSleep !== null && avgSleep < 6.5) {
    return {
      headline: "Sleep's been a bit short this week",
      tip: "Avoiding heavy or spicy dinners, and a calming tea like chamomile in the evening, can support better rest.",
    };
  }
  return {
    headline: "Mood and sleep have been steady",
    tip: "Keep this rhythm going — consistency is doing real work here.",
  };
}

type PcosPhaseKey = "menstrual" | "follicular" | "ovulatory" | "luteal";

const pcosPhaseMeals: Record<PcosPhaseKey, Record<string, { label: string; items: string }[]>> = {
  menstrual: {
    Mon: [
      { label: "Breakfast", items: "Ragi porridge with dates" },
      { label: "Lunch", items: "Palak paneer, brown rice" },
      { label: "Dinner", items: "Beetroot soup, grilled fish" },
    ],
    Tue: [
      { label: "Breakfast", items: "Sesame and date smoothie, soaked almonds" },
      { label: "Lunch", items: "Rajma, quinoa" },
      { label: "Dinner", items: "Chicken stew, sauteed greens" },
    ],
    Wed: [
      { label: "Breakfast", items: "Pomegranate and spinach smoothie" },
      { label: "Lunch", items: "Sarson ka saag, makki roti" },
      { label: "Dinner", items: "Dal palak, brown rice" },
    ],
    Thu: [
      { label: "Breakfast", items: "Jaggery oats porridge" },
      { label: "Lunch", items: "Chana masala, brown rice" },
      { label: "Dinner", items: "Grilled fish, beet salad" },
    ],
    Fri: [
      { label: "Breakfast", items: "Beetroot paratha, curd" },
      { label: "Lunch", items: "Spinach dal, roti" },
      { label: "Dinner", items: "Egg curry, sauteed spinach" },
    ],
    Sat: [
      { label: "Breakfast", items: "Dates and nut smoothie" },
      { label: "Lunch", items: "Rajma chawal" },
      { label: "Dinner", items: "Chicken soup, leafy greens" },
    ],
    Sun: [
      { label: "Breakfast", items: "Ragi dosa, chutney" },
      { label: "Lunch", items: "Palak khichdi" },
      { label: "Dinner", items: "Fish curry, brown rice" },
    ],
  },
  follicular: {
    Mon: [
      { label: "Breakfast", items: "Fresh fruit bowl, chia pudding" },
      { label: "Lunch", items: "Quinoa salad, grilled vegetables" },
      { label: "Dinner", items: "Vegetable stir-fry, tofu" },
    ],
    Tue: [
      { label: "Breakfast", items: "Oats with berries" },
      { label: "Lunch", items: "Moong salad, sprouts" },
      { label: "Dinner", items: "Grilled paneer, salad" },
    ],
    Wed: [
      { label: "Breakfast", items: "Green smoothie bowl" },
      { label: "Lunch", items: "Chickpea and vegetable bowl" },
      { label: "Dinner", items: "Vegetable soup, multigrain roti" },
    ],
    Thu: [
      { label: "Breakfast", items: "Vegetable poha" },
      { label: "Lunch", items: "Brown rice, dal, salad" },
      { label: "Dinner", items: "Grilled fish, sauteed greens" },
    ],
    Fri: [
      { label: "Breakfast", items: "Fruit chaat, mixed nuts" },
      { label: "Lunch", items: "Quinoa pulao" },
      { label: "Dinner", items: "Tofu stir-fry" },
    ],
    Sat: [
      { label: "Breakfast", items: "Idli, sambhar" },
      { label: "Lunch", items: "Lentil salad bowl" },
      { label: "Dinner", items: "Vegetable khichdi" },
    ],
    Sun: [
      { label: "Breakfast", items: "Vegetable upma, coconut chutney" },
      { label: "Lunch", items: "Roti, sabzi, salad" },
      { label: "Dinner", items: "Clear soup, grilled chicken" },
    ],
  },
  ovulatory: {
    Mon: [
      { label: "Breakfast", items: "Mixed berry smoothie" },
      { label: "Lunch", items: "Colourful vegetable salad, quinoa" },
      { label: "Dinner", items: "Grilled salmon, roasted vegetables" },
    ],
    Tue: [
      { label: "Breakfast", items: "Pomegranate yogurt bowl" },
      { label: "Lunch", items: "Rainbow salad, chickpeas" },
      { label: "Dinner", items: "Stir-fried vegetables, tofu" },
    ],
    Wed: [
      { label: "Breakfast", items: "Green smoothie" },
      { label: "Lunch", items: "Beet and carrot salad" },
      { label: "Dinner", items: "Grilled fish, sauteed greens" },
    ],
    Thu: [
      { label: "Breakfast", items: "Mixed berry oats" },
      { label: "Lunch", items: "Colourful vegetable pulao" },
      { label: "Dinner", items: "Paneer tikka, salad" },
    ],
    Fri: [
      { label: "Breakfast", items: "Citrus fruit bowl" },
      { label: "Lunch", items: "Quinoa vegetable bowl" },
      { label: "Dinner", items: "Grilled chicken, roasted vegetables" },
    ],
    Sat: [
      { label: "Breakfast", items: "Antioxidant berry smoothie" },
      { label: "Lunch", items: "Lentil salad bowl" },
      { label: "Dinner", items: "Vegetable curry, brown rice" },
    ],
    Sun: [
      { label: "Breakfast", items: "Fruit and nut bowl" },
      { label: "Lunch", items: "Roti, mixed vegetable sabzi" },
      { label: "Dinner", items: "Fish curry, sauteed greens" },
    ],
  },
  luteal: {
    Mon: [
      { label: "Breakfast", items: "Banana oats" },
      { label: "Lunch", items: "Brown rice, rajma" },
      { label: "Dinner", items: "Grilled paneer, roasted vegetables" },
    ],
    Tue: [
      { label: "Breakfast", items: "Peanut butter multigrain toast" },
      { label: "Lunch", items: "Whole wheat roti, dal, sabzi" },
      { label: "Dinner", items: "Grilled fish, sweet potato" },
    ],
    Wed: [
      { label: "Breakfast", items: "Nut and seed smoothie" },
      { label: "Lunch", items: "Millet khichdi" },
      { label: "Dinner", items: "Chicken stew, leafy greens" },
    ],
    Thu: [
      { label: "Breakfast", items: "Oats with almond butter" },
      { label: "Lunch", items: "Brown rice, chana" },
      { label: "Dinner", items: "Paneer curry, roti" },
    ],
    Fri: [
      { label: "Breakfast", items: "Whole grain paratha, curd" },
      { label: "Lunch", items: "Quinoa, dal" },
      { label: "Dinner", items: "Grilled tofu, sweet potato mash" },
    ],
    Sat: [
      { label: "Breakfast", items: "Banana smoothie, mixed nuts" },
      { label: "Lunch", items: "Roti, rajma" },
      { label: "Dinner", items: "Fish curry, brown rice" },
    ],
    Sun: [
      { label: "Breakfast", items: "Multigrain toast, nut butter" },
      { label: "Lunch", items: "Khichdi, ghee" },
      { label: "Dinner", items: "Chicken soup, leafy greens" },
    ],
  },
};

/**
 * Estimates PCOS cycle phase from real, already-collected data: an active
 * period log takes priority (menstrual), otherwise the client's self-logged
 * cycleDay (from their daily check-in) is used. Returns null if neither is
 * available — meals fall back to the generic set rather than guessing.
 */
function getPcosPhase(hasActivePeriod: boolean, cycleDay: number | undefined) {
  if (hasActivePeriod) {
    return {
      key: "menstrual" as PcosPhaseKey,
      phase: "Menstrual phase",
      tip: "Iron and B12-rich foods help offset what's lost during your period — leafy greens, dal, and lean protein are the focus this week.",
    };
  }
  if (cycleDay !== undefined) {
    if (cycleDay <= 13) {
      return {
        key: "follicular" as PcosPhaseKey,
        phase: "Follicular phase",
        tip: "Energy is usually rising through this phase — lighter, fresh meals with plenty of fibre support it well.",
      };
    }
    if (cycleDay === 14) {
      return {
        key: "ovulatory" as PcosPhaseKey,
        phase: "Ovulatory phase",
        tip: "Antioxidant-rich foods — berries, colourful vegetables — support this phase.",
      };
    }
    return {
      key: "luteal" as PcosPhaseKey,
      phase: "Luteal phase",
      tip: "Cravings and bloating are common here — complex carbs and magnesium-rich foods (nuts, seeds) can help steady mood and digestion.",
    };
  }
  return null;
}

export default function ClientPlanPage() {
  const [activeDay, setActiveDay] = useState("Mon");
  const activeClientId = useAppStore((s) => s.activeClientId);
  const client = useAppStore((s) => s.clients.find((c) => c.id === activeClientId));

  if (!client) return null;

  const hasActivePeriod =
    !!client.periodLogs?.length && !client.periodLogs[client.periodLogs.length - 1].endDate;
  const pcosPhase =
    client.condition === "pcos" ? getPcosPhase(hasActivePeriod, client.todayCheckin?.cycleDay) : null;
  const weightLossSummary = client.condition === "weight-loss" ? getWeightLossSummary(client) : null;
  const hormonalSummary = client.condition === "hormonal" ? getHormonalSummary(client) : null;

  const activeMeals = pcosPhase
    ? pcosPhaseMeals[pcosPhase.key]
    : client.condition === "weight-loss"
    ? weightLossWeekMeals
    : weekMeals;

  return (
    <div className="pt-12 px-5">
      <h1 className="font-display text-2xl text-moss-900 mb-1">Your plan</h1>
      <Pill tone="sage">{client.planType}</Pill>

      {client.condition === "pcos" && (
        <div className="mt-4">
          {pcosPhase ? (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <Droplet size={13} className="text-rose-600" />
                </div>
                <p className="text-sm font-medium text-rose-800">{pcosPhase.phase}</p>
              </div>
              <p className="text-xs text-moss-600 leading-relaxed">{pcosPhase.tip}</p>
              <p className="text-[10px] text-rose-700/70 mt-2 pt-2 border-t border-rose-100/60">
                This week&apos;s meals below are set for your {pcosPhase.phase.toLowerCase()}.
              </p>
            </div>
          ) : (
            <div className="bg-sage-50 border border-sage-100 rounded-xl p-4">
              <p className="text-xs text-moss-600">
                Log your cycle day in your daily check-in to get phase-specific meals here.
              </p>
            </div>
          )}
        </div>
      )}

      {client.condition === "weight-loss" && weightLossSummary && (
        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Target size={13} className="text-amber-600" />
            </div>
            <p className="text-sm font-medium text-amber-800">
              {weightLossSummary.lost > 0 ? `${weightLossSummary.lost} kg lost so far` : "Just getting started"}
            </p>
          </div>
          <p className="text-xs text-moss-600 leading-relaxed">
            {weightLossSummary.toGo > 0
              ? `${weightLossSummary.toGo} kg to your goal — this week's meals stay protein and fibre forward to keep you full while you get there.`
              : "You've reached your goal weight — these meals are built to help you maintain it."}
          </p>
        </div>
      )}

      {client.condition === "hormonal" && (
        <div className="mt-4">
          {hormonalSummary ? (
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                  <span className="text-sm">🌙</span>
                </div>
                <p className="text-sm font-medium text-violet-800">{hormonalSummary.headline}</p>
              </div>
              <p className="text-xs text-moss-600 leading-relaxed">{hormonalSummary.tip}</p>
            </div>
          ) : (
            <div className="bg-sage-50 border border-sage-100 rounded-xl p-4">
              <p className="text-xs text-moss-600">
                Log a few daily check-ins to see personalised mood and sleep insights here.
              </p>
            </div>
          )}
        </div>
      )}

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
        {activeMeals[activeDay].map((meal) => (
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