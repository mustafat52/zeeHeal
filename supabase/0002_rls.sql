-- zeeheal — Row Level Security policies
-- Session: Backend Phase A, July 10 2026
-- Hardcoded to a single nutritionist (Zainab), per decision: simplicity over
-- future-proofing for a second nutritionist. If that ever changes, every
-- policy using is_nutritionist() below is the single place to revisit —
-- swap it for a nutritionist_id = auth.uid() comparison instead.

-- ============================================================================
-- Helper functions
-- ============================================================================

-- True if the calling auth user IS the (one) nutritionist.
create or replace function is_nutritionist()
returns boolean as $$
  select exists (select 1 from nutritionists where id = auth.uid());
$$ language sql stable security definer set search_path = public;

-- True if the calling auth user is the client who owns this client_id row.
create or replace function client_owns(target_client_id uuid)
returns boolean as $$
  select exists (
    select 1 from clients
    where id = target_client_id and auth_user_id = auth.uid()
  );
$$ language sql stable security definer set search_path = public;

-- ============================================================================
-- Enable RLS everywhere
-- ============================================================================
alter table nutritionists     enable row level security;
alter table plan_templates    enable row level security;
alter table clients           enable row level security;
alter table cycle_history     enable row level security;
alter table daily_checkins    enable row level security;
alter table period_logs       enable row level security;
alter table period_flow_logs  enable row level security;
alter table meals             enable row level security;
alter table session_notes     enable row level security;
alter table messages          enable row level security;

-- ============================================================================
-- nutritionists — she can see/update only her own row
-- ============================================================================
create policy "nutritionist reads own row"
  on nutritionists for select
  using (id = auth.uid());

create policy "nutritionist updates own row"
  on nutritionists for update
  using (id = auth.uid());

-- ============================================================================
-- plan_templates — nutritionist only, full CRUD. Clients never read the
-- template directly; they only ever see their own forked copy on
-- clients.weekly_plan_days.
-- ============================================================================
create policy "nutritionist full access to plan_templates"
  on plan_templates for all
  using (is_nutritionist())
  with check (is_nutritionist());

-- ============================================================================
-- clients
-- Nutritionist: full CRUD on every client (single-nutritionist app).
-- Client: read-only access to their own row. No client-side UPDATE — every
-- store action a client can trigger (toggleMeal, logMeal, addWater,
-- logCheckin, period logging, sendMessage) writes to a CHILD table, never
-- to clients directly.
-- ============================================================================
create policy "nutritionist full access to clients"
  on clients for all
  using (is_nutritionist())
  with check (is_nutritionist());

create policy "client reads own row"
  on clients for select
  using (auth_user_id = auth.uid());

-- ============================================================================
-- cycle_history — read-only for both sides. Writes only ever happen via the
-- renewPlanCycle RPC (next migration), which runs as security definer and
-- bypasses these policies — so no INSERT policy is needed for either side.
-- ============================================================================
create policy "nutritionist reads cycle_history"
  on cycle_history for select
  using (is_nutritionist());

create policy "client reads own cycle_history"
  on cycle_history for select
  using (client_owns(client_id));

-- ============================================================================
-- daily_checkins
-- Client logs their own check-ins (insert/update/select own rows only).
-- Nutritionist has full access (PrepSheetModal reads across clients; she may
-- also correct a client's entry).
-- ============================================================================
create policy "nutritionist full access to daily_checkins"
  on daily_checkins for all
  using (is_nutritionist())
  with check (is_nutritionist());

create policy "client manages own daily_checkins"
  on daily_checkins for all
  using (client_owns(client_id))
  with check (client_owns(client_id));

-- ============================================================================
-- period_logs / period_flow_logs — same pattern: client manages their own,
-- nutritionist has full read/write across all clients.
-- ============================================================================
create policy "nutritionist full access to period_logs"
  on period_logs for all
  using (is_nutritionist())
  with check (is_nutritionist());

create policy "client manages own period_logs"
  on period_logs for all
  using (client_owns(client_id))
  with check (client_owns(client_id));

create policy "nutritionist full access to period_flow_logs"
  on period_flow_logs for all
  using (is_nutritionist())
  with check (is_nutritionist());

create policy "client manages own period_flow_logs"
  on period_flow_logs for all
  using (
    exists (
      select 1 from period_logs pl
      where pl.id = period_flow_logs.period_log_id
        and client_owns(pl.client_id)
    )
  )
  with check (
    exists (
      select 1 from period_logs pl
      where pl.id = period_flow_logs.period_log_id
        and client_owns(pl.client_id)
    )
  );

-- ============================================================================
-- meals
-- Client can SELECT and UPDATE their own meal rows (toggleMeal / logMeal —
-- status, log_note, log_photo_path, logged_at). Client does NOT insert or
-- delete meal rows — row creation is a nutritionist/system action (assigning
-- a plan, or the daily-generation job flagged as an open item in 0001).
-- Nutritionist has full CRUD (sets reasoning, corrects entries, etc).
-- ============================================================================
create policy "nutritionist full access to meals"
  on meals for all
  using (is_nutritionist())
  with check (is_nutritionist());

create policy "client reads own meals"
  on meals for select
  using (client_owns(client_id));

create policy "client updates own meals"
  on meals for update
  using (client_owns(client_id))
  with check (client_owns(client_id));

-- ============================================================================
-- session_notes — nutritionist's private notes. Clients never see these
-- (no session note UI exists on the client side, and these read as
-- Zainab's private prep material, e.g. PrepSheetModal).
-- ============================================================================
create policy "nutritionist full access to session_notes"
  on session_notes for all
  using (is_nutritionist())
  with check (is_nutritionist());

-- ============================================================================
-- messages — chat. Each side can read/send within their own thread.
-- Nutritionist can read/send across every client's thread (single inbox).
-- Client can only read/send within their own thread, and the sender they
-- write as must match who they are — a client can never post a message
-- with sender = 'nutritionist'.
-- ============================================================================
create policy "nutritionist full access to messages"
  on messages for all
  using (is_nutritionist())
  with check (is_nutritionist());

create policy "client reads own thread"
  on messages for select
  using (client_owns(client_id));

create policy "client sends in own thread as client"
  on messages for insert
  with check (client_owns(client_id) and sender = 'client');