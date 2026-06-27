import { create } from "zustand";
import { clients as initialClients, Client, MealStatus, MealLog, DailyCheckin, CheckinConfig } from "./mock-data/clients";

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
        return {
          ...c,
          lastLog: "Just now",
          todayCheckin: { ...checkin, loggedAt: "Just now" },
        };
      }),
    })),

  setCheckinConfig: (clientId, config) =>
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === clientId ? { ...c, checkinConfig: config } : c
      ),
    })),
}));