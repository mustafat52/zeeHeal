"use client";

import { motion } from "framer-motion";
import { Client } from "@/lib/mock-data/clients";
import { PatientProfileCard } from "./PatientProfileCard";
import { DailyBarStrip } from "./DailyBarStrip";
import { PeriodFlowStrip } from "./PeriodFlowStrip";
import { buildFlowDataForCycle } from "@/lib/period";
import { isoDateToRelativeLabel } from "@/lib/periodDateLabels";
import { getConfiguredChartFields } from "@/lib/checkinCharts";
import {
  getPcosPhase,
  getWeightLossSummary,
  getHormonalSummary,
  getSkincareSummary,
} from "@/lib/conditionSummaries";
import { X, TrendingDown, TrendingUp, Minus, Droplets, Target } from "lucide-react";

function trendIcon(change: number) {
  if (change < -0.2) return TrendingDown;
  if (change > 0.2) return TrendingUp;
  return Minus;
}

export function CycleReportModal({
  client,
  onClose,
  onRenew,
}: {
  client: Client;
  onClose: () => void;
  onRenew: () => void;
}) {
  const progress = client.progress;
  // A brand-new client can genuinely have zero progress rows — the
  // client-side Progress page already guards this (see
  // (client)/progress/page.tsx); this modal previously didn't, and would
  // crash on first.weight/last.weight when Zainab opened it for a client
  // who just started.
  const hasProgress = progress.length > 0;
  const first = hasProgress ? progress[0] : null;
  const last = hasProgress ? progress[progress.length - 1] : null;
  const weightChange = hasProgress ? last!.weight - first!.weight : 0;
  const bloatingChange = hasProgress ? last!.bloating - first!.bloating : 0;
  const energyChange = hasProgress ? last!.energy - first!.energy : 0;

  const WeightTrend = trendIcon(weightChange);
  const BloatTrend = trendIcon(bloatingChange);
  const EnergyTrend = trendIcon(energyChange);

  const { cycleNumber, currentDay, totalDays } = client.planCycle;
  const history = client.checkinHistory ?? Array.from({ length: totalDays }, () => null);

  const loggedThisCycle = history
    .slice(0, currentDay)
    .filter((h) => h !== null).length;

  // Same functions the client's own Plan page uses — whatever conclusion
  // she saw there, Zainab sees the identical statement here, rather than
  // having to re-derive it herself from the raw charts below.
  const hasActivePeriod =
    !!client.periodLogs?.length && !client.periodLogs[client.periodLogs.length - 1].endDate;
  const pcosPhase =
    client.condition === "pcos" ? getPcosPhase(hasActivePeriod, client.todayCheckin?.cycleDay) : null;
  const weightLossSummary = client.condition === "weight-loss" ? getWeightLossSummary(client) : null;
  const hormonalSummary = client.condition === "hormonal" ? getHormonalSummary(client) : null;
  const skincareSummary = client.condition === "skincare" ? getSkincareSummary(client) : null;

  const chartFields = getConfiguredChartFields(client, history);
  // planCycle.startDate is a real ISO date now (current_cycle_start from
  // Supabase), but buildFlowDataForCycle's parseRelativeDate only
  // understands "Today"/"N days ago" — converting here at the call site
  // rather than touching lib/period.ts, which is correct as written.
  const flowData = buildFlowDataForCycle(
    client.periodLogs,
    isoDateToRelativeLabel(client.planCycle.startDate),
    totalDays
  );
  const hasFlowLogged = flowData.some((v) => v !== null);

  const lastPeriod = client.periodLogs?.[client.periodLogs.length - 1];

  return (
    <div
      style={{ minHeight: "100vh" }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-moss-900/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-ivory rounded-t-[28px] px-5 pt-5 pb-[calc(env(safe-area-inset-bottom)+24px)] max-h-[88vh] overflow-y-auto no-scrollbar"
      >
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-moss-400">
            Cycle {cycleNumber} review · Day {currentDay} of {totalDays}
          </p>
          <button onClick={onClose} className="tap-scale w-8 h-8 rounded-full bg-white flex items-center justify-center" aria-label="Close">
            <X size={16} className="text-moss-600" />
          </button>
        </div>
        <h2 className="font-display text-2xl text-moss-900 mb-4">{client.name}</h2>

        <PatientProfileCard client={client} />

        {(pcosPhase || weightLossSummary || hormonalSummary || skincareSummary) && (
          <div className="bg-moss-900/[0.03] border border-moss-900/10 rounded-xl p-3.5 mb-4">
            <p className="text-[10px] font-medium text-moss-400 mb-1.5">
              At a glance — same as what {client.name.split(" ")[0]} sees on their Plan page
            </p>
            {pcosPhase && (
              <>
                <p className="text-sm font-medium text-moss-900">{pcosPhase.phase}</p>
                <p className="text-xs text-moss-600 mt-0.5">{pcosPhase.tip}</p>
              </>
            )}
            {weightLossSummary && (
              <p className="text-sm font-medium text-moss-900">
                {weightLossSummary.lost > 0 ? `${weightLossSummary.lost} kg lost so far` : "Just getting started"}
                {weightLossSummary.toGo > 0 ? ` · ${weightLossSummary.toGo} kg to goal` : ""}
              </p>
            )}
            {hormonalSummary && (
              <>
                <p className="text-sm font-medium text-moss-900">{hormonalSummary.headline}</p>
                <p className="text-xs text-moss-600 mt-0.5">{hormonalSummary.tip}</p>
              </>
            )}
            {skincareSummary && (
              <>
                <p className="text-sm font-medium text-moss-900">{skincareSummary.headline}</p>
                <p className="text-xs text-moss-600 mt-0.5">{skincareSummary.tip}</p>
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-xl border border-sage-100/60 p-3.5">
            <p className="text-xs text-moss-400 mb-1">Streak</p>
            <p className="font-display text-xl text-moss-900">{client.streak} days</p>
          </div>
          <div className="bg-white rounded-xl border border-sage-100/60 p-3.5">
            <p className="text-xs text-moss-400 mb-1">Logged this cycle</p>
            <p className="font-display text-xl text-moss-900">
              {loggedThisCycle}/{currentDay}
            </p>
          </div>
        </div>

        {hasProgress ? (
          <div className="bg-white rounded-xl border border-sage-100/60 p-3.5 mb-4">
            <p className="text-xs font-medium text-moss-600 mb-3">Since {client.startDate}</p>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-sm text-moss-900">Weight</span>
              <span className="flex items-center gap-1 text-sm font-medium text-moss-900">
                <WeightTrend
                  size={13}
                  className={weightChange < 0 ? "text-sage-600" : weightChange > 0 ? "text-clay-600" : "text-moss-400"}
                />
                {Math.abs(weightChange).toFixed(1)} kg {weightChange < 0 ? "down" : weightChange > 0 ? "up" : "no change"}
              </span>
            </div>
            <div className="h-px bg-sage-100" />
            <div className="flex items-center justify-between py-1.5 pt-2.5">
              <span className="text-sm text-moss-900">Bloating</span>
              <span className="flex items-center gap-1 text-sm font-medium text-moss-900">
                <BloatTrend
                  size={13}
                  className={bloatingChange < 0 ? "text-sage-600" : bloatingChange > 0 ? "text-clay-600" : "text-moss-400"}
                />
                {bloatingChange < 0 ? "Improving" : bloatingChange > 0 ? "Worsening" : "Stable"}
              </span>
            </div>
            <div className="h-px bg-sage-100" />
            <div className="flex items-center justify-between py-1.5 pt-2.5">
              <span className="text-sm text-moss-900">Energy</span>
              <span className="flex items-center gap-1 text-sm font-medium text-moss-900">
                <EnergyTrend
                  size={13}
                  className={energyChange > 0 ? "text-sage-600" : energyChange < 0 ? "text-clay-600" : "text-moss-400"}
                />
                {energyChange > 0 ? "Improving" : energyChange < 0 ? "Dropping" : "Stable"}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-sage-100/60 p-3.5 mb-4">
            <p className="text-xs font-medium text-moss-600 mb-1">Since {client.startDate}</p>
            <p className="text-xs text-moss-400">
              No weekly progress data yet — trends will show here once check-ins start coming in.
            </p>
          </div>
        )}

        {client.condition === "weight-loss" && client.goalWeight !== undefined && hasProgress && (
          <div className="bg-white rounded-xl border border-sage-100/60 p-3.5 mb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Target size={14} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-moss-400">Goal weight</p>
              <p className="text-sm font-medium text-moss-900">
                {last!.weight} kg now · {Math.max(last!.weight - client.goalWeight, 0).toFixed(1)} kg to {client.goalWeight} kg
              </p>
            </div>
          </div>
        )}

        {client.condition === "pcos" && (
          <div className="bg-white rounded-xl border border-sage-100/60 p-3.5 mb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
              <Droplets size={14} className="text-rose-600" />
            </div>
            <div>
              <p className="text-xs text-moss-400">Period logs</p>
              <p className="text-sm font-medium text-moss-900">
                {client.periodLogs?.length ?? 0} logged
                {lastPeriod && !lastPeriod.endDate ? " · period currently active" : ""}
                {lastPeriod?.endDate && lastPeriod.cycleLength !== undefined
                  ? ` · last was ${lastPeriod.cycleLength} days`
                  : ""}
              </p>
              <p className="text-[10px] text-moss-400 mt-0.5">
                {hasFlowLogged ? "See daily flow chart below" : "No flow entries logged this cycle yet"}
              </p>
            </div>
          </div>
        )}

        <p className="text-xs font-medium text-moss-600 mb-2">This cycle, day by day</p>

        {chartFields.map(({ def, data }) => (
          <DailyBarStrip
            key={def.key}
            label={def.label}
            data={data}
            totalDays={totalDays}
            max={def.getMax(client)}
            colorClass={def.colorClass}
          />
        ))}
        {client.condition === "pcos" && <PeriodFlowStrip data={flowData} totalDays={totalDays} />}

        <p className="text-xs font-medium text-moss-600 mb-2 mt-2">Recent notes</p>
        <div className="flex flex-col gap-2 mb-5">
          {client.notes.slice(0, 5).map((note, i) => (
            <div key={i} className="bg-white rounded-xl border border-sage-100/60 p-3">
              <p className="text-[11px] text-moss-400 mb-0.5">{note.date}</p>
              <p className="text-sm text-moss-900">{note.text}</p>
            </div>
          ))}
          {client.notes.length === 0 && (
            <p className="text-xs text-moss-400">No session notes yet.</p>
          )}
        </div>

        <button
          onClick={onRenew}
          className="tap-scale w-full flex items-center justify-center gap-2 bg-clay-600 text-white rounded-xl py-3.5 text-sm font-medium"
        >
          Start cycle {cycleNumber + 1}
        </button>
      </motion.div>
    </div>
  );
}