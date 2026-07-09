"use client";

import { motion } from "framer-motion";
import { Client } from "@/lib/mock-data/clients";
import { PlanTemplate } from "@/lib/mock-data/plans";
import { X, ChevronRight } from "lucide-react";

export function AssignPlanModal({
  template,
  clients,
  onClose,
  onAssign,
}: {
  template: PlanTemplate;
  clients: Client[];
  onClose: () => void;
  onAssign: (clientId: string) => void;
}) {
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
        className="w-full max-w-md bg-ivory rounded-t-[28px] px-5 pt-5 pb-[calc(env(safe-area-inset-bottom)+24px)] max-h-[80vh] overflow-y-auto no-scrollbar"
      >
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-moss-400">Assign</p>
          <button onClick={onClose} className="tap-scale w-8 h-8 rounded-full bg-white flex items-center justify-center" aria-label="Close">
            <X size={16} className="text-moss-600" />
          </button>
        </div>
        <h2 className="font-display text-xl text-moss-900 mb-1">{template.name}</h2>
        <p className="text-xs text-moss-400 mb-5">
          Pick a client — this copies the plan for them to edit. It won't stay linked to this template.
        </p>

        <div className="flex flex-col gap-2">
          {clients.map((client) => (
            <button
              key={client.id}
              onClick={() => onAssign(client.id)}
              className="tap-scale w-full flex items-center gap-3 bg-white border border-sage-100/60 rounded-xl p-3"
            >
              <div className="w-9 h-9 rounded-full bg-sage-100 flex items-center justify-center font-medium text-sage-800 text-sm shrink-0">
                {client.initials}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-moss-900">{client.name}</p>
                <p className="text-xs text-moss-400 truncate">
                  {client.weeklyPlan?.templateId === template.id
                    ? "Already on this plan — reassigning will overwrite their edits"
                    : client.weeklyPlan
                    ? `Currently on: ${client.weeklyPlan.templateName ?? "a custom plan"}`
                    : "No plan assigned yet"}
                </p>
              </div>
              <ChevronRight size={16} className="text-moss-400 shrink-0" />
            </button>
          ))}
          {clients.length === 0 && (
            <p className="text-sm text-moss-400 text-center py-6">No clients yet.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}