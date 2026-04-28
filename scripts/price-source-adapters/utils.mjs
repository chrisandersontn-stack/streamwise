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

