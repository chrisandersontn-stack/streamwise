/** Site registered in Plausible (Settings → General). */
export const PLAUSIBLE_DOMAIN = "streamwise.media";

/** Custom script URL from Plausible → Install → Script. */
export const PLAUSIBLE_SCRIPT_SRC =
  process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC?.trim() ||
  "https://plausible.io/js/pa-mYIBYuC4phpDe04d3f3wQ.js";

/** Load Plausible in production; set NEXT_PUBLIC_PLAUSIBLE_ENABLED=1 to test locally. */
export function isPlausibleEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_PLAUSIBLE_DISABLED === "1") return false;
  if (process.env.NEXT_PUBLIC_PLAUSIBLE_ENABLED === "1") return true;
  return process.env.NODE_ENV === "production";
}
