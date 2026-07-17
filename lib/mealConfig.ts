export const MEAL_SLOTS = [
  { key: "earlyMorning", label: "Early Morning", defaultTime: "6:30 am" },
  { key: "breakfast", label: "Breakfast", defaultTime: "8:00 am" },
  { key: "midMorning", label: "Mid-Morning", defaultTime: "11:00 am" },
  { key: "lunch", label: "Lunch", defaultTime: "1:00 pm" },
  { key: "evening", label: "Evening", defaultTime: "5:00 pm" },
  { key: "dinner", label: "Dinner", defaultTime: "8:00 pm" },
] as const;

export type MealSlotKey = (typeof MEAL_SLOTS)[number]["key"];
export type MealConfig = Partial<Record<MealSlotKey, boolean>>;

/**
 * If a nutritionist hasn't set up meal config yet (undefined/empty),
 * default to showing everything — mirrors the identical convention
 * already used for checkinConfig (DailyCheckinModal's isOn helper), so
 * the feature is never silently invisible during onboarding.
 */
export function isMealSlotOn(config: MealConfig | undefined, key: MealSlotKey): boolean {
  if (!config || Object.keys(config).length === 0) return true;
  return !!config[key];
}

export function enabledMealLabels(config: MealConfig | undefined): string[] {
  return MEAL_SLOTS.filter((slot) => isMealSlotOn(config, slot.key)).map((slot) => slot.label);
}

/**
 * Maps each meal label to its slot's default time ("Breakfast" ->
 * "8:00 am"), for passing to the generate_todays_meals RPC so real meal
 * rows actually get a `time` value — previously defaultTime was defined
 * here but nothing ever wrote it to a real row.
 */
export function labelDefaultTimes(): Record<string, string> {
  return Object.fromEntries(MEAL_SLOTS.map((slot) => [slot.label, slot.defaultTime]));
}

/**
 * Builds a blank week (all 7 days) containing exactly the meal slots this
 * client has enabled, each with an empty items string. Used by the plan
 * editor when no template/existing plan exists yet.
 */
export function blankWeekForConfig(
  config: MealConfig | undefined
): Record<string, { label: string; items: string }[]> {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const labels = enabledMealLabels(config);
  const week: Record<string, { label: string; items: string }[]> = {};
  for (const day of days) {
    week[day] = labels.map((label) => ({ label, items: "" }));
  }
  return week;
}

/**
 * Reconciles an existing weekly plan (from a fetched client or a forked
 * template) against a client's enabled meal slots: drops any meal whose
 * label isn't enabled, and adds a blank entry for any enabled slot
 * missing from that day (e.g. a template only has Breakfast/Lunch/Dinner
 * but this client also has Evening turned on — Evening shows up blank,
 * ready for her to fill in). Slots are always ordered per MEAL_SLOTS
 * regardless of storage order, so the editor is always Early Morning →
 * ... → Dinner.
 */
export function reconcileWeekWithConfig(
  days: Record<string, { label: string; items: string }[]>,
  config: MealConfig | undefined
): Record<string, { label: string; items: string }[]> {
  const enabledLabels = enabledMealLabels(config);
  const reconciled: Record<string, { label: string; items: string }[]> = {};
  for (const day of Object.keys(days)) {
    const meals = days[day] ?? [];
    reconciled[day] = enabledLabels.map((label) => {
      const existing = meals.find((m) => m.label === label);
      return existing ?? { label, items: "" };
    });
  }
  return reconciled;
}