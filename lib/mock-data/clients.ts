export type MealStatus = "pending" | "done";

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
  planType: string;
  startDate: string;
  streak: number;
  status: "on-track" | "needs-attention" | "new";
  lastLog: string;
  todayPlan: DayPlan;
  progress: ProgressPoint[];
  notes: { date: string; text: string }[];
  monthlyRecap?: string;
}

export const clients: Client[] = [
  {
    id: "priya",
    name: "Priya Menon",
    initials: "PM",
    planType: "Gut health reset",
    startDate: "2 weeks ago",
    streak: 12,
    status: "on-track",
    lastLog: "2 hours ago",
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
  },
  {
    id: "ananya",
    name: "Ananya Reddy",
    initials: "AR",
    planType: "PCOS / hormone balance",
    startDate: "5 weeks ago",
    streak: 3,
    status: "needs-attention",
    lastLog: "3 days ago",
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
  },
  {
    id: "fatima",
    name: "Fatima Sheikh",
    initials: "FS",
    planType: "Weight loss",
    startDate: "2 days ago",
    streak: 2,
    status: "new",
    lastLog: "Today",
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
  },
];

export const currentClientId = "priya";
