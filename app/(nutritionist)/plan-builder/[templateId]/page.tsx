"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { ConditionType } from "@/lib/mock-data/clients";
import { ChevronLeft, Save, Trash2, AlertTriangle } from "lucide-react";
import clsx from "clsx";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const defaultMealLabels = ["Breakfast", "Lunch", "Dinner"];

const conditionOptions: { key: ConditionType; label: string }[] = [
  { key: "weight-loss", label: "Weight loss" },
  { key: "pcos", label: "PCOS" },
  { key: "hormonal", label: "Hormonal" },
  { key: "skincare", label: "Skincare" },
];

function blankWeek(): Record<string, { label: string; items: string }[]> {
  const week: Record<string, { label: string; items: string }[]> = {};
  for (const day of days) {
    week[day] = defaultMealLabels.map((label) => ({ label, items: "" }));
  }
  return week;
}

function slugify(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "template";
}

export default function PlanTemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.templateId as string;
  const isNew = templateId === "new";

  const planTemplates = useAppStore((s) => s.planTemplates);
  const addPlanTemplate = useAppStore((s) => s.addPlanTemplate);
  const updatePlanTemplate = useAppStore((s) => s.updatePlanTemplate);
  const deletePlanTemplate = useAppStore((s) => s.deletePlanTemplate);
  const clients = useAppStore((s) => s.clients);

  const existing = isNew ? null : planTemplates.find((t) => t.id === templateId);

  const [name, setName] = useState(existing?.name ?? "");
  const [tag, setTag] = useState(existing?.tag ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [condition, setCondition] = useState<ConditionType>(existing?.condition ?? "weight-loss");
  const [activeDay, setActiveDay] = useState("Mon");
  const [draft, setDraft] = useState(() => existing?.weeklyMeals ?? blankWeek());
  const [saved, setSaved] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (!isNew && !existing) return null;

  const usedByCount = existing ? clients.filter((c) => c.weeklyPlan?.templateId === existing.id).length : 0;
  const canSave = name.trim().length > 0;

  function updateMeal(day: string, index: number, items: string) {
    setDraft((prev) => ({
      ...prev,
      [day]: prev[day].map((m, i) => (i === index ? { ...m, items } : m)),
    }));
  }

  function handleSave() {
    if (!canSave) return;
    if (isNew) {
      addPlanTemplate({
        id: slugify(name) + "-" + Date.now().toString().slice(-4),
        name: name.trim(),
        tag: tag.trim() || "Ongoing",
        description: description.trim(),
        condition,
        weeklyMeals: draft,
      });
      router.push("/plan-builder");
    } else {
      updatePlanTemplate(existing!.id, {
        name: name.trim(),
        tag: tag.trim() || "Ongoing",
        description: description.trim(),
        condition,
        weeklyMeals: draft,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  }

  function handleDelete() {
    deletePlanTemplate(existing!.id);
    router.push("/plan-builder");
  }

  return (
    <div className="pt-12 px-5 pb-10">
      <button onClick={() => router.back()} className="tap-scale flex items-center gap-1 text-moss-600 text-sm mb-4">
        <ChevronLeft size={16} /> Back
      </button>

      <h1 className="font-display text-2xl text-moss-900 mb-1">
        {isNew ? "New plan template" : "Edit template"}
      </h1>
      {!isNew && usedByCount > 0 && (
        <p className="text-xs text-moss-400 mb-5">
          {usedByCount} client{usedByCount === 1 ? "" : "s"} already assigned — editing this template won&apos;t change their plans, only future assignments.
        </p>
      )}
      {isNew && <div className="mb-5" />}

      <p className="text-xs font-medium text-moss-600 mb-2">Template details</p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Template name"
        className="w-full bg-white border border-sage-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-sage-400 mb-2.5"
      />
      <input
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        placeholder="Duration, e.g. 6 weeks"
        className="w-full bg-white border border-sage-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-sage-400 mb-2.5"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        placeholder="Short description clients and you will see"
        className="w-full bg-white border border-sage-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-sage-400 mb-5 resize-none"
      />

      <p className="text-xs font-medium text-moss-600 mb-2">Designed for</p>
      <div className="flex flex-wrap gap-2 mb-6">
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

      <p className="text-xs font-medium text-moss-600 mb-2">Weekly meals</p>
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={clsx(
              "tap-scale shrink-0 px-4 py-2 rounded-full text-sm font-medium border",
              activeDay === day
                ? "bg-sage-600 text-white border-sage-600"
                : "bg-white text-moss-600 border-sage-100"
            )}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {draft[activeDay]?.map((meal, i) => (
          <div key={meal.label} className="bg-white rounded-xl border border-sage-100/60 shadow-card p-3.5">
            <p className="text-xs text-moss-400 mb-1.5">{meal.label}</p>
            <input
              value={meal.items}
              onChange={(e) => updateMeal(activeDay, i, e.target.value)}
              placeholder={`What's for ${meal.label.toLowerCase()}?`}
              className="w-full bg-sage-50/60 border border-sage-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-sage-400"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={!canSave}
        className={clsx(
          "tap-scale w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-medium",
          canSave ? "bg-sage-600 text-white" : "bg-moss-900/10 text-moss-400"
        )}
      >
        <Save size={16} /> {isNew ? "Create template" : saved ? "Saved" : "Save changes"}
      </button>
      {!canSave && (
        <p className="text-[11px] text-moss-400 text-center mt-2">Template name is required</p>
      )}

      {!isNew && (
        <div className="mt-8 pt-5 border-t border-sage-100">
          <p className="text-xs font-medium text-clay-600 mb-3">Danger zone</p>
          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="tap-scale w-full flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 rounded-xl py-3 text-sm font-medium"
            >
              <Trash2 size={15} /> Delete template
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-2 mb-3">
                <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">
                  This removes the template from your list. {usedByCount > 0
                    ? `${usedByCount} client${usedByCount === 1 ? "" : "s"} already assigned keep their own copy of this plan unaffected.`
                    : "No clients are currently assigned to it."}
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
                  onClick={handleDelete}
                  className="tap-scale flex-1 bg-red-600 text-white rounded-xl py-2.5 text-xs font-medium"
                >
                  Yes, delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}