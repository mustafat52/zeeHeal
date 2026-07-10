"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { normalizePhoneForAuth } from "@/lib/phone";
import { Button } from "@/components/ui/Button";
import { WelcomeTransition } from "@/components/ui/WelcomeTransition";
import { motion, AnimatePresence } from "framer-motion";
import type { Client } from "@/lib/mock-data/clients";

/**
 * Maps a real `clients` table row (snake_case, real dates) onto the
 * Client shape the rest of the app still reads from Zustand. This is a
 * deliberate bridge, not a finished data layer: todayPlan, progress,
 * checkinHistory, periodLogs, cycleHistory, and todayCheckin are left as
 * safe empty placeholders below because their source tables (meals,
 * progress_weekly, daily_checkins, period_logs, cycle_history) aren't
 * wired up to any page yet — each gets its own real query when that
 * page's turn comes, same as the open item already flagged for how
 * `meals` rows get generated day to day. notes is intentionally left
 * empty permanently for the client side, not just as a placeholder:
 * session_notes is nutritionist-only per RLS, a client was never meant
 * to read it.
 */
function mapDbClientToStoreClient(row: any): Client {
  return {
    id: row.id,
    name: row.name,
    initials: row.initials,
    phone: row.phone,
    condition: row.condition,
    planType: row.plan_type,
    startDate: row.start_date,
    streak: row.streak,
    status: row.status,
    archived: row.archived ?? false,
    lastLog: row.last_log_at ?? "Never",
    planCycle: {
      cycleNumber: row.current_cycle_number,
      startDate: row.current_cycle_start,
      currentDay: row.current_cycle_day,
      totalDays: 15,
    },
    programDurationMonths: row.program_duration_months ?? undefined,
    goalWeight: row.goal_weight ?? undefined,
    monthlyRecap: row.monthly_recap ?? undefined,
    checkinConfig: row.checkin_config ?? {},
    weeklyPlan: row.weekly_plan_days
      ? {
          templateId: row.weekly_plan_template_id ?? undefined,
          templateName: row.weekly_plan_template_name ?? undefined,
          days: row.weekly_plan_days,
        }
      : undefined,
    // TODO(next session): query meals for today's date, replace this placeholder
    todayPlan: { date: "Today", meals: [], water: { current: 0, goal: 8 } },
    // TODO(next session): query progress_weekly view
    progress: [],
    // Permanently empty for clients — session_notes is nutritionist-only (RLS)
    notes: [],
    // TODO(next session): query daily_checkins for the current cycle range
    checkinHistory: undefined,
    // TODO(next session): query period_logs + period_flow_logs (PCOS clients)
    periodLogs: undefined,
    // TODO(next session): query cycle_history
    cycleHistory: undefined,
    // TODO(next session): query today's daily_checkins row
    todayCheckin: undefined,
  };
}

export default function LoginPage() {
  const router = useRouter();
  const setViewMode = useAppStore((s) => s.setViewMode);
  const setActiveClientId = useAppStore((s) => s.setActiveClientId);
  const addClient = useAppStore((s) => s.addClient);
  const clients = useAppStore((s) => s.clients);

  const [phone, setPhone] = useState("");
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [welcoming, setWelcoming] = useState<{ mode: "client" | "nutritionist"; name: string } | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const normalizedPhone = normalizePhoneForAuth(phone);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      phone: normalizedPhone,
      password: passcode,
    });

    if (authError || !authData.user) {
      setError("Phone number or passcode is incorrect. Double check with Zainab if you're not sure.");
      setLoading(false);
      return;
    }

    // Is this Zainab, or a client? Check the nutritionists table first —
    // single-nutritionist app, so this is a cheap, safe check.
    const { data: nutritionistRow } = await supabase
      .from("nutritionists")
      .select("id")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (nutritionistRow) {
      setViewMode("nutritionist");
      setWelcoming({ mode: "nutritionist", name: "Zainab" });
      setTimeout(() => router.push("/dashboard"), 1500);
      return;
    }

    const { data: clientRow, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("auth_user_id", authData.user.id)
      .maybeSingle();

    if (clientError || !clientRow) {
      setError("We couldn't find a profile linked to this account. Ask Zainab to check your account setup.");
      setLoading(false);
      return;
    }

    const mappedClient = mapDbClientToStoreClient(clientRow);

    // Only add if not already hydrated this session (e.g. re-login without
    // a full page reload) — avoids a duplicate/stale entry in the array.
    if (!clients.some((c) => c.id === mappedClient.id)) {
      addClient(mappedClient);
    }
    setActiveClientId(mappedClient.id);
    setViewMode("client");
    setWelcoming({ mode: "client", name: mappedClient.name.split(" ")[0] });
    setTimeout(() => router.push("/home"), 1500);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-6">
          <span className="font-display text-2xl text-sage-800">z</span>
        </div>
        <h1 className="font-display text-3xl text-moss-900 mb-2">zeeheal</h1>
        <p className="text-moss-400 text-sm mb-6 leading-relaxed">
          Your skin. Your weight. Your hormones.
          <br />
          One root cause.
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleLogin}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="w-full flex flex-col gap-3"
      >
        <input
          type="tel"
          inputMode="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl border border-sage-100 text-center text-moss-900 placeholder:text-moss-400 focus:outline-none focus:border-sage-600"
          required
        />
        <input
          type="password"
          inputMode="numeric"
          placeholder="Passcode"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl border border-sage-100 text-center text-moss-900 placeholder:text-moss-400 focus:outline-none focus:border-sage-600"
          required
        />

        {error && <p className="text-xs text-clay-600">{error}</p>}

        <Button type="submit" variant="primary" className="w-full py-3.5" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </Button>
      </motion.form>

      <p className="text-[11px] text-moss-400 mt-8">
        New to zeeheal? Ask Zainab to set up your account.
      </p>

      <AnimatePresence>
        {welcoming?.mode === "client" && (
          <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <WelcomeTransition
              greeting={`Welcome back, ${welcoming.name}`}
              subtitle="Let's see how today's going"
            />
          </motion.div>
        )}
        {welcoming?.mode === "nutritionist" && (
          <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <WelcomeTransition
              greeting="Welcome, Zainab"
              subtitle="Here's how your clients are doing"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}