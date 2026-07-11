"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, UserPlus, Copy, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Client, ConditionType, CHECKIN_FIELDS, CheckinConfig, CheckinFieldKey } from "@/lib/mock-data/clients";
import { createClientAccount } from "@/app/actions/clients";
import { mapDbClientToStoreClient } from "@/lib/mapDbClient";
import clsx from "clsx";

const presets: { label: string; planType: string; condition: ConditionType; keys: CheckinFieldKey[] }[] = [
  {
    label: "Gut health",
    planType: "Gut health reset",
    condition: "weight-loss", // no dedicated "gut" condition exists yet — closest fit
    keys: ["weight", "sleepHours", "mood", "bloating", "activity", "waterGlasses"],
  },
  {
    label: "PCOS / hormone",
    planType: "PCOS / hormone balance",
    condition: "pcos",
    keys: ["weight", "sleepHours", "mood", "bloating", "activity", "skinCondition", "hairFall", "cycleDay"],
  },
  {
    label: "Weight loss",
    planType: "Weight loss",
    condition: "weight-loss",
    keys: ["weight", "sleepHours", "mood", "activity", "waterGlasses"],
  },
  {
    label: "Skin focus",
    planType: "Skin and gut reset",
    condition: "skincare",
    keys: ["sleepHours", "mood", "skinCondition", "waterGlasses"],
  },
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

export function NewClientFormModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (client: Client) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [planType, setPlanType] = useState("");
  const [condition, setCondition] = useState<ConditionType>("weight-loss");
  const [config, setConfig] = useState<CheckinConfig>({});
  const [programDurationMonths, setProgramDurationMonths] = useState<number | null>(null);
  const [customPasscode, setCustomPasscode] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [created, setCreated] = useState<{ passcode: string; client: Client } | null>(null);
  const [copied, setCopied] = useState(false);

  function toggle(key: CheckinFieldKey) {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function applyPreset(preset: { planType: string; condition: ConditionType; keys: CheckinFieldKey[] }) {
    setPlanType(preset.planType);
    setCondition(preset.condition);
    const next: CheckinConfig = {};
    for (const key of preset.keys) next[key] = true;
    setConfig(next);
  }

  const passcodeValid = customPasscode.length === 0 || customPasscode.length >= 4;
  const canSave = name.trim().length > 0 && phone.trim().length > 0 && passcodeValid;

  async function handleSave() {
    if (!canSave || saving) return;
    setSaving(true);
    setErrorMsg(null);

    const result = await createClientAccount({
      name: name.trim(),
      initials: initialsFromName(name) || "??",
      phone: phone.trim(),
      condition,
      planType: planType.trim() || "General nutrition",
      programDurationMonths,
      checkinConfig: config,
      customPasscode: customPasscode.trim() || undefined,
    });

    setSaving(false);

    if (!result.success) {
      setErrorMsg(result.error);
      return;
    }

    const mappedClient = mapDbClientToStoreClient(result.client);
    setCreated({ passcode: result.passcode, client: mappedClient });
  }

  function handleCopyPasscode() {
    if (!created) return;
    navigator.clipboard.writeText(created.passcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDone() {
    if (!created) return;
    onSave(created.client);
    onClose();
  }

  return (
    <div
      style={{ minHeight: "100vh" }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-moss-900/40"
      onClick={created ? undefined : onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-ivory rounded-t-[28px] px-5 pt-5 pb-[calc(env(safe-area-inset-bottom)+24px)] max-h-[88vh] overflow-y-auto no-scrollbar"
      >
        {created ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-moss-900">Account created</h2>
            </div>

            <div className="bg-sage-50 border border-sage-200 rounded-2xl p-5 mb-4 text-center">
              <p className="text-sm text-moss-600 mb-1">{created.client.name}</p>
              <p className="text-xs text-moss-400 mb-4">{created.client.phone}</p>

              <p className="text-[11px] font-medium text-moss-600 mb-1.5 uppercase tracking-wide">Passcode</p>
              <p className="font-display text-4xl text-sage-800 tracking-[0.3em] mb-3">{created.passcode}</p>

              <button
                onClick={handleCopyPasscode}
                className="tap-scale inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-sage-200 text-moss-600"
              >
                {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy passcode"}
              </button>
            </div>

            <p className="text-[11px] text-moss-400 text-center mb-5 leading-relaxed">
              Share this with {created.client.name.split(" ")[0]} yourself — over WhatsApp, SMS, or in person.
              <br />
              <span className="font-medium text-clay-600">
                This is the only time you'll see this passcode — it can't be recovered later.
              </span>
            </p>

            <Button variant="primary" className="w-full py-3.5" onClick={handleDone}>
              Done
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-moss-900">New client</h2>
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
              placeholder="Phone number, e.g. +91 98765 43210"
              type="tel"
              className="w-full bg-white border border-sage-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-sage-400 mb-2.5"
            />
            <p className="text-[11px] text-moss-400 mb-5">
              This becomes their login. A passcode is generated automatically once you save — you'll share it with them yourself.
            </p>

            <p className="text-xs font-medium text-moss-600 mb-2">Passcode</p>
            <input
              value={customPasscode}
              onChange={(e) => setCustomPasscode(e.target.value.replace(/\D/g, ""))}
              placeholder="Leave blank to auto-generate"
              inputMode="numeric"
              maxLength={6}
              className="w-full bg-white border border-sage-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-sage-400 mb-2.5"
            />
            <p className="text-[11px] text-moss-400 mb-5">
              At least 4 digits, if set. Otherwise one is generated automatically.
            </p>

            <p className="text-xs font-medium text-moss-600 mb-2">What are you treating?</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className={clsx(
                    "tap-scale px-3 py-1.5 rounded-full text-xs font-medium border",
                    planType === preset.planType
                      ? "bg-sage-600 text-white border-sage-600"
                      : "bg-white text-moss-600 border-sage-100"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <input
              value={planType}
              onChange={(e) => setPlanType(e.target.value)}
              placeholder="Plan name, e.g. Gut health reset"
              className="w-full bg-white border border-sage-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-sage-400 mb-5"
            />

            <p className="text-xs font-medium text-moss-600 mb-1.5">Program length</p>
            <p className="text-[11px] text-moss-400 mb-2.5">
              How long has this client signed up for? Shows on their cycle reports so you can track overall progress, not just per-cycle.
            </p>
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
              className="w-full bg-white border border-sage-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-sage-400 mb-5"
            />

            <p className="text-xs font-medium text-moss-600 mb-2">
              What should they log every day?
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

            {errorMsg && (
              <p className="text-xs text-clay-600 text-center mb-2.5">{errorMsg}</p>
            )}

            <Button variant="primary" className="w-full py-3.5" onClick={handleSave} disabled={!canSave || saving}>
              <UserPlus size={16} /> {saving ? "Creating account..." : "Add client"}
            </Button>
            {!canSave && (
              <p className="text-[11px] text-moss-400 text-center mt-2">
                {!passcodeValid ? "Passcode must be at least 4 digits" : "Name and phone number are required"}
              </p>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}