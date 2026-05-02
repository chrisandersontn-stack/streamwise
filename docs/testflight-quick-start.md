# StreamWise TestFlight — 10-minute quick start

Last updated: 2026-05-02

Use this when you want **one fast pass** before uploading a build. For the full walkthrough, see `docs/testflight-submission-checklist.md`.

## Minute 0–3: Ship confidence (local)

```bash
npm run lint
```

```bash
npm test -- --run
```

```bash
npm run build
```

```bash
MOBILE_SMOKE_BASE_URL=https://streamwise-xi.vercel.app npm run qa:mobile-smoke
```

- [ ] All four finished without errors.

## Minute 3–6: iPhone sanity (Safari)

Open:

```text
https://streamwise-xi.vercel.app
```

- [ ] Pick 2–3 services, confirm recommendation updates.
- [ ] Tap **Start with this offer** once, confirm provider page opens.
- [ ] Open footer links: **Support**, **Privacy**, **Terms**, **Affiliate disclosure**, **App privacy details**.

## Minute 6–8: App Store Connect essentials

1. Open [App Store Connect](https://appstoreconnect.apple.com/) → **My Apps** → your app.
2. **TestFlight** → confirm your latest build finished processing (or upload now).
3. **App Privacy** → fill answers using this page side-by-side:

```text
https://streamwise-xi.vercel.app/app-privacy-details
```

- [ ] App Privacy saved and matches that page.

## Minute 8–10: Internal TestFlight

1. **TestFlight** → select build → **Internal Testing**.
2. Paste **What to Test**:

```text
Please verify service selection, recommendation ranking, outbound offer links, and policy/disclosure pages on iPhone.
```

- [ ] Sent to at least one internal tester (yourself counts).

## If anything fails

Stop and use the full checklist: `docs/testflight-submission-checklist.md`.
