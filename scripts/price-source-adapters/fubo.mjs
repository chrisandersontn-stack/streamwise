import { buildResult, fetchHtml, pickPriceByHints } from "./utils.mjs";

export async function runFuboAdapter(source) {
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

  const promo = pickPriceByHints(fetched.html, [
    "first month",
    "promo",
    "intro",
  ]);
  const standard = pickPriceByHints(fetched.html, ["regular", "monthly", "pro"]);

  return buildResult({
    sourceId: source.sourceId,
    provider: source.providerName,
    url: source.pricingPageUrl,
    checks: [
      {
        field: "fubo_direct.monthly",
        label: "Fubo Pro (ongoing)",
        detectedPrice: standard,
        expectedPrice: 55.99,
      },
      {
        field: "fubo_promo.monthly",
        label: "Fubo promo plan",
        detectedPrice: promo,
        expectedPrice: 45.99,
      },
      {
        field: "fubo_promo.standardMonthly",
        label: "Fubo standard monthly after promo",
        detectedPrice: standard,
        expectedPrice: 55.99,
      },
    ],
    notes: [
      "Fubo may show package-dependent prices by market and tax/RSN fees separately.",
    ],
    fetchMeta: { ok: true, status: fetched.status },
  });
}

