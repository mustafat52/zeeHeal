import { create } from "zustand";
import { clients as initialClients, Client, MealStatus, MealLog, DailyCheckin, CheckinConfig, PeriodLog, FlowIntensity, CycleSnapshot } from "./mock-data/clients";
import { chatThreads as initialChatThreads, Message } from "./mock-data/messages";
import { PlanTemplate, planTemplates as initialPlanTemplates, pcosPhaseStarterMeals, WeeklyMeals } from "./mock-data/plans";
import { getPcosPhase } from "./conditionSummaries";
import { createClient } from "./supabase/client";
import { deleteClientAccount } from "@/app/actions/clients";
import { relativeLabelToISODate } from "./periodDateLabels";
import { reconcileWeekWithConfig } from "./mealConfig";

/** Today's date as YYYY-MM-DD, matching daily_checkins.checkin_date. */
function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Upserts today's daily_checkins row for a client. Fire-and-forget by
 * design — the caller already applied an optimistic local update to
 * Zustand before calling this, so a network failure here logs to console
 * rather than blocking or rolling back the UI. Only fields actually passed
 * are updated (others stay null/unchanged via upsert's merge behavior);
 * callers pass only the columns they're touching.
 */
function persistDailyCheckin(clientId: string, fields: Record<string, any>) {
  const supabase = createClient();
  supabase
    .from("daily_checkins")
    .upsert(
      { client_id: clientId, checkin_date: todayDateString(), ...fields },
      { onConflict: "client_id,checkin_date" }
    )
    .then(({ error }) => {
      if (error) console.error("Failed to save to daily_checkins:", error.message);
    });
}

export type ViewMode = "client" | "nutritionist";

interface AppState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  activeClientId: string;
  setActiveClientId: (id: string) => void;

  clients: Client[];
  addClient: (client: Client) => void;
  /**
   * Bulk-replaces the entire client list — used by the nutritionist
   * dashboard to hydrate real data from Supabase on load, replacing
   * whatever was there (the initial mock personas) wholesale rather than
   * merging. Distinct from addClient, which appends one client without
   * touching the rest (used right after NewClientFormModal creates
   * someone, so the list updates optimistically without a full refetch).
   */
  setClients: (clients: Client[]) => void;
  /**
   * Pure read-hydration for a client's whole todayPlan — used when
   * TodayMeals loads or generates today's real meal rows from Supabase.
   * See setClientTodayWater below for the narrower water-only version.
   */
  setClientTodayPlan: (clientId: string, todayPlan: Client["todayPlan"]) => void;
  setClientTodayWater: (clientId: string, water: Client["todayPlan"]["water"]) => void;
  setClientProgress: (clientId: string, progress: Client["progress"]) => void;
  setClientCheckinHistory: (clientId: string, checkinHistory: Client["checkinHistory"]) => void;
  /**
   * Pure read-hydration for periodLogs, same reasoning as the other
   * setClientX hydration actions — populated by PeriodCalendar.tsx's own
   * load effect, converting real period_logs/period_flow_logs rows back
   * into the relative-label PeriodLog[] shape.
   */
  setClientPeriodLogs: (clientId: string, periodLogs: PeriodLog[]) => void;
  /**
   * Pure read-hydration — sets a client's todayCheckin from a Supabase
   * fetch without touching checkinHistory or lastLog, unlike logCheckin
   * (which is a real logging action). Used by the nutritionist's client
   * detail page to pull in today's real check-in on load.
   */
  setClientTodayCheckin: (clientId: string, checkin: DailyCheckin | undefined) => void;
  /**
   * Pure read-hydration for session_notes, same reasoning as
   * setClientTodayCheckin. client.notes comes back empty from the login/
   * dashboard hydration bridge (mapDbClientToStoreClient) even for
   * Zainab's own view — that mapper is shared with the client-login path,
   * where notes should always stay empty (nutritionist-only per RLS).
   * This is what actually populates it on her side.
   */
  setClientNotes: (clientId: string, notes: { date: string; text: string }[]) => void;
  toggleMeal: (clientId: string, mealId: string) => void;
  logMeal: (clientId: string, mealId: string, log: MealLog, photoStoragePath?: string) => void;
  addWater: (clientId: string) => void;
  logCheckin: (clientId: string, checkin: DailyCheckin) => void;
  setCheckinConfig: (clientId: string, config: CheckinConfig) => void;
  logPeriodStart: (clientId: string, dateLabel?: string) => void;
  logPeriodEnd: (clientId: string, dateLabel?: string) => void;
  logPeriodFlow: (clientId: string, intensity: FlowIntensity, dateLabel?: string) => void;
  renewPlanCycle: (clientId: string) => Promise<void>;
  setMonthlyRecap: (clientId: string, text: string) => void;
  setMealReasoning: (clientId: string, mealId: string, reasoning: string) => void;
  addSessionNote: (clientId: string, text: string) => void;
  updateClientProfile: (
    clientId: string,
    updates: Partial<Pick<Client, "name" | "initials" | "phone" | "condition" | "planType" | "goalWeight" | "programDurationMonths" | "mealConfig">>
  ) => void;
  archiveClient: (clientId: string) => void;
  unarchiveClient: (clientId: string) => void;
  deleteClient: (clientId: string) => void;

  /**
   * Shared across BOTH chat pages — this is the fix for the two sides
   * never seeing each other's messages. Previously each chat page kept
   * its own local useState seeded once from chatThreads, so a client's
   * message never reached Zainab's view of the same conversation.
   */
  messagesByClient: Record<string, Message[]>;
  sendMessage: (
    clientId: string,
    sender: "client" | "nutritionist",
    content: { text?: string; audioUrl?: string; audioDuration?: number },
    audioStoragePath?: string
  ) => void;
  /** Pure read-hydration — replaces a client's whole message thread, used after loadMessagesForClient. */
  setMessagesForClient: (clientId: string, messages: Message[]) => void;

  assignPlanToClient: (clientId: string, template: PlanTemplate) => void;
  setClientWeeklyPlan: (clientId: string, days: WeeklyMeals) => void;

  /**
   * Moved from a static import to real store state — templates need to be
   * creatable/editable/deletable at runtime, which a static array can't
   * support. Client assignments still fork a deep copy at assignment time
   * (assignPlanToClient), so editing a template here never touches any
   * client who already has their own copy.
   */
  planTemplates: PlanTemplate[];
  addPlanTemplate: (template: PlanTemplate) => void;
  updatePlanTemplate: (templateId: string, updates: Partial<PlanTemplate>) => void;
  deletePlanTemplate: (templateId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  viewMode: "client",
  setViewMode: (mode) => set({ viewMode: mode }),

  activeClientId: "priya",
  setActiveClientId: (id) => set({ activeClientId: id }),

  clients: initialClients,
  addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
  setClients: (clients) => set({ clients }),
  setClientTodayPlan: (clientId, todayPlan) =>
    set((state) => ({
      clients: state.clients.map((c) => (c.id === clientId ? { ...c, todayPlan } : c)),
    })),
  setClientTodayWater: (clientId, water) =>
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === clientId ? { ...c, todayPlan: { ...c.todayPlan, water } } : c
      ),
    })),
  setClientProgress: (clientId, progress) =>
    set((state) => ({
      clients: state.clients.map((c) => (c.id === clientId ? { ...c, progress } : c)),
    })),
  setClientCheckinHistory: (clientId, checkinHistory) =>
    set((state) => ({
      clients: state.clients.map((c) => (c.id === clientId ? { ...c, checkinHistory } : c)),
    })),
  setClientPeriodLogs: (clientId, periodLogs) =>
    set((state) => ({
      clients: state.clients.map((c) => (c.id === clientId ? { ...c, periodLogs } : c)),
    })),
  setClientTodayCheckin: (clientId, checkin) =>
    set((state) => ({
      clients: state.clients.map((c) => (c.id === clientId ? { ...c, todayCheckin: checkin } : c)),
    })),
  setClientNotes: (clientId, notes) =>
    set((state) => ({
      clients: state.clients.map((c) => (c.id === clientId ? { ...c, notes } : c)),
    })),

  toggleMeal: (clientId, mealId) =>
    set((state) => ({
      clients: state.clients.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          todayPlan: {
            ...c.todayPlan,
            meals: c.todayPlan.meals.map((m) =>
              m.id === mealId
                ? { ...m, status: (m.status === "done" ? "pending" : "done") as MealStatus }
                : m
            ),
          },
        };
      }),
    })),

  logMeal: (clientId, mealId, log, photoStoragePath) => {
    set((state) => ({
      clients: state.clients.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          lastLog: "Just now",
          todayPlan: {
            ...c.todayPlan,
            meals: c.todayPlan.meals.map((m) =>
              m.id === mealId ? { ...m, status: "done" as MealStatus, log } : m
            ),
          },
        };
      }),
    }));

    const supabase = createClient();
    supabase
      .from("meals")
      .update({
        status: "done",
        log_note: log.note ?? null,
        log_photo_path: photoStoragePath ?? null,
        logged_at: new Date().toISOString(),
      })
      .eq("id", mealId)
      .then(({ error }) => {
        if (error) console.error("Failed to save logged meal:", error.message);
      });
  },

  addWater: (clientId) => {
    let newCurrent = 0;
    set((state) => ({
      clients: state.clients.map((c) => {
        if (c.id !== clientId) return c;
        newCurrent = Math.min(c.todayPlan.water.current + 1, c.todayPlan.water.goal);
        return { ...c, todayPlan: { ...c.todayPlan, water: { ...c.todayPlan.water, current: newCurrent } } };
      }),
    }));

    const client = get().clients.find((c) => c.id === clientId);
    if (client) {
      persistDailyCheckin(clientId, {
        water_current: newCurrent,
        water_goal: client.todayPlan.water.goal,
      });
    }
  },

  logCheckin: (clientId, checkin) => {
    set((state) => ({
      clients: state.clients.map((c) => {
        if (c.id !== clientId) return c;

        // Write into the current cycle day's slot in checkinHistory so the
        // Cycle Report has real data for "today", not just the overwritten
        // todayCheckin snapshot.
        const totalDays = c.planCycle.totalDays;
        const history = c.checkinHistory
          ? [...c.checkinHistory]
          : Array.from({ length: totalDays }, () => null);
        const dayIndex = c.planCycle.currentDay - 1;
        if (dayIndex >= 0 && dayIndex < history.length) {
          history[dayIndex] = { ...checkin, loggedAt: "Just now" };
        }

        return {
          ...c,
          lastLog: "Just now",
          todayCheckin: { ...checkin, loggedAt: "Just now" },
          checkinHistory: history,
        };
      }),
    }));

    // energy has no UI control yet (DailyCheckinModal doesn't collect it),
    // so it's intentionally omitted here rather than sent as null — a
    // future check-in from the same day would otherwise clobber a real
    // value with null if energy capture gets added later without updating
    // this call site.
    persistDailyCheckin(clientId, {
      weight: checkin.weight ?? null,
      sleep_hours: checkin.sleepHours ?? null,
      mood: checkin.mood ?? null,
      bloating: checkin.bloating ?? null,
      activity_type: checkin.activityType ?? null,
      activity_minutes: checkin.activityMinutes ?? null,
      skin_condition: checkin.skinCondition ?? null,
      hair_fall: checkin.hairFall ?? null,
      cycle_day: checkin.cycleDay ?? null,
      water_glasses: checkin.waterGlasses ?? null,
      note: checkin.note ?? null,
      logged_at: new Date().toISOString(),
    });
  },

  setCheckinConfig: (clientId, config) => {
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === clientId ? { ...c, checkinConfig: config } : c
      ),
    }));

    const supabase = createClient();
    supabase
      .from("clients")
      .update({ checkin_config: config })
      .eq("id", clientId)
      .then(({ error }) => {
        if (error) console.error("Failed to save check-in config:", error.message);
      });
  },

  logPeriodStart: (clientId, dateLabel = "Today") => {
    set((state) => ({
      clients: state.clients.map((c) => {
        if (c.id !== clientId) return c;
        const newLog: PeriodLog = { startDate: dateLabel };
        return { ...c, periodLogs: [...(c.periodLogs ?? []), newLog] };
      }),
    }));

    const supabase = createClient();
    supabase
      .from("period_logs")
      .insert({ client_id: clientId, start_date: relativeLabelToISODate(dateLabel) })
      .then(({ error }) => {
        if (error) console.error("Failed to save period start:", error.message);
      });
  },

  logPeriodEnd: (clientId, dateLabel = "Today") => {
    set((state) => ({
      clients: state.clients.map((c) => {
        if (c.id !== clientId) return c;
        const logs = [...(c.periodLogs ?? [])];
        const last = logs[logs.length - 1];
        if (last && !last.endDate) {
          logs[logs.length - 1] = { ...last, endDate: dateLabel };
        }
        return { ...c, periodLogs: logs };
      }),
    }));

    (async () => {
      const supabase = createClient();
      const { data: activeLog, error: findError } = await supabase
        .from("period_logs")
        .select("id, start_date")
        .eq("client_id", clientId)
        .is("end_date", null)
        .order("start_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (findError || !activeLog) {
        console.error("Failed to find active period to end:", findError?.message ?? "none found");
        return;
      }

      const endISO = relativeLabelToISODate(dateLabel);
      const cycleLength =
        Math.round(
          (new Date(endISO + "T00:00:00").getTime() -
            new Date(activeLog.start_date + "T00:00:00").getTime()) /
            86400000
        ) + 1;

      const { error: updateError } = await supabase
        .from("period_logs")
        .update({ end_date: endISO, cycle_length: cycleLength })
        .eq("id", activeLog.id);

      if (updateError) console.error("Failed to save period end:", updateError.message);
    })();
  },

  logPeriodFlow: (clientId, intensity, dateLabel = "Today") => {
    set((state) => ({
      clients: state.clients.map((c) => {
        if (c.id !== clientId) return c;
        const logs = [...(c.periodLogs ?? [])];
        const lastIdx = logs.length - 1;
        if (lastIdx < 0 || logs[lastIdx].endDate) return c; // no active period to log against
        const last = logs[lastIdx];
        const dailyFlow = [...(last.dailyFlow ?? [])];
        const idx = dailyFlow.findIndex((f) => f.date === dateLabel);
        if (idx >= 0) {
          dailyFlow[idx] = { date: dateLabel, intensity };
        } else {
          dailyFlow.push({ date: dateLabel, intensity });
        }
        logs[lastIdx] = { ...last, dailyFlow };
        return { ...c, periodLogs: logs };
      }),
    }));

    (async () => {
      const supabase = createClient();
      const { data: activeLog, error: findError } = await supabase
        .from("period_logs")
        .select("id")
        .eq("client_id", clientId)
        .is("end_date", null)
        .order("start_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (findError || !activeLog) {
        console.error("Failed to find active period for flow log:", findError?.message ?? "none found");
        return;
      }

      const { error: upsertError } = await supabase
        .from("period_flow_logs")
        .upsert(
          { period_log_id: activeLog.id, flow_date: relativeLabelToISODate(dateLabel), intensity },
          { onConflict: "period_log_id,flow_date" }
        );

      if (upsertError) console.error("Failed to save flow log:", upsertError.message);
    })();
  },

  renewPlanCycle: async (clientId) => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("renew_plan_cycle", { target_client_id: clientId });

    if (error || !data) {
      console.error("Failed to renew plan cycle:", error?.message);
      return;
    }

    // data is the updated clients row the RPC returns — use it as the
    // source of truth for the new cycle fields rather than recomputing
    // locally, so we can't drift from what the atomic RPC actually did.
    set((state) => ({
      clients: state.clients.map((c) => {
        if (c.id !== clientId) return c;

        const completedCycle: CycleSnapshot = {
          cycleNumber: c.planCycle.cycleNumber,
          startDate: c.planCycle.startDate,
          checkinHistory: c.checkinHistory ?? Array.from({ length: 15 }, () => null),
          streakAtEnd: c.streak,
        };

        return {
          ...c,
          cycleHistory: [...(c.cycleHistory ?? []), completedCycle],
          planCycle: {
            cycleNumber: data.current_cycle_number,
            startDate: data.current_cycle_start,
            currentDay: data.current_cycle_day,
            totalDays: 15,
          },
          checkinHistory: Array.from({ length: 15 }, () => null),
        };
      }),
    }));
  },

  setMonthlyRecap: (clientId, text) => {
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === clientId ? { ...c, monthlyRecap: text } : c
      ),
    }));

    const supabase = createClient();
    supabase
      .from("clients")
      .update({ monthly_recap: text })
      .eq("id", clientId)
      .then(({ error }) => {
        if (error) console.error("Failed to save monthly recap:", error.message);
      });
  },

  setMealReasoning: (clientId, mealId, reasoning) =>
    set((state) => ({
      clients: state.clients.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          todayPlan: {
            ...c.todayPlan,
            meals: c.todayPlan.meals.map((m) =>
              m.id === mealId ? { ...m, reasoning } : m
            ),
          },
        };
      }),
    })),

  addSessionNote: (clientId, text) => {
    set((state) => ({
      clients: state.clients.map((c) => {
        if (c.id !== clientId) return c;
        return { ...c, notes: [{ date: "Today", text }, ...c.notes] };
      }),
    }));

    const supabase = createClient();
    supabase
      .from("session_notes")
      .insert({ client_id: clientId, text, note_date: todayDateString() })
      .then(({ error }) => {
        if (error) console.error("Failed to save session note:", error.message);
      });
  },

  updateClientProfile: (clientId, updates) => {
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === clientId ? { ...c, ...updates } : c
      ),
    }));

    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.initials !== undefined) dbUpdates.initials = updates.initials;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.condition !== undefined) dbUpdates.condition = updates.condition;
    if (updates.planType !== undefined) dbUpdates.plan_type = updates.planType;
    if (updates.goalWeight !== undefined) dbUpdates.goal_weight = updates.goalWeight;
    if (updates.programDurationMonths !== undefined) dbUpdates.program_duration_months = updates.programDurationMonths;
    if (updates.mealConfig !== undefined) dbUpdates.meal_config = updates.mealConfig;

    // NOTE: updating `phone` here only changes the display column. The
    // client's actual login credential is a synthetic email derived from
    // whatever phone number was on file at ACCOUNT CREATION time (see
    // lib/phone.ts) — it does not get regenerated here. Editing a
    // client's phone number through this action will silently break
    // their ability to log in with their new number. Flagged, not fixed —
    // needs a real decision (block phone edits? regenerate the account?)
    // before this is safe to use for that field specifically.
    const supabase = createClient();
    supabase
      .from("clients")
      .update(dbUpdates)
      .eq("id", clientId)
      .then(({ error }) => {
        if (error) console.error("Failed to save profile updates:", error.message);
      });
  },

  archiveClient: (clientId) => {
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === clientId ? { ...c, archived: true } : c
      ),
    }));
    const supabase = createClient();
    supabase
      .from("clients")
      .update({ archived: true })
      .eq("id", clientId)
      .then(({ error }) => {
        if (error) console.error("Failed to archive client:", error.message);
      });
  },

  unarchiveClient: (clientId) => {
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === clientId ? { ...c, archived: false } : c
      ),
    }));
    const supabase = createClient();
    supabase
      .from("clients")
      .update({ archived: false })
      .eq("id", clientId)
      .then(({ error }) => {
        if (error) console.error("Failed to unarchive client:", error.message);
      });
  },

  deleteClient: (clientId) => {
    // Optimistic local removal first — matches the immediate-feel of every
    // other action here. The server action runs after; a failure logs
    // rather than trying to resurrect the row in the UI, since by the
    // time it fails the person has likely already navigated away.
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== clientId),
    }));
    deleteClientAccount(clientId).then((result) => {
      if (!result.success) console.error("Failed to delete client:", result.error);
    });
  },

  messagesByClient: { ...initialChatThreads },

  sendMessage: (clientId, sender, content, audioStoragePath) => {
    set((state) => {
      const thread = state.messagesByClient[clientId] ?? [];
      const newMessage: Message = {
        id: String(Date.now()),
        sender,
        text: content.text ?? "",
        time: "Just now",
        audioUrl: content.audioUrl,
        audioDuration: content.audioDuration,
      };
      return {
        messagesByClient: {
          ...state.messagesByClient,
          [clientId]: [...thread, newMessage],
        },
      };
    });

    const supabase = createClient();
    supabase
      .from("messages")
      .insert({
        client_id: clientId,
        sender,
        text: content.text ?? null,
        audio_path: audioStoragePath ?? null,
        audio_duration: content.audioDuration ?? null,
      })
      .then(({ error }) => {
        if (error) console.error("Failed to save message:", error.message);
      });
  },

  setMessagesForClient: (clientId, messages) =>
    set((state) => ({
      messagesByClient: { ...state.messagesByClient, [clientId]: messages },
    })),

  assignPlanToClient: (clientId, template) => {
    let clonedDays: WeeklyMeals | null = null;

    set((state) => ({
      clients: state.clients.map((c) => {
        if (c.id !== clientId) return c;

        // PCOS smart-fill: fork from whichever phase-set matches her
        // current phase, if detectable, instead of the generic template.
        // This does NOT create any ongoing link — it's a one-time,
        // better-informed starting point. From here it's edited like any
        // other assigned plan.
        let sourceDays = template.weeklyMeals;
        if (template.id === "pcos" && c.condition === "pcos") {
          const hasActivePeriod = !!c.periodLogs?.length && !c.periodLogs[c.periodLogs.length - 1].endDate;
          const phase = getPcosPhase(hasActivePeriod, c.todayCheckin?.cycleDay);
          if (phase) sourceDays = pcosPhaseStarterMeals[phase.key];
        }

        const forkedDays: WeeklyMeals = reconcileWeekWithConfig(
          JSON.parse(JSON.stringify(sourceDays)), // deep clone — never share references with the template
          c.mealConfig
        );
        clonedDays = forkedDays;

        return {
          ...c,
          weeklyPlan: {
            templateId: template.id,
            templateName: template.name,
            days: forkedDays,
          },
        };
      }),
    }));

    if (!clonedDays) return; // client not found — nothing to persist

    const supabase = createClient();
    supabase
      .from("clients")
      .update({
        weekly_plan_template_id: template.id,
        weekly_plan_template_name: template.name,
        weekly_plan_days: clonedDays,
      })
      .eq("id", clientId)
      .then(({ error }) => {
        if (error) console.error("Failed to save assigned plan:", error.message);
      });
  },

  setClientWeeklyPlan: (clientId, days) => {
    let templateId: string | undefined;
    let templateName: string | undefined;
    let found = false;

    set((state) => ({
      clients: state.clients.map((c) => {
        if (c.id !== clientId) return c;
        found = true;
        templateId = c.weeklyPlan?.templateId;
        templateName = c.weeklyPlan?.templateName;
        return {
          ...c,
          weeklyPlan: { templateId, templateName, days },
        };
      }),
    }));

    if (!found) return;

    const supabase = createClient();
    supabase
      .from("clients")
      .update({
        weekly_plan_template_id: templateId ?? null,
        weekly_plan_template_name: templateName ?? null,
        weekly_plan_days: days,
      })
      .eq("id", clientId)
      .then(({ error }) => {
        if (error) console.error("Failed to save weekly plan:", error.message);
      });
  },

  planTemplates: initialPlanTemplates,

  addPlanTemplate: (template) =>
    set((state) => ({ planTemplates: [...state.planTemplates, template] })),

  updatePlanTemplate: (templateId, updates) =>
    set((state) => ({
      planTemplates: state.planTemplates.map((t) =>
        t.id === templateId ? { ...t, ...updates } : t
      ),
    })),

  deletePlanTemplate: (templateId) =>
    set((state) => ({
      planTemplates: state.planTemplates.filter((t) => t.id !== templateId),
    })),
}));