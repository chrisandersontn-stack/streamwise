import { anthropicKeyLooksValid, getAnthropicApiKey } from "@/lib/server/anthropic";

/** Current Sonnet on first-party Claude API; see https://docs.anthropic.com/en/docs/about-claude/models */
const DEFAULT_MODEL = "claude-sonnet-4-6";
const FETCH_TIMEOUT_MS = 12_000;
const MAX_RESPONSE_BYTES = 600_000;

function stripHtmlToText(html: string): string {
  let s = html.replace(/<script[\s\S]*?<\/script>/gi, " ");
  s = s.replace(/<style[\s\S]*?<\/style>/gi, " ");
  s = s.replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  s = s.replace(/<[^>]+>/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  return s.slice(0, 80_000);
}

export type FetchPageResult =
  | { ok: true; text: string; finalUrl: string }
  | { ok: false; error: string };

export async function fetchPagePlainText(urlString: string): Promise<FetchPageResult> {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return { ok: false, error: "invalid_url" };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, error: "invalid_url" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url.href, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        // Many sites return 403 for non-browser or “bot” user agents; use a normal desktop Chrome string.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Upgrade-Insecure-Requests": "1",
      },
    });
    if (!res.ok) {
      return { ok: false, error: `fetch_http_${res.status}` };
    }
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_RESPONSE_BYTES) {
      return { ok: false, error: "fetch_body_too_large" };
    }
    const text = new TextDecoder("utf-8", { fatal: false }).decode(buf);
    const plain = stripHtmlToText(text);
    if (!plain) {
      return { ok: false, error: "fetch_empty_content" };
    }
    return { ok: true, text: plain, finalUrl: res.url || url.href };
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      return { ok: false, error: "fetch_timeout" };
    }
    return { ok: false, error: "fetch_failed" };
  } finally {
    clearTimeout(timer);
  }
}

export type ExtractCatalogOptionInput = {
  url: string;
  /** Service labels from the live catalog (e.g. "Netflix", "Disney+") */
  serviceLabels: string[];
};

export type ExtractCatalogOptionResult = {
  fields: Record<string, unknown>;
  warnings: string[];
  model: string;
};

/**
 * Calls Anthropic Messages API with page text and returns JSON fields for the admin form.
 */
export async function extractCatalogOptionWithAnthropic(
  input: ExtractCatalogOptionInput
): Promise<ExtractCatalogOptionResult> {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    throw new Error("missing_anthropic_api_key");
  }
  if (!anthropicKeyLooksValid(apiKey)) {
    throw new Error("invalid_anthropic_api_key_format");
  }

  const model = process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL;

  const fetched = await fetchPagePlainText(input.url);
  if (!fetched.ok) {
    throw new Error(fetched.error);
  }

  const labelsBlock = input.serviceLabels.map((l) => `- ${JSON.stringify(l)}`).join("\n");

  const system = `You help maintain a streaming subscription catalog. Given plain text from a provider pricing page, output a SINGLE JSON object with fields the admin UI can use. Rules:
- Use ONLY these exact strings for "covers" entries (streaming service names): 
${labelsBlock}
- "provider" must be one of: direct, verizon, walmart_plus, tmobile, xfinity, instacart_plus, apple, amazon, hulu, philo, roku (use roku for Roku Channel / roku.com signup promos that cover an existing service—not Roku-native-only content)
- "category" must be one of: direct, bundle, carrier, membership, promo
- "requires" is an array of zero or more of: verizon, walmart_plus, tmobile, xfinity, instacart_plus, amazon_prime, att, spectrum_charter, apple_one
- "includedWith" is optional; same allowed values as a single string, or null
- "monthly" is a number (USD per month). If the page only shows an ANNUAL price, set monthly = annual/12 rounded to 2 decimals and say so in confidenceNotes.
- "effectiveMonthly" is optional: use for the intro/promo monthly when it should drive STARTING totals but "monthly" holds list/ongoing context, OR use for bundled $0 incremental cost, or null.
- "standardMonthly" is optional: the REGULAR monthly price AFTER the intro/promo ends (the ongoing rate). If the page lists both intro and regular monthly, put intro in monthly or effectiveMonthly and regular in standardMonthly. Use null if same as ongoing fallback.
- "introLengthMonths" optional: number of months the intro price applies when stated on the page (integer).
- "expiresAt" / "effectiveDate" optional ISO date strings if the page states them
- "mutuallyExclusiveGroup" optional short snake_case slug if the page clearly describes a plan family (otherwise null)
- "source" short provider brand name
- "sourceUrl" must be the canonical pricing page URL (use the fetched page URL if appropriate)
- "notes" one or two sentences of caveats in plain English
- "priceStatus" usually "current"
- "lastChecked" today's date YYYY-MM-DD in America/New_York (you don't know TZ — use the date from the user message context: assume caller sets lastChecked client-side; you may omit and caller fills)
- Do NOT include "id" — the human supplies it.
- Respond with JSON only, no markdown fences.

JSON shape (types):
{
  "name": string,
  "provider": string,
  "category": string,
  "monthly": number,
  "effectiveMonthly": number | null,
  "standardMonthly": number | null,
  "introLengthMonths": number | null,
  "expiresAt": string | null,
  "effectiveDate": string | null,
  "covers": string[],
  "requires": string[],
  "includedWith": string | null,
  "mutuallyExclusiveGroup": string | null,
  "source": string,
  "sourceUrl": string,
  "affiliateUrl": string | null,
  "notes": string,
  "priceStatus": string,
  "confidenceNotes": string
}`;

  const user = `Fetched URL: ${fetched.finalUrl}\n\nPage text (truncated):\n${fetched.text}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      temperature: 0.2,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`anthropic_http_${res.status}:${t.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  let textBlock = data.content?.find((c) => c.type === "text")?.text?.trim() ?? "";
  if (!textBlock) {
    throw new Error("anthropic_empty_response");
  }

  const fence = textBlock.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  if (fence?.[1]) {
    textBlock = fence[1].trim();
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(textBlock) as Record<string, unknown>;
  } catch {
    throw new Error("anthropic_invalid_json");
  }

  const warnings: string[] = [];
  const conf = parsed.confidenceNotes;
  if (typeof conf === "string" && conf.trim()) {
    warnings.push(conf.trim());
  }
  delete parsed.confidenceNotes;

  const fields: Record<string, unknown> = { ...parsed };
  fields.sourceUrl = typeof fields.sourceUrl === "string" ? fields.sourceUrl : fetched.finalUrl;

  return { fields, warnings, model };
}
