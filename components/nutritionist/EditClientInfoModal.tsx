"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Client, ConditionType } from "@/lib/mock-data/clients";
import { MEAL_SLOTS, MealConfig, MealSlotKey } from "@/lib/mealConfig";
import { X, Save, Archive, ArchiveRestore, Trash2, AlertTriangle } from "lucide-react";
import clsx from "clsx";

const conditionOptions: { key: ConditionType; label: string }[] = [
  { key: "weight-loss", label: "Weight loss" },
  { key: "pcos", label: "PCOS" },
  { key: "hormonal", label: "Hormonal" },
  { key: "skincare", label: "Skincare" },
];

const durationPresets = [1, 3, 6, 12];

function initialsFromName(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function EditClientInfoModal({
  client,
  onClose,
  onSave,
  onArchive,
  onUnarchive,
  onDelete,
}: {
  client: Client;
  onClose: () => void;
  onSave: (updates: Partial<Client>) => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone);
  const [condition, setCondition] = useState<ConditionType>(client.condition);
  const [planType, setPlanType] = useState(client.planType);
  const [goalWeight, setGoalWeight] = useState<number | null>(client.goalWeight ?? null);
  const [programDurationMonths, setProgramDurationMonths] = useState<number | null>(
    client.programDurationMonths ?? null
  );
  // Defaults to Breakfast/Lunch/Dinner on if this client has no config
  // saved yet — mirrors the same "empty means show the classic 3"
  // default used at creation time in NewClientFormModal.
  const [mealConfig, setMealConfig] = useState<MealConfig>(
    client.mealConfig && Object.keys(client.mealConfig).length > 0
      ? client.mealConfig
      : { earlyMorning: false, breakfast: true, midMorning: false, lunch: true, evening: false, dinner: true }
  );
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const canSave = name.trim().length > 0 && phone.trim().length > 0;
  const conditionChanged = condition !== client.condition;
  const phoneChanged = phone.trim() !== client.phone;

  function toggleMealSlot(key: MealSlotKey) {
    setMealConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSave() {
    if (!canSave) return;
    onSave({
      name: name.trim(),
      initials: initialsFromName(name) || client.initials,
      phone: phone.trim(),
      condition,
      planType: planType.trim() || client.planType,
      goalWeight: condition === "weight-loss" ? goalWeight ?? undefined : client.goalWeight,
      programDurationMonths: programDurationMonths ?? undefined,
      mealConfig,
    });
  }

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-moss-900">Edit client info</h2>
          <button onClick={onClose} className="tap-scale w-8 h-8 rounded-full bg-white flex items-center justify-center" aria-label="Close">
            <X size={16} className="text-moss-600" />
          </button>
        </div>

        <p className="text-xs font-medium text-moss-600 mb-2">Client details</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="w-full bg-white border border-sage-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-sage-400 mb-2.5"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          type="tel"
          className="w-full bg-white border border-sage-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-sage-400 mb-2.5"
        />
        {phoneChanged && (
          <p className="text-[11px] text-clay-600 mb-4">
            Changing this only updates their displayed number — their login is tied to the phone number used when their account was created and won&apos;t change. Changing it here will make their existing passcode stop matching what&apos;s shown for them.
          </p>
        )}
        {!phoneChanged && <div className="mb-2.5" />}

        <p className="text-xs font-medium text-moss-600 mb-2">Condition</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {conditionOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setCondition(opt.key)}
              className={clsx(
                "tap-scale px-3 py-1.5 rounded-full text-xs font-medium border",
                condition === opt.key
                  ? "bg-sage-600 text-white border-sage-600"
                  : "bg-white text-moss-600 border-sage-100"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {conditionChanged && (
          <p className="text-[11px] text-clay-600 mb-4">
            Changing condition switches which home screen, plan style, and progress view this client sees on their side. Check-in fields under &quot;Check-in setup&quot; may need reviewing too — they don&apos;t change automatically.
          </p>
        )}

        <p className="text-xs font-medium text-moss-600 mb-2 mt-1">Plan name</p>
        <input
          value={planType}
          onChange={(e) => setPlanType(e.target.value)}
          placeholder="Plan name"
          className="w-full bg-white border border-sage-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-sage-400 mb-5"
        />

        {condition === "weight-loss" && (
          <>
            <p className="text-xs font-medium text-moss-600 mb-2">Goal weight (kg)</p>
            <input
              type="number"
              value={goalWeight ?? ""}
              onChange={(e) => setGoalWeight(e.target.value === "" ? null : Number(e.target.value))}
              placeholder="e.g. 65"
              className="w-full bg-white border border-sage-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-sage-400 mb-5"
            />
          </>
        )}

        <p className="text-xs font-medium text-moss-600 mb-1.5">Which meals do they log?</p>
        <p className="text-[11px] text-moss-400 mb-2.5">
          Changing this reshapes their weekly plan editor immediately — newly enabled slots show up blank, ready to fill in; disabled slots are removed from the editor (their content isn&apos;t lost from today&apos;s already-generated meals, just from future days).
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {MEAL_SLOTS.map((slot) => {
            const active = !!mealConfig[slot.key];
            return (
              <button
                key={slot.key}
                onClick={() => toggleMealSlot(slot.key)}
                className={clsx(
                  "tap-scale px-3 py-1.5 rounded-full text-xs font-medium border",
                  active
                    ? "bg-sage-600 text-white border-sage-600"
                    : "bg-white text-moss-600 border-sage-100"
                )}
              >
                {slot.label}
              </button>
            );
          })}
        </div>

        <p className="text-xs font-medium text-moss-600 mb-2">Program length</p>
        <div className="flex flex-wrap gap-2 mb-2.5">
          {durationPresets.map((m) => (
            <button
              key={m}
              onClick={() => setProgramDurationMonths(m)}
              className={clsx(
                "tap-scale px-3 py-1.5 rounded-full text-xs font-medium border",
                programDurationMonths === m
                  ? "bg-sage-600 text-white border-sage-600"
                  : "bg-white text-moss-600 border-sage-100"
              )}
            >
              {m} month{m > 1 ? "s" : ""}
            </button>
          ))}
        </div>
        <input
          type="number"
          min={1}
          value={programDurationMonths ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            setProgramDurationMonths(v === "" ? null : Math.max(1, Number(v)));
          }}
          placeholder="Or enter a custom number of months"
          className="w-full bg-white border border-sage-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-sage-400 mb-6"
        />

        <button
          onClick={handleSave}
          disabled={!canSave}
          className={clsx(
            "tap-scale w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-medium",
            canSave ? "bg-sage-600 text-white" : "bg-moss-900/10 text-moss-400"
          )}
        >
          <Save size={16} /> Save changes
        </button>
        {!canSave && (
          <p className="text-[11px] text-moss-400 text-center mt-2">Name and phone number are required</p>
        )}

        <div className="mt-8 pt-5 border-t border-sage-100">
          <p className="text-xs font-medium text-clay-600 mb-3">Danger zone</p>

          {client.archived ? (
            <button
              onClick={onUnarchive}
              className="tap-scale w-full flex items-center justify-center gap-2 bg-sage-100 text-sage-800 rounded-xl py-3 text-sm font-medium mb-2.5"
            >
              <ArchiveRestore size={15} /> Restore from archive
            </button>
          ) : (
            <button
              onClick={onArchive}
              className="tap-scale w-full flex items-center justify-center gap-2 bg-moss-900/5 text-moss-700 rounded-xl py-3 text-sm font-medium mb-2.5"
            >
              <Archive size={15} /> Archive client
            </button>
          )}
          <p className="text-[11px] text-moss-400 mb-4">
            Archiving hides {client.name.split(" ")[0]} from the main client list — their history, notes, and plan data stay intact and can be restored anytime.
          </p>

          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="tap-scale w-full flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 rounded-xl py-3 text-sm font-medium"
            >
              <Trash2 size={15} /> Delete client permanently
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-2 mb-3">
                <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">
                  This permanently deletes {client.name} — all check-ins, notes, plan history, and reasoning. This cannot be undone. Archiving is reversible; this is not.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmingDelete(false)}
                  className="tap-scale flex-1 bg-white border border-sage-100 text-moss-600 rounded-xl py-2.5 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={onDelete}
                  className="tap-scale flex-1 bg-red-600 text-white rounded-xl py-2.5 text-xs font-medium"
                >
                  Yes, delete permanently
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}