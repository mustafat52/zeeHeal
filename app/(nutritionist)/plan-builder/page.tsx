"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { PlanTemplate } from "@/lib/mock-data/plans";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { AssignPlanModal } from "@/components/nutritionist/AssignPlanModal";
import { AnimatePresence } from "framer-motion";
import { Plus, Users, ChevronDown, ChevronRight, Pencil } from "lucide-react";

export default function PlanBuilderPage() {
  const router = useRouter();
  const clients = useAppStore((s) => s.clients);
  const planTemplates = useAppStore((s) => s.planTemplates);
  const assignPlanToClient = useAppStore((s) => s.assignPlanToClient);
  const activeClients = clients.filter((c) => !c.archived);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [assigningTemplate, setAssigningTemplate] = useState<PlanTemplate | null>(null);

  function handleAssign(clientId: string) {
    if (!assigningTemplate) return;
    assignPlanToClient(clientId, assigningTemplate);
    setAssigningTemplate(null);
    router.push(`/client/${clientId}/plan-editor`);
  }

  return (
    <div className="pt-12 px-5">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl text-moss-900">Plan templates</h1>
      </div>
      <p className="text-sm text-moss-400 mb-5">Reuse a template or build a new one for a client</p>

      <Button variant="primary" className="w-full mb-5" onClick={() => router.push("/plan-builder/new")}>
        <Plus size={16} /> New plan template
      </Button>

      <div className="flex flex-col gap-3">
        {planTemplates.map((plan) => {
          const usedByClients = activeClients.filter((c) => c.weeklyPlan?.templateId === plan.id);
          const isExpanded = expandedId === plan.id;

          return (
            <Card key={plan.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-moss-900 text-sm">{plan.name}</p>
                  <button
                    onClick={() => router.push(`/plan-builder/${plan.id}`)}
                    className="tap-scale w-6 h-6 rounded-full bg-moss-900/5 flex items-center justify-center shrink-0"
                    aria-label={`Edit ${plan.name}`}
                  >
                    <Pencil size={11} className="text-moss-500" />
                  </button>
                </div>
                <Pill tone="neutral">{plan.tag}</Pill>
              </div>
              <p className="text-xs text-moss-400 leading-relaxed mb-3">{plan.description}</p>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : plan.id)}
                  disabled={usedByClients.length === 0}
                  className="tap-scale flex items-center gap-1 text-xs text-moss-400"
                >
                  <Users size={12} /> Used by {usedByClients.length} client{usedByClients.length === 1 ? "" : "s"}
                  {usedByClients.length > 0 && (
                    <ChevronDown size={12} className={isExpanded ? "rotate-180 transition-transform" : "transition-transform"} />
                  )}
                </button>
                <button
                  onClick={() => setAssigningTemplate(plan)}
                  className="tap-scale text-xs font-medium text-sage-600"
                >
                  Assign to client
                </button>
              </div>

              {isExpanded && usedByClients.length > 0 && (
                <div className="mt-3 pt-3 border-t border-sage-100 flex flex-col gap-1.5">
                  {usedByClients.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => router.push(`/client/${c.id}`)}
                      className="tap-scale flex items-center justify-between text-left"
                    >
                      <span className="text-xs text-moss-700">{c.name}</span>
                      <ChevronRight size={13} className="text-moss-400" />
                    </button>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <AnimatePresence>
        {assigningTemplate && (
          <AssignPlanModal
            template={assigningTemplate}
            clients={activeClients}
            onClose={() => setAssigningTemplate(null)}
            onAssign={handleAssign}
          />
        )}
      </AnimatePresence>
    </div>
  );
}