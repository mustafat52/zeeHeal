import type { PlanTemplate } from "@/lib/mock-data/plans";

export function mapDbPlanTemplateRow(row: any): PlanTemplate {
  return {
    id: row.id,
    name: row.name,
    tag: row.tag,
    description: row.description,
    condition: row.condition,
    weeklyMeals: row.weekly_meals,
  };
}