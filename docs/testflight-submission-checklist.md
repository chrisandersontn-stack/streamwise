# StreamWise TestFlight Submission Checklist

Last updated: 2026-05-02

Use this checklist top-to-bottom. Skip nothing. Check each box as you complete it.

For a **10-minute** fast pass first, see `docs/testflight-quick-start.md`.

## 0) Before you start

- [ ] You can sign in to [App Store Connect](https://appstoreconnect.apple.com/).
- [ ] You can sign in to your Apple Developer account.
- [ ] Your production web app is live at `https://streamwise-xi.vercel.app`.
- [ ] You have 30-60 minutes uninterrupted.

## 1) Confirm release quality first (already automated in repo)

From your project root:

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

- [ ] All four commands pass.

## 2) Manual iPhone checks (real device)

Open `https://streamwise-xi.vercel.app` on iPhone and verify:

- [ ] No horizontal overflow.
- [ ] Service cards are readable and selectable.
- [ ] Recommendation updates after changing selected services.
- [ ] "Start with this offer" opens provider page.
- [ ] Privacy / Terms / Affiliate disclosure / App privacy details pages open.
- [ ] Support mail link opens Mail app.

## 3) Prepare App Store text fields

Use this baseline copy (edit if desired):

### App subtitle

```text
Find lower-cost streaming bundles
```

### Promotional text

```text
Compare standalone plans, bundles, and carrier perks to reduce your total streaming spend.
```

### App description

```text
StreamWise helps you find lower-cost combinations of streaming plans.

How it works:
- Pick the streaming services you want.
- StreamWise compares direct plans, bundles, and eligible provider perks.
- Recommendations are ranked by value, with 12-month total cost as the primary signal.

What you get:
- Clear monthly and annual totals
- Side-by-side recommendation paths
- Freshness and verification indicators
- Quick links to official provider offer pages

Important:
Prices and eligibility can change at any time. Always confirm final terms on provider checkout pages before subscribing.
```

### Keywords

```text
streaming,bundles,subscriptions,savings,price compare,cord cutting
```

- [ ] Text fields prepared.

## 4) Create or update app record in App Store Connect

1. Go to **My Apps**.
2. Click **+** then **New App** (or open existing StreamWise app).
3. Fill required fields (name, primary language, bundle ID, SKU).
4. Save.

- [ ] App record exists.

## 5) Upload build

Use your chosen wrapper pipeline (Xcode/Capacitor/etc.) to archive and upload.

In App Store Connect:

1. Open **TestFlight** tab.
2. Wait for uploaded build to appear (processing can take several minutes).

- [ ] Build appears in TestFlight.

## 6) Fill App Privacy labels (use StreamWise source-of-truth page)

Open this page and keep it side-by-side while filling labels:

`https://streamwise-xi.vercel.app/app-privacy-details`

In App Store Connect:

1. Open **App Privacy**.
2. Enter data collection answers to match the page exactly.
3. Save.

- [ ] App Privacy section complete and consistent.

## 7) Add screenshots

Required minimum:

- [ ] iPhone screenshots (current device sizes required by Apple)
- [ ] Optional iPad screenshots if shipping iPad support

Recommended screenshot set:

1. Service selection screen
2. Recommended path card
3. Comparison paths section
4. Data freshness + trust/disclosure elements
5. Legal/footer links visible

## 8) Internal TestFlight release

1. In **TestFlight**, select the processed build.
2. Add internal testers (your team).
3. Add "What to Test" notes.

Suggested "What to Test":

```text
Please verify service selection, recommendation ranking, outbound offer links, and policy/disclosure pages on iPhone.
```

- [ ] Internal TestFlight distributed.

## 9) External beta (optional, recommended)

1. Create external tester group.
2. Add build and submit for beta app review if prompted.
3. Invite 10-25 testers.

- [ ] External beta started (or intentionally skipped).

## 10) Final go/no-go before App Review

- [ ] Latest catalog freshness date is current.
- [ ] No expired promo appears in top recommendations.
- [ ] Privacy/terms/disclosure pages match current behavior.
- [ ] App Privacy labels match `/app-privacy-details`.
- [ ] Support email is valid and monitored.

If all boxes are checked, proceed to App Review submission.
