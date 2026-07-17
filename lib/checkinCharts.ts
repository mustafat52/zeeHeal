import { Client, DailyCheckin, CheckinFieldKey } from "./mock-data/clients";

export interface ChartFieldDef {
  key: CheckinFieldKey;
  label: string;
  colorClass: string;
  getMax: (client: Client) => number;
  extract: (h: DailyCheckin) => number | undefined;
}

/**
 * Every chartable checkinConfig field EXCEPT weight and cycleDay:
 * - weight already has a dedicated trend card (start vs. current, with
 *   direction) — more informative for a slow-moving number than a
 *   same-height daily bar would be.
 * - cycleDay is PCOS tracking input already fully covered by the
 *   dedicated period calendar + flow chart built specifically for it.
 * Every other field a client's checkinConfig turns on WILL render here —
 * this list is deliberately not gated by condition, since checkinConfig
 * is per-client customizable (via ClientProfileFormModal), so a hardcoded
 * per-condition chart list would silently drop data for any client whose
 * config doesn't match the "typical" fields for their condition.
 */
export const CHART_FIELD_DEFS: ChartFieldDef[] = [
  { key: "energy", label: "Energy (0–10)", colorClass: "bg-amber-500", getMax: () => 10, extract: (h) => h.energy },
  { key: "sleepHours", label: "Sleep (hrs)", colorClass: "bg-violet-300", getMax: () => 9, extract: (h) => h.sleepHours },
  // Fix: this used to scale against c.todayPlan.water.goal — the
  // home-screen TAP COUNTER's goal, a completely separate, independently
  // maintained number from this field (the check-in modal's self-reported
  // waterGlasses). The two can diverge arbitrarily (e.g. a client taps the
  // counter to 8/8 daily but never touches this slider, or vice versa),
  // so scaling one against the other's goal was meaningless. Using a
  // fixed reference instead — 8, matching daily_checkins.water_goal's own
  // schema default — since waterGlasses has no dedicated goal of its own.
  { key: "waterGlasses", label: "Water (glasses)", colorClass: "bg-sage-400", getMax: () => 8, extract: (h) => h.waterGlasses },
  { key: "mood", label: "Mood (1–5)", colorClass: "bg-indigo-400", getMax: () => 5, extract: (h) => h.mood },
  { key: "bloating", label: "Bloating (0–10)", colorClass: "bg-orange-400", getMax: () => 10, extract: (h) => h.bloating },
  { key: "activity", label: "Activity (minutes)", colorClass: "bg-amber-400", getMax: () => 40, extract: (h) => h.activityMinutes },
  { key: "skinCondition", label: "Skin condition (0–10, lower is clearer)", colorClass: "bg-teal-400", getMax: () => 10, extract: (h) => h.skinCondition },
  { key: "hairFall", label: "Hair fall (0–10)", colorClass: "bg-pink-400", getMax: () => 10, extract: (h) => h.hairFall },
];

/**
 * Returns one entry per checkinConfig field this client actually has
 * turned on (that's in CHART_FIELD_DEFS), with its daily data already
 * extracted from whichever checkinHistory is passed in — the LIVE current
 * cycle (CycleReportModal) or an archived CycleSnapshot's history
 * (PlanHistoryModal). Same function powers both so they can't drift apart.
 */
export function getConfiguredChartFields(
  client: Client,
  history: (DailyCheckin | null)[]
): { def: ChartFieldDef; data: (number | null)[] }[] {
  const config = client.checkinConfig ?? {};
  return CHART_FIELD_DEFS.filter((def) => config[def.key]).map((def) => ({
    def,
    data: history.map((h) => (h ? def.extract(h) ?? null : null)),
  }));
}