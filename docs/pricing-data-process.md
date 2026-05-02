# StreamWise pricing data process

This document is the **source-of-truth playbook** for how pricing gets into StreamWise, how you prove it, and how you keep it fresh. It replaces “ChatGPT generated it” as your implicit process.

## 1) Rules (non-negotiable)

1. **Primary sources only** for numbers that affect rankings: official plan pages, official help/pricing articles, checkout flows you can reproduce, or official PDF/terms where pricing is stated clearly.
2. **ChatGPT (or any LLM) is not a source.** It may help you *draft* notes or *reformat* text **after** you have already captured the official evidence (URL + what you saw + date).
3. **Every catalog `Option` must be defensible from its `sourceUrl` (or an added URL in `notes` if the URL is genuinely split across pages).** If you cannot find an official page, set `priceStatus` to `needs_verification` and do not present the price as “current”.
4. **Date everything** using `lastChecked` (ISO `YYYY-MM-DD` is fine) on each option you touch.
5. **Prefer “slightly conservative” modeling** over “optimistically cheap”**: if eligibility is fuzzy, raise monthly effective cost via `notes`, add requirements, or mark `needs_verification`.

## 2) What “accuracy” means in StreamWise

Users interpret accuracy as:

- The **monthly numbers** are close to what a careful shopper would see on official pages **for the stated assumptions** (ads vs no-ads, intro vs standard, bundling rules).
- The **access path** is honest (`requires`, `includedWith`, `category`, `mutuallyExclusiveGroup`).
- The **risk** is visible (`priceStatus`, `introLengthMonths`, `standardMonthly`, `expiresAt`, promo tags).

Accuracy is **not** “every user pays this exact amount” (taxes, grandfathering, regional offers, hidden fees, and account-specific promos exist).

## 3) Map your research to catalog fields

Use `app/streamwise-data.ts` as the schema reference (`Service`, `Option`).

| Your research output | Where it goes |
| --- | --- |
| Official page you used | `sourceUrl` |
| Human-readable label for the link | `source` |
| What you priced | `monthly` / `effectiveMonthly` (if you model annualized or amortized bundles—document the math in `notes`) |
| What services this satisfies | `covers` |
| Eligibility / stack rules / caveats | `notes` |
| Gated paths | `requires`, `includedWith` |
| Promo / bundle / carrier / membership / direct | `category` |
| Intro then renews | `introLengthMonths`, `standardMonthly` |
| Offer window (if known) | `expiresAt`, `effectiveDate` |
| Confidence | `priceStatus` |
| When you verified | `lastChecked` |

### `priceStatus` guidance

- **`current`**: you opened the official source on `lastChecked` and the price/terms matched your model.
- **`scheduled_change`**: official source states a future price change or step-up you modeled.
- **`needs_verification`**: you are not confident, cannot find a stable official URL, or the offer is account-specific/ambiguous.
- **`expired`**: you know the modeled offer is no longer sold as modeled (prefer removing or replacing the option rather than leaving it ranked).

## 4) Source quality tiers (use this to decide confidence)

**Tier A (best):** official pricing/help page with explicit monthly price for the exact plan name you model.

**Tier B (ok with care):** official marketing landing page with price, but requires extra interpretation (bundles, “starting at”, conditional discounts). Add precise `notes` and prefer `needs_verification` until you can cite Tier A.

**Tier C (do not use as proof):** forums, Reddit, news articles without a primary link, “I heard”, or LLM output.

## 5) Per-option research record (minimum audit trail)

For each `Option.id`, keep a row (spreadsheet is fine) with:

| Column | Example |
| --- | --- |
| option_id | `hulu_direct` |
| verified_on | `2026-04-18` |
| official_url | paste `sourceUrl` |
| plan_name_on_page | copy exact plan title text |
| price_seen | `$11.99/mo` |
| assumptions | “with ads”, “US”, “new subscribers only”, etc. |
| screenshot? | optional but valuable for promos |
| modeled_fields_changed | `monthly`, `standardMonthly`, … |
| verifier | your name |

You do **not** need to commit this sheet to git, but you should keep it somewhere durable (Google Sheet, Notion, etc.).

## 6) Standard verification procedure (10–20 minutes per option)

1. Open `sourceUrl` in a clean session (incognito) and confirm region (US vs not).
2. Confirm the **plan name** in StreamWise matches the page’s plan naming closely enough that a user won’t feel tricked.
3. Confirm **recurring price** matches your `monthly` for the modeled period (intro vs ongoing).
4. Confirm **eligibility** matches your `requires` / `includedWith` / `notes`.
5. If the page is ambiguous, do **one** of: find a better Tier A URL, downgrade `priceStatus`, or remove the option from “best path” competitiveness by adjusting `notes` / pricing conservatively.
6. Update `lastChecked` to today.

## 7) Cadence (practical, biased toward promos changing)

**Weekly (Tier 1):** anything `category: "promo"`, anything with `introLengthMonths`, anything `priceStatus: "scheduled_change"`, carrier/membership bundle paths.

**Biweekly (Tier 2):** stable `direct` options with public list prices.

**Monthly hygiene:** scan `notes` for time-bound language (“through”, “limited time”) and either refresh `expiresAt` or retire the option.

If you miss a cycle, update `lastChecked` only when you actually re-opened the official source.

## 8) Technical workflow in this repo (how data gets to users)

Runtime catalog resolution is implemented in `lib/server/catalog-store.ts`:

1. If Supabase is configured, the active row in `catalog_snapshots` wins.
2. Else `data/catalog.json` if valid.
3. Else defaults compiled from `app/streamwise-data.ts`.

### 8a) Pull the live catalog you’re serving

```bash
curl -sS https://YOUR_DOMAIN/api/catalog | jq '.services,.options | length'
```

Save the full JSON locally as `catalog.export.json` while you work.

### 8b) Edit services/options

- Prefer editing the exported JSON **or** updating `app/streamwise-data.ts` and re-exporting—pick one workflow and stick to it.
- For a **Google Sheets** workflow (CSVs + merge script), see `docs/catalog-google-sheet.md`.
- For **weekly “this page changed” alerts** (GitHub issue + baseline commit), see `docs/url-watch.md`.
- Validate mentally: arrays only, required fields present, numbers not strings.

### 8c) Publish updates (hosted)

Admin update:

```bash
curl -sS -X PUT "https://YOUR_DOMAIN/api/catalog" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $CATALOG_ADMIN_TOKEN" \
  --data-binary @catalog.export.json
```

Notes:

- `PUT /api/catalog` is protected by `CATALOG_ADMIN_TOKEN` (see `docs/phase-3-setup.md`).
- `GET /api/catalog` is cached at the edge (`s-maxage=3600`); expect **up to an hour** before public caches reflect changes unless you revalidate/purge on your host.

### 8d) Local file fallback (no Supabase)

If you are not using Supabase for catalog snapshots, write `data/catalog.json` in the repo/deploy artifact instead (same JSON shape).

### 8e) Diff before you PUT (repo script)

Export two snapshots (e.g. `catalog.before.json` and `catalog.after.json`), then:

```bash
npm run catalog:diff -- catalog.before.json catalog.after.json
```

- Exit **0** if `services` and `options` are identical (by `id`, for tracked fields).
- Exit **1** if anything changed (same convention as `diff(1)` — useful in scripts).

Tracked fields include pricing and provenance fields such as `monthly`, `standardMonthly`, `priceStatus`, `lastChecked`, `sourceUrl`, `covers`, `requires`, and `notes`. See `scripts/catalog-diff.mjs` for the full list.

### 8f) Source registry and automation coverage

Track provider sources in `data/price-sources.csv` and generate automation metadata with:

```bash
npm run catalog:price-sources:build
```

This writes:

- `data/price-source-registry.json` (normalized source records)
- `data/price-source-automation-report.json` (automation tiers and manual-review coverage)

Use automation tiers to decide workflow:

- `api` / `html_scrape`: candidates for scheduled extraction adapters
- `manual_review` / `manual_override`: require human verification before publish

### 8g) Automated price-source checks (first adapter set)

Current adapters include:

- `netflix_signup`
- `hulu_start`
- `disneyplus_pricing`
- `peacock_pricing`
- `max_pricing`
- `youtube_tv_pricing`
- `sling_pricing`
- `fubo_pricing`
- `philo_pricing`
- `walmart_plus` *(manual review adapter)*
- `instacart_plus` *(manual review adapter)*
- `verizon_unlimited_bundles` *(manual review adapter)*
- `tmobile_offers` *(manual review adapter)*
- `xfinity_offers` *(manual review adapter)*

Run checks:

```bash
npm run catalog:price-sources:check
```

Apply successful checks to a catalog snapshot (refresh `lastChecked`, optional auto-price update):

```bash
# refresh lastChecked for options with successful checks
npm run catalog:price-sources:apply-checks

# optional: also update option.monthly from detected values
node scripts/apply-price-source-check-results.mjs \
  --catalog catalog-before.json \
  --checks data/price-source-candidate-updates.json \
  --output catalog-after-auto.json \
  --apply-prices
```

Note: this only applies automated results for adapters that successfully fetched and detected checks.

Run checks with fetch diagnostics (for failure triage):

```bash
npm run catalog:price-sources:check:debug
```

Run checks with optional browser fallback (Playwright), for JS-heavy pages that fail static fetch:

```bash
# one-time setup on your machine/runner:
npx playwright install chromium

# optional: restrict browser fallback to specific hosts
PRICE_WATCH_BROWSER_HOSTS="www.netflix.com,signup.hulu.com" \
npm run catalog:price-sources:check:browser
```

Browser fallback behavior:

- Normal mode remains HTTP-first only (`catalog:price-sources:check`).
- Browser mode is opt-in via `PRICE_WATCH_BROWSER_FETCH=1`.
- Browser fetch only runs after HTTP retries fail, with strict navigation timeout.
- If `PRICE_WATCH_BROWSER_HOSTS` is set, fallback is limited to those hosts.

Run network preflight to separate adapter issues from environment/network failures:

```bash
npm run catalog:price-sources:network-check
```

Run full triage bundle (build + network + debug checks + manual issue body):

```bash
npm run catalog:price-sources:triage
```

Outputs:

- `data/price-source-candidate-updates.json`
- `price-source-check-report.md`
- `price-source-manual-review-issue.md` (from manual review helper command below)
- `data/price-source-network-health.json`
- `price-source-network-health-report.md`
- `price-source-triage-summary.md`

Exit behavior:

- `0`: no candidate price deltas detected
- `1`: candidate deltas found **or** one or more source fetch failures (verification degraded)
- `2`: script/config/fetch error

`data/price-source-candidate-updates.json` now includes:

- `verificationStatus` (`ok` or `degraded`)
- `fetchFailureCount`
- `fetchFailureBreakdown` (grouped by classified failure cause)
- `checksDetectedCount` (how many adapters produced parsable checks)
- `sourceVerificationStates` (per-source `verified_automated` / `verified_manual` / `failed_fetch` / `manual_required`)
- `sourceVerificationStateCounts` (state totals)

Automation:

- GitHub workflow: `.github/workflows/price-source-watch.yml`
- Runs weekly and on manual dispatch
- Runs a network preflight first; if DNS is blocked, it opens an environment issue and skips adapter checks to avoid misleading "0 changes"
- Uploads artifacts and opens issues for candidate deltas or degraded verification

Generate a copy-ready manual review issue body (prioritized by source priority):

```bash
npm run catalog:price-sources:manual-review-issue
```

Record a manual verification event for hard providers:

```bash
npm run catalog:price-sources:record-manual -- --source walmart_plus --date 2026-04-28 --verifier "Chris" --notes "Verified in signed-in account flow"
```

Optional HTTP path (same `CATALOG_ADMIN_TOKEN` as catalog publish): `POST /api/manual-price-verification` with JSON body `sourceId`, `date` (`YYYY-MM-DD`), `verifier`, optional `notes`, and header `x-admin-token`. Writes `data/manual-price-verifications.json` on the server; on read-only serverless hosts prefer the CLI and commit the file.

Before relying on browser fallback in CI or locally, confirm Chromium is installed:

```bash
npm run catalog:price-sources:playwright-verify
```

Recommended manual-verification SLA for hard sources:

- Weekly: `walmart_plus`, `instacart_plus`, `verizon_unlimited_bundles`, `tmobile_offers`, `xfinity_offers`
- Record every completed review using `catalog:price-sources:record-manual`
- Keep `verifiedOn` current so dashboards/reports can distinguish manual verification from failed automation

## 9) “We used ChatGPT before” cleanup plan

Treat legacy data as **untrusted** until re-verified:

1. Export current catalog (`GET /api/catalog`).
2. For each option: open `sourceUrl`. If missing, **find** a Tier A/B URL or mark `needs_verification`.
3. Fix mismatches; update `lastChecked`.
4. Publish snapshot via `PUT` (or commit `data/catalog.json` if that’s your path).

## 10) When two official sources disagree

Prefer the page that matches the **purchase path** (checkout/plan picker) over generic marketing. If still unclear:

- set `priceStatus: "needs_verification"`, and
- explain the conflict briefly in `notes`.

## 11) What I (the assistant) can and cannot do in this workflow

- **Can:** help you interpret messy pages, draft `notes`, propose JSON edits, build checklists, and sanity-check internal consistency.
- **Cannot:** be the citation for pricing. The citation is always **your captured official URL + verification date** (and optional screenshot).
