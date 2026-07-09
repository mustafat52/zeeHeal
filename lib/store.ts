import { create } from "zustand";
import { clients as initialClients, Client, MealStatus, MealLog, DailyCheckin, CheckinConfig, PeriodLog, FlowIntensity, CycleSnapshot } from "./mock-data/clients";
import { chatThreads as initialChatThreads, Message } from "./mock-data/messages";
import { PlanTemplate, planTemplates as initialPlanTemplates, pcosPhaseStarterMeals, WeeklyMeals } from "./mock-data/plans";
import { getPcosPhase } from "./conditionSummaries";

export type ViewMode = "client" | "nutritionist";

interface AppState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  activeClientId: string;
  setActiveClientId: (id: string) => void;

  clients: Client[];
  addClient: (client: Client) => void;
  toggleMeal: (clientId: string, mealId: string) => void;
  logMeal: (clientId: string, mealId: string, log: MealLog) => void;
  addWater: (clientId: string) => void;
  logCheckin: (clientId: string, checkin: DailyCheckin) => void;
  setCheckinConfig: (clientId: string, config: CheckinConfig) => void;
  logPeriodStart: (clientId: string, dateLabel?: string) => void;
  logPeriodEnd: (clientId: string, dateLabel?: string) => void;
  logPeriodFlow: (clientId: string, intensity: FlowIntensity, dateLabel?: string) => void;
  renewPlanCycle: (clientId: string) => void;
  setMonthlyRecap: (clientId: string, text: string) => void;
  setMealReasoning: (clientId: string, mealId: string, reasoning: string) => void;
  addSessionNote: (clientId: string, text: string) => void;
  updateClientProfile: (
    clientId: string,
    updates: Partial<Pick<Client, "name" | "initials" | "phone" | "condition" | "planType" | "goalWeight" | "programDurationMonths">>
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
    content: { text?: string; audioUrl?: string; audioDuration?: number }
  ) => void;

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

export const useAppStore = create<AppState>((set) => ({
  viewMode: "client",
  setViewMode: (mode) => set({ viewMode: mode }),

  activeClientId: "priya",
  setActiveClientId: (id) => set({ activeClientId: id }),

  clients: initialClients,
  addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),

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

  logMeal: (clientId, mealId, log) =>
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
    })),

  addWater: (clientId) =>
    set((state) => ({
      clients: state.clients.map((c) => {
        if (c.id !== clientId) return c;
        const current = Math.min(c.todayPlan.water.current + 1, c.todayPlan.water.goal);
        return { ...c, todayPlan: { ...c.todayPlan, water: { ...c.todayPlan.water, current } } };
      }),
    })),

  logCheckin: (clientId, checkin) =>
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
    })),

  setCheckinConfig: (clientId, config) =>
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === clientId ? { ...c, checkinConfig: config } : c
      ),
    })),

  logPeriodStart: (clientId, dateLabel = "Today") =>
    set((state) => ({
      clients: state.clients.map((c) => {
        if (c.id !== clientId) return c;
        const newLog: PeriodLog = { startDate: dateLabel };
        return { ...c, periodLogs: [...(c.periodLogs ?? []), newLog] };
      }),
    })),

  logPeriodEnd: (clientId, dateLabel = "Today") =>
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
    })),

  logPeriodFlow: (clientId, intensity, dateLabel = "Today") =>
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
    })),

  renewPlanCycle: (clientId) =>
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
            cycleNumber: c.planCycle.cycleNumber + 1,
            startDate: "Today",
            currentDay: 1,
            totalDays: 15,
          },
          // Fresh cycle, fresh live history — the just-finished cycle now
          // lives in cycleHistory instead of being discarded.
          checkinHistory: Array.from({ length: 15 }, () => null),
        };
      }),
    })),

  setMonthlyRecap: (clientId, text) =>
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === clientId ? { ...c, monthlyRecap: text } : c
      ),
    })),

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

  addSessionNote: (clientId, text) =>
    set((state) => ({
      clients: state.clients.map((c) => {
        if (c.id !== clientId) return c;
        return { ...c, notes: [{ date: "Today", text }, ...c.notes] };
      }),
    })),

  updateClientProfile: (clientId, updates) =>
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === clientId ? { ...c, ...updates } : c
      ),
    })),

  archiveClient: (clientId) =>
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === clientId ? { ...c, archived: true } : c
      ),
    })),

  unarchiveClient: (clientId) =>
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === clientId ? { ...c, archived: false } : c
      ),
    })),

  deleteClient: (clientId) =>
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== clientId),
    })),

  messagesByClient: { ...initialChatThreads },

  sendMessage: (clientId, sender, content) =>
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
    }),

  assignPlanToClient: (clientId, template) =>
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

        return {
          ...c,
          weeklyPlan: {
            templateId: template.id,
            templateName: template.name,
            days: JSON.parse(JSON.stringify(sourceDays)), // deep clone — never share references with the template
          },
        };
      }),
    })),

  setClientWeeklyPlan: (clientId, days) =>
    set((state) => ({
      clients: state.clients.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          weeklyPlan: {
            templateId: c.weeklyPlan?.templateId,
            templateName: c.weeklyPlan?.templateName,
            days,
          },
        };
      }),
    })),

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