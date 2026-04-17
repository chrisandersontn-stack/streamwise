# StreamWise Phase 2 Scaffold

## Added in this phase

### 1) Persistent analytics event sink
- Outbound source-link clicks now persist to `data/events.ndjson`.
- Endpoint: `POST /api/track-click`
- Captured fields: option metadata, referrer, user agent, and forwarded IP headers.

### 2) Externalized catalog management
- Catalog reads from `data/catalog.json` when present, or falls back to in-code defaults.
- Endpoint: `GET /api/catalog`
- Admin update endpoint: `PUT /api/catalog` with header `x-admin-token`.
- Required env var for updates: `CATALOG_ADMIN_TOKEN`.

### 3) Auth scaffold + saved preferences
- Anonymous persistent session cookie (`sw_session`) created server-side.
- Session endpoint: `GET /api/session`
- Preferences endpoints:
  - `GET /api/profile/preferences`
  - `PUT /api/profile/preferences`
- Preferences are persisted in `data/preferences.json`.
- Client now hydrates from saved preferences and autosaves updates.

## Recommended next moves
- Replace file-based stores with a hosted DB (Supabase/Postgres) before public launch.
- Connect events to product analytics platform (PostHog/Amplitude/Segment).
- Add real user authentication (email/social/passkeys) and account linking.
