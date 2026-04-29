import { buildResult, fetchHtml, pickPriceByHints } from "./utils.mjs";

export async function runSlingAdapter(source) {
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

  const orange = pickPriceByHints(fetched.html, ["sling orange", "orange"]);
  const blue = pickPriceByHints(fetched.html, ["sling blue", "blue"]);
  const orangeBluePromo = pickPriceByHints(fetched.html, [
    "orange & blue",
    "first month",
    "half off",
  ]);

  return buildResult({
    sourceId: source.sourceId,
    provider: source.providerName,
    url: source.pricingPageUrl,
    checks: [
      {
        field: "sling_orange_direct.monthly",
        label: "Sling Orange",
        detectedPrice: orange,
        expectedPrice: 45.99,
      },
      {
        field: "sling_blue_direct.monthly",
        label: "Sling Blue",
        detectedPrice: blue,
        expectedPrice: 45.99,
      },
      {
        field: "sling_orange_blue_promo.monthly",
        label: "Sling Orange & Blue promo",
        detectedPrice: orangeBluePromo,
        expectedPrice: 29.99,
      },
    ],
    notes: [
      "Sling pricing pages can show regional channel package variants; verify base package context.",
    ],
    fetchMeta: { ok: true, status: fetched.status },
  });
}

