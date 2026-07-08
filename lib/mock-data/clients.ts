export type MealStatus = "pending" | "done";

export type ConditionType = "weight-loss" | "pcos" | "hormonal" | "skincare";

export interface MealLog {
  photo?: string;
  note?: string;
  loggedAt?: string;
}

export interface DayPlan {
  date: string;
  meals: {
    id: string;
    label: string;
    time: string;
    items: string;
    status: MealStatus;
    log?: MealLog;
    reasoning?: string;
  }[];
  water: { current: number; goal: number };
}

export interface PlanCycle {
  cycleNumber: number;
  startDate: string;
  currentDay: number;
  totalDays: 15;
}

/**
 * A frozen record of a completed cycle, archived by renewPlanCycle right
 * before it resets the live checkinHistory. periodLogs are NOT duplicated
 * here — they're never deleted from the client, so a past cycle's period
 * flow can always be reconstructed later from periodLogs + this snapshot's
 * startDate via buildFlowDataForCycle.
 */
export interface CycleSnapshot {
  cycleNumber: number;
  startDate: string;
  checkinHistory: (DailyCheckin | null)[];
  streakAtEnd: number;
}

export type FlowIntensity = "light" | "medium" | "heavy";

export interface PeriodLog {
  startDate: string;
  endDate?: string;
  cycleLength?: number;
  /** Day-by-day flow intensity logged while this period is active. */
  dailyFlow?: { date: string; intensity: FlowIntensity }[];
}

export interface DailyCheckin {
  weight?: number;
  sleepHours?: number;
  mood?: number;
  bloating?: number;
  activityType?: string;
  activityMinutes?: number;
  skinCondition?: number;
  hairFall?: number;
  cycleDay?: number;
  waterGlasses?: number;
  note?: string;
  loggedAt?: string;
}

export const CHECKIN_FIELDS = [
  { key: "weight", label: "Weight", hint: "Daily weigh-in" },
  { key: "sleepHours", label: "Sleep", hint: "Hours slept" },
  { key: "mood", label: "Mood / energy", hint: "How they're feeling" },
  { key: "bloating", label: "Bloating / digestion", hint: "Gut health, GI symptoms" },
  { key: "activity", label: "Activity", hint: "Exercise type and duration" },
  { key: "skinCondition", label: "Skin condition", hint: "Acne, breakouts, flare-ups" },
  { key: "hairFall", label: "Hair fall", hint: "PCOS, hormonal hair loss" },
  { key: "cycleDay", label: "Cycle tracking", hint: "PCOS, hormone balance" },
  { key: "waterGlasses", label: "Water intake", hint: "Hydration" },
] as const;

export type CheckinFieldKey = (typeof CHECKIN_FIELDS)[number]["key"];

export type CheckinConfig = Partial<Record<CheckinFieldKey, boolean>>;

export interface ProgressPoint {
  week: string;
  weight: number;
  bloating: number;
  energy: number;
}

export interface Client {
  id: string;
  name: string;
  initials: string;
  phone: string;
  condition: ConditionType;
  planType: string;
  startDate: string;
  streak: number;
  status: "on-track" | "needs-attention" | "new";
  /** Explicit manual state — orthogonal to the derived on-track/needs-attention status above. */
  archived?: boolean;
  lastLog: string;
  planCycle: PlanCycle;
  /** How many months the client signed up for with Zainab (approx 30-day months). Optional until set during onboarding. */
  programDurationMonths?: number;
  /**
   * Day-by-day check-in history for the CURRENT cycle only.
   * Index 0 = Day 1 of the current cycle. Length is always 15 (totalDays).
   * `null` means the client did not check in that day (used to visualize consistency).
   * Resets to all-null when a new cycle starts via renewPlanCycle.
   */
  checkinHistory?: (DailyCheckin | null)[];
  /** Archived record of every completed cycle, oldest first. */
  cycleHistory?: CycleSnapshot[];
  goalWeight?: number;
  periodLogs?: PeriodLog[];
  todayPlan: DayPlan;
  progress: ProgressPoint[];
  notes: { date: string; text: string }[];
  monthlyRecap?: string;
  todayCheckin?: DailyCheckin;
  checkinConfig?: CheckinConfig;
}

export const clients: Client[] = [
  {
    id: "priya",
    name: "Priya Menon",
    initials: "PM",
    phone: "+91 98765 43210",
    condition: "hormonal",
    planType: "Hormonal balance reset",
    startDate: "2 weeks ago",
    streak: 12,
    status: "on-track",
    lastLog: "2 hours ago",
    planCycle: { cycleNumber: 2, startDate: "12 days ago", currentDay: 12, totalDays: 15 },
    programDurationMonths: 3,
    cycleHistory: [
      {
        cycleNumber: 1,
        startDate: "27 days ago",
        streakAtEnd: 14,
        checkinHistory: [
          { mood: 3, sleepHours: 6, waterGlasses: 4, activityType: "None", activityMinutes: 0, weight: 70.5, bloating: 7 },
          { mood: 3, sleepHours: 6.5, waterGlasses: 5, activityType: "Walk", activityMinutes: 15, weight: 70.3, bloating: 7 },
          { mood: 4, sleepHours: 7, waterGlasses: 5, activityType: "Walk", activityMinutes: 20, weight: 70.1, bloating: 6 },
          { mood: 3, sleepHours: 6, waterGlasses: 4, activityType: "None", activityMinutes: 0, weight: 70.0, bloating: 7 },
          { mood: 4, sleepHours: 7, waterGlasses: 6, activityType: "Walk", activityMinutes: 20, weight: 69.9, bloating: 6 },
          { mood: 4, sleepHours: 7.5, waterGlasses: 6, activityType: "Yoga", activityMinutes: 25, weight: 69.8, bloating: 5 },
          { mood: 5, sleepHours: 8, waterGlasses: 7, activityType: "Walk", activityMinutes: 25, weight: 69.7, bloating: 5 },
          { mood: 4, sleepHours: 7, waterGlasses: 6, activityType: "Walk", activityMinutes: 15, weight: 69.6, bloating: 5 },
          null,
          { mood: 3, sleepHours: 6, waterGlasses: 5, activityType: "None", activityMinutes: 0, weight: 69.6, bloating: 6 },
          { mood: 4, sleepHours: 7, waterGlasses: 6, activityType: "Walk", activityMinutes: 20, weight: 69.5, bloating: 5 },
          { mood: 4, sleepHours: 7.5, waterGlasses: 7, activityType: "Walk", activityMinutes: 25, weight: 69.5, bloating: 5 },
          { mood: 5, sleepHours: 8, waterGlasses: 7, activityType: "Yoga", activityMinutes: 30, weight: 69.4, bloating: 4 },
          { mood: 4, sleepHours: 7, waterGlasses: 6, activityType: "Walk", activityMinutes: 20, weight: 69.4, bloating: 4 },
          { mood: 4, sleepHours: 7, waterGlasses: 6, activityType: "Walk", activityMinutes: 20, weight: 69.4, bloating: 4 },
        ],
      },
    ],
    checkinHistory: [
      { mood: 3, sleepHours: 6.5, waterGlasses: 5, activityType: "Walk", activityMinutes: 15, weight: 69.4, bloating: 5 },
      { mood: 4, sleepHours: 7, waterGlasses: 6, activityType: "Walk", activityMinutes: 20, weight: 69.3, bloating: 5 },
      { mood: 4, sleepHours: 6, waterGlasses: 5, activityType: "None", activityMinutes: 0, weight: 69.1, bloating: 4 },
      { mood: 3, sleepHours: 7.5, waterGlasses: 7, activityType: "Walk", activityMinutes: 25, weight: 69.0, bloating: 4 },
      { mood: 4, sleepHours: 7, waterGlasses: 6, activityType: "Walk", activityMinutes: 20, weight: 68.9, bloating: 4 },
      { mood: 5, sleepHours: 8, waterGlasses: 8, activityType: "Yoga", activityMinutes: 30, weight: 68.8, bloating: 3 },
      { mood: 4, sleepHours: 7, waterGlasses: 6, activityType: "Walk", activityMinutes: 15, weight: 68.7, bloating: 3 },
      { mood: 3, sleepHours: 6, waterGlasses: 5, activityType: "None", activityMinutes: 10, weight: 68.6, bloating: 4 },
      { mood: 4, sleepHours: 7, waterGlasses: 7, activityType: "Walk", activityMinutes: 20, weight: 68.6, bloating: 3 },
      { mood: 4, sleepHours: 7.5, waterGlasses: 7, activityType: "Walk", activityMinutes: 25, weight: 68.5, bloating: 3 },
      { mood: 5, sleepHours: 8, waterGlasses: 8, activityType: "Yoga", activityMinutes: 30, weight: 68.4, bloating: 3 },
      { mood: 4, sleepHours: 7, waterGlasses: 5, activityType: "Walk", activityMinutes: 20, weight: 68.4, bloating: 3 },
      null,
      null,
      null,
    ],
    todayPlan: {
      date: "Today",
      meals: [
        {
          id: "b1",
          label: "Breakfast",
          time: "8:00 am",
          items: "Moong dal chilla, mint chutney",
          status: "done",
          log: { note: "Had it a bit later, around 9", loggedAt: "9:10 am" },
          reasoning:
            "Moong dal is gentle on digestion and easy to break down first thing in the morning, especially while your gut is still settling.",
        },
        {
          id: "l1",
          label: "Lunch",
          time: "1:00 pm",
          items: "Khichdi, cucumber raita",
          status: "done",
          log: { note: "Felt very light after, no bloating", loggedAt: "1:20 pm" },
          reasoning:
            "I gave you khichdi today because your bloating was up yesterday. It's the gentlest thing on your gut while we let it settle, should ease by tomorrow.",
        },
        {
          id: "s1",
          label: "Snack",
          time: "5:00 pm",
          items: "Roasted chana, herbal tea",
          status: "pending",
          reasoning:
            "Chana gives you protein and fibre without anything heavy before dinner, and the herbal tea helps with the evening bloating you mentioned last week.",
        },
        {
          id: "d1",
          label: "Dinner",
          time: "8:00 pm",
          items: "Vegetable soup, grilled paneer",
          status: "pending",
          reasoning:
            "Keeping dinner light and warm tends to help you sleep better, based on what you told me about your evenings.",
        },
      ],
      water: { current: 5, goal: 8 },
    },
    progress: [
      { week: "W1", weight: 70.0, bloating: 7, energy: 4 },
      { week: "W2", weight: 69.4, bloating: 6, energy: 5 },
      { week: "W3", weight: 68.9, bloating: 4, energy: 6 },
      { week: "W4", weight: 68.4, bloating: 3, energy: 7 },
    ],
    notes: [
      { date: "3 days ago", text: "Reported less bloating after cutting dairy. Keep current plan." },
      { date: "1 week ago", text: "Started gut-health reset. Mild fatigue first 3 days, expected." },
    ],
    monthlyRecap:
      "This month your bloating dropped from a 7 to a 3, and you stuck to the plan 26 out of 30 days, that's the kind of consistency that actually moves the needle. The lunch swaps you asked for clearly worked better for your gut, so we're keeping those. Next month I want to focus on your energy levels in the afternoon, let's talk about that on our next call.",
    todayCheckin: {
      weight: 68.4,
      sleepHours: 7,
      mood: 4,
      bloating: 3,
      activityType: "Walk",
      activityMinutes: 20,
      note: "Felt good today, slept better than usual",
      loggedAt: "This morning",
    },
    checkinConfig: {
      weight: true,
      sleepHours: true,
      mood: true,
      bloating: true,
      activity: true,
      waterGlasses: true,
    },
  },
  {
    id: "ananya",
    name: "Ananya Reddy",
    initials: "AR",
    phone: "+91 90123 45678",
    condition: "pcos",
    planType: "PCOS / hormone balance",
    startDate: "5 weeks ago",
    streak: 3,
    status: "needs-attention",
    lastLog: "3 days ago",
    planCycle: { cycleNumber: 3, startDate: "8 days ago", currentDay: 8, totalDays: 15 },
    programDurationMonths: 6,
    checkinHistory: [
      { mood: 2, sleepHours: 6, bloating: 8, hairFall: 4, weight: 74.0 },
      { mood: 3, sleepHours: 6.5, bloating: 7, hairFall: 4, weight: 73.9 },
      { mood: 3, sleepHours: 7, bloating: 7, hairFall: 3, weight: 73.8 },
      { mood: 2, sleepHours: 5.5, bloating: 8, hairFall: 5, weight: 73.9 },
      { mood: 3, sleepHours: 6, bloating: 6, hairFall: 4, weight: 73.7 },
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    periodLogs: [
      { startDate: "22 days ago", endDate: "17 days ago", cycleLength: 5 },
      {
        startDate: "3 days ago",
        dailyFlow: [
          { date: "3 days ago", intensity: "heavy" },
          { date: "2 days ago", intensity: "heavy" },
          { date: "1 day ago", intensity: "medium" },
        ],
      },
    ],
    todayPlan: {
      date: "Today",
      meals: [
        {
          id: "b2",
          label: "Breakfast",
          time: "8:30 am",
          items: "Vegetable poha, flax seeds",
          status: "pending",
          reasoning:
            "Flax seeds support hormone balance through the cycle, and poha keeps your blood sugar steadier than heavier breakfasts.",
        },
        {
          id: "l2",
          label: "Lunch",
          time: "1:30 pm",
          items: "Brown rice, dal, sauteed greens",
          status: "pending",
          reasoning:
            "Brown rice over white keeps your blood sugar response slower, which matters a lot for PCOS. The greens add iron you mentioned feeling low on.",
        },
        {
          id: "s2",
          label: "Snack",
          time: "5:30 pm",
          items: "Walnuts, buttermilk",
          status: "pending",
          reasoning:
            "Walnuts have omega-3s that help with inflammation, and buttermilk is light on digestion for the evening.",
        },
        {
          id: "d2",
          label: "Dinner",
          time: "8:30 pm",
          items: "Grilled fish, steamed vegetables",
          status: "pending",
          reasoning:
            "Protein-forward dinners help manage insulin overnight, which is one of the bigger levers for PCOS symptoms.",
        },
      ],
      water: { current: 2, goal: 8 },
    },
    progress: [
      { week: "W1", weight: 74.2, bloating: 8, energy: 3 },
      { week: "W2", weight: 73.8, bloating: 7, energy: 3 },
      { week: "W3", weight: 73.9, bloating: 7, energy: 4 },
      { week: "W4", weight: 73.5, bloating: 6, energy: 4 },
    ],
    notes: [
      { date: "5 days ago", text: "Logging has dropped off this week. Follow up before next call." },
    ],
    monthlyRecap:
      "This month was a tougher one, logging dropped off in week 3 and your bloating didn't move much. That's completely okay, some months are like that. Let's use our next call to figure out what got in the way, no judgement, just want to make next month easier for you.",
    checkinConfig: {
      weight: true,
      sleepHours: true,
      mood: true,
      bloating: true,
      activity: true,
      skinCondition: true,
      hairFall: true,
      cycleDay: true,
    },
  },
  {
    id: "fatima",
    name: "Fatima Sheikh",
    initials: "FS",
    phone: "+91 99887 76655",
    condition: "weight-loss",
    planType: "Weight loss",
    startDate: "2 days ago",
    streak: 2,
    status: "new",
    lastLog: "Today",
    goalWeight: 72,
    planCycle: { cycleNumber: 1, startDate: "2 days ago", currentDay: 2, totalDays: 15 },
    programDurationMonths: 1,
    checkinHistory: [
      { weight: 82.0, sleepHours: 7, mood: 3, waterGlasses: 4, activityType: "None", activityMinutes: 0 },
      { weight: 81.7, sleepHours: 6.5, mood: 4, waterGlasses: 5, activityType: "Walk", activityMinutes: 15 },
      null, null, null, null, null, null, null, null, null, null, null, null, null,
    ],
    todayPlan: {
      date: "Today",
      meals: [
        {
          id: "b3",
          label: "Breakfast",
          time: "7:30 am",
          items: "Vegetable oats, boiled egg",
          status: "done",
          reasoning:
            "Starting with protein and fibre keeps you full longer and avoids the mid-morning energy crash you mentioned.",
        },
        {
          id: "l3",
          label: "Lunch",
          time: "12:30 pm",
          items: "Multigrain roti, dal, salad",
          status: "pending",
          reasoning:
            "Kept this close to what you already eat day to day, small sustainable changes work better than a complete overhaul in week one.",
        },
        {
          id: "s3",
          label: "Snack",
          time: "4:30 pm",
          items: "Sprouts salad",
          status: "pending",
          reasoning:
            "Light and crunchy, good for the afternoon slot without adding extra calories you don't need.",
        },
        {
          id: "d3",
          label: "Dinner",
          time: "7:30 pm",
          items: "Grilled chicken, sauteed vegetables",
          status: "pending",
          reasoning:
            "Avoiding dairy here given your sensitivity, and keeping protein high to support your goals without feeling restrictive.",
        },
      ],
      water: { current: 3, goal: 8 },
    },
    progress: [{ week: "W1", weight: 82.0, bloating: 5, energy: 5 }],
    notes: [{ date: "2 days ago", text: "Onboarded. Mild lactose sensitivity, avoiding dairy in plan." }],
    checkinConfig: {
      weight: true,
      sleepHours: true,
      mood: true,
      activity: true,
      waterGlasses: true,
    },
  },
  {
    id: "riya",
    name: "Riya Sharma",
    initials: "RS",
    phone: "+91 97654 32109",
    condition: "skincare",
    planType: "Skin and gut reset",
    startDate: "1 week ago",
    streak: 6,
    status: "on-track",
    lastLog: "Today",
    planCycle: { cycleNumber: 1, startDate: "7 days ago", currentDay: 7, totalDays: 15 },
    programDurationMonths: 3,
    checkinHistory: [
      { sleepHours: 7, mood: 4, skinCondition: 6, waterGlasses: 5, activityType: "Walk", activityMinutes: 10 },
      { sleepHours: 7.5, mood: 4, skinCondition: 6, waterGlasses: 6, activityType: "Walk", activityMinutes: 15 },
      { sleepHours: 6.5, mood: 3, skinCondition: 5, waterGlasses: 6, activityType: "None", activityMinutes: 0 },
      { sleepHours: 7, mood: 4, skinCondition: 5, waterGlasses: 7, activityType: "Walk", activityMinutes: 20 },
      { sleepHours: 8, mood: 5, skinCondition: 4, waterGlasses: 8, activityType: "Yoga", activityMinutes: 15 },
      { sleepHours: 7, mood: 4, skinCondition: 4, waterGlasses: 7, activityType: "Walk", activityMinutes: 10 },
      { sleepHours: 7.5, mood: 4, skinCondition: 3, waterGlasses: 4, activityType: "Walk", activityMinutes: 5 },
      null, null, null, null, null, null, null, null,
    ],
    todayPlan: {
      date: "Today",
      meals: [
        {
          id: "b4", label: "Breakfast", time: "8:00 am",
          items: "Green smoothie, chia seeds, soaked almonds",
          status: "done",
          reasoning: "Antioxidants in the morning help fight inflammation that drives breakouts — especially important for your skin type.",
        },
        {
          id: "l4", label: "Lunch", time: "1:00 pm",
          items: "Quinoa salad, cucumber, avocado, lemon dressing",
          status: "pending",
          reasoning: "Avocado gives you the healthy fats your skin barrier needs. Cucumber keeps you hydrated from inside out.",
        },
        {
          id: "s4", label: "Snack", time: "4:30 pm",
          items: "Pumpkin seeds, herbal tea",
          status: "pending",
          reasoning: "Pumpkin seeds are high in zinc — one of the most clinically backed nutrients for acne reduction.",
        },
        {
          id: "d4", label: "Dinner", time: "7:30 pm",
          items: "Grilled salmon, steamed broccoli, brown rice",
          status: "pending",
          reasoning: "Omega-3s from salmon directly reduce skin inflammation. Broccoli adds vitamin C for collagen support.",
        },
      ],
      water: { current: 4, goal: 10 },
    },
    progress: [
      { week: "W1", weight: 58.0, bloating: 4, energy: 6 },
    ],
    notes: [
      { date: "7 days ago", text: "Hormonal acne along jawline, started low-GI anti-inflammatory plan. No dairy, no refined sugar." },
    ],
    monthlyRecap: "Your first week has been great — you logged every day and your skin photos already show less redness around the jawline. The no-dairy rule is the most important one right now, keep it going. Next 15 days we'll add a probiotic protocol to the plan.",
    checkinConfig: {
      sleepHours: true,
      mood: true,
      skinCondition: true,
      waterGlasses: true,
      activity: true,
    },
  },
];

export const currentClientId = "priya";

export const ZAINAB_PHONE = "+91 91234 56789";