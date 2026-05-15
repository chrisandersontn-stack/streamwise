/** Canonical production origin (www). Used by sitemap and robots. */
export const SITE_URL = "https://www.streamwise.media";

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return SITE_URL;
  return `${SITE_URL}${normalized}`;
}
