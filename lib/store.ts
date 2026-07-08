import { create } from "zustand";
import { clients as initialClients, Client, MealStatus, MealLog, DailyCheckin, CheckinConfig, PeriodLog, FlowIntensity, CycleSnapshot } from "./mock-data/clients";

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
}));