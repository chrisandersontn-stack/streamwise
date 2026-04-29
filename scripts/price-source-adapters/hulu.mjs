import { buildResult, fetchHtml, pickPriceByHints } from "./utils.mjs";

export async function runHuluAdapter(source) {
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

  const huluWithAds = pickPriceByHints(fetched.html, ["hulu (with ads)", "hulu"]);
  const disneyBundle = pickPriceByHints(fetched.html, [
    "disney+, hulu bundle",
    "duo basic",
  ]);
  const disneyHuluEspn = pickPriceByHints(fetched.html, [
    "disney+, hulu, espn",
    "trio basic",
  ]);

  return buildResult({
    sourceId: source.sourceId,
    provider: source.providerName,
    url: source.pricingPageUrl,
    checks: [
      {
        field: "hulu_direct.monthly",
        label: "Hulu (With Ads)",
        detectedPrice: huluWithAds,
        expectedPrice: 11.99,
      },
      {
        field: "disney_hulu_bundle.monthly",
        label: "Disney+, Hulu Bundle",
        detectedPrice: disneyBundle,
        expectedPrice: 12.99,
      },
      {
        field: "disney_hulu_espn_unlimited_bundle.monthly",
        label: "Disney+, Hulu, ESPN Bundle",
        detectedPrice: disneyHuluEspn,
        expectedPrice: 35.99,
      },
    ],
    notes: [
      "Promo and naming on Hulu pages can shift between Duo/Trio labels.",
      "Manual verification required when parser picks first generic price on the page.",
    ],
    fetchMeta: { ok: true, status: fetched.status },
  });
}

