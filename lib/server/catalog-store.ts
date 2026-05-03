import { promises as fs } from "node:fs";
import path from "node:path";

import type { PriceStatus } from "@/app/streamwise-data";
import { options as defaultOptions, services as defaultServices } from "@/app/streamwise-data";
import { getSupabaseAdminClient } from "@/lib/server/supabase-admin";

type Service = (typeof defaultServices)[number];
type CatalogOption = (typeof defaultOptions)[number];

type CatalogPayload = {
  services: Service[];
  options: CatalogOption[];
};

type CatalogSource = "supabase" | "file" | "defaults";

type CatalogWithMetadata = CatalogPayload & {
  catalogUpdatedAt: string | null;
  catalogSource: CatalogSource;
};

const catalogPath = path.join(process.cwd(), "data", "catalog.json");

function readTruthyEnv(name: string) {
  const v = process.env[name]?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/**
 * When true, `/api/catalog` serves `streamwise-data.ts` (embedded defaults) instead of
 * Supabase or `data/catalog.json`.
 *
 * - In **development** (`next dev`), this is the default so edits to `streamwise-data.ts`
 *   show up immediately. Set `STREAMWISE_CATALOG_USE_REMOTE=1` to load the real snapshot
 *   while developing (e.g. testing admin pricing against Supabase).
 * - Set `STREAMWISE_USE_DEFAULT_CATALOG=1` in **any** environment to force embedded defaults
 *   (e.g. until a bad production snapshot is fixed).
 */
function shouldServeEmbeddedDefaultCatalog(): boolean {
  if (readTruthyEnv("STREAMWISE_USE_DEFAULT_CATALOG")) {
    return true;
  }
  if (process.env.NODE_ENV !== "development") {
    return false;
  }
  return !readTruthyEnv("STREAMWISE_CATALOG_USE_REMOTE");
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidCatalogPayload(value: unknown): value is CatalogPayload {
  if (!isObject(value)) return false;
  if (!Array.isArray(value.services) || !Array.isArray(value.options)) return false;
  return true;
}

/**
 * STARZ promo pricing is canonical in `streamwise-data.ts`. Supabase snapshots have been
 * saved as flat $11.99 (or missing intro fields), which ties the standard plan on 12‑month
 * math and lets `starz_direct` win tie-breakers — so users only see $11.99.
 *
 * We always re-anchor `starz_promo` from embedded defaults and keep only freshness / link
 * fields from the snapshot. See https://www.starz.com/us/en/buy
 */
function repairStarzPromoOption(options: CatalogOption[]): CatalogOption[] {
  const def = defaultOptions.find((o) => o.id === "starz_promo");
  if (!def) return options;

  const idx = options.findIndex((o) => o.id === "starz_promo");
  if (idx === -1) {
    return [...options, def];
  }

  const cur = options[idx]!;
  const next = [...options];
  next[idx] = {
    ...def,
    lastChecked: cur.lastChecked ?? def.lastChecked,
    priceStatus: cur.priceStatus ?? def.priceStatus,
    sourceUrl: cur.sourceUrl?.trim() || def.sourceUrl,
    affiliateUrl: cur.affiliateUrl ?? def.affiliateUrl,
  };
  return next;
}

/** Applies snapshot repairs (e.g. STARZ promo shape) before serving catalog data. */
export function repairCatalogOptions(options: CatalogOption[]): CatalogOption[] {
  return repairStarzPromoOption(options);
}

async function ensureCatalogDirectory() {
  await fs.mkdir(path.dirname(catalogPath), { recursive: true });
}

export async function getCatalog(): Promise<CatalogPayload> {
  const withMeta = await getCatalogWithMetadata();
  return { services: withMeta.services, options: withMeta.options };
}

export async function getCatalogWithMetadata(): Promise<CatalogWithMetadata> {
  if (shouldServeEmbeddedDefaultCatalog()) {
    return {
      services: defaultServices,
      options: repairCatalogOptions([...defaultOptions]),
      catalogUpdatedAt: null,
      catalogSource: "defaults",
    };
  }

  const supabase = getSupabaseAdminClient();
  if (supabase) {
    const { data } = await supabase
      .from("catalog_snapshots")
      .select("services, options, updated_at")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data && Array.isArray(data.services) && Array.isArray(data.options)) {
      return {
        services: data.services as Service[],
        options: repairCatalogOptions(data.options as CatalogOption[]),
        catalogUpdatedAt:
          typeof data.updated_at === "string" && data.updated_at
            ? data.updated_at
            : null,
        catalogSource: "supabase",
      };
    }
  }

  try {
    const raw = await fs.readFile(catalogPath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (isValidCatalogPayload(parsed)) {
      const fileStat = await fs.stat(catalogPath);
      return {
        services: parsed.services,
        options: repairCatalogOptions(parsed.options),
        catalogUpdatedAt: fileStat.mtime.toISOString(),
        catalogSource: "file",
      };
    }
  } catch {
    // fall through to defaults
  }

  return {
    services: defaultServices,
    options: repairCatalogOptions([...defaultOptions]),
    catalogUpdatedAt: null,
    catalogSource: "defaults",
  };
}

export async function saveCatalog(payload: CatalogPayload) {
  if (!isValidCatalogPayload(payload)) {
    throw new Error("invalid_catalog_payload");
  }

  const supabase = getSupabaseAdminClient();
  if (supabase) {
    await supabase.from("catalog_snapshots").insert({
      services: payload.services,
      options: payload.options,
      is_active: true,
      updated_at: new Date().toISOString(),
    });
    return;
  }

  await ensureCatalogDirectory();
  await fs.writeFile(catalogPath, JSON.stringify(payload, null, 2), "utf8");
}

const PRICE_STATUSES: readonly PriceStatus[] = [
  "current",
  "scheduled_change",
  "expired",
  "needs_verification",
];

export type AdminCatalogOptionPayload = {
  sourceUrl: string;
  monthly: number;
  lastChecked: string;
  notes: string;
  priceStatus: PriceStatus;
  effectiveMonthly?: number | null;
};

function isIsoDateOnly(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isPriceStatus(value: unknown): value is PriceStatus {
  return typeof value === "string" && (PRICE_STATUSES as readonly string[]).includes(value);
}

/**
 * Updates one catalog option (price, citation URL, freshness, notes) and persists via saveCatalog.
 */
export async function applyAdminCatalogOptionUpdate(
  optionId: string,
  fields: AdminCatalogOptionPayload
): Promise<CatalogOption> {
  if (!isIsoDateOnly(fields.lastChecked)) {
    throw new Error("invalid_last_checked");
  }
  if (!Number.isFinite(fields.monthly) || fields.monthly < 0) {
    throw new Error("invalid_monthly");
  }
  if (!isPriceStatus(fields.priceStatus)) {
    throw new Error("invalid_price_status");
  }
  if (
    fields.effectiveMonthly !== undefined &&
    fields.effectiveMonthly !== null &&
    (!Number.isFinite(fields.effectiveMonthly) || fields.effectiveMonthly < 0)
  ) {
    throw new Error("invalid_effective_monthly");
  }

  const catalog = await getCatalog();
  const index = catalog.options.findIndex((o) => o.id === optionId);
  if (index === -1) {
    throw new Error("unknown_option");
  }

  const prev = catalog.options[index];
  const next: CatalogOption = { ...prev };

  const trimmedUrl = fields.sourceUrl.trim();
  if (!trimmedUrl) {
    throw new Error("missing_source_url");
  }
  try {
    new URL(trimmedUrl);
  } catch {
    throw new Error("invalid_source_url");
  }
  next.sourceUrl = trimmedUrl;

  next.monthly = fields.monthly;
  next.lastChecked = fields.lastChecked;
  next.notes = fields.notes;
  next.priceStatus = fields.priceStatus;

  if (fields.effectiveMonthly === null || fields.effectiveMonthly === undefined) {
    delete next.effectiveMonthly;
  } else {
    next.effectiveMonthly = fields.effectiveMonthly;
  }

  const nextOptions = [...catalog.options];
  nextOptions[index] = next;
  await saveCatalog({ services: catalog.services, options: nextOptions });
  return next;
}
