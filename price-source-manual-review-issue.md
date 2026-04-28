## Price source manual review checklist

Generated at: 2026-04-28T20:50:56.045Z
Manual review groups: 5

### How to use

1. Work from top to bottom by priority.
2. Open source URL and verify current pricing/eligibility in an incognito window.
3. Update catalog values and `lastChecked`, then run catalog diff before publish.

### Provider tasks

- [ ] **Instacart+** (`instacart_plus`) · Priority 1
  - URL: https://www.instacart.com/plus
  - [ ] Verify Instacart+ membership monthly price.
  - [ ] Confirm Peacock included benefit details and activation flow.
  - [ ] Update catalog option notes/fields and lastChecked date.

- [ ] **T-Mobile** (`tmobile_offers`) · Priority 1
  - URL: https://www.t-mobile.com/offers
  - [ ] Confirm Netflix On Us and Apple TV+ benefit pricing by eligible plan family.
  - [ ] Verify if listed prices are recurring or promotional.
  - [ ] Update catalog options with current terms and lastChecked date.

- [ ] **Verizon** (`verizon_unlimited_bundles`) · Priority 1
  - URL: https://www.verizon.com/plans/unlimited/
  - [ ] Verify Verizon Disney+/Hulu/ESPN perk monthly charge and eligibility terms.
  - [ ] Confirm any scheduled price changes and effective dates.
  - [ ] Update catalog option(s) and set lastChecked after verification.

- [ ] **Walmart+** (`walmart_plus`) · Priority 1
  - URL: https://www.walmart.com/plus
  - [ ] Verify Walmart+ membership monthly price.
  - [ ] Confirm streaming benefit options (Paramount+ vs Peacock) and exclusivity rules.
  - [ ] Update catalog values/notes with current eligibility text and lastChecked.

- [ ] **Xfinity** (`xfinity_offers`) · Priority 1
  - URL: https://www.xfinity.com/learn/offers
  - [ ] Confirm StreamSaver monthly price and covered services (Netflix/Peacock/Apple TV+).
  - [ ] Verify eligibility constraints (internet/tv customer requirements).
  - [ ] Update catalog option values and lastChecked date.

### Publish guardrail

- [ ] Run `npm run catalog:diff -- <before.json> <after.json>`
- [ ] Publish only after confirming changes are intentional

