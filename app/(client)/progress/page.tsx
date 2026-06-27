"use client";

import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";

export default function ClientProgressPage() {
  const activeClientId = useAppStore((s) => s.activeClientId);
  const client = useAppStore((s) => s.clients.find((c) => c.id === activeClientId));

  if (!client) return null;

  const first = client.progress[0];
  const last = client.progress[client.progress.length - 1];
  const weightChange = (last.weight - first.weight).toFixed(1);
  const bloatingImproved = last.bloating < first.bloating;

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
        <div className="h-44 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={client.progress}>
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
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <p className="text-sm font-medium text-moss-600 mb-3">Energy levels</p>
        <div className="h-36 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={client.progress}>
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
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
