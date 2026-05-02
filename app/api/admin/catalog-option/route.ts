import { NextRequest, NextResponse } from "next/server";

import {
  applyAdminCatalogOptionUpdate,
  type AdminCatalogOptionPayload,
} from "@/lib/server/catalog-store";

function parseBody(value: unknown): AdminCatalogOptionPayload & { optionId: string } | null {
  if (!value || typeof value !== "object") return null;
  const o = value as Record<string, unknown>;
  const optionId = typeof o.optionId === "string" ? o.optionId.trim() : "";
  if (!optionId) return null;

  const sourceUrl = typeof o.sourceUrl === "string" ? o.sourceUrl : "";
  const notes = typeof o.notes === "string" ? o.notes : "";
  const lastChecked = typeof o.lastChecked === "string" ? o.lastChecked.trim() : "";
  const priceStatus = o.priceStatus;

  const monthly =
    typeof o.monthly === "number"
      ? o.monthly
      : typeof o.monthly === "string"
        ? Number.parseFloat(o.monthly)
        : Number.NaN;

  let effectiveMonthly: number | null | undefined;
  if ("effectiveMonthly" in o) {
    if (o.effectiveMonthly === null) {
      effectiveMonthly = null;
    } else if (typeof o.effectiveMonthly === "number") {
      effectiveMonthly = o.effectiveMonthly;
    } else if (typeof o.effectiveMonthly === "string" && o.effectiveMonthly.trim() === "") {
      effectiveMonthly = null;
    } else if (typeof o.effectiveMonthly === "string") {
      effectiveMonthly = Number.parseFloat(o.effectiveMonthly);
    } else {
      effectiveMonthly = undefined;
    }
  }

  return {
    optionId,
    sourceUrl,
    monthly,
    lastChecked,
    notes,
    priceStatus: priceStatus as AdminCatalogOptionPayload["priceStatus"],
    effectiveMonthly,
  };
}

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

  const parsed = parseBody(raw);
  if (!parsed) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const { optionId, ...fields } = parsed;

  try {
    const updated = await applyAdminCatalogOptionUpdate(optionId, fields);
    return NextResponse.json({
      ok: true,
      optionId: updated.id,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    const code = err instanceof Error ? err.message : "update_failed";
    const known = new Set([
      "unknown_option",
      "invalid_last_checked",
      "invalid_monthly",
      "invalid_price_status",
      "invalid_effective_monthly",
      "invalid_source_url",
      "missing_source_url",
      "invalid_catalog_payload",
    ]);
    const status = code === "unknown_option" ? 404 : known.has(code) ? 400 : 500;
    return NextResponse.json({ ok: false, error: code }, { status });
  }
}
