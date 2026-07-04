# zeeheal — Project README

> **This file is the single source of truth for this project.**
> If you are starting a new Claude conversation, paste this file in first.
> All change history lives in `CHANGELOG.md`.

---

## What this is

A custom-built PWA (Progressive Web App) for **Zainab Burhanuddin**, a Registered Nutritionist based in India (Instagram: `@_zeeheal._`). The app has two sides:

- **Client side** — what her patients use daily (meal plan, logging, progress, messaging)
- **Nutritionist side** — what Zainab uses to manage all her clients (dashboard, inbox, client profiles, prep for calls)

This is currently a **frontend-only demo with static mock data**. Nothing persists after a browser refresh. There is no backend, no database, no real authentication. The purpose of this build is a high-fidelity clickable demo to get Zainab bought in before building the real product.

Deployed on Vercel. Opens and installs as a PWA on mobile (Add to Home Screen).

---

## The business context

Zainab previously managed all client communication across WhatsApp, Instagram DMs, and phone calls — no single place to see all clients. This app consolidates everything: plans, daily logs, progress, messaging, and calling into one branded platform. The pitch is that clients see a professional, personal product, not a generic app — which increases her brand value and client retention.

She treats 4 conditions:
1. **Weight loss**
2. **PCOS**
3. **Hormonal imbalance**
4. **Skincare / skin issues**

Each condition requires different daily tracking fields, different home screen content, and different plan structures.

---

## Plan structure

Zainab works in **15-day cycles**. She sets a plan for a client, reviews progress at day 15, and updates the plan for the next 15 days. The app needs to track:
- Which 15-day cycle a client is currently on
- What day of the current cycle they are on (Day 1–15)
- Plan history across cycles

**This 15-day cycle tracking is not yet built — it is the next priority after condition-specific home screens.**

---

## Tech stack

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js App Router | 14.2.5 |
| Language | TypeScript | ^5.5.4 |
| Styling | Tailwind CSS | ^3.4.7 |
| Animation | Framer Motion | ^11.3.19 |
| Charts | Recharts | ^2.12.7 |
| State | Zustand | ^4.5.4 |
| Icons | Lucide React | ^0.414.0 |
| PWA | next-pwa | ^5.6.0 |
| Fonts | Fraunces + Inter | via next/font/google |
| Deploy | Vercel | zero config |

No backend. No database. No auth. All data is in-memory via Zustand, seeded from `lib/mock-data/`.

---

## Design system

| Token | Value | Usage |
|---|---|---|
| `ivory` | `#FAF8F3` | Page background |
| `sage-50` | `#F4F6F0` | Light fills |
| `sage-100` | `#EDF1E6` | Client header bands, card fills |
| `sage-600` | `#7C9473` | Primary buttons, active states |
| `clay-100` | `#F6E8D8` | Nutritionist header band |
| `clay-600` | `#B97D45` | Nutritionist accent, attention states |
| `moss-900` | `#3F4438` | Primary text |
| `moss-400` | `#8A8F7E` | Muted/secondary text |

**Fonts:** Fraunces (`--font-fraunces`, serif, headings + monthly recap) and Inter (`--font-inter`, body/UI).

**Shape:** 16–20px radii throughout. Soft `shadow-card` on white cards. No dark mode.

**Android Chrome fix:** Both bottom navs use solid `bg-white` (not `backdrop-blur`) and charts use fixed pixel widths via `useRef` (not `ResponsiveContainer`) to prevent GPU compositor tearing on mid-range Android devices.

---

## Project file structure

```
zeeheal-app/
├── app/
│   ├── page.tsx                              # Root → redirects to /login
│   ├── layout.tsx                            # Root layout, Fraunces+Inter fonts, PWA meta
│   ├── globals.css                           # Tailwind base + .tap-scale (will-change: transform)
│   ├── manifest.ts                           # PWA manifest (name, icons, theme color)
│   ├── login/
│   │   └── page.tsx                          # Login + WelcomeTransition animation
│   ├── (client)/                             # CLIENT SIDE — route group, no URL prefix
│   │   ├── layout.tsx                        # ClientBottomNav wrapper
│   │   ├── home/page.tsx                     # Today's plan, check-in card, meal log
│   │   ├── plan/page.tsx                     # Full week meal plan, day picker
│   │   ├── progress/page.tsx                 # Zainab's note + weight/energy charts
│   │   └── chat/page.tsx                     # Chat + voice notes + tel: call button
│   └── (nutritionist)/                       # NUTRITIONIST SIDE
│       ├── layout.tsx                        # NutritionistBottomNav wrapper
│       ├── dashboard/page.tsx                # Client list, digest, search, add client
│       ├── inbox/page.tsx                    # All client chats + call icon
│       ├── plan-builder/page.tsx             # Plan template library
│       └── client/[id]/
│           ├── page.tsx                      # Client detail: stats, check-in, prep sheet
│           └── chat/page.tsx                 # Per-client chat + voice + tel: call
├── components/
│   ├── ui/
│   │   ├── Button.tsx                        # primary / secondary / ghost
│   │   ├── Card.tsx                          # White card with shadow-card
│   │   ├── Pill.tsx                          # sage / clay / neutral tags
│   │   ├── LogoutButton.tsx                  # Pushes to /login
│   │   └── WelcomeTransition.tsx             # Full-screen animated welcome overlay
│   ├── client/
│   │   ├── ClientBottomNav.tsx               # Home / Plan / Progress / Ask Zainab
│   │   ├── DailyCheckinModal.tsx             # Combined daily log (config-driven)
│   │   ├── LogMealModal.tsx                  # Per-meal: photo, symptom tags, note
│   │   ├── VoiceRecorder.tsx                 # MediaRecorder-based audio capture
│   │   └── VoiceMessageBubble.tsx            # Waveform playback UI
│   └── nutritionist/
│       ├── NutritionistBottomNav.tsx         # Clients / Plans / Inbox
│       ├── DigestCard.tsx                    # Auto-generated status summary
│       ├── PrepSheetModal.tsx                # Pre-call one-page client summary
│       ├── ClientProfileFormModal.tsx        # Edit check-in fields for existing client
│       └── NewClientFormModal.tsx            # Full onboarding: name, phone, condition, fields
├── lib/
│   ├── store.ts                              # Zustand store + all actions
│   ├── digest.ts                             # DigestItem generator from client data
│   └── mock-data/
│       ├── clients.ts                        # All types + 3 seeded clients + ZAINAB_PHONE
│       ├── messages.ts                       # Message type + chat threads
│       └── plans.ts                          # 4 plan templates
├── public/icons/                             # PWA icons (placeholder, need real assets)
├── next.config.js                            # next-pwa (disabled in dev)
├── tailwind.config.ts                        # Design tokens
├── tsconfig.json
├── postcss.config.js
├── .gitignore
├── README.md                                 # This file
└── CHANGELOG.md                              # File change history
```

---

## Routing map

| URL | Renders |
|---|---|
| `/` | Redirects → `/login` |
| `/login` | Shared login + welcome animation |
| `/home` | Client home screen |
| `/plan` | Client week plan |
| `/progress` | Client progress + monthly note |
| `/chat` | Client chat with Zainab |
| `/dashboard` | Nutritionist client list |
| `/inbox` | Nutritionist inbox |
| `/plan-builder` | Nutritionist plan templates |
| `/client/[id]` | Nutritionist client detail |
| `/client/[id]/chat` | Nutritionist per-client chat |

---

## Data model overview

### Client (lib/mock-data/clients.ts)
```
id, name, initials, phone, planType, startDate, streak,
status ("on-track" | "needs-attention" | "new"),
lastLog, todayPlan (DayPlan), progress (ProgressPoint[]),
notes, monthlyRecap, todayCheckin (DailyCheckin),
checkinConfig (CheckinConfig)
```

### DayPlan
```
date, meals: [{ id, label, time, items, status, log?, reasoning? }],
water: { current, goal }
```

### DailyCheckin (all optional)
```
weight, sleepHours, mood, bloating, activityType, activityMinutes,
skinCondition, hairFall, cycleDay, waterGlasses, note, loggedAt
```

### CheckinConfig
Record of CheckinFieldKey → boolean. Keys:
`weight | sleepHours | mood | bloating | activity | skinCondition | hairFall | cycleDay | waterGlasses`

If `checkinConfig` is empty/missing, `DailyCheckinModal` shows all fields (safe fallback).

### Message (lib/mock-data/messages.ts)
```
id, sender ("client" | "nutritionist"), text, time,
audioUrl? (voice note blob URL), audioDuration? (seconds)
```

---

## Seeded mock clients

| Client | Condition | Status | Streak | Has check-in today |
|---|---|---|---|---|
| Priya Menon | Gut health reset | On track | 12 days | Yes (seeded) |
| Ananya Reddy | PCOS / hormone balance | Needs attention | 3 days | No |
| Fatima Sheikh | Weight loss | New | 2 days | No |

Each client has:
- Per-meal `reasoning` text (Zainab's voice explaining why she chose that meal)
- A `monthlyRecap` paragraph written as a personal note from Zainab
- A `checkinConfig` appropriate to their condition

---

## Store actions (lib/store.ts)

| Action | What it does |
|---|---|
| `setViewMode(mode)` | Switch client / nutritionist view |
| `setActiveClientId(id)` | Set which client is logged in |
| `toggleMeal(clientId, mealId)` | Flip meal done ↔ pending |
| `logMeal(clientId, mealId, log)` | Save photo + note to meal |
| `addWater(clientId)` | Increment water counter (max = goal) |
| `logCheckin(clientId, checkin)` | Save full daily check-in |
| `setCheckinConfig(clientId, config)` | Update which fields client logs |
| `addClient(client)` | Add new client object to array |

---

## What is built ✅

### Client side
- [x] Login + welcome animation ("Welcome back, [name]")
- [x] Home screen: greeting, streak, water, meal plan for the day
- [x] Per-meal "Log" button → camera/photo modal + symptom tags + note
- [x] "Why did Zainab pick this?" expandable reasoning per meal
- [x] Daily check-in card → combined modal (mood, weight, sleep, bloating, activity + condition-specific)
- [x] Check-in fields driven by per-client `checkinConfig`
- [x] Full week meal plan with day picker (Mon–Sun)
- [x] Progress screen: Zainab's monthly note + weight chart + energy chart
- [x] Chat: text messages, voice notes, tel: call button

### Nutritionist side
- [x] Login + welcome animation ("Welcome, Zainab")
- [x] Dashboard: clay header, stat cards, smart daily digest, searchable client list, + new client button
- [x] New client onboarding form: name, phone, condition preset, check-in field toggles
- [x] Client detail: prep-for-call sheet, check-in setup editor, today's check-in display, weight chart, session notes, Message + Call buttons
- [x] Per-client chat: text, voice notes, tel: call button
- [x] Inbox: all clients, last message preview, phone icon per row
- [x] Plan template library (display only, no assignment yet)

---

## What is NOT built yet ❌

### Priority 1 — Condition-specific client home screens
- [ ] **Weight loss home screen** — calorie/macro tracking progress, step count, weight trend on home
- [ ] **PCOS home screen** — period tracker calendar (client marks start/end of period; Zainab sees status), symptom log prominent
- [ ] **Hormonal imbalance home screen** — symptom tracking, mood patterns, relevant daily prompts
- [ ] **Skincare home screen** — skin condition daily photo log, routine tracker, trigger food log

### Priority 2 — 15-day plan cycles
- [ ] `cycleDay` field on Client (Day 1–15, resets each cycle)
- [ ] `cycleNumber` field (which 15-day cycle this is)
- [ ] Home screen shows "Day X of 15" with a progress bar
- [ ] Nutritionist dashboard shows which clients are at/near Day 15
- [ ] Nutritionist can push a new plan at the end of a cycle
- [ ] Plan history (past cycles, what changed)

### Priority 3 — Real product infrastructure
- [ ] Backend: Supabase (Postgres + Realtime + Auth) recommended
- [ ] Real authentication (phone OTP — appropriate for Indian wellness audience)
- [ ] Push notifications (shape already in `checkinConfig`)
- [ ] Real-time chat (Supabase Realtime or Pusher)
- [ ] Meal plan assignment (attach template to client)
- [ ] PWA icons with real zeeheal brand assets

---

## Build order going forward

```
Phase 1 — All 4 condition-specific client home screens
  1. Weight loss home screen
  2. PCOS home screen (period tracker calendar is the key feature)
  3. Hormonal imbalance home screen
  4. Skincare home screen

Phase 2 — 15-day cycle tracking
  5. Add cycle fields to data model
  6. Client home screen shows Day X of 15
  7. Nutritionist dashboard shows cycle status per client
  8. Plan renewal flow at Day 15

Phase 3 — Nutritionist side updates
  9. Meal plan assignment to specific client
  10. Plan history viewer

Phase 4 — Real product
  11. Backend (Supabase)
  12. Real auth
  13. Push notifications
  14. Real-time chat
```

---

## How to run

```bash
npm install
npm run dev
# → http://localhost:3000 (redirects to /login)
```

## How to deploy to Vercel

1. Push to GitHub
2. vercel.com → New Project → import repo
3. Default settings (Next.js auto-detected)
4. Deploy → open link on phone → Add to Home Screen

No `vercel.json` needed.

---

## Key decisions

| Decision | Reason |
|---|---|
| PWA not native app | No App Store wait, installs on home screen, works on all devices from one URL |
| No backend in demo | Validate with Zainab first, backend adds weeks. Mock data is sufficient for sign-off. |
| `tel:` links not in-app WebRTC | Simpler, zero infra, works immediately. Zainab's suggestion. |
| Fixed-width charts | `ResponsiveContainer` ResizeObserver fires during scroll and causes GPU tearing on Android Chrome |
| No `backdrop-blur` on fixed elements | Same GPU tearing issue on Android Chrome with `position: fixed` + `backdrop-filter` |
| Condition-specific check-in config | Each of 4 conditions tracks different symptoms — one form is wrong for everyone |
| `checkinConfig` shaped for future reminders | When push notifications are added, same config drives what reminders each client gets |
| Separate `NewClientFormModal` vs `ClientProfileFormModal` | Onboarding (new client) and editing (existing client fields) are different moments — keeping them separate keeps each focused |
| 15-day cycles | This is Zainab's actual practice cadence. The app must model it to be genuinely useful, not just a display layer. |