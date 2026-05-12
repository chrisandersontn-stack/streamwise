import type {
  IncludedWith,
  Option,
  OptionCategory,
  PriceStatus,
  Provider,
  Requirement,
  Service,
} from "@/app/streamwise-data";

const PROVIDERS: readonly Provider[] = [
  "direct",
  "verizon",
  "walmart_plus",
  "tmobile",
  "xfinity",
  "instacart_plus",
  "apple",
  "amazon",
  "hulu",
  "philo",
] as const;

const CATEGORIES: readonly OptionCategory[] = [
  "direct",
  "bundle",
  "carrier",
  "membership",
  "promo",
] as const;

const REQUIREMENTS: readonly Requirement[] = [
  "verizon",
  "walmart_plus",
  "tmobile",
  "xfinity",
  "instacart_plus",
  "amazon_prime",
  "att",
  "spectrum_charter",
  "apple_one",
] as const;

const INCLUDED_WITH: readonly IncludedWith[] = REQUIREMENTS;

const PRICE_STATUSES: readonly PriceStatus[] = [
  "current",
  "scheduled_change",
  "expired",
  "needs_verification",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIsoDateOnly(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isIsoDateTime(value: string) {
  return /^\d{4}-\d{2}-\d{2}T/.test(value) && !Number.isNaN(Date.parse(value));
}

function isValidOptionId(id: string) {
  if (id.length < 2 || id.length > 80) return false;
  return /^[\w:.-]+$/.test(id);
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number.parseFloat(value.trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asOptionalFiniteNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const n = asFiniteNumber(value);
  return n === null ? undefined : n;
}

function asOptionalInt(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const n = asFiniteNumber(value);
  if (n === null) return undefined;
  const r = Math.round(n);
  return Math.abs(n - r) < 1e-9 ? r : undefined;
}

function parseUrlOptional(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") throw new Error(`invalid_${field}`);
  const t = value.trim();
  if (!t) return undefined;
  try {
    new URL(t);
  } catch {
    throw new Error(`invalid_${field}`);
  }
  return t;
}

function parseUrlRequired(value: unknown, field: string): string {
  const u = parseUrlOptional(value, field);
  if (!u) throw new Error(`missing_${field}`);
  return u;
}

function isProvider(v: unknown): v is Provider {
  return typeof v === "string" && (PROVIDERS as readonly string[]).includes(v);
}

function isCategory(v: unknown): v is OptionCategory {
  return typeof v === "string" && (CATEGORIES as readonly string[]).includes(v);
}

function isPriceStatus(v: unknown): v is PriceStatus {
  return typeof v === "string" && (PRICE_STATUSES as readonly string[]).includes(v);
}

function parseRequirements(value: unknown): Requirement[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) throw new Error("invalid_requires");
  const out: Requirement[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !(REQUIREMENTS as readonly string[]).includes(item)) {
      throw new Error("invalid_requires");
    }
    out.push(item as Requirement);
  }
  return out.length ? out : undefined;
}

function parseIncludedWith(value: unknown): IncludedWith | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string" || !(INCLUDED_WITH as readonly string[]).includes(value)) {
    throw new Error("invalid_included_with");
  }
  return value as IncludedWith;
}

function parseCovers(value: unknown, labels: Set<string>): string[] {
  if (!Array.isArray(value) || value.length === 0) throw new Error("invalid_covers");
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !labels.has(item)) {
      throw new Error("invalid_covers");
    }
    out.push(item);
  }
  return out;
}

export function serviceLabelsFromCatalog(services: Service[]): Set<string> {
  return new Set(services.map((s) => s.label));
}

/**
 * Given current catalog options, suggest a mutex slug when another option covers exactly the same services.
 */
export function suggestMutexGroupFromCatalog(
  options: Pick<Option, "covers" | "mutuallyExclusiveGroup">[],
  covers: string[]
): string | null {
  const key = [...covers].sort().join("\u0001");
  for (const o of options) {
    if (!o.mutuallyExclusiveGroup) continue;
    const ok = [...o.covers].sort().join("\u0001") === key;
    if (ok) return o.mutuallyExclusiveGroup;
  }
  return null;
}

export type AdminFullOptionSaveMode = "create" | "update";

/**
 * Validates and normalizes a full Option from admin JSON (create or replace).
 */
export function parseAdminFullCatalogOption(
  raw: unknown,
  serviceLabels: Set<string>
): Option {
  if (!isRecord(raw)) {
    throw new Error("invalid_option_shape");
  }

  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  if (!isValidOptionId(id)) {
    throw new Error("invalid_option_id");
  }

  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (!name) throw new Error("invalid_name");

  if (!isProvider(raw.provider)) throw new Error("invalid_provider");
  if (!isCategory(raw.category)) throw new Error("invalid_category");

  const monthly = asFiniteNumber(raw.monthly);
  if (monthly === null || monthly < 0) throw new Error("invalid_monthly");

  const source = typeof raw.source === "string" ? raw.source.trim() : "";
  if (!source) throw new Error("invalid_source");

  const notes = typeof raw.notes === "string" ? raw.notes : "";
  if (typeof raw.notes !== "string") throw new Error("invalid_notes");

  const sourceUrl = parseUrlRequired(raw.sourceUrl, "source_url");
  const affiliateUrl = parseUrlOptional(raw.affiliateUrl, "affiliate_url");

  const covers = parseCovers(raw.covers, serviceLabels);

  const lastChecked =
    typeof raw.lastChecked === "string" && isIsoDateOnly(raw.lastChecked.trim())
      ? raw.lastChecked.trim()
      : undefined;
  if (!lastChecked) throw new Error("invalid_last_checked");

  const priceStatus = isPriceStatus(raw.priceStatus) ? raw.priceStatus : undefined;
  if (!priceStatus) throw new Error("invalid_price_status");

  let effectiveMonthly: number | undefined;
  if ("effectiveMonthly" in raw) {
    if (raw.effectiveMonthly === null || raw.effectiveMonthly === "") {
      effectiveMonthly = undefined;
    } else {
      const e = asFiniteNumber(raw.effectiveMonthly);
      if (e === null || e < 0) throw new Error("invalid_effective_monthly");
      effectiveMonthly = e;
    }
  }

  const standardMonthly = asOptionalFiniteNumber(raw.standardMonthly);
  if (standardMonthly !== undefined && standardMonthly < 0) {
    throw new Error("invalid_standard_monthly");
  }

  const introLengthMonths = asOptionalInt(raw.introLengthMonths);
  if (introLengthMonths !== undefined && (introLengthMonths < 0 || introLengthMonths > 120)) {
    throw new Error("invalid_intro_length_months");
  }

  let effectiveDate: string | undefined;
  if (raw.effectiveDate !== undefined && raw.effectiveDate !== null && raw.effectiveDate !== "") {
    if (typeof raw.effectiveDate !== "string") throw new Error("invalid_effective_date");
    const t = raw.effectiveDate.trim();
    if (!isIsoDateOnly(t) && !isIsoDateTime(t)) throw new Error("invalid_effective_date");
    effectiveDate = t;
  }

  let expiresAt: string | undefined;
  if (raw.expiresAt !== undefined && raw.expiresAt !== null && raw.expiresAt !== "") {
    if (typeof raw.expiresAt !== "string") throw new Error("invalid_expires_at");
    const t = raw.expiresAt.trim();
    if (!isIsoDateOnly(t) && !isIsoDateTime(t)) throw new Error("invalid_expires_at");
    expiresAt = t;
  }

  let mutuallyExclusiveGroup: string | undefined;
  if (
    raw.mutuallyExclusiveGroup !== undefined &&
    raw.mutuallyExclusiveGroup !== null &&
    raw.mutuallyExclusiveGroup !== ""
  ) {
    if (typeof raw.mutuallyExclusiveGroup !== "string") throw new Error("invalid_mutex_group");
    const g = raw.mutuallyExclusiveGroup.trim();
    if (!g || g.length > 120) throw new Error("invalid_mutex_group");
    mutuallyExclusiveGroup = g;
  }

  const requires = parseRequirements(raw.requires);
  const includedWith = parseIncludedWith(raw.includedWith);

  const option: Option = {
    id,
    name,
    provider: raw.provider,
    monthly,
    covers,
    notes,
    source,
    sourceUrl,
    category: raw.category,
    lastChecked,
    priceStatus,
  };

  if (effectiveMonthly !== undefined) option.effectiveMonthly = effectiveMonthly;
  if (affiliateUrl) option.affiliateUrl = affiliateUrl;
  if (requires) option.requires = requires;
  if (includedWith) option.includedWith = includedWith;
  if (standardMonthly !== undefined) option.standardMonthly = standardMonthly;
  if (introLengthMonths !== undefined) option.introLengthMonths = introLengthMonths;
  if (effectiveDate) option.effectiveDate = effectiveDate;
  if (expiresAt) option.expiresAt = expiresAt;
  if (mutuallyExclusiveGroup) option.mutuallyExclusiveGroup = mutuallyExclusiveGroup;

  return option;
}
