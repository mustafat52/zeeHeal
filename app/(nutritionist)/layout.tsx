import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NutritionistSessionHydrator } from "@/components/nutritionist/NutritionistSessionHydrator";
import { NutritionistBottomNav } from "@/components/nutritionist/NutritionistBottomNav";

/**
 * Server Component — re-runs on every request to a (nutritionist) route,
 * including hard refreshes. Enforces "must be logged in as Zainab" for
 * every page under here (fixes /dashboard being directly accessible with
 * no session), and triggers a real data re-fetch on every refresh via
 * NutritionistSessionHydrator — not just when the dashboard page happens
 * to be the one that loaded.
 */
export default async function NutritionistLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: nutritionistRow } = await supabase
    .from("nutritionists")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  // Logged in, but not Zainab's account — e.g. a client somehow hit a
  // nutritionist-only route. Safer to bounce to login than render with
  // no data.
  if (!nutritionistRow) redirect("/login");

  return (
    <div className="pb-24">
      <NutritionistSessionHydrator>
        {children}
      </NutritionistSessionHydrator>
      <NutritionistBottomNav />
    </div>
  );
}