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
    return NextResponse.json({ ok: false, error: code }, { status });
  }
}
