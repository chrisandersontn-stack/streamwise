import { buildResult, fetchHtml, pickPriceByHints } from "./utils.mjs";

export async function runMaxAdapter(source) {
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

  const basicWithAds = pickPriceByHints(fetched.html, [
    "basic with ads",
    "with ads",
    "basic",
  ]);

  return buildResult({
    sourceId: source.sourceId,
    provider: source.providerName,
    url: source.pricingPageUrl,
    checks: [
      {
        field: "max_direct.monthly",
        label: "Max Basic with Ads",
        detectedPrice: basicWithAds,
        expectedPrice: 10.99,
      },
    ],
    notes: [
      "Max frequently features promo placements; confirm whether detected value is recurring monthly pricing.",
    ],
    fetchMeta: { ok: true, status: fetched.status },
  });
}

