# StreamWise App Store Readiness

Last updated: 2026-05-02

This checklist separates tasks that can be completed in-repo from tasks that require external accounts, legal review, or App Store Connect access.

## Completed in repo

- [x] Recommendation engine excludes expired offers (`priceStatus: "expired"`).
- [x] Catalog endpoint and client fetch are set to `no-store` to reduce stale price data windows.
- [x] Freshness and verification status are displayed clearly on the main page.
- [x] Affiliate disclosure language states compensation does not change ranking order.
- [x] Privacy and Terms pages now describe auth, analytics tracking, outbound click tracking, and deletion-request contact flow.
- [x] Footer includes direct support contact link.
- [x] Mobile spacing improved on primary page (`p-4` on small screens, `sm:p-6`).
- [x] Added `App Privacy Details` page to mirror App Store privacy-label fields.
- [x] Added `qa:mobile-smoke` script for pre-release mobile smoke checks.

## In-repo tasks still recommended before submission

- [ ] Add dedicated app icons/splash assets for iOS and Android wrappers.
- [ ] Add app metadata assets/screenshots source files for repeatable release updates.
- [ ] Add E2E smoke tests for critical mobile flows (select services, view recommendation, tap CTA).
- [ ] Add CI gate for `lint`, `test`, and `build` on pull requests.

## Requires external systems (cannot be completed from code alone)

- [ ] Create App Store Connect listing (name, subtitle, category, support URL, marketing URL).
- [ ] Complete Apple privacy nutrition labels using real production data flows.
- [ ] Upload App Store screenshots and preview media for required device sizes.
- [ ] Publish valid business contact details and legal entity information.
- [ ] Confirm affiliate-program disclosure wording against each network/program contract.
- [ ] Ship TestFlight build and collect private beta feedback (10-25 users) before public launch.

## Release readiness gate

Before App Store submission, verify all of the following:

1. Home screen recommendation reflects current catalog data and no stale promo paths.
2. Privacy policy, terms, and affiliate disclosure match deployed behavior.
3. Support email is configured with `NEXT_PUBLIC_SUPPORT_EMAIL`.
4. Pricing refresh process has run successfully in the last 7 days.
5. TestFlight beta confirms mobile usability and CTA clarity.

For step-by-step App Store Connect/TestFlight actions, use:

- `docs/testflight-submission-checklist.md`
- `docs/testflight-quick-start.md` (10-minute fast pass)
- `docs/ios-expo-webview-wrapper.md` (sibling Expo repo + WebView to production)
