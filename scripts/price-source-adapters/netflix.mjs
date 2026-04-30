import { buildResult, fetchHtml, pickBestPrice } from "./utils.mjs";

export async function runNetflixAdapter(source) {
  const fetched = await fetchHtml(source.pricingPageUrl);
  if (!fetched.ok) {
    return buildResult({
      sourceId: source.sourceId,
      provider: source.providerName,
      url: source.pricingPageUrl,
      checks: [],
      notes: [`Fetch failed: ${fetched.error}`],
      fetchMeta: { ok: false, status: fetched.status, error: fetched.error },
    });
  }

  const standardWithAds = pickBestPrice(fetched.html, [
    "standard with ads",
    "standard",
  ]);
  const premium = pickBestPrice(fetched.html, ["premium"]);

  return buildResult({
    sourceId: source.sourceId,
    provider: source.providerName,
    url: source.pricingPageUrl,
    checks: [
      {
        field: "netflix_direct.monthly",
        label: "Netflix Standard with Ads",
        detectedPrice: standardWithAds,
        expectedPrice: 8.99,
      },
      {
        field: "netflix_premium_reference.monthly",
        label: "Netflix Premium (reference only)",
        detectedPrice: premium,
        expectedPrice: null,
      },
    ],
    notes: ["Region-specific pricing can vary; treat this as US default check."],
    fetchMeta: { ok: true, status: fetched.status },
  });
}

