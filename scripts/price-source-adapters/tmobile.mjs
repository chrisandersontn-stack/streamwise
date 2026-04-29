import { buildResult, fetchHtml } from "./utils.mjs";

export async function runTmobileAdapter(source) {
  const fetched = await fetchHtml(source.pricingPageUrl);

  return buildResult({
    sourceId: source.sourceId,
    provider: source.providerName,
    url: source.pricingPageUrl,
    checks: [],
    notes: [
      "T-Mobile perks are highly plan-dependent and may require logged-in account context.",
      "Use this adapter as a manual review trigger, not an auto-pricing extractor.",
    ],
    fetchMeta: {
      ok: fetched.ok,
      status: fetched.status,
      error: fetched.ok ? "" : fetched.error,
    },
    manualReviewTasks: [
      "Confirm Netflix On Us and Apple TV+ benefit pricing by eligible plan family.",
      "Verify if listed prices are recurring or promotional.",
      "Update catalog options with current terms and lastChecked date.",
    ],
  });
}

