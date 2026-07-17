-- zeeheal — populate meals.time from each slot's default time
-- Fixes: meals.time was defined in the schema and lib/mealConfig.ts's
-- MEAL_SLOTS had a defaultTime per slot ("Breakfast" -> "8:00 am"), but
-- nothing ever wrote it to a real row — TodayMeals.tsx's render shows
-- "Breakfast · {meal.time}", which rendered as "Breakfast · " (blank) for
-- all real data since mapDbMeal.ts's row.time ?? "" fallback masked the
-- gap rather than erroring.
--
-- Postgres identifies functions by argument TYPES, not names or defaults
-- — adding a parameter to generate_todays_meals changes its signature, so
-- CREATE OR REPLACE alone would create a second, separate overload rather
-- than truly replacing the old one. Dropping the old (uuid, text[])
-- signature first, then recreating with the added label_times parameter.

drop function if exists generate_todays_meals(uuid, text[]);

create or replace function generate_todays_meals(
  target_client_id uuid,
  enabled_labels text[],
  label_times jsonb default '{}'::jsonb
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

  day_key := (array['Sun','Mon','Tue','Wed','Thu','Fri','Sat'])[extract(dow from today_date)::int + 1];

  select weekly_plan_days into plan_days
  from clients
  where id = target_client_id;

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
      insert into meals (client_id, meal_date, label, time, items, status)
      values (
        target_client_id,
        today_date,
        item ->> 'label',
        label_times ->> (item ->> 'label'),
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

revoke all on function generate_todays_meals(uuid, text[], jsonb) from public;
grant execute on function generate_todays_meals(uuid, text[], jsonb) to authenticated;