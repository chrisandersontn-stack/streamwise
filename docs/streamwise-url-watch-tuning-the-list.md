# StreamWise URL watch — tuning `url-watch-list.json` (beginner)

This document explains how to manage:

- `data/url-watch-list.json` (what URLs are monitored)
- optional flags like `skipAutomation`

Related automation:

- GitHub Action: `.github/workflows/url-watch.yml`
- Script: `scripts/watch-urls.mjs`
- Saved fingerprints: `data/url-watch-baseline.json`

---

## What `url-watch-list.json` is

It is a JSON **array** of objects. Each object describes one monitored row.

Minimum fields:

- `id`: a stable name you choose (example: `opt-netflix_direct`)
- `url`: the official page to watch
- `label`: human-readable label for GitHub issues

Optional:

- `skipAutomation`: if `true`, the GitHub workflow **will not fetch** this URL

---

## Rule 1 — start small (less noise)

If you monitor too many URLs, you will get too many alerts.

Beginner recommendation:

- Start with **10–20** URLs that matter most:
  - promos
  - bundles
  - carrier pages (Verizon / T‑Mobile / Xfinity)
  - pages you personally rely on for “best path” results

Expand later once you’re comfortable triaging issues.

---

## Rule 2 — regenerate the list after big catalog changes

Whenever you add/remove lots of `sourceUrl` values in your catalog, rebuild the list:

```bash
cd /Users/chrisanderson/streamwise
npm run catalog:url-watch:generate-list -- catalog-before.json
```

Then commit and push:

- `data/url-watch-list.json`

This keeps monitoring aligned with your catalog.

---

## Rule 3 — use `skipAutomation` for “bot-hostile” pages

Some sites return **403** to cloud servers (GitHub Actions). Your watcher will skip those fetches and keep the old fingerprint.

If a URL is consistently blocked or too noisy, add:

```json
"skipAutomation": true
```

Example shape:

```json
{
  "id": "opt-example",
  "url": "https://example.com/pricing",
  "label": "Example pricing page",
  "skipAutomation": true
}
```

Then monitor that URL using a consumer tool (like Distill) instead.

---

## Rule 4 — dedupe by URL in your head (not required, but helpful)

If multiple catalog options share the same `sourceUrl`, you do **not** need duplicate monitor rows unless you want separate labels in issues.

---

## Rule 5 — after you edit the list, verify the workflow still runs

1. GitHub → **Actions** → **URL watch** → **Run workflow**
2. Confirm it succeeds (green)

---

## Common mistakes

- Editing the list but forgetting to **commit + push** to `main`.
- Expecting alerts to mean “price changed” — it only means **page HTML fingerprint changed**.
- Monitoring huge homepages instead of the smallest stable pricing/help URL available.

---

## More reading

- `docs/url-watch.md` (repo)
