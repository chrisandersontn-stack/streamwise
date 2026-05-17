import { NextRequest, NextResponse } from "next/server";

import { serviceLabelsFromCatalog } from "@/lib/server/admin-full-catalog-option";
import { extractCatalogOptionWithAnthropic } from "@/lib/server/extract-catalog-option-from-url";
import { getCatalog } from "@/lib/server/catalog-store";

export async function POST(request: NextRequest) {
  const adminToken = process.env.CATALOG_ADMIN_TOKEN;
  const providedToken = request.headers.get("x-admin-token");

  if (!adminToken || providedToken !== adminToken) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const url = typeof (raw as { url?: unknown }).url === "string" ? (raw as { url: string }).url.trim() : "";
  if (!url) {
    return NextResponse.json({ ok: false, error: "missing_url" }, { status: 400 });
  }

  try {
    const catalog = await getCatalog();
    const serviceLabels = [...serviceLabelsFromCatalog(catalog.services)];
    const result = await extractCatalogOptionWithAnthropic({ url, serviceLabels });
    return NextResponse.json({
      ok: true,
      fields: result.fields,
      warnings: result.warnings,
      model: result.model,
    });
  } catch (err) {
    const code = err instanceof Error ? err.message : "extract_failed";
    if (code === "missing_anthropic_api_key") {
      return NextResponse.json(
        {
          ok: false,
          error: code,
          hint: "Set ANTHROPIC_API_KEY in .env.local (dev) or Vercel env (production).",
        },
        { status: 503 }
      );
    }
    if (code === "invalid_anthropic_api_key_format") {
      return NextResponse.json(
        {
          ok: false,
          error: code,
          hint:
            "ANTHROPIC_API_KEY should start with sk-ant- and have no quotes. In Vercel, paste only the key value, then redeploy.",
        },
        { status: 503 }
      );
    }
    if (code.startsWith("anthropic_http_401")) {
      return NextResponse.json(
        {
          ok: false,
          error: "anthropic_invalid_api_key",
          hint:
            "Anthropic rejected the API key (invalid or revoked). Create a new key at console.anthropic.com → API Keys, update ANTHROPIC_API_KEY in Vercel (Production), redeploy, then try Extract again.",
        },
        { status: 503 }
      );
    }
    const clientErrors = new Set([
      "invalid_url",
      "fetch_http_404",
      "fetch_http_403",
      "fetch_http_401",
      "fetch_timeout",
      "fetch_body_too_large",
      "fetch_empty_content",
    ]);
    const status = clientErrors.has(code) ? 400 : 502;

    const fetchHints: Record<string, string> = {
      fetch_http_403:
        "That site refused our server (anti-bot / login wall). Try a simpler URL (help article, press pricing page) or fill the form by hand.",
      fetch_http_401:
        "That URL requires a login our server cannot use. Open the page in your browser, copy the visible pricing text into Notes, or pick a public help URL.",
      fetch_http_404:
        "That URL returned “not found.” Check for typos or use the provider’s main pricing/help page.",
      fetch_empty_content:
        "The page loaded but had almost no readable text (often heavy JavaScript). Try a different URL or enter fields manually.",
      fetch_timeout: "The page took too long to respond. Try again or use a lighter URL.",
      fetch_body_too_large: "That page was too large to download in one request. Try a narrower help/pricing URL.",
    };

    const hint = fetchHints[code];
    return NextResponse.json(
      hint ? { ok: false, error: code, hint } : { ok: false, error: code },
      { status }
    );
  }
}
