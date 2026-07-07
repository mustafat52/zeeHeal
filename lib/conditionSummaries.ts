/**
 * Shared "what does this data mean" logic for each condition.
 *
 * These functions used to live only in app/(client)/plan/page.tsx — the
 * client would see a stated conclusion ("mood's dipped," "skin's improving")
 * while Zainab only ever saw the same raw charts and had to re-derive the
 * exact same conclusion herself. Moving the logic here means both sides
 * call the identical function, so they can't say different things about
 * the same data — the same failure mode the config-driven chart fix
 * (checkinCharts.ts) closed for the daily charts themselves.
 *
 * Tip text is written to read sensibly in EITHER context — the client's
 * Plan page (where a meal grid sits right below) or Zainab's Cycle Report
 * (where there's no meal grid) — so nothing here says "this week's meals"
 * in a way that only makes sense in one of the two places.
 */

export type PcosPhaseKey = "menstrual" | "follicular" | "ovulatory" | "luteal";

export interface PcosPhaseResult {
  key: PcosPhaseKey;
  phase: string;
  tip: string;
}

/**
 * Estimates PCOS cycle phase from real, already-collected data: an active
 * period log takes priority (menstrual), otherwise the client's self-logged
 * cycleDay (from their daily check-in) is used. Returns null if neither is
 * available — callers should fall back rather than guess.
 */
export function getPcosPhase(
  hasActivePeriod: boolean,
  cycleDay: number | undefined
): PcosPhaseResult | null {
  if (hasActivePeriod) {
    return {
      key: "menstrual",
      phase: "Menstrual phase",
      tip: "Iron and B12-rich foods help offset what's lost during her period — leafy greens, dal, and lean protein are the focus right now.",
    };
  }
  if (cycleDay !== undefined) {
    if (cycleDay <= 13) {
      return {
        key: "follicular",
        phase: "Follicular phase",
        tip: "Energy is usually rising through this phase — lighter, fresh meals with plenty of fibre support it well.",
      };
    }
    if (cycleDay === 14) {
      return {
        key: "ovulatory",
        phase: "Ovulatory phase",
        tip: "Antioxidant-rich foods — berries, colourful vegetables — support this phase.",
      };
    }
    return {
      key: "luteal",
      phase: "Luteal phase",
      tip: "Cravings and bloating are common here — complex carbs and magnesium-rich foods (nuts, seeds) can help steady mood and digestion.",
    };
  }
  return null;
}

/**
 * Real numbers only — no calorie/macro estimates. kg progress is the one
 * number already used throughout the app, kept as the only figure here.
 */
export function getWeightLossSummary(client: {
  progress: { weight: number }[];
  goalWeight?: number;
}): { lost: number; toGo: number } | null {
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
 * mood matters more than short sleep. Returns null if there isn't enough
 * logged history yet to say anything meaningful.
 */
export function getHormonalSummary(client: {
  checkinHistory?: ({ mood?: number; sleepHours?: number } | null)[];
}): { headline: string; tip: string } | null {
  const logged = (client.checkinHistory ?? []).filter(
    (h): h is { mood?: number; sleepHours?: number } => h !== null
  );
  const recent = logged.slice(-5);
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
      headline: "Sleep's been a bit short recently",
      tip: "Avoiding heavy or spicy dinners, and a calming tea like chamomile in the evening, can support better rest.",
    };
  }
  return {
    headline: "Mood and sleep have been steady",
    tip: "This rhythm is doing real work — worth naming as a win.",
  };
}

/**
 * Real, data-driven only — computed from the client's actual logged
 * skinCondition history, not fabricated. Needs at least 2 logged days;
 * compares the most recent entries against the ones before to detect a
 * real direction rather than guessing.
 */
export function getSkincareSummary(client: {
  checkinHistory?: ({ skinCondition?: number } | null)[];
}): { headline: string; tip: string } | null {
  const logged = (client.checkinHistory ?? [])
    .filter((h): h is { skinCondition?: number } => h !== null)
    .map((h) => h.skinCondition)
    .filter((v): v is number => v !== undefined);

  if (logged.length < 2) return null;

  const recent = logged.slice(-2);
  const prior = logged.slice(-5, -2);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const priorAvg = prior.length ? prior.reduce((a, b) => a + b, 0) / prior.length : recentAvg;

  if (recentAvg < priorAvg - 0.3) {
    return {
      headline: "Skin has been improving",
      tip: "Keep the no-dairy, low-sugar rhythm going — anti-inflammatory foods (pumpkin seeds, salmon, leafy greens) support it.",
    };
  }
  if (recentAvg > priorAvg + 0.3) {
    return {
      headline: "A rougher stretch recently",
      tip: "Zinc and omega-3-rich foods (pumpkin seeds, salmon) help calm flare-ups, and hitting the water goal matters more than usual right now.",
    };
  }
  return {
    headline: "Skin has been steady",
    tip: "Consistency is doing the work — the same anti-inflammatory, dairy-free approach keeps it going.",
  };
}