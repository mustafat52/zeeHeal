import { NutritionistBottomNav } from "@/components/nutritionist/NutritionistBottomNav";

export default function NutritionistLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-24">
      {children}
      <NutritionistBottomNav />
    </div>
  );
}
