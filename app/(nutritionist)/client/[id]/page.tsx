"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { PrepSheetModal } from "@/components/nutritionist/PrepSheetModal";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { AnimatePresence } from "framer-motion";
import { ChevronLeft, MessageCircle, ClipboardList } from "lucide-react";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const client = useAppStore((s) => s.clients.find((c) => c.id === clientId));
  const [showPrepSheet, setShowPrepSheet] = useState(false);

  if (!client) return null;

  const doneToday = client.todayPlan.meals.filter((m) => m.status === "done").length;

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
        </div>
      </div>

      <button
        onClick={() => setShowPrepSheet(true)}
        className="tap-scale w-full flex items-center gap-3 bg-clay-100 rounded-xl p-3.5 mb-5"
      >
        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
          <ClipboardList size={16} className="text-clay-600" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-clay-600">Prep for your call</p>
          <p className="text-xs text-clay-600/70">One-page summary before you talk</p>
        </div>
      </button>

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

      <Button variant="primary" className="w-full" onClick={() => router.push(`/client/${client.id}/chat`)}>
        <MessageCircle size={16} /> Message {client.name.split(" ")[0]}
      </Button>

      <AnimatePresence>
        {showPrepSheet && (
          <PrepSheetModal client={client} onClose={() => setShowPrepSheet(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
