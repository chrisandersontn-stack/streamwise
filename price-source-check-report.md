## Price source check report

Generated at: 2026-04-28T20:50:56.045Z
Adapters run: 14
Detected changes: 0
Unknown checks (manual review): 0
Manual review task groups: 5
Fetch failures: 14
Verification status: degraded
Browser fallback attempted: 0
Browser fallback recovered: 0
Browser fallback skipped: 0
Source states (automated/manual/failed/manual-required): 0/0/9/5

### Adapter coverage

### Fetch failures (not verified)

- **Netflix** (`netflix_signup`)
  - URL: https://www.netflix.com/signup
  - Status: 0
  - Error: fetch failed
  - Fetch mode: http
  - Classified as: runtime_fetch_failure

- **Hulu** (`hulu_start`)
  - URL: https://www.hulu.com/start
  - Status: 0
  - Error: fetch failed
  - Fetch mode: http
  - Classified as: runtime_fetch_failure

- **Disney+** (`disneyplus_pricing`)
  - URL: https://www.disneyplus.com/
  - Status: 0
  - Error: fetch failed
  - Fetch mode: http
  - Classified as: runtime_fetch_failure

- **Peacock** (`peacock_pricing`)
  - URL: https://www.peacocktv.com/
  - Status: 0
  - Error: fetch failed
  - Fetch mode: http
  - Classified as: runtime_fetch_failure

- **Max (HBO)** (`max_pricing`)
  - URL: https://www.max.com/
  - Status: 0
  - Error: fetch failed
  - Fetch mode: http
  - Classified as: runtime_fetch_failure

- **Walmart+** (`walmart_plus`)
  - URL: https://www.walmart.com/plus
  - Status: 0
  - Error: fetch failed
  - Fetch mode: http
  - Classified as: runtime_fetch_failure

- **Instacart+** (`instacart_plus`)
  - URL: https://www.instacart.com/plus
  - Status: 0
  - Error: fetch failed
  - Fetch mode: http
  - Classified as: runtime_fetch_failure

- **Verizon** (`verizon_unlimited_bundles`)
  - URL: https://www.verizon.com/plans/unlimited/
  - Status: 0
  - Error: fetch failed
  - Fetch mode: http
  - Classified as: runtime_fetch_failure

- **T-Mobile** (`tmobile_offers`)
  - URL: https://www.t-mobile.com/offers
  - Status: 0
  - Error: fetch failed
  - Fetch mode: http
  - Classified as: runtime_fetch_failure

- **Xfinity** (`xfinity_offers`)
  - URL: https://www.xfinity.com/learn/offers
  - Status: 0
  - Error: fetch failed
  - Fetch mode: http
  - Classified as: runtime_fetch_failure

- **YouTube TV** (`youtube_tv_pricing`)
  - URL: https://tv.youtube.com/
  - Status: 0
  - Error: fetch failed
  - Fetch mode: http
  - Classified as: runtime_fetch_failure

- **Sling TV** (`sling_pricing`)
  - URL: https://www.sling.com/
  - Status: 0
  - Error: fetch failed
  - Fetch mode: http
  - Classified as: runtime_fetch_failure

- **Fubo** (`fubo_pricing`)
  - URL: https://www.fubo.tv/
  - Status: 0
  - Error: fetch failed
  - Fetch mode: http
  - Classified as: runtime_fetch_failure

- **Philo** (`philo_pricing`)
  - URL: https://www.philo.com/
  - Status: 0
  - Error: fetch failed
  - Fetch mode: http
  - Classified as: runtime_fetch_failure

When fetch failures exist, `0 detected changes` does not imply prices were verified.

Failure breakdown:

- runtime_fetch_failure: 14

### Per-source verification state

- **Netflix** (`netflix_signup`): failed_fetch
  - Signals: fetchOk=no, checksDetected=0, manualTasks=0

- **Hulu** (`hulu_start`): failed_fetch
  - Signals: fetchOk=no, checksDetected=0, manualTasks=0

- **Disney+** (`disneyplus_pricing`): failed_fetch
  - Signals: fetchOk=no, checksDetected=0, manualTasks=0

- **Peacock** (`peacock_pricing`): failed_fetch
  - Signals: fetchOk=no, checksDetected=0, manualTasks=0

- **Max (HBO)** (`max_pricing`): failed_fetch
  - Signals: fetchOk=no, checksDetected=0, manualTasks=0

- **Walmart+** (`walmart_plus`): manual_required
  - Signals: fetchOk=no, checksDetected=0, manualTasks=3

- **Instacart+** (`instacart_plus`): manual_required
  - Signals: fetchOk=no, checksDetected=0, manualTasks=3

- **Verizon** (`verizon_unlimited_bundles`): manual_required
  - Signals: fetchOk=no, checksDetected=0, manualTasks=3

- **T-Mobile** (`tmobile_offers`): manual_required
  - Signals: fetchOk=no, checksDetected=0, manualTasks=3

- **Xfinity** (`xfinity_offers`): manual_required
  - Signals: fetchOk=no, checksDetected=0, manualTasks=3

- **YouTube TV** (`youtube_tv_pricing`): failed_fetch
  - Signals: fetchOk=no, checksDetected=0, manualTasks=0

- **Sling TV** (`sling_pricing`): failed_fetch
  - Signals: fetchOk=no, checksDetected=0, manualTasks=0

- **Fubo** (`fubo_pricing`): failed_fetch
  - Signals: fetchOk=no, checksDetected=0, manualTasks=0

- **Philo** (`philo_pricing`): failed_fetch
  - Signals: fetchOk=no, checksDetected=0, manualTasks=0

- **Netflix** (`netflix_signup`)
  - URL: https://www.netflix.com/signup
  - Fetch: failed
  - Note: Fetch failed: fetch failed

- **Hulu** (`hulu_start`)
  - URL: https://www.hulu.com/start
  - Fetch: failed
  - Note: Fetch failed: fetch failed

- **Disney+** (`disneyplus_pricing`)
  - URL: https://www.disneyplus.com/
  - Fetch: failed
  - Note: Fetch failed: fetch failed

- **Peacock** (`peacock_pricing`)
  - URL: https://www.peacocktv.com/
  - Fetch: failed
  - Note: Fetch failed: fetch failed

- **Max (HBO)** (`max_pricing`)
  - URL: https://www.max.com/
  - Fetch: failed
  - Note: Fetch failed: fetch failed

- **Walmart+** (`walmart_plus`)
  - URL: https://www.walmart.com/plus
  - Fetch: failed
  - Note: Walmart+ member benefits can change by account and campaign.
  - Note: Use this adapter as a manual review trigger, not an auto-pricing extractor.

- **Instacart+** (`instacart_plus`)
  - URL: https://www.instacart.com/plus
  - Fetch: failed
  - Note: Instacart+ benefits and Peacock inclusion can vary by plan/region and campaign.
  - Note: Use this adapter as a manual review trigger, not an auto-pricing extractor.

- **Verizon** (`verizon_unlimited_bundles`)
  - URL: https://www.verizon.com/plans/unlimited/
  - Fetch: failed
  - Note: Carrier-gated pricing often varies by plan eligibility and account state.
  - Note: Use this adapter as a manual review trigger, not an auto-pricing extractor.

- **T-Mobile** (`tmobile_offers`)
  - URL: https://www.t-mobile.com/offers
  - Fetch: failed
  - Note: T-Mobile perks are highly plan-dependent and may require logged-in account context.
  - Note: Use this adapter as a manual review trigger, not an auto-pricing extractor.

- **Xfinity** (`xfinity_offers`)
  - URL: https://www.xfinity.com/learn/offers
  - Fetch: failed
  - Note: Xfinity StreamSaver access can depend on account type and regional availability.
  - Note: Use this adapter as a manual review trigger, not an auto-pricing extractor.

- **YouTube TV** (`youtube_tv_pricing`)
  - URL: https://tv.youtube.com/
  - Fetch: failed
  - Note: Fetch failed: fetch failed

- **Sling TV** (`sling_pricing`)
  - URL: https://www.sling.com/
  - Fetch: failed
  - Note: Fetch failed: fetch failed

- **Fubo** (`fubo_pricing`)
  - URL: https://www.fubo.tv/
  - Fetch: failed
  - Note: Fetch failed: fetch failed

- **Philo** (`philo_pricing`)
  - URL: https://www.philo.com/
  - Fetch: failed
  - Note: Fetch failed: fetch failed

### Candidate price changes

No price deltas detected versus current expected values.

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

