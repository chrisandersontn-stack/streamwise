import type { Option } from "@/app/streamwise-data";

export function parseLastCheckedDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const parsed = new Date(`${trimmed}T00:00:00.000Z`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const slash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slash) {
    const month = Number(slash[1]);
    const day = Number(slash[2]);
    let year = Number(slash[3]);
    if (year < 100) year += 2000;
    const parsed = new Date(Date.UTC(year, month - 1, day));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatLastCheckedLabel(value: string | null | undefined): string {
  if (!value) return "Unknown";
  const parsed = parseLastCheckedDate(value);
  if (!parsed) return value;
  return parsed.toISOString().slice(0, 10);
}

/** Site-wide catalog freshness from all option `lastChecked` values. */
export function getCatalogRefreshSummary(optionCatalog: Option[]) {
  const validDates = optionCatalog
    .map((item) => item.lastChecked)
    .filter((value): value is string => Boolean(value))
    .map((value) => ({ raw: value, parsed: parseLastCheckedDate(value) }))
    .filter(
      (entry): entry is { raw: string; parsed: Date } => entry.parsed !== null
    );

  if (!validDates.length) {
    return { latest: null as string | null, oldest: null as string | null };
  }

  validDates.sort((a, b) => a.parsed.getTime() - b.parsed.getTime());

  return {
    latest: formatLastCheckedLabel(validDates.at(-1)?.raw ?? null),
    oldest: formatLastCheckedLabel(validDates[0]?.raw ?? null),
  };
}

/**
 * Latest `lastChecked` among catalog options that cover each service group.
 * Shown on service cards; each plan line still has its own `lastChecked`.
 */
export function getLastCheckedByServiceGroup(
  optionCatalog: Option[]
): Map<string, string> {
  const byGroup = new Map<string, { raw: string; parsed: Date }>();

  for (const option of optionCatalog) {
    const raw = option.lastChecked?.trim();
    if (!raw) continue;
    const parsed = parseLastCheckedDate(raw);
    if (!parsed) continue;

    for (const group of option.covers) {
      const existing = byGroup.get(group);
      if (!existing || parsed.getTime() > existing.parsed.getTime()) {
        byGroup.set(group, { raw, parsed });
      }
    }
  }

  const out = new Map<string, string>();
  byGroup.forEach((entry, group) => {
    out.set(group, formatLastCheckedLabel(entry.raw));
  });
  return out;
}
