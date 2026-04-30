import { buildResult, fetchHtml, pickBestPrice } from "./utils.mjs";

export async function runPeacockAdapter(source) {
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

  const premium = pickBestPrice(fetched.html, [
    "peacock premium",
    "premium",
  ]);

  return buildResult({
    sourceId: source.sourceId,
    provider: source.providerName,
    url: source.pricingPageUrl,
    checks: [
      {
        field: "peacock_direct.monthly",
        label: "Peacock Premium",
        detectedPrice: premium,
        expectedPrice: 10.99,
      },
    ],
    notes: [
      "Peacock often rotates limited-time offers; validate whether detected price is intro or standard.",
    ],
    fetchMeta: { ok: true, status: fetched.status },
  });
}

