import { buildResult, fetchHtml } from "./utils.mjs";

export async function runXfinityAdapter(source) {
  const fetched = await fetchHtml(source.pricingPageUrl);

  return buildResult({
    sourceId: source.sourceId,
    provider: source.providerName,
    url: source.pricingPageUrl,
    checks: [],
    notes: [
      "Xfinity StreamSaver access can depend on account type and regional availability.",
      "Use this adapter as a manual review trigger, not an auto-pricing extractor.",
    ],
    fetchMeta: {
      ok: fetched.ok,
      status: fetched.status,
      error: fetched.ok ? "" : fetched.error,
    },
    manualReviewTasks: [
      "Confirm StreamSaver monthly price and covered services (Netflix/Peacock/Apple TV+).",
      "Verify eligibility constraints (internet/tv customer requirements).",
      "Update catalog option values and lastChecked date.",
    ],
  });
}

