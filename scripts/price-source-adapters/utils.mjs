import { fetchHtmlWithBrowser } from "./browser-fetch.mjs";

export const DEFAULT_USER_AGENT =
  "StreamWise-PriceWatch/1.0 (+https://github.com/chrisandersontn-stack/streamwise)";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableFailure(result) {
  if (result.ok) return false;
  const status = Number(result.status ?? 0);
  const code = String(result.errorCode ?? "").toUpperCase();
  const retryableHttp = [408, 425, 429, 500, 502, 503, 504];
  const retryableCodes = ["ENOTFOUND", "EAI_AGAIN", "ECONNRESET", "ECONNREFUSED"];

  if (retryableHttp.includes(status)) return true;
  if (retryableCodes.includes(code)) return true;
  if (String(result.error ?? "").toLowerCase().includes("timeout")) return true;
  if (String(result.error ?? "").toLowerCase().includes("abort")) return true;
  return false;
}

async function fetchHtmlOnce(url, debugFetch) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  const startedAt = Date.now();
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": process.env.PRICE_WATCH_USER_AGENT || DEFAULT_USER_AGENT,
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
      },
    });

    const html = await response.text();
    if (!response.ok) {
      if (debugFetch) {
        console.warn(
          `[debug-fetch] HTTP failure ${response.status} for ${url} (${Date.now() - startedAt}ms)`
        );
      }
      return {
        ok: false,
        status: response.status,
        html: "",
        error: `HTTP ${response.status}`,
        durationMs: Date.now() - startedAt,
      };
    }

    if (debugFetch) {
      console.log(
        `[debug-fetch] OK ${response.status} for ${url} (${Date.now() - startedAt}ms, bytes=${Buffer.byteLength(
          html,
          "utf8"
        )})`
      );
    }

    return {
      ok: true,
      status: response.status,
      html,
      error: "",
      durationMs: Date.now() - startedAt,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const code =
      error &&
      typeof error === "object" &&
      "cause" in error &&
      error.cause &&
      typeof error.cause === "object" &&
      "code" in error.cause
        ? String(error.cause.code)
        : "";

    if (debugFetch) {
      console.warn(
        `[debug-fetch] EXCEPTION for ${url} (${Date.now() - startedAt}ms) code=${code || "unknown"} message=${message}`
      );
    }

    return {
      ok: false,
      status: 0,
      html: "",
      error: message,
      errorCode: code,
      durationMs: Date.now() - startedAt,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchHtml(url) {
  const debugFetch = process.env.PRICE_WATCH_DEBUG_FETCH === "1";
  const enableBrowserFallback = process.env.PRICE_WATCH_BROWSER_FETCH === "1";
  const browserHostAllowlist = String(process.env.PRICE_WATCH_BROWSER_HOSTS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const retryCountRaw = Number(process.env.PRICE_WATCH_FETCH_RETRIES ?? "2");
  const retryCount = Number.isFinite(retryCountRaw)
    ? Math.max(0, Math.min(5, Math.trunc(retryCountRaw)))
    : 2;
  const backoffBaseRaw = Number(process.env.PRICE_WATCH_BACKOFF_MS ?? "600");
  const backoffBaseMs = Number.isFinite(backoffBaseRaw)
    ? Math.max(100, Math.min(5000, Math.trunc(backoffBaseRaw)))
    : 600;

  let attempt = 0;
  let lastResult = null;
  const attempts = [];

  while (attempt <= retryCount) {
    attempt += 1;
    const result = await fetchHtmlOnce(url, debugFetch);
    attempts.push({
      attempt,
      ok: result.ok,
      status: result.status,
      error: result.error,
      errorCode: result.errorCode ?? "",
      durationMs: result.durationMs ?? null,
    });
    lastResult = result;

    if (result.ok) {
      return {
        ...result,
        attemptCount: attempt,
        retryCount,
        attempts,
      };
    }

    if (attempt > retryCount || !isRetryableFailure(result)) {
      break;
    }

    const backoffMs = backoffBaseMs * attempt;
    if (debugFetch) {
      console.warn(
        `[debug-fetch] RETRY ${attempt}/${retryCount} for ${url} after ${backoffMs}ms`
      );
    }
    await sleep(backoffMs);
  }

  const finalHttpResult = {
    ...(lastResult ?? {
      ok: false,
      status: 0,
      html: "",
      error: "unknown_fetch_failure",
    }),
    attemptCount: attempt,
    retryCount,
    attempts,
  };

  if (!enableBrowserFallback || finalHttpResult.ok) {
    return finalHttpResult;
  }

  if (browserHostAllowlist.length > 0) {
    const host = (() => {
      try {
        return new URL(url).hostname.toLowerCase();
      } catch {
        return "";
      }
    })();
    const allowed = browserHostAllowlist.some(
      (allowedHost) => host === allowedHost || host.endsWith(`.${allowedHost}`)
    );
    if (!allowed) {
      return {
        ...finalHttpResult,
        browserFallbackSkipped: "host_not_allowlisted",
      };
    }
  }

  if (!isRetryableFailure(finalHttpResult)) {
    return finalHttpResult;
  }

  const browserResult = await fetchHtmlWithBrowser(url, debugFetch);
  if (browserResult.ok) {
    return {
      ...browserResult,
      attemptCount: attempt,
      retryCount,
      attempts,
      fallbackFromHttpFailure: true,
    };
  }

  return {
    ...finalHttpResult,
    browserFallbackAttempted: true,
    browserFallbackError: browserResult.error,
  };
}

export function normalizeHtml(html) {
  return String(html)
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractDollarAmounts(html) {
  const normalized = normalizeHtml(html);
  const matches = [...normalized.matchAll(/\$ ?(\d{1,3}(?:\.\d{2})?)/g)];
  return matches
    .map((match) => Number.parseFloat(match[1]))
    .filter((value) => Number.isFinite(value));
}

export function pickPriceByHints(html, hints) {
  const normalized = normalizeHtml(html).toLowerCase();
  const amounts = extractDollarAmounts(html);
  if (!amounts.length) return null;

  for (const hint of hints) {
    const idx = normalized.indexOf(hint.toLowerCase());
    if (idx === -1) continue;
    const windowStart = Math.max(0, idx - 180);
    const windowEnd = Math.min(normalized.length, idx + 240);
    const windowText = normalized.slice(windowStart, windowEnd);
    const localAmounts = [...windowText.matchAll(/\$ ?(\d{1,3}(?:\.\d{2})?)/g)]
      .map((m) => Number.parseFloat(m[1]))
      .filter((v) => Number.isFinite(v));
    if (localAmounts.length) {
      return localAmounts[0];
    }
  }

  return amounts[0] ?? null;
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function flattenStructuredNodes(node, out) {
  if (!node) return;
  if (Array.isArray(node)) {
    node.forEach((item) => flattenStructuredNodes(item, out));
    return;
  }
  if (typeof node !== "object") return;
  out.push(node);
  Object.values(node).forEach((value) => flattenStructuredNodes(value, out));
}

export function pickPriceByStructuredData(html, hints) {
  const normalizedHints = hints.map((hint) => hint.toLowerCase());
  const scriptMatches = [
    ...String(html).matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    ),
  ];
  if (!scriptMatches.length) {
    return null;
  }

  const nodes = [];
  scriptMatches.forEach((match) => {
    const parsed = safeJsonParse(match[1]?.trim() ?? "");
    if (parsed) {
      flattenStructuredNodes(parsed, nodes);
    }
  });

  let fallback = null;
  for (const node of nodes) {
    if (!node || typeof node !== "object") continue;
    const textBlob = [
      node.name,
      node.description,
      node.planName,
      node.title,
      node.sku,
      node.category,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase())
      .join(" ");
    const maybePriceRaw =
      node.price ??
      node.lowPrice ??
      node.highPrice ??
      node?.offers?.price ??
      node?.offers?.lowPrice ??
      node?.offers?.highPrice;
    const maybePrice = Number.parseFloat(String(maybePriceRaw ?? ""));
    if (!Number.isFinite(maybePrice)) continue;
    if (!fallback) fallback = maybePrice;
    if (normalizedHints.some((hint) => textBlob.includes(hint))) {
      return maybePrice;
    }
  }

  return fallback;
}

export function pickBestPrice(html, hints) {
  const structured = pickPriceByStructuredData(html, hints);
  if (typeof structured === "number" && Number.isFinite(structured)) {
    return structured;
  }
  return pickPriceByHints(html, hints);
}

/** Absolute monthly price floors used to reject scrape noise ($0 / $1). */
export const ABSURD_LOW_MONTHLY_PRICE = 1.01;
/** Reject candidate deltas larger than this fraction of expected (unless allowed). */
export const MAX_RELATIVE_PRICE_DELTA = 0.6;
/** Monthly prices above this often mean an annual figure was scraped as monthly. */
export const SUSPECT_ANNUAL_AS_MONTHLY_MIN = 50;

function textBlob(...parts) {
  return parts
    .filter((part) => part != null && part !== "")
    .map((part) => String(part).toLowerCase())
    .join(" ");
}

function mentionsAnnualBilling(text) {
  return /\b(annual|annually|\/\s*year|per\s*year|yearly|billed\s+yearly|12[\s-]*month)\b/i.test(
    text
  );
}

function mentionsFreeOrIntro(text) {
  return /\b(free|\$0|no\s+extra|included|on\s+us|intro|trial|first\s+month)\b/i.test(
    text
  );
}

function relativeDelta(expected, detected) {
  if (!(expected > 0)) return Infinity;
  return Math.abs(detected - expected) / expected;
}

/**
 * Classify a detected vs expected price pair so absurd scrape hits become
 * manual review instead of auto "changes".
 *
 * @returns {{ accept: boolean, reason?: string }}
 */
export function assessDetectedPriceChange({
  detectedPrice,
  expectedPrice,
  label = "",
  field = "",
  hints = [],
  maxRelativeDelta = MAX_RELATIVE_PRICE_DELTA,
}) {
  if (typeof detectedPrice !== "number" || Number.isNaN(detectedPrice)) {
    return { accept: false, reason: "no_price_detected" };
  }
  if (typeof expectedPrice !== "number" || Number.isNaN(expectedPrice)) {
    return { accept: true };
  }

  const delta = Number((detectedPrice - expectedPrice).toFixed(2));
  if (Math.abs(delta) < 0.01) {
    return { accept: true };
  }

  const context = textBlob(label, field, ...(Array.isArray(hints) ? hints : []));
  const allowTinyPrices =
    expectedPrice <= ABSURD_LOW_MONTHLY_PRICE || mentionsFreeOrIntro(context);

  // Netflix $1 / YouTube TV $0 style false positives against a normal plan price.
  if (
    !allowTinyPrices &&
    expectedPrice >= 5 &&
    detectedPrice < ABSURD_LOW_MONTHLY_PRICE
  ) {
    return {
      accept: false,
      reason: "absurd_low_price",
    };
  }

  // Annual sticker ($78.99/yr) scraped as a monthly plan price.
  if (
    detectedPrice >= SUSPECT_ANNUAL_AS_MONTHLY_MIN &&
    expectedPrice > 0 &&
    expectedPrice < SUSPECT_ANNUAL_AS_MONTHLY_MIN &&
    detectedPrice >= expectedPrice * 4 &&
    !mentionsAnnualBilling(context)
  ) {
    return {
      accept: false,
      reason: "suspect_annual_as_monthly",
    };
  }

  const rel = relativeDelta(expectedPrice, detectedPrice);
  if (rel > maxRelativeDelta) {
    // Allow when the surrounding text clearly names an annual/yearly figure and
    // the ratio is near 12x (convertibility cue for humans, still not auto-apply).
    if (
      mentionsAnnualBilling(context) &&
      Math.abs(detectedPrice / Math.max(expectedPrice, 0.01) - 12) <= 1.5
    ) {
      return {
        accept: false,
        reason: "annual_price_needs_manual_review",
      };
    }
    return {
      accept: false,
      reason: "delta_exceeds_sanity_bound",
    };
  }

  return { accept: true };
}

export function buildResult({
  sourceId,
  provider,
  url,
  checks,
  notes = [],
  fetchMeta = {},
  manualReviewTasks = [],
}) {
  return {
    sourceId,
    provider,
    url,
    checkedAt: new Date().toISOString(),
    checks,
    notes,
    fetch: fetchMeta,
    manualReviewTasks,
  };
}

