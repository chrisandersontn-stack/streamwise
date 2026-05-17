/** CJ deep link for NordVPN card (override via env without redeploying copy). */
export function getCjNordVpnUrl(): string {
  return (
    process.env.NEXT_PUBLIC_CJ_NORDVPN_URL?.trim() ||
    "https://www.dpbolvw.net/click-101740617-13914989"
  );
}

/** When set in Vercel, applies to all catalog options whose id starts with the prefix. */
const CJ_PREFIX_ENV: Array<{ prefix: string; envKey: string }> = [
  { prefix: "youtube_tv_", envKey: "NEXT_PUBLIC_CJ_URL_YOUTUBE_TV" },
  { prefix: "sling_", envKey: "NEXT_PUBLIC_CJ_URL_SLING" },
  { prefix: "fubo_", envKey: "NEXT_PUBLIC_CJ_URL_FUBO" },
  { prefix: "hulu_", envKey: "NEXT_PUBLIC_CJ_URL_HULU" },
  { prefix: "philo_", envKey: "NEXT_PUBLIC_CJ_URL_PHILO" },
];

/**
 * Returns a CJ tracking URL when configured for this option id prefix.
 * Paste links from CJ → Links after you join each advertiser’s program.
 */
export function getCjAffiliateUrlForOptionId(optionId: string): string | undefined {
  const id = optionId.trim();
  if (!id) return undefined;

  for (const { prefix, envKey } of CJ_PREFIX_ENV) {
    if (!id.startsWith(prefix)) continue;
    const url = process.env[envKey]?.trim();
    if (url) return url;
  }

  return undefined;
}
