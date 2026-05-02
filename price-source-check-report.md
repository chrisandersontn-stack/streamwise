## Price source check report

Generated at: 2026-04-30T03:58:33.648Z
Adapters run: 14
Detected changes: 15
Unknown checks (manual review): 0
Manual review task groups: 5
Fetch failures: 1
Verification status: degraded
Browser fallback attempted: 0
Browser fallback recovered: 0
Browser fallback skipped: 0
Source states (automated/manual/failed/manual-required): 9/0/0/5

### Adapter coverage

### Fetch failures (not verified)

- **Xfinity** (`xfinity_offers`)
  - URL: https://www.xfinity.com/learn/offers
  - Status: 403
  - Error: HTTP 403
  - Fetch mode: http
  - Classified as: blocked_or_unauthorized

When fetch failures exist, `0 detected changes` does not imply prices were verified.

Failure breakdown:

- blocked_or_unauthorized: 1

### Per-source verification state

- **Netflix** (`netflix_signup`): verified_automated
  - Signals: fetchOk=yes, checksDetected=2, manualTasks=0

- **Hulu** (`hulu_start`): verified_automated
  - Signals: fetchOk=yes, checksDetected=3, manualTasks=0

- **Disney+** (`disneyplus_pricing`): verified_automated
  - Signals: fetchOk=yes, checksDetected=3, manualTasks=0

- **Peacock** (`peacock_pricing`): verified_automated
  - Signals: fetchOk=yes, checksDetected=1, manualTasks=0

- **Max (HBO)** (`max_pricing`): verified_automated
  - Signals: fetchOk=yes, checksDetected=1, manualTasks=0

- **Walmart+** (`walmart_plus`): manual_required
  - Signals: fetchOk=yes, checksDetected=0, manualTasks=3

- **Instacart+** (`instacart_plus`): manual_required
  - Signals: fetchOk=yes, checksDetected=0, manualTasks=3

- **Verizon** (`verizon_unlimited_bundles`): manual_required
  - Signals: fetchOk=yes, checksDetected=0, manualTasks=3

- **T-Mobile** (`tmobile_offers`): manual_required
  - Signals: fetchOk=yes, checksDetected=0, manualTasks=3

- **Xfinity** (`xfinity_offers`): manual_required
  - Signals: fetchOk=no, checksDetected=0, manualTasks=3

- **YouTube TV** (`youtube_tv_pricing`): verified_automated
  - Signals: fetchOk=yes, checksDetected=2, manualTasks=0

- **Sling TV** (`sling_pricing`): verified_automated
  - Signals: fetchOk=yes, checksDetected=3, manualTasks=0

- **Fubo** (`fubo_pricing`): verified_automated
  - Signals: fetchOk=yes, checksDetected=2, manualTasks=0

- **Philo** (`philo_pricing`): verified_automated
  - Signals: fetchOk=yes, checksDetected=2, manualTasks=0

- **Netflix** (`netflix_signup`)
  - URL: https://www.netflix.com/signup
  - Fetch: ok (status 200)
  - Note: Region-specific pricing can vary; treat this as US default check.

- **Hulu** (`hulu_start`)
  - URL: https://www.hulu.com/start
  - Fetch: ok (status 200)
  - Note: Promo and naming on Hulu pages can shift between Duo/Trio labels.
  - Note: Manual verification required when parser picks first generic price on the page.

- **Disney+** (`disneyplus_pricing`)
  - URL: https://www.disneyplus.com/
  - Fetch: ok (status 200)
  - Note: Disney+ pages may direct to Hulu checkout for full bundle details.
  - Note: Treat extracted values as candidates and verify against official checkout labels.

- **Peacock** (`peacock_pricing`)
  - URL: https://www.peacocktv.com/
  - Fetch: ok (status 200)
  - Note: Peacock often rotates limited-time offers; validate whether detected price is intro or standard.

- **Max (HBO)** (`max_pricing`)
  - URL: https://www.max.com/
  - Fetch: ok (status 200)
  - Note: Max frequently features promo placements; confirm whether detected value is recurring monthly pricing.

- **Walmart+** (`walmart_plus`)
  - URL: https://www.walmart.com/plus
  - Fetch: ok (status 200)
  - Note: Walmart+ member benefits can change by account and campaign.
  - Note: Use this adapter as a manual review trigger, not an auto-pricing extractor.

- **Instacart+** (`instacart_plus`)
  - URL: https://www.instacart.com/plus
  - Fetch: ok (status 200)
  - Note: Instacart+ benefits and Peacock inclusion can vary by plan/region and campaign.
  - Note: Use this adapter as a manual review trigger, not an auto-pricing extractor.

- **Verizon** (`verizon_unlimited_bundles`)
  - URL: https://www.verizon.com/plans/unlimited/
  - Fetch: ok (status 200)
  - Note: Carrier-gated pricing often varies by plan eligibility and account state.
  - Note: Use this adapter as a manual review trigger, not an auto-pricing extractor.

- **T-Mobile** (`tmobile_offers`)
  - URL: https://www.t-mobile.com/offers
  - Fetch: ok (status 200)
  - Note: T-Mobile perks are highly plan-dependent and may require logged-in account context.
  - Note: Use this adapter as a manual review trigger, not an auto-pricing extractor.

- **Xfinity** (`xfinity_offers`)
  - URL: https://www.xfinity.com/learn/offers
  - Fetch: failed (status 403)
  - Note: Xfinity StreamSaver access can depend on account type and regional availability.
  - Note: Use this adapter as a manual review trigger, not an auto-pricing extractor.

- **YouTube TV** (`youtube_tv_pricing`)
  - URL: https://tv.youtube.com/
  - Fetch: ok (status 200)
  - Note: YouTube TV promos can be gated to new subscribers and time-limited; verify intro duration separately.

- **Sling TV** (`sling_pricing`)
  - URL: https://www.sling.com/
  - Fetch: ok (status 200)
  - Note: Sling pricing pages can show regional channel package variants; verify base package context.

- **Fubo** (`fubo_pricing`)
  - URL: https://www.fubo.tv/
  - Fetch: ok (status 200)
  - Note: Fubo may show package-dependent prices by market and tax/RSN fees separately.

- **Philo** (`philo_pricing`)
  - URL: https://www.philo.com/
  - Fetch: ok (status 200)
  - Note: Philo support pages can contain historical plan references; verify current package naming.

### Candidate price changes

- **Netflix** · Netflix Standard with Ads
  - Field: `netflix_direct.monthly`
  - Expected: $8.99
  - Detected: $1.00
  - Delta: $-7.99
  - Source: https://www.netflix.com/signup

- **Hulu** · Hulu (With Ads)
  - Field: `hulu_direct.monthly`
  - Expected: $11.99
  - Detected: $19.99
  - Delta: +$8.00
  - Source: https://www.hulu.com/start

- **Hulu** · Disney+, Hulu, ESPN Bundle
  - Field: `disney_hulu_espn_unlimited_bundle.monthly`
  - Expected: $35.99
  - Detected: $12.99
  - Delta: $-23.00
  - Source: https://www.hulu.com/start

- **Disney+** · Disney+ (With Ads)
  - Field: `disney_direct.monthly`
  - Expected: $11.99
  - Detected: $35.99
  - Delta: +$24.00
  - Source: https://www.disneyplus.com/

- **Disney+** · Disney+, Hulu Bundle
  - Field: `disney_hulu_bundle.monthly`
  - Expected: $12.99
  - Detected: $11.99
  - Delta: $-1.00
  - Source: https://www.disneyplus.com/

- **Disney+** · Disney+, Hulu, ESPN Bundle
  - Field: `disney_hulu_espn_unlimited_bundle.monthly`
  - Expected: $35.99
  - Detected: $11.99
  - Delta: $-24.00
  - Source: https://www.disneyplus.com/

- **Peacock** · Peacock Premium
  - Field: `peacock_direct.monthly`
  - Expected: $10.99
  - Detected: $2.99
  - Delta: $-8.00
  - Source: https://www.peacocktv.com/

- **Max (HBO)** · Max Basic with Ads
  - Field: `max_direct.monthly`
  - Expected: $10.99
  - Detected: $14.98
  - Delta: +$3.99
  - Source: https://www.max.com/

- **YouTube TV** · YouTube TV Base Plan
  - Field: `youtube_tv_direct.monthly`
  - Expected: $82.99
  - Detected: $0.00
  - Delta: $-82.99
  - Source: https://tv.youtube.com/

- **Sling TV** · Sling Orange
  - Field: `sling_orange_direct.monthly`
  - Expected: $45.99
  - Detected: $4.99
  - Delta: $-41.00
  - Source: https://www.sling.com/

- **Sling TV** · Sling Blue
  - Field: `sling_blue_direct.monthly`
  - Expected: $45.99
  - Detected: $4.99
  - Delta: $-41.00
  - Source: https://www.sling.com/

- **Sling TV** · Sling Orange & Blue promo
  - Field: `sling_orange_blue_promo.monthly`
  - Expected: $29.99
  - Detected: $4.99
  - Delta: $-25.00
  - Source: https://www.sling.com/

- **Fubo** · Fubo promo plan
  - Field: `fubo_promo.monthly`
  - Expected: $45.99
  - Detected: $0.00
  - Delta: $-45.99
  - Source: https://www.fubo.tv/

- **Fubo** · Fubo standard monthly after promo
  - Field: `fubo_promo.standardMonthly`
  - Expected: $55.99
  - Detected: $0.00
  - Delta: $-55.99
  - Source: https://www.fubo.tv/

- **Philo** · Philo Bundle+
  - Field: `philo_bundle_plus.monthly`
  - Expected: $33.00
  - Detected: $25.00
  - Delta: $-8.00
  - Source: https://www.philo.com/

### Manual review tasks

- **Walmart+** (`walmart_plus`)
  - URL: https://www.walmart.com/plus
  - [ ] Verify Walmart+ membership monthly price.
  - [ ] Confirm streaming benefit options (Paramount+ vs Peacock) and exclusivity rules.
  - [ ] Update catalog values/notes with current eligibility text and lastChecked.

- **Instacart+** (`instacart_plus`)
  - URL: https://www.instacart.com/plus
  - [ ] Verify Instacart+ membership monthly price.
  - [ ] Confirm Peacock included benefit details and activation flow.
  - [ ] Update catalog option notes/fields and lastChecked date.

- **Verizon** (`verizon_unlimited_bundles`)
  - URL: https://www.verizon.com/plans/unlimited/
  - [ ] Verify Verizon Disney+/Hulu/ESPN perk monthly charge and eligibility terms.
  - [ ] Confirm any scheduled price changes and effective dates.
  - [ ] Update catalog option(s) and set lastChecked after verification.

- **T-Mobile** (`tmobile_offers`)
  - URL: https://www.t-mobile.com/offers
  - [ ] Confirm Netflix On Us and Apple TV+ benefit pricing by eligible plan family.
  - [ ] Verify if listed prices are recurring or promotional.
  - [ ] Update catalog options with current terms and lastChecked date.

- **Xfinity** (`xfinity_offers`)
  - URL: https://www.xfinity.com/learn/offers
  - [ ] Confirm StreamSaver monthly price and covered services (Netflix/Peacock/Apple TV+).
  - [ ] Verify eligibility constraints (internet/tv customer requirements).
  - [ ] Update catalog option values and lastChecked date.

