-- zeeheal — Storage bucket policies
-- Session: Backend Phase A, July 10 2026
-- Buckets (meal-photos, skin-photos, voice-notes) must already exist —
-- created via the dashboard, not SQL. Path pattern for all three:
-- {client_id}/{...filename}, per BACKEND_PLAN.md §3.
--
-- DELTA from BACKEND_PLAN.md §3: that doc says "Zainab can read (not
-- write)" for all three buckets. True for meal-photos and skin-photos
-- (client-only uploads). NOT true for voice-notes — VoiceRecorder is used
-- on both the client chat page and the nutritionist's per-client chat page
-- (context.md), so Zainab needs write access there too. voice-notes is the
-- one bucket where both sides can upload.

-- ============================================================================
-- meal-photos — client uploads own, nutritionist reads only
-- ============================================================================
create policy "client uploads own meal photos"
  on storage.objects for insert
  with check (
    bucket_id = 'meal-photos'
    and client_owns((storage.foldername(name))[1]::uuid)
  );

create policy "client reads own meal photos"
  on storage.objects for select
  using (
    bucket_id = 'meal-photos'
    and client_owns((storage.foldername(name))[1]::uuid)
  );

create policy "nutritionist reads all meal photos"
  on storage.objects for select
  using (
    bucket_id = 'meal-photos'
    and is_nutritionist()
  );

-- ============================================================================
-- skin-photos — same pattern as meal-photos
-- ============================================================================
create policy "client uploads own skin photos"
  on storage.objects for insert
  with check (
    bucket_id = 'skin-photos'
    and client_owns((storage.foldername(name))[1]::uuid)
  );

create policy "client reads own skin photos"
  on storage.objects for select
  using (
    bucket_id = 'skin-photos'
    and client_owns((storage.foldername(name))[1]::uuid)
  );

create policy "nutritionist reads all skin photos"
  on storage.objects for select
  using (
    bucket_id = 'skin-photos'
    and is_nutritionist()
  );

-- ============================================================================
-- voice-notes — BOTH sides upload (chat exists on both client and
-- nutritionist pages), both sides read within a shared thread.
-- ============================================================================
create policy "client uploads own voice notes"
  on storage.objects for insert
  with check (
    bucket_id = 'voice-notes'
    and client_owns((storage.foldername(name))[1]::uuid)
  );

create policy "nutritionist uploads any voice note"
  on storage.objects for insert
  with check (
    bucket_id = 'voice-notes'
    and is_nutritionist()
  );

create policy "client reads own voice notes"
  on storage.objects for select
  using (
    bucket_id = 'voice-notes'
    and client_owns((storage.foldername(name))[1]::uuid)
  );

create policy "nutritionist reads all voice notes"
  on storage.objects for select
  using (
    bucket_id = 'voice-notes'
    and is_nutritionist()
  );