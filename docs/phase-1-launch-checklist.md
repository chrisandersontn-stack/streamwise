# StreamWise Phase 1 Launch Checklist

## Stability
- [x] Production build succeeds (`npm run build`)
- [x] TypeScript compiles without root backup-file failures
- [x] Unit tests for combo engine logic are in place (`npm test`)

## Product Baseline
- [x] Production metadata is configured
- [x] Core pricing catalog is exposed behind an API route (`/api/catalog`)
- [x] Outbound source-link click tracking endpoint exists (`/api/track-click`)

## Next Steps
- [ ] Persist analytics events to a real sink (PostHog, Segment, Amplitude, etc.)
- [ ] Move catalog/options from static code to managed data source
- [ ] Add auth and user profiles for saved preferences
- [ ] Add legal pages and app-store policy copy (Privacy, Terms, affiliate disclosure)
- [ ] Add CI workflow for lint, test, and build gating
