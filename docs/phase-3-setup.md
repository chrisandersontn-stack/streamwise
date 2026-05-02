# StreamWise Phase 3 Setup

## Environment variables

```bash
# Catalog admin
CATALOG_ADMIN_TOKEN=replace_with_secure_token

# Optional: show footer link "Catalog admin (pricing)" on the main app (default: dev-only)
# NEXT_PUBLIC_SHOW_ADMIN_PRICING_LINK=1

# Supabase (required for auth + hosted persistence)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_AUTH_REDIRECT_URL=http://localhost:3000

# PostHog (optional analytics provider)
POSTHOG_API_KEY=phc_...
POSTHOG_HOST=https://app.posthog.com

# Affiliate helpers (optional; US-first, fast to wire)
# Amazon Associates: adds ?tag=... to outbound amazon.com links from your catalog.
NEXT_PUBLIC_AMAZON_ASSOCIATES_TAG=yourstore-20

# Walmart: append tracking query params to walmart.com links.
# Example format: affiliateId=YOUR_ID (can include multiple key=value pairs)
NEXT_PUBLIC_WALMART_AFFILIATE_QUERY=affiliateId=YOUR_ID
```

## Required Supabase tables (minimum)

```sql
create table if not exists analytics_events (
  id bigint generated always as identity primary key,
  event_name text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists user_preferences (
  user_key text primary key,
  preferences jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists catalog_snapshots (
  id bigint generated always as identity primary key,
  services jsonb not null,
  options jsonb not null,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);
```

## New API endpoints

- `POST /api/auth/magic-link` - send Supabase magic link email
- `GET /api/auth/user` - validates bearer token and returns user id
- `GET|PUT /api/profile/preferences` - token-aware preference storage
- `GET|PUT /api/catalog` - hosted catalog read/update (see `docs/pricing-data-process.md` for sourcing and refresh workflow)
- `POST /api/admin/catalog-option` - update a single plan (same `x-admin-token` as catalog); browser UI at `/admin/pricing`
- `POST /api/track-click` - analytics event capture (Supabase + PostHog + fallback)
