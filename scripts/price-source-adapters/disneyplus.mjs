import { buildResult, fetchHtml, pickPriceByHints } from "./utils.mjs";

export async function runDisneyPlusAdapter(source) {
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

  const disneyBase = pickPriceByHints(fetched.html, [
    "disney+ (with ads)",
    "disney+",
  ]);
  const duo = pickPriceByHints(fetched.html, ["duo basic", "disney+, hulu"]);
  const trio = pickPriceByHints(fetched.html, ["trio basic", "disney+, hulu, espn"]);

  return buildResult({
    sourceId: source.sourceId,
    provider: source.providerName,
    url: source.pricingPageUrl,
    checks: [
      {
        field: "disney_direct.monthly",
        label: "Disney+ (With Ads)",
        detectedPrice: disneyBase,
        expectedPrice: 11.99,
      },
      {
        field: "disney_hulu_bundle.monthly",
        label: "Disney+, Hulu Bundle",
        detectedPrice: duo,
        expectedPrice: 12.99,
      },
      {
        field: "disney_hulu_espn_unlimited_bundle.monthly",
        label: "Disney+, Hulu, ESPN Bundle",
        detectedPrice: trio,
        expectedPrice: 35.99,
      },
    ],
    notes: [
      "Disney+ pages may direct to Hulu checkout for full bundle details.",
      "Treat extracted values as candidates and verify against official checkout labels.",
    ],
    fetchMeta: { ok: true, status: fetched.status },
  });
}

