-- zeeheal — initial schema
-- Session: Backend Phase A, July 10 2026
-- Source of truth for shape decisions: lib/mock-data/clients.ts, lib/mock-data/plans.ts,
-- lib/store.ts (actual code) — cross-checked against BACKEND_PLAN.md and PROGRESS.md.
-- Where BACKEND_PLAN.md (written July 7) conflicts with the actual code (Sessions 11-12,
-- July 8-9), the code wins. Deltas are called out inline below.

create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. nutritionists
-- ============================================================================
create table nutritionists (
  id            uuid primary key references auth.users(id),
  name          text not null,
  phone         text not null,
  created_at    timestamptz not null default now()
);

-- ============================================================================
-- 2. plan_templates
-- DELTA: did not exist in BACKEND_PLAN.md at all — added in Session 12
-- (lib/store.ts: planTemplates moved from static import to real state,
-- with addPlanTemplate / updatePlanTemplate / deletePlanTemplate).
-- ============================================================================
create table plan_templates (
  id              uuid primary key default gen_random_uuid(),
  nutritionist_id uuid not null references nutritionists(id),
  name            text not null,
  tag             text not null,               -- e.g. "4 weeks" — display only
  description     text not null,
  condition       text not null check (condition in ('weight-loss','pcos','hormonal','skincare')),
  weekly_meals    jsonb not null,               -- { Mon: [{label,items}], Tue: [...], ... }
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================================
-- 3. clients
-- DELTA: `archived` is its own boolean, NOT a value inside `status`'s check —
-- confirmed against Client type (clients.ts) and Session 10 notes (progress.md):
-- getDisplayStatus() derives display state from live signals; `archived` is an
-- explicit manual field that short-circuits it. Keeping them orthogonal, not
-- merged into one enum, matches how the app actually reads them everywhere.
-- DELTA: weekly_plan_* columns added — did not exist in BACKEND_PLAN.md.
-- ============================================================================
create table clients (
  id                       uuid primary key default gen_random_uuid(),
  nutritionist_id          uuid not null references nutritionists(id),
  auth_user_id             uuid references auth.users(id),           -- null until client logs in
  name                     text not null,
  initials                 text not null,
  phone                    text not null,
  condition                text not null check (condition in ('weight-loss','pcos','hormonal','skincare')),
  plan_type                text not null,
  start_date               date not null default current_date,
  streak                   int not null default 0,
  status                   text not null default 'new' check (status in ('on-track','needs-attention','new')),
  archived                 boolean not null default false,
  last_log_at              timestamptz,
  program_duration_months  int,
  goal_weight              numeric,
  checkin_config           jsonb not null default '{}'::jsonb,
  monthly_recap            text,

  -- 15-day cycle tracking. current_cycle_day is the program cycle day
  -- (1-15) — NOT the same thing as daily_checkins.cycle_day below, which is
  -- the client's self-reported menstrual cycle day. Two different concepts
  -- that happen to share the word "cycle" in the mock data; keeping them
  -- clearly separate here on purpose.
  current_cycle_number     int not null default 1,
  current_cycle_start      date not null default current_date,
  current_cycle_day        int not null default 1,

  -- Forked copy of a plan_template at assignment time. Deliberately NOT a
  -- live link: ON DELETE SET NULL means deleting a template never breaks or
  -- alters a client's own copy of the days they were assigned (matches
  -- assignPlanToClient's deep-clone-on-fork behavior in store.ts).
  weekly_plan_template_id   uuid references plan_templates(id) on delete set null,
  weekly_plan_template_name text,               -- denormalized snapshot, survives template rename/delete
  weekly_plan_days          jsonb,              -- { Mon: [{label,items}], ... } — the client's own editable copy

  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index clients_nutritionist_id_idx on clients(nutritionist_id);
create index clients_auth_user_id_idx on clients(auth_user_id);

-- ============================================================================
-- 4. cycle_history
-- Replaces the mock's CycleSnapshot (a frozen copy of the 15-slot
-- checkinHistory array). With real dates in daily_checkins, a past cycle's
-- data is always just a date-range query — no snapshot to keep in sync.
-- ============================================================================
create table cycle_history (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references clients(id) on delete cascade,
  cycle_number   int not null,
  start_date     date not null,
  end_date       date not null,
  streak_at_end  int not null,
  created_at     timestamptz not null default now()
);

create index cycle_history_client_id_idx on cycle_history(client_id);

-- ============================================================================
-- 5. daily_checkins
-- One row per client per real calendar day. Replaces the mock's 15-slot
-- checkinHistory array AND the separate todayCheckin field — "today's
-- checkin" becomes a query (checkin_date = current_date), not a stored field.
-- cycle_day here = self-reported MENSTRUAL cycle day (DailyCheckin.cycleDay
-- in the mock) — distinct from clients.current_cycle_day (the 15-day
-- program cycle). See comment on clients table above.
-- energy column added per your decision — no mock equivalent existed
-- (ProgressPoint.energy was only ever a hand-authored weekly-averaged
-- number with no daily source).
-- ============================================================================
create table daily_checkins (
  id                uuid primary key default gen_random_uuid(),
  client_id         uuid not null references clients(id) on delete cascade,
  checkin_date      date not null,
  weight            numeric,
  sleep_hours       numeric,
  mood              int check (mood between 1 and 5),
  bloating          int check (bloating between 0 and 10),
  energy            int check (energy between 0 and 10),
  activity_type     text,
  activity_minutes  int,
  skin_condition    int check (skin_condition between 0 and 10),
  hair_fall         int check (hair_fall between 0 and 10),
  cycle_day         int,                        -- menstrual cycle day, self-reported
  water_glasses     int,                        -- check-in modal self-report
  water_current     int not null default 0,     -- home-screen tap counter
  water_goal        int not null default 8,
  note              text,
  logged_at         timestamptz,
  unique (client_id, checkin_date)
);

create index daily_checkins_client_id_idx on daily_checkins(client_id);

-- ============================================================================
-- 6. progress_weekly — view, not a table
-- Powers the weight/energy/bloating trend charts on Progress pages and the
-- Cycle Report, computed live from real daily data instead of hand-seeded
-- weekly arrays (ProgressPoint[] in the mock).
-- ============================================================================
create view progress_weekly as
select
  client_id,
  date_trunc('week', checkin_date) as week_start,
  avg(weight)   as avg_weight,
  avg(bloating) as avg_bloating,
  avg(energy)   as avg_energy
from daily_checkins
group by client_id, date_trunc('week', checkin_date)
order by week_start;

-- ============================================================================
-- 7. period_logs + 8. period_flow_logs (PCOS)
-- Mirrors PeriodLog.dailyFlow[] from the mock as its own table rather than
-- a nested jsonb array, so flow entries can be upserted by date without
-- read-modify-write races.
-- ============================================================================
create table period_logs (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references clients(id) on delete cascade,
  start_date     date not null,
  end_date       date,
  cycle_length   int,
  created_at     timestamptz not null default now()
);

create index period_logs_client_id_idx on period_logs(client_id);

create table period_flow_logs (
  id             uuid primary key default gen_random_uuid(),
  period_log_id  uuid not null references period_logs(id) on delete cascade,
  flow_date      date not null,
  intensity      text not null check (intensity in ('light','medium','heavy')),
  unique (period_log_id, flow_date)
);

-- ============================================================================
-- 9. meals
-- Real per-date rows. NOTE (flagged, not solved here): how a given date's
-- rows get generated from weekly_plan_days (or the condition fallback set)
-- is an application-layer decision, not a schema one — revisit when wiring
-- up the client home/plan pages.
-- ============================================================================
create table meals (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references clients(id) on delete cascade,
  meal_date       date not null,
  label           text not null,          -- "Breakfast", "Lunch", etc
  time            text,
  items           text not null,
  status          text not null default 'pending' check (status in ('pending','done')),
  reasoning       text,
  log_note        text,
  log_photo_path  text,                   -- Storage path, never a public URL — see storage policies migration
  logged_at       timestamptz
);

create index meals_client_id_date_idx on meals(client_id, meal_date);

-- ============================================================================
-- 10. session_notes
-- ============================================================================
create table session_notes (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references clients(id) on delete cascade,
  note_date    date not null default current_date,
  text         text not null,
  created_at   timestamptz not null default now()
);

create index session_notes_client_id_idx on session_notes(client_id);

-- ============================================================================
-- 11. messages — chat/inbox (confirmed in Phase A scope)
-- ============================================================================
create table messages (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references clients(id) on delete cascade,
  sender          text not null check (sender in ('client','nutritionist')),
  text            text,
  audio_path      text,                    -- Storage path, see storage policies migration
  audio_duration  int,
  sent_at         timestamptz not null default now()
);

create index messages_client_id_sent_at_idx on messages(client_id, sent_at);

-- ============================================================================
-- updated_at trigger (clients, plan_templates)
-- ============================================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger clients_set_updated_at
  before update on clients
  for each row execute function set_updated_at();

create trigger plan_templates_set_updated_at
  before update on plan_templates
  for each row execute function set_updated_at();