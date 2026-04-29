import { buildResult, fetchHtml } from "./utils.mjs";

export async function runWalmartPlusAdapter(source) {
  const fetched = await fetchHtml(source.pricingPageUrl);

  return buildResult({
    sourceId: source.sourceId,
    provider: source.providerName,
    url: source.pricingPageUrl,
    checks: [],
    notes: [
      "Walmart+ member benefits can change by account and campaign.",
      "Use this adapter as a manual review trigger, not an auto-pricing extractor.",
    ],
    fetchMeta: {
      ok: fetched.ok,
      status: fetched.status,
      error: fetched.ok ? "" : fetched.error,
    },
    manualReviewTasks: [
      "Verify Walmart+ membership monthly price.",
      "Confirm streaming benefit options (Paramount+ vs Peacock) and exclusivity rules.",
      "Update catalog values/notes with current eligibility text and lastChecked.",
    ],
  });
}

