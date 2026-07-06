# zeeheal — Data Field Audit

> Companion to README.md and CHANGELOG.md. This file exists to answer one question:
> **for every piece of data the app collects, where does it actually get shown?**
> A field that's collected but never displayed anywhere is effectively dead weight —
> it makes the data model look more complete than the product actually is.

**Scope note:** this audit covers every file reviewed across this project's Claude
sessions. If a component exists in the real repo that wasn't shared during these
sessions (e.g. the inbox page, chat pages), it isn't accounted for below — treat
"not shown anywhere" as "not shown anywhere *I've seen*," not an absolute claim.

---

## How to read this

Each field lists:
- **Collected via** — where the data enters the system
- **Client sees** — where the client (patient) can see their own data
- **Zainab sees** — where the nutritionist can see it
- Anything marked ⚠️ was a genuine gap found and fixed during this audit
- Anything marked ❌ is a known gap, **not yet fixed** (requires new authoring UI, not just a display fix — flagged for a decision, not silently built)

---

## Client-level fields (`Client` interface)

| Field | Collected via | Client sees | Zainab sees |
|---|---|---|---|
| `name`, `initials`, `phone` | Onboarding (`NewClientFormModal`) | Home header | Client detail header, `tel:` link, inbox |
| `condition` | Onboarding preset | Determines which Home/Plan/Progress variant renders | Plan type pill, condition-specific report sections |
| `planType` | Onboarding (preset or custom text) | Plan page pill | Client detail pill |
| `startDate` | Onboarding (`"Today"`) | Progress page ("Since...") | Patient Profile card |
| `streak` | `logMeal`/`logCheckin` side-effect | Home screen stat card | Client detail, Cycle Report, Prep Sheet |
| `status` | Currently only set at onboarding (`"new"`); no in-app transition to `"on-track"`/`"needs-attention"` was found in reviewed files | — | Dashboard pill, digest |
| `lastLog` | Updated by `logMeal`/`logCheckin` | — | Dashboard row |
| `planCycle` (cycleNumber, startDate, currentDay, totalDays) | `renewPlanCycle` | `PlanCycleBar` on every Home screen | Dashboard badge, client detail, Cycle Report header, Patient Profile |
| `programDurationMonths` | Onboarding (preset pills or custom number) — **optional** | — | Patient Profile card only |
| `goalWeight` | Onboarding is condition-based but this specific field's entry point wasn't in the files reviewed — likely seeded/set elsewhere | Home (WeightLossHome), Progress page goal card | Cycle Report goal card |
| `checkinHistory` | `logCheckin` (writes into current day's slot) | Feeds client-side charts (`PeriodFlowChart`, `ActivityBarStrip`) | Feeds `DailyBarStrip` charts in Cycle Report — now config-driven, see below |
| `cycleHistory` | `renewPlanCycle` (archives before reset) | — | `PlanHistoryModal` |
| `periodLogs` | `logPeriodStart`/`End`/`Flow` | Progress page ("Your cycle"), `PeriodCalendar` | Cycle Report period card, `PeriodFlowStrip` |
| `progress[]` (weekly weight/bloating/energy) | Not written to by any store action found — appears to be seed-only | Progress page charts | Client detail weight chart, Cycle Report trend card |
| `notes[]` | No "add note" UI found in reviewed files — currently seed-only | — | Client detail "Session notes", Cycle Report, Prep Sheet |
| `monthlyRecap` | ❌ **No authoring UI found anywhere.** Currently hardcoded per seeded client, presented as if Zainab wrote it | Progress page, styled as "a note from Zainab" | **Not shown anywhere on Zainab's own side** — she can't see or edit the note the app claims she wrote |
| `todayCheckin` | `logCheckin` | Home screen check-in summary | ⚠️ Client detail "Today's check-in" card — was missing `mood` and `waterGlasses` despite both being collectible; **fixed this session** |
| `checkinConfig` | `ClientProfileFormModal` / onboarding | Determines which fields `DailyCheckinModal` shows | `ClientProfileFormModal` (editable), "Check-in setup" card |

---

## `DailyCheckin` fields (what actually gets logged day-to-day)

| Field | Client sees | Zainab sees (before fix) | Zainab sees (after fix) |
|---|---|---|---|
| `weight` | Home, Progress | Today's check-in card, weight trend chart | Unchanged — has its own dedicated trend card, deliberately excluded from the new daily-chart loop (see rationale below) |
| `sleepHours` | — | Today's check-in card + chart (if condition happened to be one of the 3 hardcoded to show it) | Chart now renders for **any** client with `sleepHours` on in their config |
| `mood` | Emoji on Home (PCOS/hormonal) | ⚠️ **Missing entirely from Today's check-in card.** Charted only for PCOS/hormonal in Cycle Report, even though weight-loss and skincare clients can have `mood` enabled too | Added to Today's check-in card; chart now renders for any client with `mood` on, not just 2 of 4 conditions |
| `bloating` | — | Today's check-in card + trend card | Chart now renders for any client with `bloating` on (previously had **no daily chart at all**, only the aggregate trend card) |
| `activityType` / `activityMinutes` | Home (implicitly, via reasoning text) | Today's check-in card | Chart now renders for any client with `activity` on, not just weight-loss |
| `skinCondition` | Home (skincare scorer) | Today's check-in card | Chart now renders for any client with `skinCondition` on, not just skincare |
| `hairFall` | — | Today's check-in card | ⚠️ **Previously had no daily chart at all**, even for Ananya who tracks it. Now charted. |
| `cycleDay` | Plan page phase banner (PCOS) | Today's check-in card | Deliberately excluded from daily-chart loop — already fully covered by the period calendar + flow chart |
| `waterGlasses` | — | ⚠️ **Missing entirely from Today's check-in card** | Added to Today's check-in card; chart already existed for all conditions |
| `note` | — (client writes it) | Today's check-in card, quoted | Unchanged |

**Why weight and cycleDay are excluded from the daily-chart loop:** weight already has a dedicated "since start date" trend card with actual kg change and direction — a same-height daily bar strip would show less than that card already does, for a number that moves slowly by nature. `cycleDay` is PCOS-specific tracking input fully covered by the period calendar and flow chart built specifically for it — a generic bar chart of "which day of her cycle she said she was on" adds nothing beyond what those already show.

---

## The core fix: config-driven charts

**Before:** `CycleReportModal` and `PlanHistoryModal` each hardcoded which chart appeared per *condition* — e.g. "if weight-loss, show Activity; if PCOS or hormonal, show Mood." This silently broke the moment `checkinConfig` (which is genuinely per-client customizable via `ClientProfileFormModal`) didn't match that assumption. A weight-loss client with `mood` and `bloating` turned on would never see either charted, purely because the code checked `condition`, not `checkinConfig`.

**After:** both components now call `getConfiguredChartFields(client, history)` from the new `lib/checkinCharts.ts`. This iterates the client's actual `checkinConfig`, not their condition, and renders a chart for every field that's both (a) turned on for this specific client and (b) chartable. Adding a field to a client's check-in config now automatically makes it appear in every report — live and historical — with zero per-condition logic to keep in sync.

---

## Known gaps — flagged, not silently fixed

These weren't display bugs — they're missing *input* mechanisms. Fixing them means designing a new feature, not editing an existing card, so they're documented here for a decision rather than built without being asked:

1. **`monthlyRecap` has no authoring UI.** The client sees a note "from Zainab" every month, but no reviewed file lets Zainab actually write or edit it — it's seed data pretending to be authored content. If this ships as-is, either every client's monthly note is manually hardcoded forever, or this needs a real editor on Zainab's side.
2. **Per-meal `reasoning` text has no authoring UI.** Same shape of problem — the client sees "Why did Zainab pick this?" but there's no reviewed component letting Zainab write that text for a specific meal.
3. **`notes[]` (session notes) has no visible "add note" UI** in the files reviewed. If one exists elsewhere in the repo, this line can be deleted; if not, Zainab currently has no way to log a new session note from within the app.
4. **`status` (`on-track`/`needs-attention`/`new`) has no visible transition logic** — it's set once at onboarding and never reviewed changing in response to actual behavior (e.g. a logging gap automatically flipping someone to "needs attention"). Right now it's either seed data or set manually somewhere not reviewed.

None of these were fabricated to look more finished than they are — flagging them here is the point of this document.