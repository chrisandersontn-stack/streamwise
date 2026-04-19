# Weekly URL watch (GitHub Actions)

This workflow helps you notice when **official pricing / plan pages change**, so you can re-verify your catalog. It does **not** extract prices automatically.

## What it does

1. Reads `data/url-watch-list.json` (a list of `{ id, url, label }` entries).
2. Fetches each unique URL once per run (sequential, polite `User-Agent`).
3. Stores a **SHA-256 fingerprint** of the normalized HTML in `data/url-watch-baseline.json`.
4. On a later run, if a fingerprint **changes**, it:
   - writes `url-watch-report.md` (for humans),
   - **opens a GitHub issue** with the details,
   - **commits** the updated `data/url-watch-baseline.json` so you are not alerted again until the next change.

## What it does *not* do

- It does not prove a **dollar amount** changed (cookie banners, A/B tests, and unrelated edits also change HTML).
- Some sites return **403** to GitHub’s cloud IPs. Those URLs are **skipped** for that run; existing fingerprints are kept. For stubborn pages, use **`skipAutomation: true`** on that row (see below) and monitor with a consumer tool like Distill instead.

## Files

| File | Purpose |
| --- | --- |
| `data/url-watch-list.json` | Which URLs to monitor |
| `data/url-watch-baseline.json` | Last known fingerprints (committed; updated by automation) |
| `scripts/watch-urls.mjs` | Core logic |
| `scripts/generate-url-watch-list.mjs` | Rebuild the list from a catalog JSON export |

## Regenerate the URL list from your catalog

Whenever you add/remove options with `sourceUrl` in the catalog:

```bash
npm run catalog:url-watch:generate-list -- catalog-before.json
```

Commit the updated `data/url-watch-list.json`.

The generator sets **`skipAutomation: true`** for ESPN’s support article (often blocks datacenter IPs). You can add the same flag to any other row.

Example row:

```json
{
  "id": "opt-example",
  "url": "https://example.com/pricing",
  "label": "Example plan page",
  "skipAutomation": true
}
```

## Manual test locally

```bash
node scripts/watch-urls.mjs --report url-watch-report.md
echo $?
```

- `0` — no fingerprint change vs baseline  
- `1` — change detected (`url-watch-report.md` created)  
- `2` — hard failure (e.g. every URL failed)

## GitHub Actions schedule

Workflow: `.github/workflows/url-watch.yml`

- Runs **weekly** (Mondays 16:00 UTC) and can be run manually (**Actions → URL watch → Run workflow**).

### Optional secret: custom User-Agent

Repository → **Settings → Secrets and variables → Actions** → **New repository secret**

- Name: `URL_WATCH_USER_AGENT`  
- Value: a short string that identifies you and a contact URL or email (some sites are less hostile to identifiable bots).

If unset, a default UA referencing this GitHub repo is used.

## Permissions

The workflow uses `GITHUB_TOKEN` to **create issues** and **push** baseline commits. It only runs on this repository’s default branch workflows.

### If the “commit baseline” step fails

Some repositories use **branch protection** that blocks pushes from `github-actions`. In that case you can either loosen protection for automation (narrow rules if your host supports it) or run `npm run catalog:url-watch` locally after a change and open a normal PR with `data/url-watch-baseline.json`.

## First successful run

The first time fingerprints are recorded for your URLs, you may see a **commit** that fills `data/url-watch-baseline.json` **without** an issue. That is normal. Issues appear only when a **previously recorded** fingerprint changes.
