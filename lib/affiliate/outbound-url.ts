function appendAmazonAssociatesTag(url: string, tag: string) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith("amazon.com")) {
      return url;
    }

    parsed.searchParams.set("tag", tag);
    return parsed.toString();
  } catch {
    return url;
  }
}

function appendWalmartAffiliate(url: string, affiliateParam: string) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith("walmart.com")) {
      return url;
    }

    // Many Walmart affiliate setups append a tracking query param.
    // Put your exact param string in WALMART_AFFILIATE_QUERY (example: "affiliateId=...").
    const fragment = affiliateParam.startsWith("?")
      ? affiliateParam.slice(1)
      : affiliateParam;
    const params = new URLSearchParams(fragment);
    params.forEach((value, key) => {
      parsed.searchParams.set(key, value);
    });
    return parsed.toString();
  } catch {
    return url;
  }
}

function normalizeKnownBrokenSourceUrl(url: string) {
  const normalized = url.trim();
  const knownHuluFallback = "https://www.hulu.com/disney-hulu-bundle";
  const knownBrokenHuluUrls = new Set([
    "https://help.hulu.com/article/hulu-offer-2026",
    "https://www.hulu.com/start",
  ]);
  if (knownBrokenHuluUrls.has(normalized)) {
    return knownHuluFallback;
  }
  return normalized;
}

/**
 * True when the option can resolve to a real outbound destination (affiliate or official).
 */
export function hasResolvableOutbound(input: {
  sourceUrl?: string;
  affiliateUrl?: string;
}): boolean {
  return Boolean(input.affiliateUrl?.trim() || input.sourceUrl?.trim());
}

export function resolveOutboundSourceUrl(input: {
  sourceUrl?: string;
  affiliateUrl?: string;
}): { href: string; kind: "affiliate_override" | "amazon_associates" | "walmart_affiliate" | "official" } {
  const affiliateUrl = input.affiliateUrl?.trim();
  if (affiliateUrl) {
    return { href: affiliateUrl, kind: "affiliate_override" };
  }

  const sourceUrl = input.sourceUrl
    ? normalizeKnownBrokenSourceUrl(input.sourceUrl.trim())
    : undefined;
  if (!sourceUrl) {
    return { href: "#", kind: "official" };
  }

  const amazonTag = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATES_TAG?.trim();
  if (amazonTag && sourceUrl.includes("amazon.com")) {
    return {
      href: appendAmazonAssociatesTag(sourceUrl, amazonTag),
      kind: "amazon_associates",
    };
  }

  const walmartAffiliateQuery = process.env.NEXT_PUBLIC_WALMART_AFFILIATE_QUERY?.trim();
  if (walmartAffiliateQuery && sourceUrl.includes("walmart.com")) {
    return {
      href: appendWalmartAffiliate(sourceUrl, walmartAffiliateQuery),
      kind: "walmart_affiliate",
    };
  }

  return { href: sourceUrl, kind: "official" };
}
