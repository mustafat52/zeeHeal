import { ConditionType } from "./clients";

export interface WeekMeal {
  label: string;
  items: string;
}

export type WeeklyMeals = Record<string, WeekMeal[]>;

export interface PlanTemplate {
  id: string;
  name: string;
  tag: string;
  description: string;
  condition: ConditionType;
  weeklyMeals: WeeklyMeals;
}

export const planTemplates: PlanTemplate[] = [
  {
    id: "gut-health",
    name: "Gut health reset",
    tag: "4 weeks",
    description: "Anti-inflammatory, dairy-free, fibre-rich meals to calm bloating and improve digestion.",
    condition: "hormonal",
    weeklyMeals: {
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
    },
  },
  {
    id: "pcos",
    name: "PCOS / hormone balance",
    tag: "8 weeks",
    description: "Low-GI, seed-cycling based plan to support insulin sensitivity and hormone regulation.",
    condition: "pcos",
    weeklyMeals: {
      Mon: [
        { label: "Breakfast", items: "Flaxseed oats, berries" },
        { label: "Lunch", items: "Quinoa, chickpea salad" },
        { label: "Dinner", items: "Grilled fish, roasted vegetables" },
      ],
      Tue: [
        { label: "Breakfast", items: "Pumpkin seed smoothie" },
        { label: "Lunch", items: "Brown rice, rajma, greens" },
        { label: "Dinner", items: "Chicken stew, sauteed spinach" },
      ],
      Wed: [
        { label: "Breakfast", items: "Besan chilla, mint chutney" },
        { label: "Lunch", items: "Millet khichdi, salad" },
        { label: "Dinner", items: "Dal, brown rice, vegetables" },
      ],
      Thu: [
        { label: "Breakfast", items: "Sesame seed porridge" },
        { label: "Lunch", items: "Quinoa salad, grilled tofu" },
        { label: "Dinner", items: "Grilled fish, steamed greens" },
      ],
      Fri: [
        { label: "Breakfast", items: "Sunflower seed smoothie" },
        { label: "Lunch", items: "Brown rice, chana, salad" },
        { label: "Dinner", items: "Chicken soup, roasted vegetables" },
      ],
      Sat: [
        { label: "Breakfast", items: "Flaxseed idli, sambhar" },
        { label: "Lunch", items: "Rajma, quinoa, greens" },
        { label: "Dinner", items: "Grilled paneer, sauteed vegetables" },
      ],
      Sun: [
        { label: "Breakfast", items: "Pumpkin seed porridge" },
        { label: "Lunch", items: "Dal, brown rice, salad" },
        { label: "Dinner", items: "Fish curry, steamed vegetables" },
      ],
    },
  },
  {
    id: "weight-loss",
    name: "Sustainable weight loss",
    tag: "6 weeks",
    description: "Calorie-aware, high-protein meals built around foods the client already eats.",
    condition: "weight-loss",
    weeklyMeals: {
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
    },
  },
  {
    id: "skin-reset",
    name: "Skin and gut reset",
    tag: "4 weeks",
    description: "Targets acne and dull skin through gut-skin axis support and reduced sugar load.",
    condition: "skincare",
    weeklyMeals: {
      Mon: [
        { label: "Breakfast", items: "Green smoothie, chia seeds, soaked almonds" },
        { label: "Lunch", items: "Quinoa salad, cucumber, avocado, lemon dressing" },
        { label: "Dinner", items: "Grilled salmon, steamed broccoli, brown rice" },
      ],
      Tue: [
        { label: "Breakfast", items: "Berry and flaxseed smoothie" },
        { label: "Lunch", items: "Chickpea salad, roasted pumpkin seeds" },
        { label: "Dinner", items: "Grilled fish, sauteed spinach" },
      ],
      Wed: [
        { label: "Breakfast", items: "Overnight oats, walnuts" },
        { label: "Lunch", items: "Quinoa and avocado bowl, mixed greens" },
        { label: "Dinner", items: "Turmeric lentil soup, brown rice" },
      ],
      Thu: [
        { label: "Breakfast", items: "Green smoothie, pumpkin seeds" },
        { label: "Lunch", items: "Grilled tofu salad, olive oil dressing" },
        { label: "Dinner", items: "Baked fish, roasted vegetables" },
      ],
      Fri: [
        { label: "Breakfast", items: "Chia pudding, mixed berries" },
        { label: "Lunch", items: "Quinoa and avocado bowl" },
        { label: "Dinner", items: "Grilled chicken, sauteed greens, sweet potato" },
      ],
      Sat: [
        { label: "Breakfast", items: "Herbal tea, soaked almonds, fruit" },
        { label: "Lunch", items: "Lentil and vegetable soup, multigrain toast" },
        { label: "Dinner", items: "Grilled salmon, steamed broccoli" },
      ],
      Sun: [
        { label: "Breakfast", items: "Green smoothie bowl" },
        { label: "Lunch", items: "Chickpea and cucumber salad" },
        { label: "Dinner", items: "Turmeric baked tofu, brown rice, greens" },
      ],
    },
  },
];

/**
 * PCOS-only: at assignment time, if the client's current cycle phase is
 * known, the PCOS template forks from the matching phase-set below instead
 * of the generic template content — a well-informed starting point rather
 * than a generic one. This does NOT auto-swap later; once assigned, it's
 * the client's own editable plan like any other. Auto-swapping after
 * assignment was retired because it would silently fight with manual
 * edits (e.g. an allergy removal getting overwritten by the next phase
 * change).
 */
export const pcosPhaseStarterMeals: Record<"menstrual" | "follicular" | "ovulatory" | "luteal", WeeklyMeals> = {
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