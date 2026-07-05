"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { PrepSheetModal } from "@/components/nutritionist/PrepSheetModal";
import { ClientProfileFormModal } from "@/components/nutritionist/ClientProfileFormModal";
import { CycleReportModal } from "@/components/nutritionist/CycleReportModal";
import { PlanHistoryModal } from "@/components/nutritionist/PlanHistoryModal";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { AnimatePresence } from "framer-motion";
import { ChevronLeft, MessageCircle, ClipboardList, Settings2, Phone, FileText, History } from "lucide-react";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const client = useAppStore((s) => s.clients.find((c) => c.id === clientId));
  const setCheckinConfig = useAppStore((s) => s.setCheckinConfig);
  const renewPlanCycle = useAppStore((s) => s.renewPlanCycle);
  const [showPrepSheet, setShowPrepSheet] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showCycleReport, setShowCycleReport] = useState(false);
  const [showPlanHistory, setShowPlanHistory] = useState(false);

  if (!client) return null;

  const doneToday = client.todayPlan.meals.filter((m) => m.status === "done").length;
  const configuredCount = Object.values(client.checkinConfig ?? {}).filter(Boolean).length;
  const daysLeft = client.planCycle.totalDays - client.planCycle.currentDay;
  const cycleNearEnd = daysLeft <= 3;

  return (
    <div className="pt-12 px-5">
      <button onClick={() => router.back()} className="tap-scale flex items-center gap-1 text-moss-600 text-sm mb-4">
        <ChevronLeft size={16} /> Back
      </button>

      <div className="flex items-center gap-3 mb-5">
        <div className="w-14 h-14 rounded-full bg-sage-100 flex items-center justify-center font-medium text-lg text-sage-800">
          {client.initials}
        </div>
        <div>
          <h1 className="font-display text-xl text-moss-900">{client.name}</h1>
          <Pill tone="sage">{client.planType}</Pill>
          <p className="text-xs text-moss-400 mt-1">{client.phone}</p>
        </div>
      </div>

      <button
        onClick={() => setShowCycleReport(true)}
        className={`tap-scale w-full flex items-center gap-3 rounded-xl p-3.5 mb-2.5 ${
          cycleNearEnd ? "bg-clay-600" : "bg-white border border-sage-100/60 shadow-card"
        }`}
      >
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
            cycleNearEnd ? "bg-white/20" : "bg-clay-100"
          }`}
        >
          <FileText size={16} className={cycleNearEnd ? "text-white" : "text-clay-600"} />
        </div>
        <div className="text-left flex-1">
          <p className={`text-sm font-medium ${cycleNearEnd ? "text-white" : "text-moss-900"}`}>
            Cycle {client.planCycle.cycleNumber} review
          </p>
          <p className={`text-xs ${cycleNearEnd ? "text-white/80" : "text-moss-400"}`}>
            {cycleNearEnd
              ? `Day ${client.planCycle.currentDay} of 15 · review due`
              : `Day ${client.planCycle.currentDay} of 15`}
          </p>
        </div>
      </button>

      {client.cycleHistory && client.cycleHistory.length > 0 && (
        <button
          onClick={() => setShowPlanHistory(true)}
          className="tap-scale flex items-center gap-1.5 text-xs text-moss-600 mb-5"
        >
          <History size={13} />
          View past cycles ({client.cycleHistory.length})
        </button>
      )}

      <div className="flex gap-2.5 mb-5">
        <button
          onClick={() => setShowPrepSheet(true)}
          className="tap-scale flex-1 flex items-center gap-3 bg-clay-100 rounded-xl p-3.5"
        >
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
            <ClipboardList size={16} className="text-clay-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-clay-600">Prep for call</p>
            <p className="text-xs text-clay-600/70">Quick summary</p>
          </div>
        </button>

        <button
          onClick={() => setShowProfileForm(true)}
          className="tap-scale flex-1 flex items-center gap-3 bg-sage-100 rounded-xl p-3.5"
        >
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
            <Settings2 size={16} className="text-sage-700" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-sage-800">Check-in setup</p>
            <p className="text-xs text-sage-700/70">{configuredCount} fields on</p>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Card>
          <p className="text-xs text-moss-400">Streak</p>
          <p className="font-display text-xl text-moss-900 mt-0.5">{client.streak} days</p>
        </Card>
        <Card>
          <p className="text-xs text-moss-400">Today&apos;s logging</p>
          <p className="font-display text-xl text-moss-900 mt-0.5">
            {doneToday}/{client.todayPlan.meals.length} meals
          </p>
        </Card>
      </div>

      {client.todayCheckin && (
        <Card className="mb-5">
          <p className="text-sm font-medium text-moss-600 mb-3">Today&apos;s check-in</p>
          <div className="grid grid-cols-2 gap-3">
            {client.todayCheckin.weight !== undefined && (
              <div>
                <p className="text-xs text-moss-400">Weight</p>
                <p className="text-sm font-medium text-moss-900">{client.todayCheckin.weight} kg</p>
              </div>
            )}
            {client.todayCheckin.sleepHours !== undefined && (
              <div>
                <p className="text-xs text-moss-400">Sleep</p>
                <p className="text-sm font-medium text-moss-900">{client.todayCheckin.sleepHours} hrs</p>
              </div>
            )}
            {client.todayCheckin.bloating !== undefined && (
              <div>
                <p className="text-xs text-moss-400">Bloating</p>
                <p className="text-sm font-medium text-moss-900">{client.todayCheckin.bloating}/10</p>
              </div>
            )}
            {client.todayCheckin.skinCondition !== undefined && (
              <div>
                <p className="text-xs text-moss-400">Skin condition</p>
                <p className="text-sm font-medium text-moss-900">{client.todayCheckin.skinCondition}/10</p>
              </div>
            )}
            {client.todayCheckin.hairFall !== undefined && (
              <div>
                <p className="text-xs text-moss-400">Hair fall</p>
                <p className="text-sm font-medium text-moss-900">{client.todayCheckin.hairFall}/10</p>
              </div>
            )}
            {client.todayCheckin.cycleDay !== undefined && (
              <div>
                <p className="text-xs text-moss-400">Cycle day</p>
                <p className="text-sm font-medium text-moss-900">Day {client.todayCheckin.cycleDay}</p>
              </div>
            )}
            {client.todayCheckin.activityType && client.todayCheckin.activityType !== "None" && (
              <div>
                <p className="text-xs text-moss-400">Activity</p>
                <p className="text-sm font-medium text-moss-900">
                  {client.todayCheckin.activityType} · {client.todayCheckin.activityMinutes}min
                </p>
              </div>
            )}
          </div>
          {client.todayCheckin.note && (
            <p className="text-xs text-moss-600 mt-3 pt-3 border-t border-sage-100 italic">
              &quot;{client.todayCheckin.note}&quot;
            </p>
          )}
        </Card>
      )}

      <Card className="mb-5">
        <p className="text-sm font-medium text-moss-600 mb-3">Weight trend</p>
        <div className="h-40 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={client.progress}>
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#8A8F7E" }} axisLine={false} tickLine={false} />
              <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #EDF1E6", fontSize: 12 }} />
              <Line type="monotone" dataKey="weight" stroke="#7C9473" strokeWidth={2.5} dot={{ fill: "#7C9473", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <h2 className="text-sm font-medium text-moss-600 mb-3">Session notes</h2>
      <div className="flex flex-col gap-2.5 mb-6">
        {client.notes.map((note, i) => (
          <Card key={i}>
            <p className="text-xs text-moss-400 mb-1">{note.date}</p>
            <p className="text-sm text-moss-900">{note.text}</p>
          </Card>
        ))}
      </div>

      <div className="flex gap-2.5">
        <Button variant="primary" className="flex-1" onClick={() => router.push(`/client/${client.id}/chat`)}>
          <MessageCircle size={16} /> Message
        </Button>
        <a
          href={`tel:${client.phone.replace(/\s/g, "")}`}
          className="tap-scale flex-1 flex items-center justify-center gap-2 bg-sage-100 text-sage-800 rounded-xl py-3 text-sm font-medium"
        >
          <Phone size={16} /> Call
        </a>
      </div>

      <AnimatePresence>
        {showPrepSheet && (
          <PrepSheetModal client={client} onClose={() => setShowPrepSheet(false)} />
        )}
        {showProfileForm && (
          <ClientProfileFormModal
            client={client}
            onClose={() => setShowProfileForm(false)}
            onSave={(config) => {
              setCheckinConfig(client.id, config);
              setShowProfileForm(false);
            }}
          />
        )}
        {showCycleReport && (
          <CycleReportModal
            client={client}
            onClose={() => setShowCycleReport(false)}
            onRenew={() => {
              renewPlanCycle(client.id);
              setShowCycleReport(false);
            }}
          />
        )}
        {showPlanHistory && (
          <PlanHistoryModal client={client} onClose={() => setShowPlanHistory(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}