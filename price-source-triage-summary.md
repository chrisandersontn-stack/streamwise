## Price source triage summary

Generated at: 2026-04-28T20:50:56.277Z

### Pipeline status

- Sources tracked: 17
- Network hosts checked: 17
- DNS failures: 17
- HTTP failures: 17
- Likely environment DNS issue: yes
- Adapters run: 14
- Checks detected: 0
- Candidate changes: 0
- Fetch failures: 14
- Browser fallback attempted: 0
- Browser fallback recovered: 0
- Browser fallback skipped: 0
- Verification status: degraded
- Manual review groups: 5

### Step results

- ✅ **Build source registry** (exit 0)
  - Command: `npm run catalog:price-sources:build`
- ❌ **Network preflight** (exit 1)
  - Command: `npm run catalog:price-sources:network-check`
- ❌ **Debug source checks** (exit 1)
  - Command: `npm run catalog:price-sources:check:debug`
- ✅ **Manual review issue body** (exit 0)
  - Command: `npm run catalog:price-sources:manual-review-issue`

### Output files

- `data/price-source-registry.json`
- `data/price-source-automation-report.json`
- `data/price-source-network-health.json`
- `price-source-network-health-report.md`
- `data/price-source-candidate-updates.json`
- `price-source-check-report.md`
- `price-source-manual-review-issue.md`
- `price-source-triage-summary.md`

