export interface PlanTemplate {
  id: string;
  name: string;
  tag: string;
  description: string;
  usedBy: number;
}

export const planTemplates: PlanTemplate[] = [
  {
    id: "gut-health",
    name: "Gut health reset",
    tag: "4 weeks",
    description: "Anti-inflammatory, dairy-free, fibre-rich meals to calm bloating and improve digestion.",
    usedBy: 6,
  },
  {
    id: "pcos",
    name: "PCOS / hormone balance",
    tag: "8 weeks",
    description: "Low-GI, seed-cycling based plan to support insulin sensitivity and hormone regulation.",
    usedBy: 9,
  },
  {
    id: "weight-loss",
    name: "Sustainable weight loss",
    tag: "6 weeks",
    description: "Calorie-aware, high-protein meals built around foods the client already eats.",
    usedBy: 14,
  },
  {
    id: "skin-reset",
    name: "Skin and gut reset",
    tag: "4 weeks",
    description: "Targets acne and dull skin through gut-skin axis support and reduced sugar load.",
    usedBy: 4,
  },
];
