import { buildResult, fetchHtml, pickPriceByHints } from "./utils.mjs";

export async function runYoutubeTvAdapter(source) {
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

  const basePlan = pickPriceByHints(fetched.html, [
    "base plan",
    "youtube tv",
  ]);
  const promo = pickPriceByHints(fetched.html, [
    "introductory",
    "for the first",
    "new users",
  ]);

  return buildResult({
    sourceId: source.sourceId,
    provider: source.providerName,
    url: source.pricingPageUrl,
    checks: [
      {
        field: "youtube_tv_direct.monthly",
        label: "YouTube TV Base Plan",
        detectedPrice: basePlan,
        expectedPrice: 82.99,
      },
      {
        field: "youtube_tv_promo.monthly",
        label: "YouTube TV promo",
        detectedPrice: promo,
        expectedPrice: 67.99,
      },
    ],
    notes: [
      "YouTube TV promos can be gated to new subscribers and time-limited; verify intro duration separately.",
    ],
    fetchMeta: { ok: true, status: fetched.status },
  });
}

