"use client";

import { Client } from "@/lib/mock-data/clients";
import { Calendar } from "lucide-react";

export function PatientProfileCard({ client }: { client: Client }) {
  const hasProgramLength = client.programDurationMonths !== undefined;
  const cyclesCompleted = client.planCycle.cycleNumber - 1;

  const totalProgramDays = hasProgramLength ? client.programDurationMonths! * 30 : null;
  const elapsedDays = cyclesCompleted * 15 + client.planCycle.currentDay;
  const programPct = totalProgramDays ? Math.min(100, Math.round((elapsedDays / totalProgramDays) * 100)) : null;
  const totalCyclesInProgram = totalProgramDays ? Math.ceil(totalProgramDays / 15) : null;

  return (
    <div className="bg-white rounded-xl border border-sage-100/60 p-3.5 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={14} className="text-moss-600" />
        <p className="text-xs font-medium text-moss-600">Patient profile</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[10px] text-moss-400">Started</p>
          <p className="text-sm font-medium text-moss-900">{client.startDate}</p>
        </div>
        <div>
          <p className="text-[10px] text-moss-400">Program length</p>
          <p className="text-sm font-medium text-moss-900">
            {hasProgramLength
              ? `${client.programDurationMonths} month${client.programDurationMonths! > 1 ? "s" : ""}`
              : "Not set"}
          </p>
        </div>
      </div>

      {hasProgramLength ? (
        <>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-moss-600">
              Cycle {client.planCycle.cycleNumber} of ~{totalCyclesInProgram}
            </span>
            <span className="text-[11px] text-moss-400">{programPct}% of program</span>
          </div>
          <div className="h-1.5 bg-moss-900/10 rounded-full overflow-hidden">
            <div className="h-full bg-sage-600 rounded-full transition-all duration-500" style={{ width: `${programPct}%` }} />
          </div>
          <p className="text-[10px] text-moss-400 mt-1">
            ~{elapsedDays} of ~{totalProgramDays} days · {cyclesCompleted} full cycle{cyclesCompleted === 1 ? "" : "s"} completed
          </p>
        </>
      ) : (
        <p className="text-[11px] text-moss-400">
          Cycle {client.planCycle.cycleNumber} · {cyclesCompleted} full cycle{cyclesCompleted === 1 ? "" : "s"} completed · program length not set for this client yet
        </p>
      )}
    </div>
  );
}