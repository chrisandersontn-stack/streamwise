import { NextRequest, NextResponse } from "next/server";

import {
  applyAdminCatalogOptionFullSave,
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

function parseFullOptionBody(raw: unknown): { create: boolean; option: unknown } | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.kind !== "full_option") return null;
  if (!("option" in o) || !o.option || typeof o.option !== "object") return null;
  return { create: Boolean(o.create), option: o.option };
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

  const full = parseFullOptionBody(raw);
  if (full) {
    try {
      const updated = await applyAdminCatalogOptionFullSave(
        full.option,
        full.create ? "create" : "update"
      );
      return NextResponse.json({
        ok: true,
        optionId: updated.id,
        updatedAt: new Date().toISOString(),
        mode: full.create ? "create" : "update",
      });
    } catch (err) {
      const code = err instanceof Error ? err.message : "full_save_failed";
      const known = new Set([
        "option_id_exists",
        "unknown_option",
        "invalid_option_shape",
        "invalid_option_id",
        "invalid_name",
        "invalid_provider",
        "invalid_category",
        "invalid_monthly",
        "invalid_source",
        "invalid_notes",
        "invalid_source_url",
        "missing_source_url",
        "invalid_affiliate_url",
        "invalid_covers",
        "invalid_last_checked",
        "invalid_price_status",
        "invalid_effective_monthly",
        "invalid_standard_monthly",
        "invalid_intro_length_months",
        "invalid_effective_date",
        "invalid_expires_at",
        "invalid_mutex_group",
        "invalid_requires",
        "invalid_included_with",
        "invalid_catalog_payload",
      ]);
      let status = 500;
      if (code === "unknown_option") status = 404;
      else if (code === "option_id_exists") status = 409;
      else if (known.has(code)) status = 400;
      return NextResponse.json({ ok: false, error: code }, { status });
    }
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
