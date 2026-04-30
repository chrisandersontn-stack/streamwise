# StreamWise URL watch — weekly routine (beginner)

This checklist matches the GitHub Action **URL watch** in your repo (`.github/workflows/url-watch.yml`).

## What this is for

The workflow checks official pages you list in `data/url-watch-list.json`. If a page’s HTML fingerprint changes, GitHub opens an **issue** so you can re-verify pricing on the real site.

It does **not** automatically update prices in StreamWise.

---

## Step A — Monday morning (5 minutes)

1. Open your GitHub repository in a browser.
2. Click **Actions**.
3. In the left sidebar, click **URL watch** (not **CI**).
4. Click **Run workflow** → choose branch **main** → click the green **Run workflow** button.
5. Wait until the run shows a green checkmark (**Success**).

If it fails (red X), open the run, click the job, scroll to the bottom, and read the error message.

---

## Step B — decide if you need to do anything (2 minutes)

### B1) Check GitHub Issues

1. Click **Issues**.
2. Look for a new issue titled like **URL watch: monitored pricing pages changed**.

- **If there is no new issue:** you’re done for the week (no fingerprint changes vs the saved baseline).

### B2) Check commits (optional)

Sometimes the workflow commits an update to:

- `data/url-watch-baseline.json`

That is normal. It stores the new “normal” fingerprint so you are not alerted again until the next change.

---

## When you get an issue — do this (Outcomes 1–3)

Open the issue. It will list URLs and old/new fingerprints.

### Outcome 1 — False alarm (very common)

**What it means:** the page changed, but not necessarily the price (banners, layout, marketing copy, cookie text, etc.).

**What you do:**

1. Open each URL from the issue in a browser (incognito is fine).
2. Confirm pricing/eligibility still matches your StreamWise catalog.
3. Close the GitHub issue with a short comment like: “Verified: no pricing change.”

**Catalog update:** none.

---

### Outcome 2 — Real pricing or offer change

**What it means:** the official page shows a different bundle, price, or eligibility than your catalog.

**What you do:**

1. Update your **Google Sheet** (or catalog JSON if that’s your workflow).
2. Re-download CSVs to `data/catalog-sheet-export/`.
3. Run:

```bash
cd /Users/chrisanderson/streamwise
npm run catalog:sheet:apply -- catalog-before.json data/catalog-sheet-export/services.csv data/catalog-sheet-export/options.csv catalog-merged.json
npm run catalog:diff -- catalog-before.json catalog-merged.json
```

4. If the diff looks correct, publish:

```bash
read -s CATALOG_ADMIN_TOKEN
curl -sS -X PUT "https://streamwise-xi.vercel.app/api/catalog" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $CATALOG_ADMIN_TOKEN" \
  --data-binary @catalog-merged.json
```

5. Hard refresh the live site (**Cmd+Shift+R**).
6. Close the GitHub issue with a short note: “Updated catalog after verified pricing change.”

---

### Outcome 3 — Page blocks automation (403) or is too noisy

**What it means:** GitHub’s servers can’t fetch the page reliably, or the page changes constantly for non-pricing reasons.

**What you do:**

1. In `data/url-watch-list.json`, set `"skipAutomation": true` on that row (see the tuning PDF).
2. Commit and push to `main`.
3. Use a consumer tool (like Distill) on your home internet for that URL instead.

---

## Notes

- Fingerprint changes mean **HTML changed**, not guaranteed “dollar amount changed.”
- Your live catalog endpoint may be cached for up to about an hour after a publish.
- Incident log (2026-04-29): fixed broken Hulu CTA path by routing known dead Hulu offer URLs to a stable bundle page.

---

## Price-source verification loop (6-step)

Use this after URL-watch alerts, or run it weekly even if no alert appears.

### 1) Diagnose failure causes

Run with fetch diagnostics:

```bash
cd /Users/chrisanderson/streamwise
npm run catalog:price-sources:check:debug
```

Read `price-source-check-report.md` for per-source failure class (`dns_resolution_failure`, `blocked_or_unauthorized`, `timeout`, etc.).

### 2) Keep hardened HTTP fetch defaults

No weekly action needed; already built into scripts:

- browser-like headers
- retry/backoff
- failure classification

### 3) Use provider-specific strategy

- Static/public pages: automated adapters (`html_scrape`)
- Hard/login-gated pages: manual-review adapters

Manual-review items are generated into `price-source-manual-review-issue.md`.

### 4) Use optional browser fallback only when needed

For JS-heavy pages that repeatedly fail static fetch:

```bash
npx playwright install chromium
PRICE_WATCH_BROWSER_HOSTS="www.netflix.com,signup.hulu.com" \
npm run catalog:price-sources:check:browser
```

Keep host allowlist small; expand only when it improves verification.

### 5) Trust verification states (not just “0 changes”)

Treat these as source-of-truth in `data/price-source-candidate-updates.json`:

- `verificationStatus`
- `sourceVerificationStates`
- `sourceVerificationStateCounts`

If verification is degraded, do not treat catalog freshness as fully verified.

### 6) Record manual verification for hard sources

Run for providers that need human validation:

```bash
npm run catalog:price-sources:record-manual -- --source walmart_plus --date 2026-04-28 --verifier "Chris" --notes "Verified in signed-in flow"
```

Recommended weekly manual-SLA set:

- `walmart_plus`
- `instacart_plus`
- `verizon_unlimited_bundles`
- `tmobile_offers`
- `xfinity_offers`

---

## Post-deploy smoke test (5 minutes)

Run this after each production deploy:

1. Hard refresh the live app (`Cmd+Shift+R`).
2. Confirm recommendations load and no section crashes.
3. Click at least 3 outbound links (include Hulu + one non-Hulu source).
4. Open `/api/track-click` and confirm it returns a healthy JSON response.
5. Run link health check:

```bash
cd /Users/chrisanderson/streamwise
npm run catalog:links:check
```

If it reports failures, review `data/catalog-link-health.json` and fix bad URLs before your next catalog publish.

---

## More reading

- `docs/url-watch.md` (repo)
- `docs/pricing-data-process.md` (full automation + triage playbook)
