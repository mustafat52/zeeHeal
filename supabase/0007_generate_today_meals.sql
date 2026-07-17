-- zeeheal — generate_todays_meals RPC
-- Fixes: TodayMeals.tsx previously inserted meal rows directly from the
-- client's own browser session, but no client-insert RLS policy exists on
-- `meals` (deliberately — see 0001_init.sql / 0002_rls.sql comments: row
-- creation is meant to be a nutritionist/system action, not a client
-- action, since the client never decides what's in a meal — Zainab does,
-- via the plan editor). This RPC IS that system action: it copies
-- whatever Zainab already decided (clients.weekly_plan_days) into today's
-- real meal rows, scoped to this client's currently-enabled meal slots.
--
-- security definer, same pattern as renew_plan_cycle — bypasses RLS, so it
-- does its own explicit authorization check up front. A client may only
-- generate meals for THEMSELVES (client_owns); Zainab may generate for
-- any of her clients too (is_nutritionist), though nothing calls it that
-- way today.
--
-- Idempotent: if today's rows already exist for this client, returns them
-- as-is rather than generating duplicates — same "check first" behavior
-- TodayMeals.tsx used to do client-side, just moved server-side.
--
-- enabled_labels is passed in rather than recomputed here so there's only
-- one place (lib/mealConfig.ts's enabledMealLabels) that knows how to turn
-- a client's meal_config into a label list — this function trusts that
-- input rather than re-deriving it from meal_config jsonb keys, avoiding a
-- second implementation of that mapping drifting from the first.

create or replace function generate_todays_meals(
  target_client_id uuid,
  enabled_labels text[]
)
returns setof meals as $$
declare
  today_date     date := current_date;
  day_key        text;
  plan_days      jsonb;
  day_items      jsonb;
  item           jsonb;
  existing_count int;
begin
  if not (client_owns(target_client_id) or is_nutritionist()) then
    raise exception 'not authorized';
  end if;

  select count(*) into existing_count
  from meals
  where client_id = target_client_id and meal_date = today_date;

  if existing_count > 0 then
    return query
      select * from meals
      where client_id = target_client_id and meal_date = today_date;
    return;
  end if;

  -- extract(dow from date): 0=Sunday..6=Saturday, matching JS Date.getDay()
  -- and the DAY_KEYS array previously used client-side in TodayMeals.tsx.
  day_key := (array['Sun','Mon','Tue','Wed','Thu','Fri','Sat'])[extract(dow from today_date)::int + 1];

  select weekly_plan_days into plan_days
  from clients
  where id = target_client_id;

  -- No plan assigned yet — nothing to generate. Matches TodayMeals.tsx's
  -- existing "no plan assigned" empty state rather than erroring.
  if plan_days is null then
    return;
  end if;

  day_items := plan_days -> day_key;

  if day_items is null then
    return;
  end if;

  for item in select * from jsonb_array_elements(day_items)
  loop
    if item ->> 'label' = any(enabled_labels) then
      insert into meals (client_id, meal_date, label, items, status)
      values (
        target_client_id,
        today_date,
        item ->> 'label',
        item ->> 'items',
        'pending'
      );
    end if;
  end loop;

  return query
    select * from meals
    where client_id = target_client_id and meal_date = today_date;
end;
$$ language plpgsql security definer set search_path = public;

-- Same access model as renew_plan_cycle: only authenticated users can call
-- this at all; the client_owns()/is_nutritionist() check inside narrows it
-- further. anon (logged-out) can't call it.
revoke all on function generate_todays_meals(uuid, text[]) from public;
grant execute on function generate_todays_meals(uuid, text[]) to authenticated;