import { buildResult, fetchHtml } from "./utils.mjs";

export async function runVerizonAdapter(source) {
  const fetched = await fetchHtml(source.pricingPageUrl);

  return buildResult({
    sourceId: source.sourceId,
    provider: source.providerName,
    url: source.pricingPageUrl,
    checks: [],
    notes: [
      "Carrier-gated pricing often varies by plan eligibility and account state.",
      "Use this adapter as a manual review trigger, not an auto-pricing extractor.",
    ],
    fetchMeta: {
      ok: fetched.ok,
      status: fetched.status,
      error: fetched.ok ? "" : fetched.error,
    },
    manualReviewTasks: [
      "Verify Verizon Disney+/Hulu/ESPN perk monthly charge and eligibility terms.",
      "Confirm any scheduled price changes and effective dates.",
      "Update catalog option(s) and set lastChecked after verification.",
    ],
  });
}

