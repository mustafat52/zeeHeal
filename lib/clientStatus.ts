import { Client } from "./mock-data/clients";
import { parseRelativeDate } from "./period";

export type DisplayStatus = "on-track" | "needs-attention" | "new" | "archived";

/**
 * Status is computed at display time, not stored and kept in sync. Every
 * store action (logCheckin, addWater, renewPlanCycle, ...) would otherwise
 * need to remember to also update a status field — fragile, and exactly the
 * kind of "field goes stale" risk the config-driven charts and the
 * cycle_history-as-a-query backend design both avoid on purpose.
 *
 * `archived` is the one genuine exception — that's a real manual action
 * (a nutritionist decision, not a behavior pattern), so it's checked first
 * and short-circuits everything else.
 */
export function getDisplayStatus(client: Client): DisplayStatus {
  if (client.archived) return "archived";

  const start = parseRelativeDate(client.startDate);
  const startedRecently = start ? Date.now() - start.getTime() < 3 * 24 * 60 * 60 * 1000 : false;

  const history = client.checkinHistory ?? [];
  const currentDay = client.planCycle.currentDay;
  const loggedSoFar = history.slice(0, currentDay).filter((h) => h !== null && h !== undefined).length;

  // Grace period — a brand new client hasn't had a fair chance to log yet.
  if (startedRecently && loggedSoFar <= 1) return "new";

  // Count consecutive missed days at the END of the logged history (the
  // most recent days), not missed days anywhere in the cycle — a gap from
  // 10 days ago that's since recovered shouldn't still read as an active
  // problem today.
  let consecutiveMissed = 0;
  for (let i = currentDay - 1; i >= 0; i--) {
    if (history[i] === null || history[i] === undefined) consecutiveMissed++;
    else break;
  }

  if (consecutiveMissed >= 2) return "needs-attention";
  return "on-track";
}