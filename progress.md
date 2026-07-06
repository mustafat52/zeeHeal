# zeeheal — CHANGELOG

> This file logs every meaningful file change in the project.
> Format per entry:
> **File path** | What changed | Why

Add new entries at the TOP under a date heading.

---

## Session 1 — Initial build (project kickoff through demo)

### Project scaffolded
**All files** — Created from scratch. Next.js 14 App Router + TypeScript + Tailwind + next-pwa. No create-next-app (no network in build environment) — all files hand-written.

---

### `next.config.js` — Created
next-pwa config. PWA disabled in development (`NODE_ENV === 'development'`), enabled on build/deploy.

---

### `tailwind.config.ts` — Created
Full design token system:
- Colors: ivory, sage (50/100/200/400/600/800), clay (100/400/600), moss (400/600/900)
- Fonts: `--font-fraunces` (display serif), `--font-inter` (body)
- Border radius: xl (20px), 2xl (28px)
- Box shadows: soft, card

---

### `app/globals.css` — Created
Tailwind base + `.tap-scale` class with `transition: transform 0.15s ease-out` + `will-change: transform`.
`will-change` added later to fix Android Chrome GPU compositor tearing.

---

### `app/layout.tsx` — Created
Root layout. Loads Fraunces and Inter via `next/font/google`. Sets PWA meta (theme color, apple-web-app-capable). Max-width `max-w-md mx-auto` centres content on desktop.

---

### `app/manifest.ts` — Created
PWA manifest. `start_url: "/login"`, `display: "standalone"`, `theme_color: "#FAF8F3"`. Icons at 192/512/maskable.

---

### `app/page.tsx` — Created
Single line: `redirect("/login")`. Fixes the original bug where `localhost:3000` opened Priya's home screen directly because the `(client)` route group's `page.tsx` was at the root path.

**Before:** No root `page.tsx`. `(client)/page.tsx` resolved to `/` and was the default.
**After:** Root `page.tsx` redirects to `/login`. Client home moved to `(client)/home/page.tsx`.

---

### `app/login/page.tsx` — Created, then updated
**v1:** Two buttons ("Continue as client", "Continue as Zainab"), immediate navigation.
**v2:** Added `WelcomeTransition` — tapping a button now shows the full-screen welcome animation for 1.5 seconds before navigating. Client sees "Welcome back, Priya", nutritionist sees "Welcome, Zainab".
**Note:** Originally used "Welcome, Dr Zainab" but corrected to "Welcome, Zainab" since her credentials are B.Sc (Registered Nutritionist), not a doctorate.

---

### `lib/mock-data/clients.ts` — Created, multiple updates
**v1:** 3 seeded clients (Priya/Ananya/Fatima), basic Client type.

**Updates over time:**
- Added `MealLog` type + `log?` field on meals (for photo/note logging)
- Added `reasoning?` field on meals (Zainab's personal note explaining the meal choice)
- Added `monthlyRecap?` on Client (personal note from Zainab at end of month)
- Added `DailyCheckin` type (weight, sleep, mood, bloating, activity, skinCondition, hairFall, cycleDay, waterGlasses)
- Added `CHECKIN_FIELDS` constant array — 9 possible fields with labels and hints
- Added `CheckinFieldKey` and `CheckinConfig` types
- Added `checkinConfig?` and `todayCheckin?` to Client interface
- Added `phone` field to Client interface
- Added `ZAINAB_PHONE` constant
- Added phone numbers to all 3 seeded clients (Indian +91 format)
- Added per-condition `checkinConfig` to all 3 seeded clients
- Added seeded `todayCheckin` for Priya
- Added per-meal `reasoning` text for all 3 clients
- Added `monthlyRecap` paragraphs for Priya and Ananya

**Why:** Each update driven by a new feature. The type system reflects the actual data each feature needs.

---

### `lib/store.ts` — Created, multiple updates
**v1:** `viewMode`, `activeClientId`, `clients`, `toggleMeal`, `addWater`.
**Updates:**
- Added `logMeal(clientId, mealId, log)` — saves MealLog to a specific meal
- Added `logCheckin(clientId, checkin)` — saves DailyCheckin, also sets `lastLog: "Just now"`
- Added `setCheckinConfig(clientId, config)` — updates per-client field toggles
- Added `addClient(client)` — appends new Client to array (in-memory)
- Imported `DailyCheckin`, `CheckinConfig` as types were added to clients.ts

---

### `lib/mock-data/messages.ts` — Created, updated
**v1:** `Message` interface (text only) + threads for 3 clients.
**Update 1:** Added `audioUrl?` and `audioDuration?` for voice notes. Added seeded voice note bubble in Priya's thread.
**Update 2:** Added `callDuration?` and `missedCall?` for in-app call logging (later REMOVED — see below).
**Update 3:** Removed `callDuration` and `missedCall` fields when the fake in-app call screen was scrapped in favour of `tel:` links. Cleaned up seeded call log entries.

**Why removed:** In-app calling (WebRTC) adds significant infra cost and complexity. Zainab suggested `tel:` links — tap the phone button, native dialer opens with the number pre-filled. Much simpler, works immediately, no ongoing cost.

---

### `lib/mock-data/plans.ts` — Created
4 plan templates: Gut health reset, PCOS/hormone balance, Weight loss, Skin and gut reset. Each has name, tag, description, usedBy count. Used by plan-builder page.

---

### `lib/digest.ts` — Created
Pure function `generateDigest(clients)` → `DigestItem[]`. Derives plain-English insights from client data: who's not logging, who had a weight/bloating improvement, who's new. Also `digestSummaryLine()` for a one-line stat. Used by `DigestCard.tsx` on the nutritionist dashboard.

---

### `app/(client)/home/page.tsx` — Created (was originally `(client)/page.tsx`), multiple updates
**v1:** Meal cards with check-off toggle. Camera icon as a tiny passive indicator.
**Update 1:** Replaced hidden tap-to-log with explicit green "Log" pill button per meal. Much more discoverable.
**Update 2:** Added "Why did Zainab pick this?" expandable per meal (AnimatePresence height animation, Zainab's initials avatar).
**Update 3:** Added daily check-in card above meal list. Shows clay CTA if not done, green summary if done. Opens `DailyCheckinModal`.
**Update 4:** Added `LogoutButton` to header.
**Update 5:** Made check-in summary line adaptive (shows whichever fields are actually present, not hardcoded to weight/sleep/bloating).

---

### `app/(client)/plan/page.tsx` — Created
Week view with Mon–Sun pill picker. Static mock meal data (7 days × 3 meals). Simple, no interactivity beyond day switching.

---

### `app/(client)/progress/page.tsx` — Created, updated
**v1:** Weight + bloating stat cards, ResponsiveContainer LineCharts (weight + energy).
**Update 1:** Added `monthlyRecap` card at top — renders Zainab's personal note in Fraunces italic.
**Update 2 (bug fix):** Replaced `ResponsiveContainer` with fixed-width charts using `useRef`/`useEffect`/`offsetWidth` hook. Added `isAnimationActive={false}` on both Line components. Added `contain: "layout paint"` on chart wrapper divs.
**Why:** `ResponsiveContainer` uses a continuously-active `ResizeObserver` that was firing during scroll, triggering repaints that caused the GPU compositor tearing (striped/torn visual) on Android Chrome. Fixed by measuring width once on mount + on `resize` event only.

---

### `app/(client)/chat/page.tsx` — Created, updated
**v1:** Text messages, send on Enter/button.
**Update 1:** Added voice note recording (`VoiceRecorder`) and `VoiceMessageBubble` rendering.
**Update 2:** Added `tel:` call button (phone icon, top-right of header). Imports `ZAINAB_PHONE` constant.
**Update 3:** Removed fake in-app call screen (`CallScreen` component). Simplified — call is just an `<a href="tel:...">`.

---

### `app/(nutritionist)/dashboard/page.tsx` — Created, multiple updates
**v1:** Flat page — just text headings, stat cards, client list. No visual hierarchy.
**Update 1 (redesign):** Added clay header band (matching client home's sage band), stat cards moved inside header as semi-transparent white, `DigestCard` overlapping header with negative margin, search bar, client count label. Addresses "too plain, everything on one screen" feedback.
**Update 2:** Added `+` button next to search bar. Wires `NewClientFormModal`. Added `AnimatePresence` for modal.

---

### `app/(nutritionist)/client/[id]/page.tsx` — Created, updated
**v1:** Avatar, name, plan pill, streak/logging stats, weight chart, session notes, "Message" button.
**Update 1:** Added "Prep for call" card (clay-colored) + `PrepSheetModal`.
**Update 2:** Added phone number display under client name.
**Update 3:** Added "Check-in setup" card (sage-colored) + `ClientProfileFormModal`.
**Update 4:** Added today's check-in display card (shows all non-null check-in fields).
**Update 5:** Split bottom CTA into two buttons: "Message" (primary, navigates to chat) and "Call" (`tel:` link, secondary sage style).

---

### `app/(nutritionist)/client/[id]/chat/page.tsx` — Created, updated
**v1:** Text + voice note chat with nutritionist identity.
**Update 1:** Added `tel:` call button (phone icon, top right). Replaced `router.push('/client/${id}/chat')` pattern.
**Update 2:** Removed fake `CallScreen` usage entirely.

---

### `app/(nutritionist)/inbox/page.tsx` — Created, updated
**v1:** Flat list of clients, last message preview, links to client detail.
**Update 1:** Added sage header band with tagline "Every client conversation, all in zeeheal".
**Update 2 (with call feature):** Added call-aware previews (voice note icon, missed call, call ended). Later REMOVED when `tel:` approach replaced fake calls.
**Update 3 (simplified):** Rows now link directly to per-client chat. Added phone icon on each row as `tel:` link. Removed call-type message logic.

---

### `components/client/ClientBottomNav.tsx` — Created, updated
**v1:** Tabs: Home `/`, Plan, Progress, Chat. Used `backdrop-blur-sm`.
**Update 1:** Removed `backdrop-blur-sm` → solid `bg-white`. Fixed Android Chrome GPU tearing.
**Update 2:** "Home" tab href changed from `/` to `/home` (after root route was taken by redirect).
**Update 3:** "Chat" tab renamed to "Ask Zainab" for clearer personal framing.

---

### `components/nutritionist/NutritionistBottomNav.tsx` — Created, updated
**v1:** Tabs: Clients `/dashboard`, Plans, Inbox. Used `backdrop-blur-sm`.
**Update:** Removed `backdrop-blur-sm` → solid `bg-white`. Same Android Chrome fix.

---

### `components/client/DailyCheckinModal.tsx` — Created, updated
**v1:** Fixed set of fields: mood, weight, sleep, bloating, activity, note.
**Update:** Made fully config-driven. Accepts `config?: CheckinConfig` prop. Each section conditionally renders based on `isOn(config, key)`. Added condition-specific fields: skin condition (0–10 slider), hair fall (0–10 slider), cycle day (stepper Day 1–40). If no config provided, all fields show (safe fallback for onboarding).

---

### `components/client/LogMealModal.tsx` — Created
Bottom-sheet modal triggered by tapping "Log" on a meal card. File input with `capture="environment"` (opens native camera on mobile). Symptom quick-tags (tap to toggle). Optional note textarea. Saves `MealLog` object.

---

### `components/client/VoiceRecorder.tsx` — Created
Mic button. Tap to start recording via `MediaRecorder` API, tap again to stop. On stop, creates blob URL and calls `onRecorded(url, durationSeconds)`.

---

### `components/client/VoiceMessageBubble.tsx` — Created, updated
Waveform-style bubble (static bars, not real waveform). Play/pause via `<audio>` ref. Accepts `sender` prop to flip bubble color (sage for client, white for nutritionist). Updated to guard against empty `audioUrl` — tapping play without a real URL toggles icon only (graceful for demo seeded data).

---

### `components/nutritionist/DigestCard.tsx` — Created
Renders `DigestItem[]` from `generateDigest()`. Three item types: `attention` (clay/alert icon), `win` (sage/sparkle icon), `new` (neutral/user-plus icon). Empty state: "All quiet today." Each item links to the relevant client detail page.

---

### `components/nutritionist/PrepSheetModal.tsx` — Created
Pre-call summary bottom sheet. Shows: adherence % (done meals / total meals today), days on plan, weight change with trend arrow, bloating change with trend arrow, last 3 session notes.

---

### `components/nutritionist/ClientProfileFormModal.tsx` — Created
Edit check-in fields for an existing client. Quick presets (Gut health, PCOS, Weight loss, Skin focus) auto-select relevant fields. All 9 fields individually toggleable with label + hint. Shows count of selected fields. Note at bottom: "this also shapes future reminders."

---

### `components/nutritionist/NewClientFormModal.tsx` — Created
Full onboarding form for adding a new client. Fields: full name (required), phone number (required, type="tel"), condition preset pills (auto-sets planType + checkinConfig), manual plan name override, 9 check-in field toggles. Generates a new `Client` object and calls `addClient` on the store. Validates that name + phone are filled before enabling save.

---

### `components/ui/WelcomeTransition.tsx` — Created
Full-screen ivory overlay. Framer Motion sequence: circle scales in (spring), leaf icon rotates in, greeting fades up (Fraunces 2xl), subtitle fades up, underline width animates from 0 to 64px. Used by `login/page.tsx` for both client and nutritionist entry.

---

### `components/ui/LogoutButton.tsx` — Created
Small rounded button with LogOut icon. `router.push("/login")` on click. Used in client home header and nutritionist dashboard header.

---

### `components/ui/CallScreen.tsx` — Created then DELETED
Full-screen in-app calling UI (dark background, avatar, timer, mute/video/end controls). Removed when call approach changed from in-app WebRTC to `tel:` links. Dead code, deleted to avoid confusion.

---

### `components/ui/CallLogEntry.tsx` — Created then DELETED
Inline pill showing "Call · 5:12" or "Missed call" in chat history. Removed along with `CallScreen` when call approach changed.

---

## What to build next (Phase 1)

See README.md Build Order. Next session should start with:
1. Condition-specific home screens (4 variants)
2. PCOS period tracker calendar component
3. 15-day cycle data model + display


---

## Session 2 — July 4, 2026 · Condition-specific home screens + data model overhaul

### Summary of what was done this session
Zainab confirmed she treats 4 distinct conditions: weight loss, PCOS, hormonal imbalance, and skincare. Each condition now has its own dedicated home screen with relevant content. A shared 15-day plan cycle bar was built and appears on all 4 screens. The PCOS screen has a full period tracker calendar (Flo-referenced). The data model was extended to support condition types, plan cycles, period logs, and goal weight. The login screen was updated with a client selector so all 4 conditions can be demoed without touching code.

---

### `lib/mock-data/clients.ts` — Major update

**Before:**
- No `condition` field on Client
- No `planCycle` field
- No `periodLogs` field
- No `goalWeight` field
- 3 seeded clients: Priya (gut health), Ananya (PCOS), Fatima (weight loss)
- Missing `PlanCycle`, `PeriodLog`, `ConditionType` types entirely

**After:**
- Added `ConditionType = "weight-loss" | "pcos" | "hormonal" | "skincare"`
- Added `PlanCycle` interface: `{ cycleNumber, startDate, currentDay, totalDays: 15 }`
- Added `PeriodLog` interface: `{ startDate, endDate?, cycleLength? }`
- Added `condition`, `planCycle`, `goalWeight?`, `periodLogs?` fields to `Client` interface
- Priya reassigned to `condition: "hormonal"` (was gut health — reassigned to cover the hormonal demo)
- Ananya: `condition: "pcos"`, added `periodLogs` with 2 seeded entries (one active — no endDate)
- Fatima: `condition: "weight-loss"`, added `goalWeight: 72`
- Added 4th client **Riya Sharma** (`condition: "skincare"`, skin and gut reset plan, streak 6, Day 7 of cycle 1)
- All 4 clients now have `planCycle` with realistic seeded values

**Why:** Each condition needs different home screen content and different data to display. The data model needed to reflect this before any UI could be built. 15-day cycles are Zainab's actual practice cadence — the app must model it accurately.

---

### `lib/store.ts` — Updated

**Before:**
- No `logPeriodStart` or `logPeriodEnd` actions
- No `PeriodLog` import

**After:**
- Added `logPeriodStart(clientId)` — appends a new `PeriodLog` with `startDate: "Today"` to the client's `periodLogs` array
- Added `logPeriodEnd(clientId)` — finds the last `PeriodLog` with no `endDate` and sets `endDate: "Today"`
- Imported `PeriodLog` from `clients.ts`

**Why:** The PCOS period calendar needs to write period start/end events. These actions are the in-memory store equivalent of what would eventually be a database write.

---

### `app/(client)/home/page.tsx` — Completely replaced (was monolithic, now a router)

**Before:**
Single large component handling all clients with a fixed home screen layout (sage header, streak/water cards, check-in card, meal list). No concept of conditions. One screen for everyone.

**After:**
A 10-line condition router:
```tsx
switch (client.condition) {
  case "weight-loss": return <WeightLossHome client={client} />;
  case "pcos":        return <PCOSHome client={client} />;
  case "hormonal":    return <HormonalHome client={client} />;
  case "skincare":    return <SkincareHome client={client} />;
}
```
All display logic moved into 4 separate components in `components/client/homes/`.

**Why:** A weight-loss client and a PCOS client should not see the same home screen. The router pattern keeps each condition screen fully independent — changing one doesn't risk breaking others.

---

### `app/login/page.tsx` — Updated

**Before:**
Two buttons: "Continue as client" (always logged in as Priya), "Continue as Zainab". No way to switch clients without editing code.

**After:**
Added a row of client selector pills above the main buttons. Each pill shows `[FirstName] · [Condition]` (e.g. "Priya · Hormonal", "Ananya · PCOS", "Fatima · Weight loss", "Riya · Skincare"). Tapping a pill calls `setActiveClientId()`. The "Continue as client" button label updates dynamically to "Continue as [selected name]". Selector pills auto-populate from the live clients array in the store — adding a new client will automatically appear here.

**Why:** The demo needs to show all 4 condition home screens without touching code. This gives a clean in-app switcher that also naturally demonstrates how the login will eventually work per-client.

---

### `components/client/PlanCycleBar.tsx` — New file

A shared component used on all 4 home screens. Displays:
- "Plan cycle N · Day X of 15" label
- A progress bar (fills left to right, turns clay-colored when ≤3 days remain)
- "X days left" badge (turns clay/orange when near the end as a visual alert)
- "Day 1" and "Day 15 · plan review" end labels

**Why:** 15-day cycles are core to Zainab's practice. Every client needs to see where they are in their current cycle. Extracted as a shared component so all 4 home screens use identical cycle bar behavior.

---

### `components/client/PeriodCalendar.tsx` — New file

Full period tracker calendar, PCOS home screen only. Features:
- Monthly calendar grid (7-column, day-of-week headers)
- Previous/next month navigation
- Period days highlighted in clay-red (`bg-clay-400`)
- Today highlighted in sage if not a period day
- "Log period start" / "Log period end" button that toggles based on whether an active period log exists (no `endDate`)
- Active period status banner ("Period started X days ago")
- Confirmation bottom-sheet modal before logging
- Calls `logPeriodStart(clientId)` or `logPeriodEnd(clientId)` on the store
- `parseRelativeDate()` helper converts "Today" / "X days ago" strings to real `Date` objects for calendar rendering

**Reference:** Flo app — home screen built around a single cycle status widget, not a cramped full calendar. Period dates are the primary data, cycle phase labels are secondary.

**Why:** PCOS clients need to track their period. Zainab needs to see this data to adjust plans around cycle phases. This is the most clinically relevant feature for the PCOS condition and the one Zainab specifically called out in the meeting.

---

### `components/client/TodayMeals.tsx` — New file (extracted from old home page)

Previously the meal-card section lived inline in the single home page component. Extracted into a reusable `<TodayMeals clientId={} plan={} />` component used by all 4 condition home screens.

Contains:
- Meal cards with Log button (camera + "Log" pill)
- "Why did Zainab pick this?" expandable reasoning
- `LogMealModal` integration (photo, symptom tags, note)
- Staggered Framer Motion entrance animation

**Why:** All 4 home screens show the same meal plan section. Extracting it avoids copy-pasting 80 lines of meal card logic into each home screen component.

---

### `components/client/CheckinCard.tsx` — New file (extracted from old home page)

Previously the daily check-in card lived inline in the single home page. Extracted into `<CheckinCard client={} />` used by all 4 condition home screens.

Shows clay CTA ("Do your daily check-in") when not done, green summary card when done. Summary line adapts to whichever fields are present (weight, sleep, bloating, skin). Opens `DailyCheckinModal` with the client's `checkinConfig`.

**Why:** Same extraction rationale as `TodayMeals` — identical across all 4 screens, no reason to duplicate.

---

### `components/client/homes/WeightLossHome.tsx` — New file

Home screen for `condition: "weight-loss"` clients. Unique sections:
- **Lost so far** card — calculates `startWeight - currentWeight` from `progress[]`
- **Goal weight** card — shows `client.goalWeight` and `currentWeight - goalWeight` ("X kg to go")
- **Goal progress bar** — visual fill from start weight to goal weight with percentage
- Streak + water cards
- `PlanCycleBar`, `CheckinCard`, `TodayMeals`

Header: sage green band (consistent with other screens), "Your weight loss plan" heading.

---

### `components/client/homes/PCOSHome.tsx` — New file

Home screen for `condition: "pcos"` clients. Unique sections:
- **`PeriodCalendar`** — the full cycle tracker, most prominent non-plan element
- Streak + water cards
- **Today's symptoms** card — conditionally renders if `todayCheckin` has bloating/mood/hairFall/skinCondition. Shows all non-null values in a grid (mood shown as emoji)
- `PlanCycleBar`, `CheckinCard`, `TodayMeals`

---

### `components/client/homes/HormonalHome.tsx` — New file

Home screen for `condition: "hormonal"` clients. Unique sections:
- **Mood & energy bar chart** — 7-day history, two bar series (clay for mood, sage for energy), day labels. Uses static mock history data for demo (real data would come from `todayCheckin` history)
- **3-column stat row** — today's mood (emoji), energy level with trend arrow, streak
- **Water progress row** — horizontal progress bar inline with tap-to-add
- `PlanCycleBar`, `CheckinCard`, `TodayMeals`

---

### `components/client/homes/SkincareHome.tsx` — New file

Home screen for `condition: "skincare"` clients. Unique sections:
- **Skin condition scorer** — 5-tap buttons (Clear / Mostly clear / Mild / Moderate / Severe), color-coded from sage to red. Selecting a level shows an inline tip ("Mild flare-up. Make sure you're hitting your water goal today.")
- **Skin condition weekly chart** — 7-day bar chart, bar color reflects severity
- Hydration (water) card with larger water goal (10 glasses vs 8 — skin clients need more)
- **Skin photo log** — camera button to take today's photo for Zainab to track visually
- `PlanCycleBar`, `CheckinCard`, `TodayMeals`

---

### Git details


Commit:   18640f5
Message:  "added screens"
Branch:   main
Remote:   https://github.com/mustafat52/zeeHeal.git
Files changed: 12
Insertions:    +1056
Deletions:     -249
New files created:
components/client/CheckinCard.tsx
components/client/PeriodCalendar.tsx
components/client/PlanCycleBar.tsx
components/client/TodayMeals.tsx
components/client/homes/HormonalHome.tsx
components/client/homes/PCOSHome.tsx
components/client/homes/SkincareHome.tsx
components/client/homes/WeightLossHome.tsx
Modified files:
app/(client)/home/page.tsx    (replaced with condition router)
app/login/page.tsx            (added client selector pills)
lib/mock-data/clients.ts      (new types, 4th client, planCycle/periodLogs fields)
lib/store.ts                  (logPeriodStart, logPeriodEnd actions)


---

### What's next (Phase 1 remaining)
- All 4 condition home screens are built. Phase 1 is complete.
- Phase 2 starts: 15-day cycle management on Zainab's nutritionist dashboard
  - Show which clients are at/near Day 15
  - Plan renewal flow (push new plan at end of cycle)
  - Plan history per client


## Session 3 — July 4, 2026 · Condition-specific color identity for the 4 home screens

### Summary of what was done this session
All 4 condition home screens shared one identity (sage header band, same accent everywhere) despite showing completely different content. Each screen now has its own accent hue applied to its header band and its single hero/most-distinctive feature, while the shared card system, borders, and body text stay exactly as they were. Semantic colors (skin severity scale, streak flame, trend arrows, clay "needs attention" states) were deliberately left untouched since they carry meaning independent of which condition owns the screen. Part 2 extends the accent down into the 3 shared components so the identity carries the whole way through each screen, not just the header.

---

### `components/client/homes/WeightLossHome.tsx` — Updated

**Before:**
- Header band `bg-sage-100` / `text-sage-800`
- Goal progress bar fill `bg-sage-600`
- `Target` icon uncolored
- `PlanCycleBar` and `CheckinCard` rendered with no accent

**After:**
- Header band recolored to `bg-amber-50` / `text-amber-800`
- Goal progress bar fill recolored to `bg-amber-500`
- `Target` icon recolored to `text-amber-600`
- `<PlanCycleBar accent="amber" />` and `<CheckinCard accent="amber" />`

**Why:** Amber reads as momentum/achievement — distinct from the generic sage used everywhere else.

---

### `components/client/homes/PCOSHome.tsx` — Updated

**Before:**
- Header band `bg-sage-100` / `text-sage-800`
- `PeriodCalendar` themed entirely in clay/sage (period days `bg-clay-400`, today `bg-sage-100`, log buttons `clay-100`/`sage-100`, confirm CTA `bg-clay-400`)
- "Today's symptoms" `Activity` icon uncolored
- `PlanCycleBar` and `CheckinCard` rendered with no accent

**After:**
- Header band recolored to `bg-rose-50` / `text-rose-800`
- `PeriodCalendar` recolored internally to rose throughout: log buttons (`bg-rose-100`/`bg-rose-50`), status banner dot and background, period-day fills (`bg-rose-400`), today-marker (`bg-rose-100`), confirm CTA (`bg-rose-500`), and card border (`border-rose-100/70`)
- `Activity` icon recolored to `text-rose-600`
- `<PlanCycleBar accent="rose" />` and `<CheckinCard accent="rose" />`

**Why:** Rose was chosen over clay deliberately — clay is already doing double duty as the nutritionist-side brand color and the app-wide "needs attention" alert color, so reusing it as a client-facing identity color would blur that meaning. Rose keeps the period-tracking warmth without the collision. `PeriodCalendar` is PCOS-exclusive so the color is hardcoded rather than passed as a prop — no other screen consumes this component.

---

### `components/client/homes/HormonalHome.tsx` — Updated

**Before:**
- Header band `bg-sage-100` / `text-sage-800`
- Mood/energy chart bars `bg-clay-200` (mood) / `bg-sage-200` (energy), legend swatches matching
- Water droplet icon `text-sage-600`
- `PlanCycleBar` and `CheckinCard` rendered with no accent

**After:**
- Header band recolored to `bg-violet-50` / `text-violet-800`
- Mood/energy chart bars recolored to `bg-violet-200` (mood) / `bg-violet-500` (energy) — single-hue family instead of borrowed clay/sage
- Legend swatches updated to match
- Water droplet icon recolored to `text-violet-600`
- `<PlanCycleBar accent="violet" />` and `<CheckinCard accent="violet" />`

**Why:** Violet gives this screen a calm/balance register, distinct from the achievement-oriented weight-loss screen.

---

### `components/client/homes/SkincareHome.tsx` — Updated

**Before:**
- Header band `bg-sage-100` / `text-sage-800`
- Insight tip box `bg-sage-50` with `Sparkles` icon `text-sage-600`
- Photo-log CTA border `border-sage-200`, text `text-sage-700`
- `PlanCycleBar` and `CheckinCard` rendered with no accent

**After:**
- Header band recolored to `bg-teal-50` / `text-teal-800`
- Insight tip box recolored to `bg-teal-50` with `Sparkles` icon `text-teal-600`
- Photo-log CTA recolored to `border-teal-200`, text `text-teal-700`
- `<PlanCycleBar accent="teal" />` and `<CheckinCard accent="teal" />`

**Why:** Teal reads cooler/cleaner than sage, separating skincare from the generic green used everywhere else. The 5-point skin severity scale (`sage → clay → red`) was intentionally left unchanged since it's a meaning-carrying scale, not a brand color.

---

### `components/client/PlanCycleBar.tsx` — Updated (Part 2)

**Before:**
- No `accent` prop. Days-left pill and progress fill hardcoded to `bg-sage-100`/`text-sage-700`/`bg-sage-600`. Near-end "review soon" state hardcoded to clay.

**After:**
- Added optional `accent?: "amber" | "rose" | "violet" | "teal"` prop with a `ACCENT_STYLES` lookup map (`pillBg`, `pillText`, `barFill` per accent)
- When `accent` is omitted, falls back to the original sage styling (backward compatible)
- Near-end alert state (`daysLeft <= 3`) stays clay regardless of accent — this is a universal warning cue, not identity

**Why:** Used by all 4 home screens, so the color needed to be parameterized rather than hardcoded to one condition.

---

### `components/client/CheckinCard.tsx` — Updated (Part 2)

**Before:**
- No `accent` prop. Done-state checkmark circle hardcoded to `bg-sage-100`/`text-sage-600`.

**After:**
- Added optional `accent?: "amber" | "rose" | "violet" | "teal"` prop with an `ACCENT_STYLES` lookup map (`doneBg`, `doneIcon` per accent)
- Applies only to the done-state checkmark circle
- Not-done CTA state stays clay regardless of accent — same "needs action" universal cue as the digest card elsewhere in the app

**Why:** Same rationale as `PlanCycleBar` — shared across all 4 screens, needed to stay reusable.

---

### `components/client/PeriodCalendar.tsx` — Updated (Part 2)

**Before:**
- Fully clay/sage themed (see PCOSHome entry above)

**After:**
- Fully recolored to rose (see PCOSHome entry above) — themed internally rather than via prop since it has exactly one consumer

**Why:** Consolidates the PCOS identity into the component itself instead of relying on an external wrapper div, which was removed from `PCOSHome.tsx` as part of this change.

---

### What was NOT touched (scope note)
`TodayMeals.tsx`, `LogMealModal.tsx`, and `DailyCheckinModal.tsx` remain in the original neutral sage/moss palette. Meal logging and check-in data entry are transactional flows shared identically across all 4 conditions — kept deliberately unbranded so the *action* of logging feels consistent everywhere, even though the surrounding screen doesn't.

---

### Git details

**Commit 1:**

Commit:   e6059f6
Message:  "trying other screens ui"
Branch:   main
Remote:   https://github.com/mustafat52/zeeHeal.git
Files changed: 6
Insertions:    +846
Deletions:     -23
New files created:
context.md
progress.md
Modified files:
components/client/homes/WeightLossHome.tsx   (amber accent)
components/client/homes/PCOSHome.tsx         (rose accent)
components/client/homes/HormonalHome.tsx     (violet accent)
components/client/homes/SkincareHome.tsx     (teal accent)

**Commit 2:**

Commit:   c6b6803
Message:  "trying other screens ui part 2"
Branch:   main
Remote:   https://github.com/mustafat52/zeeHeal.git
Files changed: 8
Insertions:    +153
Deletions:     -29
Modified files:
components/client/PlanCycleBar.tsx           (added accent prop)
components/client/CheckinCard.tsx            (added accent prop)
components/client/PeriodCalendar.tsx         (recolored to rose internally)
components/client/homes/WeightLossHome.tsx   (wired accent="amber")
components/client/homes/PCOSHome.tsx         (wired accent="rose", removed redundant ring wrapper)
components/client/homes/HormonalHome.tsx     (wired accent="violet")
components/client/homes/SkincareHome.tsx     (wired accent="teal")

---

### What's next
- The 4 condition home screens are now fully finished — color identity carries from header through hero feature down to the check-in state.
- Phase 2 (15-day cycle management on Zainab's nutritionist dashboard) is the next major milestone per README Build Order:
  - Show which clients are at/near Day 15
  - Plan renewal flow (push new plan at end of cycle)
  - Plan history per client


  ## Session 4 — July 5, 2026 · 15-day cycle review: dashboard indicators, Cycle Report, patient profile, and period flow tracking

### Summary of what was done this session
Phase 2 of the README build order (15-day cycle management) was implemented, then substantially deepened based on Zainab's feedback that plan renewal needs to be an informed decision, not a one-tap reset. What started as a simple "Day X/15" badge on the dashboard grew into a full Cycle Report: a gate Zainab must open before renewing a client's cycle, showing day-by-day consistency across sleep, water, and condition-specific factors (activity, mood, skin condition), a patient enrollment profile (program length, cycles completed), and period flow intensity tracking for PCOS clients. A build error surfaced near the end of the session (a new required field broke client-onboarding creation) and was resolved by making the field optional with a graceful fallback, then properly fixed by adding a program-length selector to onboarding itself.

---

### `lib/store.ts` — Updated

**Before:**
- No `renewPlanCycle` action
- `logCheckin` only overwrote `todayCheckin`, no historical record kept
- No period flow logging

**After:**
- Added `renewPlanCycle(clientId)` — bumps `cycleNumber`, resets `currentDay` to 1, sets `startDate` to `"Today"`, and resets `checkinHistory` to a fresh 15-null array
- `logCheckin` now also writes into `checkinHistory[currentDay - 1]` in addition to `todayCheckin`, so the current cycle's day-by-day data is preserved rather than only ever showing "today"
- Added `logPeriodFlow(clientId, intensity)` — records or updates today's flow intensity on the active period log; no-ops if no period is currently active

**Why:** The dashboard's initial "Renew" pill called `renewPlanCycle` directly on tap, with no visibility into what happened during the cycle. Zainab pointed out her plan changes are based on the client's progress over those 15 days, so renewal needed to move behind a real review step — which meant the store needed to actually retain daily history instead of only tracking "today."

---

### `app/(nutritionist)/dashboard/page.tsx` — Updated (twice)

**Before:**
- No indication of which clients were near the end of their cycle
- Two-card stat grid: Active clients, Needs attention

**After (first pass):**
- Added `cycleReviewDue` count (clients with `totalDays - currentDay <= 3`), shown as a clay banner under the stat grid, only rendered when count > 0
- Each client row shows `Day X/15`; within 3 days of the end, this became a tappable clay pill that called `renewPlanCycle` directly

**After (revised, once the report requirement was raised):**
- The per-row badge no longer calls `renewPlanCycle`. It's back to a plain (but still clay-highlighted when near end) indicator reading `Day 12/15 · Review due` — tapping it just opens the client like any other row. Renewal moved entirely to the client detail page.

**Why:** The first version optimized for a satisfying one-tap dashboard action. The revision reflects that renewal is a clinical decision that needs the full report first — the dashboard's job is now just to flag *who* needs review, not to let Zainab renew from a list view.

---

### `app/(nutritionist)/client/[id]/page.tsx` — Updated

**Before:**
- Two-button row: "Prep for call," "Check-in setup"
- No cycle-review entry point

**After:**
- New full-width "Cycle {N} review" trigger card above the existing two-button row — solid clay and reading "review due" when within 3 days of Day 15, plain white/neutral otherwise
- Opens `CycleReportModal`; its `onRenew` callback is the only place `renewPlanCycle` is called from anywhere in the app

**Why:** Consolidates renewal behind a single, deliberate entry point, modeled visually on the existing "Prep for call" card so it reads as part of the same family of nutritionist tools rather than a bolted-on feature.

---

### `components/nutritionist/CycleReportModal.tsx` — New file, then substantially extended

**v1:** Modeled on `PrepSheetModal`'s pattern (adherence-style stat cards, weight/bloating trend with arrows, last-3-notes list), scoped to the whole cycle instead of "today." Included a condition-specific single card: goal-weight delta (weight-loss), period-log count (PCOS), and "today only, no trend" caveats for skincare and hormonal mood/skin, since no daily history existed yet.

**v2 (after Zainab's feedback):** Rebuilt around real daily data once `checkinHistory` existed:
- Added `PatientProfileCard` at the top (program length, cycles completed, overall progress)
- Replaced the "Session notes" stat with **"Logged this cycle: X/Y days"** — a real consistency metric computed from `checkinHistory`
- Added three `DailyBarStrip` charts per report: **Sleep** and **Water** (universal), plus one condition-specific chart — **Activity** (weight-loss), **Mood** (PCOS, hormonal), **Skin condition** (skincare)
- This retroactively resolved the "today only" caveats from v1 — mood and skin condition now have real 15-day trends, so those disclaimer cards were removed
- Added `PeriodFlowStrip` for PCOS clients, replacing the "flow intensity isn't tracked yet" note with an actual color-coded daily flow chart

**Why:** v1 was honest about a real data gap (no daily history existed). Once that gap was closed via `checkinHistory`, the caveats became unnecessary and were replaced with the real thing rather than left in as stale disclaimers.

---

### `lib/mock-data/clients.ts` — Updated (three passes)

**Before:**
- No daily history of any kind — only `todayCheckin` (single snapshot) and weekly `progress[]` (4 points)
- `PeriodLog` had no flow data — only `startDate`/`endDate`/`cycleLength`
- No concept of overall program length, only per-cycle data

**After (main pass):**
- Added `checkinHistory?: (DailyCheckin | null)[]` to `Client` — a 15-slot array, index 0 = Day 1 of the *current* cycle, `null` meaning "not logged that day." Resets on `renewPlanCycle`.
- Added `programDurationMonths: number` to `Client` (initially required)
- Added `FlowIntensity = "light" | "medium" | "heavy"` type and `dailyFlow?: { date: string; intensity: FlowIntensity }[]` on `PeriodLog`
- Seeded realistic `checkinHistory` for all 4 clients, deliberately including gaps for Ananya (days 6–8 missing) to match her existing "needs attention, logging dropped off" narrative rather than showing an artificially perfect record
- Seeded Ananya's active period log with 3 days of flow data ("heavy, heavy, medium"), timed to land on the same days her check-ins went quiet — surfacing a real clinical explanation (period onset) for the consistency drop, rather than leaving it looking like unexplained disengagement
- Added `programDurationMonths` values to all 4 seeded clients (Priya: 3, Ananya: 6, Fatima: 1, Riya: 3)

**After (build-fix pass):**
- Changed `programDurationMonths: number` to `programDurationMonths?: number` — the Vercel build failed because `NewClientFormModal` created new `Client` objects without this field, and the type checker correctly caught the mismatch

**Why:** This is the actual data-model foundation the whole session's reporting features are built on. The deliberate gaps and the period/check-in-drop-off correlation for Ananya aren't just filler — they make the report's core value visible in the demo: Zainab can now see not just *that* a client went quiet, but plausibly *why*. The field going optional was a necessary correction once a real onboarding flow (which doesn't know this value yet by default) exposed the assumption that every client would always have it.

---

### `components/nutritionist/PatientProfileCard.tsx` — New file, then hardened

**v1:** Program length, start date, cycles completed (`cycleNumber - 1`), and a progress bar computed as `elapsedDays / (programDurationMonths * 30)`.

**v2 (build-fix):** Guarded against `programDurationMonths` being `undefined`. The card now branches: if set, shows the full progress bar and estimate; if not, shows a plain "program length not set for this client yet" line instead of computing a misleading percentage from a missing number.

**Why:** New clients created through onboarding wouldn't have this field until the onboarding form was updated to collect it — the card needed to degrade gracefully rather than break, and rather than silently invent a default duration that could mislead Zainab.

---

### `components/nutritionist/DailyBarStrip.tsx` — New file

Reusable 15-cell bar chart. Logged days render as a colored bar scaled to value; missed days render as a thin gray dash rather than a zero-height bar, so gaps are visually distinct from "logged a low number." Built with hand-rolled divs, not Recharts — deliberately, since Recharts + `ResizeObserver` inside a scrollable bottom sheet is the same class of GPU-tearing issue already fixed elsewhere in this app (see Session 1's chart fix).

---

### `components/nutritionist/PeriodFlowStrip.tsx` — New file

Same 15-cell grid concept as `DailyBarStrip`, but specialized for categorical flow data: both bar height *and* color encode intensity (light/medium/heavy → increasingly saturated rose), and non-period days render as a faint neutral mark rather than the "missed" gray dash, since most days in a cycle aren't period days at all — that's a different meaning from "should have logged and didn't."

---

### `lib/period.ts` — New file

Self-contained util for mapping relative-date period logs onto a cycle-day-indexed array (`buildFlowDataForCycle`). Includes its own `parseRelativeDate` rather than importing the one already living inside `PeriodCalendar.tsx`, to avoid refactoring working date-parsing logic under time pressure — a deliberate small duplication traded for lower risk.

---

### `components/client/PeriodCalendar.tsx` — Updated

**Before:** Log period start/end only. No way to record flow.

**After:** When a period is active, a "Today's flow" row appears with Light/Medium/Heavy pills, calling the new `logPeriodFlow` action. Selected intensity is visually distinct per level (light = soft rose fill, medium/heavy = increasingly solid).

**Why:** Zainab specifically asked for blood flow to be tracked as a factor, not just period start/end dates — flow intensity during the period is clinically more useful than a binary "period happening or not."

---

### `components/nutritionist/NewClientFormModal.tsx` — Updated

**Before:** No program-length field — the created `Client` object didn't set `programDurationMonths` at all, which is what broke the Vercel type check once that field existed on the interface.

**After:** New "Program length" section between the plan-name input and the check-in toggles — four preset pills (1/3/6/12 months) plus a custom number input for non-standard durations. Left optional (not part of the `canSave` gate) — a client onboarded without it shows "Not set" on their `PatientProfileCard` rather than a fabricated number.

**Why:** This is the actual long-term fix for the build error — new clients should have Zainab deliberately choose a program length at signup, not silently default to a placeholder. Combined with the previous two files' fallback handling, the app now degrades gracefully for legacy/unset clients while giving a proper path forward for new ones.

---

### What's next
- Phase 2 (15-day cycle management) is now functionally complete: dashboard indicators, gated renewal, real day-by-day consistency reporting, patient enrollment profile, and period flow tracking
- Phase 3 per README (meal plan assignment to a specific client, plan history viewer) is the next major milestone — note that "plan history" now has a natural foundation to build on, since `checkinHistory` currently resets to null on renewal and would need to be archived per-cycle rather than discarded if a history viewer is built


## Session 5 — July 5, 2026 · Plan history: cycle archiving and a past-cycles viewer

### Summary of what was done this session
Closed the gap flagged at the end of Session 4: renewing a cycle previously discarded all of that cycle's data with nothing kept anywhere in the app. `renewPlanCycle` now archives the completed cycle before resetting, and a new Plan History viewer lets Zainab look back at any past cycle's day-by-day data — reusing the same chart components built for the live Cycle Report rather than duplicating that logic.

---

### `lib/mock-data/clients.ts` — Updated

**Before:**
- No archival of any kind — `renewPlanCycle` reset `checkinHistory` to nulls with no record kept of what it had contained

**After:**
- Added `CycleSnapshot` interface: `{ cycleNumber, startDate, checkinHistory, streakAtEnd }`
- Added `cycleHistory?: CycleSnapshot[]` to `Client` — oldest first
- Deliberately does NOT duplicate `periodLogs` into each snapshot — since `periodLogs` are never deleted from the client, a past cycle's period flow can always be reconstructed later from `periodLogs` + that snapshot's `startDate`, so storing only the `startDate` avoids redundant/driftable data
- Seeded Priya's completed Cycle 1 as an example (14/15 days logged, one gap, weight trending down 70.5 → 69.4) so the history viewer has real content immediately

**Why:** Keeps the archive minimal — only what can't be derived elsewhere gets stored, everything else is recomputed on demand from data that already exists.

---

### `lib/store.ts` — Updated

**Before:**
- `renewPlanCycle` reset `checkinHistory` to a fresh null array with no archival step

**After:**
- `renewPlanCycle` now builds a `CycleSnapshot` from the client's current `planCycle` + `checkinHistory` + `streak`, appends it to `cycleHistory`, *then* resets for the new cycle

**Why:** This is the actual fix — the just-finished cycle's data now survives the renewal instead of being silently discarded.

---

### `components/nutritionist/PlanHistoryModal.tsx` — New file

Accordion-style list of archived cycles, most recent first. Each collapsed row shows cycle number, start date, days-logged count, and streak-at-end; expanding a row reveals the same `DailyBarStrip`/`PeriodFlowStrip` charts used in the live `CycleReportModal`, fed from that cycle's frozen `checkinHistory` (and, for PCOS clients, `periodLogs` re-filtered against that cycle's `startDate` via the existing `buildFlowDataForCycle` util).

**Why:** Reusing the exact chart components from the live report means a past cycle's data looks and reads identically to a live one — no separate "history view" visual language to maintain.

---

### `app/(nutritionist)/client/[id]/page.tsx` — Updated

**Before:** No way to see anything about a client's prior cycles.

**After:** A small "View past cycles (N)" text link appears beneath the Cycle Review card — only rendered when `cycleHistory` actually has entries, so clients on their first cycle (Ananya, Fatima, Riya) don't see a dead link.

---

### Git details

Commit:   46283c0
Message:  "moved to next phase"
Branch:   main
Remote:   https://github.com/mustafat52/zeeHeal.git
Files changed: 4
Insertions:    +177
Deletions:     -4
New files created:
components/nutritionist/PlanHistoryModal.tsx
Modified files:
app/(nutritionist)/client/[id]/page.tsx
lib/mock-data/clients.ts
lib/store.ts

---

### What's next
- Phase 2 (15-day cycle management) is now fully complete, including historical archiving — nothing outstanding from the README's Phase 2 list
- Phase 3 per README (meal plan assignment to a specific client, plan history viewer) — the plan history viewer is now done; meal plan assignment (attaching a template to a client) is the one remaining item
- New direction under discussion: going condition-by-condition to deepen each of the 4 client-facing screens (weight-loss, PCOS, hormonal, skincare) beyond their current baseline feature set