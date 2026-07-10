# zeeheal — Backend Plan

> Companion to README.md, CHANGELOG.md, and DATA_AUDIT.md.
> Written July 7, 2026. Target: working backend for a friends/family beta by **July 12**,
> hardened for real patients by **August**.

---

## 0. Timeline reality check — read this first

Five days is enough to stand up a real, persistent backend for a small beta. It is **not**
enough time to also rewire all ~25 files in this app from Zustand mock state to live backend
calls, build production-grade auth (SMS provider setup has its own lead time — see §5), AND
test all four condition flows end to end. Something has to give, deliberately, not by accident
under deadline pressure.

**Recommended split:**

| | Phase A — by July 12 | Phase B — by August |
|---|---|---|
| Auth | Simplified (see §5) | Phone OTP, per README's original plan |
| Data | Real, persisted, backed up | Same, hardened + audited |
| Media | Working uploads | Same, with cleanup/retention policy |
| Scope | Core flows only (see §6 for what's cut) | Everything, including chat/inbox if not done in A |
| Users | Friends & family, told it's a beta | Real patients — real health data, real stakes |

I can generate every migration file, RLS policy, and the application-side code changes. **I
cannot provision your actual Supabase project, run migrations against it, set environment
variables, or set up an SMS provider account** — those are real steps that take real time
within your 5 days, and should start today in parallel with anything I generate.

---

## 1. Stack decision: Supabase

This was already README's stated target ("Backend: Supabase (Postgres + Realtime + Auth)
recommended"), and it's the right call given the timeline — managed Postgres, built-in Auth
(including phone OTP), built-in Storage, a first-class Next.js SDK, and a generous free tier.
Building a custom Express/Node API layer instead would mean hand-building auth, hand-building
every CRUD endpoint, and hand-building authorization logic that Supabase gives for free via
Row Level Security. Given 5 days, that difference is the difference between shipping and not.

**Pattern:** Next.js talks to Supabase directly via `@supabase/supabase-js`, secured by RLS —
not a custom REST layer in between. A small number of operations that need atomicity or
server-only logic (flagged in §4) go through Postgres RPC functions instead of raw
multi-table client writes.

---

## 2. Database schema

Derived directly from the current TypeScript types across `lib/mock-data/clients.ts` and
`lib/store.ts`. Where the real-DB version differs meaningfully from the mock, it's noted —
several of these are straight improvements the mock's architecture couldn't support.

### 2.1 `nutritionists`
```sql
id            uuid primary key references auth.users(id)
name          text not null
phone         text not null
created_at    timestamptz default now()
```
One row for Zainab today; designed so a second nutritionist could exist later without a
schema change.

### 2.2 `clients`
```sql
id                      uuid primary key default gen_random_uuid()
nutritionist_id         uuid not null references nutritionists(id)
auth_user_id            uuid references auth.users(id)          -- null until client logs in
name                    text not null
initials                text not null
phone                   text not null
condition               text not null check (condition in ('weight-loss','pcos','hormonal','skincare'))
plan_type               text not null
start_date              date not null default current_date
streak                  int not null default 0
status                  text not null default 'new' check (status in ('on-track','needs-attention','new','archived'))
last_log_at             timestamptz
program_duration_months int
goal_weight             numeric
checkin_config          jsonb not null default '{}'::jsonb
monthly_recap           text
current_cycle_number    int not null default 1
current_cycle_start     date not null default current_date
current_cycle_day       int not null default 1
created_at              timestamptz default now()
updated_at              timestamptz default now()
```
**Design notes:**
- `checkin_config` as JSONB, not a normalized table — it's always read/written as a whole
  object, never queried field-by-field, so a table with 9 boolean columns would add
  complexity for zero query benefit.
- Current-cycle fields stay inline on `clients` (not a separate `plan_cycles` table) since
  there's only ever one *active* cycle per client, and that's how the app actually reads it
  everywhere. `cycle_total_days` isn't a column — it's always 15, a constant in code.
- `auth_user_id` is nullable: a client can exist (created by Zainab) before they've ever
  logged in themselves.

### 2.3 `cycle_history`
```sql
id             uuid primary key default gen_random_uuid()
client_id      uuid not null references clients(id)
cycle_number   int not null
start_date     date not null
end_date       date not null
streak_at_end  int not null
created_at     timestamptz default now()
```
**Real improvement over the mock:** the mock's `CycleSnapshot` had to freeze a copy of
`checkinHistory` at renewal time, because relative-date strings ("3 days ago") made it
impossible to reliably re-derive what a past cycle looked like later. With **real dates**,
this problem disappears — a past cycle's daily data is always just:
```sql
select * from daily_checkins
where client_id = :id and checkin_date between :start_date and :end_date
```
No snapshot to keep in sync, no risk of it going stale. `Plan History` becomes a query, not a
copy.

### 2.4 `daily_checkins`
```sql
id                uuid primary key default gen_random_uuid()
client_id         uuid not null references clients(id)
checkin_date      date not null
weight            numeric
sleep_hours       numeric
mood              int check (mood between 1 and 5)
bloating          int check (bloating between 0 and 10)
activity_type     text
activity_minutes  int
skin_condition    int check (skin_condition between 0 and 10)
hair_fall         int check (hair_fall between 0 and 10)
cycle_day         int
water_glasses     int
water_current     int not null default 0
water_goal        int not null default 8
note              text
logged_at         timestamptz
unique (client_id, checkin_date)
```
One row per client per **real calendar day** — this directly replaces the mock's 15-slot
`checkinHistory` array. Straight upgrade: no reset-on-cycle-renewal data loss, no cycle-day
array-index math anywhere in the app, and it's what makes `cycle_history` above work as a pure
query.

**Recommendation flagged for a decision (§8):** add a proper `energy` column here. In the
mock, energy only ever existed as a weekly-averaged number with no real daily source —
`DATA_AUDIT.md` never fully closed that gap because there was nowhere for the client to
actually log it day to day. Moving to a real backend is the natural point to fix this
properly rather than carry the same gap forward.

### 2.5 `progress_points` — becomes a VIEW, not a table
```sql
create view progress_weekly as
select
  client_id,
  date_trunc('week', checkin_date) as week_start,
  avg(weight)     as avg_weight,
  avg(bloating)   as avg_bloating,
  avg(energy)     as avg_energy   -- assuming energy column added per 2.4
from daily_checkins
group by client_id, date_trunc('week', checkin_date)
order by week_start;
```
No more hand-seeded weekly arrays — the weight/energy trend charts on Progress pages and in
the Cycle Report compute themselves from real daily data.

### 2.6 `period_logs`
```sql
id             uuid primary key default gen_random_uuid()
client_id      uuid not null references clients(id)
start_date     date not null
end_date       date
cycle_length   int
created_at     timestamptz default now()
```

### 2.7 `period_flow_logs`
```sql
id             uuid primary key default gen_random_uuid()
period_log_id  uuid not null references period_logs(id)
flow_date      date not null
intensity      text not null check (intensity in ('light','medium','heavy'))
unique (period_log_id, flow_date)
```

### 2.8 `meals`
```sql
id              uuid primary key default gen_random_uuid()
client_id       uuid not null references clients(id)
meal_date       date not null
label           text not null          -- "Breakfast", "Lunch", etc
time            text
items           text not null
status          text not null default 'pending' check (status in ('pending','done'))
reasoning       text
log_note        text
log_photo_path  text                    -- Storage path, not a public URL — see §3
logged_at       timestamptz
```

### 2.9 `session_notes`
```sql
id           uuid primary key default gen_random_uuid()
client_id    uuid not null references clients(id)
note_date    date not null default current_date
text         text not null
created_at   timestamptz default now()
```

### 2.10 `messages` — chat (unaudited scope, see note)
```sql
id              uuid primary key default gen_random_uuid()
client_id       uuid not null references clients(id)
sender          text not null check (sender in ('client','nutritionist'))
text            text
audio_path      text                     -- Storage path, see §3
audio_duration  int
sent_at         timestamptz default now()
```
**Caveat:** I've never seen the actual chat/inbox page source in any session, so this schema
is inferred from `CHANGELOG.md`'s description of the `Message` type, not verified against
real code. If chat is in Phase A scope, I need those files before I can wire them up —
otherwise this table exists but nothing implements it yet.

---

## 3. Media storage

Three private (non-public) Supabase Storage buckets:

| Bucket | Path pattern | Written by |
|---|---|---|
| `meal-photos` | `{client_id}/{meal_id}-{timestamp}.jpg` | `LogMealModal` |
| `skin-photos` | `{client_id}/{date}.jpg` | Skincare Home "Take today's photo" (currently a placeholder button with no upload wired — this is new functionality, not a port) |
| `voice-notes` | `{client_id}/{message_id}.webm` | `VoiceRecorder` |

**Never store public URLs in the database** — store the *path* only (`log_photo_path`,
`audio_path` above), and generate a signed, time-limited URL at read time via
`supabase.storage.from(bucket).createSignedUrl(path, expiresIn)`. This matters for health
data specifically: a permanent public URL to a skin photo is a real privacy problem if it
ever leaks (search-indexed, shared link, etc.) in a way a short-lived signed URL isn't.

Storage bucket policies mirror the RLS pattern in §6 — a client can only read/write objects
under their own `client_id` prefix; Zainab can read (not write) objects under any client she
manages.

---

## 4. API surface — every store action, mapped

Every one of the 16 actions currently in `lib/store.ts` (verified against the actual file,
not recalled from memory), and what it becomes:

| Store action | Tables touched | Direct client+RLS, or needs an RPC? |
|---|---|---|
| `addClient` | `clients` insert | Direct — RLS restricts insert to `nutritionist_id = auth.uid()` |
| `updateClientProfile` | `clients` update | Direct |
| `setCheckinConfig` | `clients.checkin_config` update | Direct |
| `toggleMeal` | `meals` update (status) | Direct |
| `logMeal` | `meals` update + Storage upload | Direct (two calls: upload, then update row with path) |
| `addWater` | `daily_checkins` upsert (water_current) | Direct |
| `logCheckin` | `daily_checkins` upsert | Direct |
| `logPeriodStart` | `period_logs` insert | Direct |
| `logPeriodEnd` | `period_logs` update | Direct |
| `logPeriodFlow` | `period_flow_logs` upsert | Direct |
| `renewPlanCycle` | `cycle_history` insert + `clients` update (reset cycle fields) | **RPC** — must be atomic; a partial write here (history saved but cycle not reset, or vice versa) corrupts state in a way that's hard to detect later |
| `setMonthlyRecap` | `clients.monthly_recap` update | Direct |
| `setMealReasoning` | `meals.reasoning` update | Direct |
| `addSessionNote` | `session_notes` insert | Direct |
| `setActiveClientId` | Client-side only (which client's data is currently displayed) | N/A — not a backend concern, pure UI state |
| `setViewMode` | Client-side only (client vs. nutritionist view toggle) | N/A — same |

**Only one action genuinely needs a Postgres function:** `renewPlanCycle`. Everything else is
a straightforward, safe direct call once RLS policies are in place. This is a much smaller
"real backend" surface than "build 16 API routes" might have implied — most of this is
Supabase doing the work.

**Two operations exist in the real backend that had no mock equivalent at all** (new
functionality, not a port of existing code): generating signed URLs for stored media, and the
`renewPlanCycle` RPC's transaction logic itself.

---

## 5. Auth plan — and the real timeline risk

**Zainab:** single account, email/password or magic link via Supabase Auth. She's one person;
OTP complexity buys nothing here. Trivial to set up today.

**Clients — this is the actual risk to July 12:** README's original plan (phone OTP,
"appropriate for Indian wellness audience") is the right long-term choice, but Supabase's
phone auth requires an SMS provider (Twilio, MessageBird) with its own account setup, and in
India specifically, SMS sender ID registration/DLT compliance can introduce delays that are
outside your control and hard to predict from here.

**Recommendation for Phase A:** don't gate the July 12 beta on phone OTP working. Use Supabase
magic-link email auth for the friends/family round instead — every tester has email, it's a
5-minute Supabase config change, zero external dependencies. Move to phone OTP as a defined
Phase B task with its own lead time, not squeezed into this week.

---

## 6. What Phase A deliberately cuts (say so, don't discover it under pressure)

- Phone OTP (→ magic link for now, per §5)
- Chat/inbox, if those files aren't available to wire up in time (→ confirm scope, §8)
- Push notifications (already README Phase 4, unaffected by this plan)
- Automatic `status` transitions (flagged in the earlier planning-session entry, still open,
  not required for a beta to function)
- Client deletion/archiving UI (also still open from that same planning entry — not blocking
  for a beta with a handful of known testers)

---

## 7. Migration path for the 4 existing mock personas

Open question, not yet decided (see §8): do Priya/Ananya/Fatima/Riya get seeded into the real
database as demo accounts your friends/family can explore, or does every beta tester create a
fresh account from scratch? Seeding them gives testers something realistic to look at
immediately (skipping the "empty app" first impression) but means real people are looking at
what's still fictional data attributed to fictional names — worth deciding deliberately.

---

## 8. Decisions needed before I generate migrations and rewire the app

1. **Confirm Supabase** — proceeding on that assumption unless you say otherwise.
2. **Auth for Phase A** — magic link (recommended) vs. attempting phone OTP now vs. a even-simpler shared passcode per client for just this beta week.
3. **Add a real `energy` daily field** — yes/no. Recommended, closes a real audit gap for free while we're already redesigning this table.
4. **Chat/inbox in Phase A scope?** — if yes, I need those page files; I've never seen them.
5. **Seed the 4 mock personas as demo accounts, or fresh signups only for beta testers?**
6. **Confirm you'll handle Supabase project creation + env vars in parallel** — I can generate SQL/RLS/application code, but provisioning the actual project and running migrations against it is on your side, and needs to start now, not after this doc is finalized.

Once these are locked, next step is generating the actual SQL migration files, RLS policies,
and a `lib/supabase/` client setup — then working through the existing pages one by one,
replacing Zustand store calls with real Supabase calls, starting with whichever flow is
highest priority for the beta.