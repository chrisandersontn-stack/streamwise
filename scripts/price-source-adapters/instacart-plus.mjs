import { buildResult, fetchHtml } from "./utils.mjs";

export async function runInstacartPlusAdapter(source) {
  const fetched = await fetchHtml(source.pricingPageUrl);

  return buildResult({
    sourceId: source.sourceId,
    provider: source.providerName,
    url: source.pricingPageUrl,
    checks: [],
    notes: [
      "Instacart+ benefits and Peacock inclusion can vary by plan/region and campaign.",
      "Use this adapter as a manual review trigger, not an auto-pricing extractor.",
    ],
    fetchMeta: {
      ok: fetched.ok,
      status: fetched.status,
      error: fetched.ok ? "" : fetched.error,
    },
    manualReviewTasks: [
      "Verify Instacart+ membership monthly price.",
      "Confirm Peacock included benefit details and activation flow.",
      "Update catalog option notes/fields and lastChecked date.",
    ],
  });
}

