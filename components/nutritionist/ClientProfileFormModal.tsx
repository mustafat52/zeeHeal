"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Client, CHECKIN_FIELDS, CheckinConfig, CheckinFieldKey } from "@/lib/mock-data/clients";
import clsx from "clsx";

const presets: { label: string; keys: CheckinFieldKey[] }[] = [
  {
    label: "Gut health",
    keys: ["weight", "sleepHours", "mood", "bloating", "activity", "waterGlasses"],
  },
  {
    label: "PCOS / hormone",
    keys: ["weight", "sleepHours", "mood", "bloating", "activity", "skinCondition", "hairFall", "cycleDay"],
  },
  {
    label: "Weight loss",
    keys: ["weight", "sleepHours", "mood", "activity", "waterGlasses"],
  },
  {
    label: "Skin focus",
    keys: ["sleepHours", "mood", "skinCondition", "waterGlasses"],
  },
];

export function ClientProfileFormModal({
  client,
  onClose,
  onSave,
}: {
  client: Client;
  onClose: () => void;
  onSave: (config: CheckinConfig) => void;
}) {
  const [config, setConfig] = useState<CheckinConfig>(client.checkinConfig ?? {});

  function toggle(key: CheckinFieldKey) {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function applyPreset(keys: CheckinFieldKey[]) {
    const next: CheckinConfig = {};
    for (const key of keys) next[key] = true;
    setConfig(next);
  }

  const selectedCount = Object.values(config).filter(Boolean).length;

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
          <p className="text-xs font-medium text-moss-400">Daily check-in setup for</p>
          <button onClick={onClose} className="tap-scale w-8 h-8 rounded-full bg-white flex items-center justify-center" aria-label="Close">
            <X size={16} className="text-moss-600" />
          </button>
        </div>
        <h2 className="font-display text-xl text-moss-900 mb-4">{client.name}</h2>

        <p className="text-xs font-medium text-moss-600 mb-2">Quick presets</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset.keys)}
              className="tap-scale px-3 py-1.5 rounded-full text-xs font-medium border border-sage-100 bg-white text-moss-600"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <p className="text-xs font-medium text-moss-600 mb-2">
          What should {client.name.split(" ")[0]} log every day?
        </p>
        <div className="flex flex-col gap-2 mb-5">
          {CHECKIN_FIELDS.map((field) => {
            const active = !!config[field.key];
            return (
              <button
                key={field.key}
                onClick={() => toggle(field.key)}
                className={clsx(
                  "tap-scale w-full flex items-center gap-3 rounded-xl border p-3 text-left",
                  active ? "bg-sage-50 border-sage-200" : "bg-white border-sage-100/60"
                )}
              >
                <div
                  className={clsx(
                    "w-5 h-5 rounded-md flex items-center justify-center shrink-0 border",
                    active ? "bg-sage-600 border-sage-600" : "border-sage-200"
                  )}
                >
                  {active && <Check size={12} className="text-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-moss-900">{field.label}</p>
                  <p className="text-xs text-moss-400">{field.hint}</p>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-moss-400 text-center mb-4">
          {selectedCount} field{selectedCount === 1 ? "" : "s"} selected · this also shapes future reminders for{" "}
          {client.name.split(" ")[0]}
        </p>

        <Button variant="primary" className="w-full py-3.5" onClick={() => onSave(config)}>
          <Check size={16} /> Save check-in setup
        </Button>
      </motion.div>
    </div>
  );
}