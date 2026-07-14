-- zeeheal — per-client meal slot configuration
-- Session: Backend wiring, July 2026
-- Adds meal_config, mirroring the existing checkin_config pattern: which
-- of the 6 possible daily meal slots (Early Morning, Breakfast,
-- Mid-Morning, Lunch, Evening, Dinner) apply to THIS client. Some clients
-- get 3 meals, some 5, some all 6 — set once at onboarding, editable later.

alter table clients
  add column meal_config jsonb not null default '{}'::jsonb;