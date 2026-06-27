"use client";

import { planTemplates } from "@/lib/mock-data/plans";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { Plus, Users } from "lucide-react";

export default function PlanBuilderPage() {
  return (
    <div className="pt-12 px-5">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl text-moss-900">Plan templates</h1>
      </div>
      <p className="text-sm text-moss-400 mb-5">Reuse a template or build a new one for a client</p>

      <Button variant="primary" className="w-full mb-5">
        <Plus size={16} /> New plan template
      </Button>

      <div className="flex flex-col gap-3">
        {planTemplates.map((plan) => (
          <Card key={plan.id}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="font-medium text-moss-900 text-sm">{plan.name}</p>
              <Pill tone="neutral">{plan.tag}</Pill>
            </div>
            <p className="text-xs text-moss-400 leading-relaxed mb-3">{plan.description}</p>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs text-moss-400">
                <Users size={12} /> Used by {plan.usedBy} clients
              </span>
              <button className="tap-scale text-xs font-medium text-sage-600">
                Assign to client
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
