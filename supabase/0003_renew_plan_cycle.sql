-- zeeheal — renew_plan_cycle RPC
-- Session: Backend Phase A, July 10 2026
-- The one store action (per BACKEND_PLAN.md §4) that genuinely needs a
-- Postgres function instead of a direct client+RLS write: a partial write
-- here (cycle_history saved but clients' cycle fields not reset, or vice
-- versa) corrupts state in a way that's hard to detect later. Wrapping both
-- writes in one function makes them succeed or fail together.
--
-- security definer means this function runs with the privileges of its
-- owner, bypassing RLS on the tables it touches — which is exactly why it
-- does its own explicit is_nutritionist() authorization check up front,
-- rather than relying on RLS to gate it. Do not remove that check.

create or replace function renew_plan_cycle(target_client_id uuid)
returns clients as $$
declare
  updated_client clients;
  client_row     clients;
begin
  if not is_nutritionist() then
    raise exception 'not authorized';
  end if;

  -- Lock the row so a double-click / retry can't renew the same cycle twice
  -- concurrently and produce two cycle_history rows for one cycle.
  select * into client_row
  from clients
  where id = target_client_id
  for update;

  if not found then
    raise exception 'client not found: %', target_client_id;
  end if;

  insert into cycle_history (client_id, cycle_number, start_date, end_date, streak_at_end)
  values (
    client_row.id,
    client_row.current_cycle_number,
    client_row.current_cycle_start,
    current_date,
    client_row.streak
  );

  update clients
  set
    current_cycle_number = client_row.current_cycle_number + 1,
    current_cycle_start  = current_date,
    current_cycle_day    = 1
  where id = target_client_id
  returning * into updated_client;

  return updated_client;
end;
$$ language plpgsql security definer set search_path = public;

-- Only authenticated users can call this at all — the is_nutritionist()
-- check inside then narrows it to Zainab specifically. anon (logged-out)
-- can't call it.
revoke all on function renew_plan_cycle(uuid) from public;
grant execute on function renew_plan_cycle(uuid) to authenticated;