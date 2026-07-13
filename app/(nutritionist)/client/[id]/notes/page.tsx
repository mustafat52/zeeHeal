"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { ChevronLeft, Save, Plus, MessageSquareText } from "lucide-react";

export default function ClientNotesPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const client = useAppStore((s) => s.clients.find((c) => c.id === clientId));

  const setMonthlyRecap = useAppStore((s) => s.setMonthlyRecap);
  const setMealReasoning = useAppStore((s) => s.setMealReasoning);
  const addSessionNote = useAppStore((s) => s.addSessionNote);
  const setClientNotes = useAppStore((s) => s.setClientNotes);

  const [recapDraft, setRecapDraft] = useState(client?.monthlyRecap ?? "");
  const [recapSaved, setRecapSaved] = useState(false);

  const [reasoningDrafts, setReasoningDrafts] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        (client?.todayPlan.meals ?? []).map((m) => [m.id, m.reasoning ?? ""])
      )
  );
  const [savedMealId, setSavedMealId] = useState<string | null>(null);

  const [newNote, setNewNote] = useState("");
  const [notesLoading, setNotesLoading] = useState(true);

  // session_notes comes back empty from the dashboard/detail hydration —
  // this page is the one that actually loads the real list.
  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    async function loadNotes() {
      setNotesLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("session_notes")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (!error && data) {
        setClientNotes(
          clientId,
          data.map((row) => ({ date: row.note_date, text: row.text }))
        );
      }
      setNotesLoading(false);
    }

    loadNotes();
    return () => {
      cancelled = true;
    };
  }, [clientId, setClientNotes]);

  if (!client) return null;

  function handleSaveRecap() {
    setMonthlyRecap(client!.id, recapDraft);
    setRecapSaved(true);
    setTimeout(() => setRecapSaved(false), 1500);
  }

  function handleSaveReasoning(mealId: string) {
    // NOTE: still a no-op against real data — todayPlan.meals is an empty
    // placeholder until the meal-generation decision lands, so this button
    // has nothing to actually attach reasoning to yet. Left wired for the
    // moment that unblocks.
    setMealReasoning(client!.id, mealId, reasoningDrafts[mealId] ?? "");
    setSavedMealId(mealId);
    setTimeout(() => setSavedMealId(null), 1500);
  }

  function handleAddNote() {
    if (!newNote.trim()) return;
    addSessionNote(client!.id, newNote.trim());
    setNewNote("");
  }

  return (
    <div className="pt-12 px-5 pb-10">
      <button onClick={() => router.back()} className="tap-scale flex items-center gap-1 text-moss-600 text-sm mb-4">
        <ChevronLeft size={16} /> Back
      </button>

      <h1 className="font-display text-2xl text-moss-900 mb-1">Notes & plan reasoning</h1>
      <p className="text-sm text-moss-400 mb-5">{client.name}</p>

      <Card className="mb-5">
        <p className="text-sm font-medium text-moss-600 mb-1">Monthly note</p>
        <p className="text-xs text-moss-400 mb-3">
          This is what {client.name.split(" ")[0]} sees on their Progress page, styled as a personal note from you.
        </p>
        <textarea
          value={recapDraft}
          onChange={(e) => setRecapDraft(e.target.value)}
          rows={5}
          placeholder="Write this month's note..."
          className="w-full bg-white border border-sage-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-sage-400 resize-none"
        />
        <button
          onClick={handleSaveRecap}
          className="tap-scale mt-2.5 flex items-center gap-1.5 bg-sage-600 text-white rounded-xl px-4 py-2 text-xs font-medium"
        >
          <Save size={13} /> {recapSaved ? "Saved" : "Save note"}
        </button>
      </Card>

      <Card className="mb-5">
        <p className="text-sm font-medium text-moss-600 mb-1">Today&apos;s meal reasoning</p>
        <p className="text-xs text-moss-400 mb-3">
          Shown to {client.name.split(" ")[0]} when they tap &quot;Why did Zainab pick this?&quot; on a meal.
        </p>
        <div className="flex flex-col gap-4">
          {client.todayPlan.meals.map((meal) => (
            <div key={meal.id} className="pb-4 border-b border-sage-100 last:border-0 last:pb-0">
              <p className="text-sm font-medium text-moss-900">{meal.label}</p>
              <p className="text-xs text-moss-400 mb-2">{meal.items}</p>
              <textarea
                value={reasoningDrafts[meal.id] ?? ""}
                onChange={(e) =>
                  setReasoningDrafts((prev) => ({ ...prev, [meal.id]: e.target.value }))
                }
                rows={3}
                placeholder="Why did you choose this meal for them?"
                className="w-full bg-white border border-sage-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-sage-400 resize-none"
              />
              <button
                onClick={() => handleSaveReasoning(meal.id)}
                className="tap-scale mt-2 flex items-center gap-1.5 bg-sage-100 text-sage-800 rounded-xl px-3.5 py-1.5 text-xs font-medium"
              >
                <Save size={12} /> {savedMealId === meal.id ? "Saved" : "Save reasoning"}
              </button>
            </div>
          ))}
          {client.todayPlan.meals.length === 0 && (
            <p className="text-xs text-moss-400 text-center py-2">
              No meals to reason about yet — today&apos;s plan hasn&apos;t been generated.
            </p>
          )}
        </div>
      </Card>

      <Card>
        <p className="text-sm font-medium text-moss-600 mb-3 flex items-center gap-1.5">
          <MessageSquareText size={14} /> Session notes
        </p>
        <div className="flex gap-2 mb-4">
          <input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note from today's session..."
            className="flex-1 bg-white border border-sage-100 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-sage-400"
          />
          <button
            onClick={handleAddNote}
            className="tap-scale w-11 h-11 rounded-xl bg-sage-600 flex items-center justify-center shrink-0"
            aria-label="Add note"
          >
            <Plus size={18} className="text-white" />
          </button>
        </div>
        <div className="flex flex-col gap-2.5">
          {notesLoading && (
            <p className="text-xs text-moss-400 text-center py-4">Loading notes...</p>
          )}
          {!notesLoading &&
            client.notes.map((note, i) => (
              <div key={i} className="bg-white rounded-xl border border-sage-100/60 p-3">
                <p className="text-[11px] text-moss-400 mb-0.5">{note.date}</p>
                <p className="text-sm text-moss-900">{note.text}</p>
              </div>
            ))}
          {!notesLoading && client.notes.length === 0 && (
            <p className="text-xs text-moss-400 text-center py-4">No session notes yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}