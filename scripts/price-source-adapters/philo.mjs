import { buildResult, fetchHtml, pickPriceByHints } from "./utils.mjs";

export async function runPhiloAdapter(source) {
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

  const essential = pickPriceByHints(fetched.html, [
    "philo",
    "essential",
    "monthly",
  ]);
  const bundlePlus = pickPriceByHints(fetched.html, [
    "bundle+",
    "philo bundle",
  ]);

  return buildResult({
    sourceId: source.sourceId,
    provider: source.providerName,
    url: source.pricingPageUrl,
    checks: [
      {
        field: "philo_essential_direct.monthly",
        label: "Philo Essential",
        detectedPrice: essential,
        expectedPrice: 25,
      },
      {
        field: "philo_bundle_plus.monthly",
        label: "Philo Bundle+",
        detectedPrice: bundlePlus,
        expectedPrice: 33,
      },
    ],
    notes: [
      "Philo support pages can contain historical plan references; verify current package naming.",
    ],
    fetchMeta: { ok: true, status: fetched.status },
  });
}

