"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { TrendingDown, TrendingUp, Droplet, Target } from "lucide-react";
import { PeriodFlowChart } from "@/components/client/PeriodFlowChart";
import { ActivityBarStrip } from "@/components/client/ActivityBarStrip";

function useChartWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(280);

  useEffect(() => {
    function measure() {
      if (ref.current) setWidth(ref.current.offsetWidth);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return { ref, width };
}

export default function ClientProgressPage() {
  const activeClientId = useAppStore((s) => s.activeClientId);
  const client = useAppStore((s) => s.clients.find((c) => c.id === activeClientId));
  const weightChart = useChartWidth();
  const energyChart = useChartWidth();

  if (!client) return null;

  const first = client.progress[0];
  const last = client.progress[client.progress.length - 1];
  const weightChange = (last.weight - first.weight).toFixed(1);
  const bloatingImproved = last.bloating < first.bloating;

  const periodLogs = client.condition === "pcos" ? client.periodLogs ?? [] : [];
  const periodLengths = periodLogs.filter((l) => l.cycleLength !== undefined).map((l) => l.cycleLength as number);
  const avgPeriodLength = periodLengths.length
    ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
    : null;

  const showGoalProgress = client.condition === "weight-loss" && client.goalWeight !== undefined;
  const lostSoFar = showGoalProgress ? parseFloat((first.weight - last.weight).toFixed(1)) : 0;
  const toGo = showGoalProgress ? parseFloat((last.weight - client.goalWeight!).toFixed(1)) : 0;
  const goalDenominator = showGoalProgress ? first.weight - client.goalWeight! : 0;
  const goalPct = showGoalProgress
    ? goalDenominator > 0
      ? Math.max(0, Math.min(100, Math.round((lostSoFar / goalDenominator) * 100)))
      : 100
    : 0;
  const activityData = (client.checkinHistory ?? []).map((h) => h?.activityMinutes ?? null);
  const hormonalMoodData = (client.checkinHistory ?? []).map((h) => h?.mood ?? null);
  const hormonalSleepData = (client.checkinHistory ?? []).map((h) => h?.sleepHours ?? null);
  const skincareSkinData = (client.checkinHistory ?? []).map((h) => h?.skinCondition ?? null);
  const skincareWaterData = (client.checkinHistory ?? []).map((h) => h?.waterGlasses ?? null);

  return (
    <div className="pt-12 px-5">
      <h1 className="font-display text-2xl text-moss-900 mb-1">Your progress</h1>
      <p className="text-sm text-moss-400 mb-5">Since {client.startDate}</p>

      {client.monthlyRecap && (
        <div className="bg-sage-50 border border-sage-100 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-7 h-7 rounded-full bg-sage-100 flex items-center justify-center text-[11px] font-medium text-sage-800 shrink-0">
              ZB
            </div>
            <p className="text-xs font-medium text-moss-600">A note from Zainab, this month</p>
          </div>
          <p className="text-sm text-moss-900 leading-relaxed font-display italic">
            {client.monthlyRecap}
          </p>
        </div>
      )}

      {client.condition === "pcos" && (
        <Card className="mb-5">
          <p className="text-sm font-medium text-moss-600 mb-3 flex items-center gap-1.5">
            <Droplet size={13} className="text-rose-500" /> Your cycle
          </p>
          {periodLogs.length === 0 ? (
            <p className="text-xs text-moss-400">No periods logged yet.</p>
          ) : (
            <>
              <div className="flex flex-col gap-2 mb-3">
                {[...periodLogs].reverse().slice(0, 4).map((log, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-moss-900">
                      {log.startDate}
                      {log.endDate ? ` – ${log.endDate}` : " · ongoing"}
                    </span>
                    {log.cycleLength !== undefined && (
                      <span className="text-xs text-moss-400">{log.cycleLength}-day period</span>
                    )}
                  </div>
                ))}
              </div>
              {avgPeriodLength !== null && (
                <p className="text-xs text-moss-600 pt-2.5 border-t border-sage-100">
                  Average period length: <span className="font-medium text-moss-900">{avgPeriodLength} days</span>
                </p>
              )}
              <PeriodFlowChart log={periodLogs[periodLogs.length - 1]} />
            </>
          )}
        </Card>
      )}

      {showGoalProgress && (
        <Card className="mb-5">
          <p className="text-sm font-medium text-moss-600 mb-3 flex items-center gap-1.5">
            <Target size={13} className="text-amber-600" /> Goal progress
          </p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-moss-600">
              {lostSoFar > 0 ? `${lostSoFar} kg lost so far` : "Just getting started"}
            </span>
            <span className="text-xs text-moss-400">{goalPct}%</span>
          </div>
          <div className="h-2 bg-moss-900/8 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-700"
              style={{ width: `${goalPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-moss-400">
            <span>{first.weight} kg</span>
            <span>{client.goalWeight} kg goal</span>
          </div>
          {toGo > 0 && (
            <p className="text-xs text-moss-600 mt-2">{toGo} kg to go</p>
          )}
          <ActivityBarStrip
            label="Activity this cycle"
            data={activityData}
            totalDays={client.planCycle.totalDays}
            max={40}
            colorClass="bg-amber-400"
            unitLabel="days active"
          />
        </Card>
      )}

      {client.condition === "hormonal" && (
        <Card className="mb-5">
          <p className="text-sm font-medium text-moss-600 mb-1">Mood & sleep this cycle</p>
          <p className="text-xs text-moss-400 mb-1">
            Real day-by-day data from your check-ins — no guessing, no averages standing in for it.
          </p>
          <ActivityBarStrip
            label="Mood (1–5)"
            data={hormonalMoodData}
            totalDays={client.planCycle.totalDays}
            max={5}
            colorClass="bg-violet-400"
            unitLabel="days logged"
          />
          <ActivityBarStrip
            label="Sleep (hrs)"
            data={hormonalSleepData}
            totalDays={client.planCycle.totalDays}
            max={9}
            colorClass="bg-violet-300"
            unitLabel="days logged"
          />
        </Card>
      )}

      {client.condition === "skincare" && (
        <Card className="mb-5">
          <p className="text-sm font-medium text-moss-600 mb-1">Skin & hydration this cycle</p>
          <p className="text-xs text-moss-400 mb-1">Lower skin condition scores mean clearer skin.</p>
          <ActivityBarStrip
            label="Skin condition (0–10)"
            data={skincareSkinData}
            totalDays={client.planCycle.totalDays}
            max={10}
            colorClass="bg-teal-400"
            unitLabel="days logged"
          />
          <ActivityBarStrip
            label="Water (glasses)"
            data={skincareWaterData}
            totalDays={client.planCycle.totalDays}
            max={client.todayPlan.water.goal}
            colorClass="bg-sage-400"
            unitLabel="days logged"
          />
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Card>
          <p className="text-xs text-moss-400">Weight</p>
          <p className="font-display text-xl text-moss-900 mt-0.5">{last.weight} kg</p>
          <p className="text-xs text-sage-600 flex items-center gap-1 mt-1">
            <TrendingDown size={12} /> {Math.abs(Number(weightChange))} kg this month
          </p>
        </Card>
        <Card>
          <p className="text-xs text-moss-400">Bloating</p>
          <p className="font-display text-xl text-moss-900 mt-0.5">
            {last.bloating <= 3 ? "Mild" : last.bloating <= 6 ? "Moderate" : "High"}
          </p>
          <p className="text-xs text-sage-600 flex items-center gap-1 mt-1">
            {bloatingImproved ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
            {bloatingImproved ? "Improving" : "Watch this"}
          </p>
        </Card>
      </div>

      <Card className="mb-4">
        <p className="text-sm font-medium text-moss-600 mb-3">Weight trend</p>
        <div ref={weightChart.ref} className="h-44 -ml-2" style={{ contain: "layout paint" }}>
          {weightChart.width > 0 && (
            <LineChart
              width={weightChart.width}
              height={176}
              data={client.progress}
            >
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: "#8A8F7E" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #EDF1E6",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#7C9473"
                strokeWidth={2.5}
                dot={{ fill: "#7C9473", r: 3 }}
                isAnimationActive={false}
              />
            </LineChart>
          )}
        </div>
      </Card>

      <Card>
        <p className="text-sm font-medium text-moss-600 mb-3">Energy levels</p>
        <div ref={energyChart.ref} className="h-36 -ml-2" style={{ contain: "layout paint" }}>
          {energyChart.width > 0 && (
            <LineChart
              width={energyChart.width}
              height={144}
              data={client.progress}
            >
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: "#8A8F7E" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide domain={[0, 10]} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #EDF1E6",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="energy"
                stroke="#D9A06B"
                strokeWidth={2.5}
                dot={{ fill: "#D9A06B", r: 3 }}
                isAnimationActive={false}
              />
            </LineChart>
          )}
        </div>
      </Card>
    </div>
  );
}