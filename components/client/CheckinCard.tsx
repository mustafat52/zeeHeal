"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Client } from "@/lib/mock-data/clients";
import { DailyCheckinModal } from "./DailyCheckinModal";
import { AnimatePresence } from "framer-motion";
import { ClipboardList, Check, ChevronRight } from "lucide-react";

type Accent = "amber" | "rose" | "violet" | "teal";

const ACCENT_STYLES: Record<Accent, { doneBg: string; doneIcon: string }> = {
  amber: { doneBg: "bg-amber-100", doneIcon: "text-amber-600" },
  rose: { doneBg: "bg-rose-100", doneIcon: "text-rose-600" },
  violet: { doneBg: "bg-violet-100", doneIcon: "text-violet-600" },
  teal: { doneBg: "bg-teal-100", doneIcon: "text-teal-600" },
};

export function CheckinCard({ client, accent }: { client: Client; accent?: Accent }) {
  const logCheckin = useAppStore((s) => s.logCheckin);
  const [open, setOpen] = useState(false);
  const done = !!client.todayCheckin;
  const style = accent ? ACCENT_STYLES[accent] : { doneBg: "bg-sage-100", doneIcon: "text-sage-600" };

  const summaryParts = [
    client.todayCheckin?.weight !== undefined && `${client.todayCheckin.weight}kg`,
    client.todayCheckin?.sleepHours !== undefined && `${client.todayCheckin.sleepHours}h sleep`,
    client.todayCheckin?.bloating !== undefined && `bloating ${client.todayCheckin.bloating}/10`,
    client.todayCheckin?.skinCondition !== undefined && `skin ${client.todayCheckin.skinCondition}/10`,
  ].filter(Boolean).slice(0, 3).join(" · ");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`tap-scale w-full flex items-center gap-3 rounded-xl p-3.5 ${done ? "bg-white border border-sage-100/60 shadow-card" : "bg-clay-100"}`}
      >
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${done ? style.doneBg : "bg-white"}`}>
          {done
            ? <Check size={15} className={style.doneIcon} />
            : <ClipboardList size={15} className="text-clay-600" />
          }
        </div>
        <div className="flex-1 text-left">
          <p className={`text-sm font-medium ${done ? "text-moss-900" : "text-clay-600"}`}>
            {done ? "Today's check-in done" : "Do your daily check-in"}
          </p>
          <p className={`text-xs ${done ? "text-moss-400" : "text-clay-600/70"}`}>
            {done ? summaryParts : "Weight, sleep, mood, activity — under a minute"}
          </p>
        </div>
        <ChevronRight size={16} className={done ? "text-moss-400" : "text-clay-600"} />
      </button>

      <AnimatePresence>
        {open && (
          <DailyCheckinModal
            config={client.checkinConfig}
            onClose={() => setOpen(false)}
            onSave={(data) => {
              logCheckin(client.id, data);
              setOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}