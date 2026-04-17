-- StreamWise Supabase hardening (RLS)
-- Run in Supabase SQL Editor after creating tables.

alter table public.analytics_events enable row level security;
alter table public.user_preferences enable row level security;
alter table public.catalog_snapshots enable row level security;

-- Deny direct client access to server-only tables.
-- Server routes use the service role key and bypass RLS.

revoke all on public.analytics_events from anon, authenticated;
revoke all on public.user_preferences from anon, authenticated;
revoke all on public.catalog_snapshots from anon, authenticated;

grant usage on schema public to anon, authenticated;
