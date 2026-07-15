import type { OutboundLinkKind } from "@/lib/affiliate/outbound-url";

/** Normalized kinds stored on analytics events for dashboards. */
export type TrackedLinkKind = "affiliate" | "source" | "ui_event";

const AFFILIATE_LINK_KINDS = new Set<string>([
  "affiliate",
  "affiliate_override",
  "amazon_associates",
  "walmart_affiliate",
]);

const SOURCE_LINK_KINDS = new Set<string>(["source", "official"]);

/**
 * Map resolver kinds (and legacy stored kinds) to the dashboard buckets.
 */
export function normalizeOutboundLinkKindForTracking(
  kind: OutboundLinkKind | TrackedLinkKind | string | null | undefined
): TrackedLinkKind {
  const value = (kind ?? "").trim();
  if (value === "ui_event") return "ui_event";
  if (AFFILIATE_LINK_KINDS.has(value)) return "affiliate";
  if (SOURCE_LINK_KINDS.has(value) || value === "official") return "source";
  // Compensated network kinds that may appear before normalization.
  if (value.includes("affiliate") || value.includes("associates")) {
    return "affiliate";
  }
  return "source";
}

export function isAffiliateTrackedLinkKind(
  kind: string | null | undefined
): boolean {
  return normalizeOutboundLinkKindForTracking(kind) === "affiliate";
}

export function isSourceTrackedLinkKind(kind: string | null | undefined): boolean {
  return normalizeOutboundLinkKindForTracking(kind) === "source";
}

export function inferAffiliateNetwork(input: {
  kind?: OutboundLinkKind | string | null;
  resolvedUrl?: string | null;
  explicitNetwork?: string | null;
}): string {
  const explicit = input.explicitNetwork?.trim();
  if (explicit) return explicit;

  const kind = (input.kind ?? "").trim();
  if (kind === "amazon_associates") return "Amazon Associates";
  if (kind === "walmart_affiliate") return "Walmart";
  if (kind === "affiliate_override") {
    const href = input.resolvedUrl ?? "";
    if (/dpbolvw\.net|anrdoezrs\.net|jdoqocy\.com|tkqlhce\.com|cj\.com/i.test(href)) {
      return "CJ";
    }
    if (/directv\.com/i.test(href)) return "Skimlinks/DirecTV";
    return "override";
  }
  return "";
}

/**
 * Parse outbound click payloads from JSON or URL-encoded beacon bodies.
 * Browsers differ on Content-Type for sendBeacon(URLSearchParams).
 */
export function parseTrackClickPayload(
  body: unknown,
  contentType = ""
): Record<string, string> | null {
  if (body instanceof FormData) {
    return {
      optionId: body.get("optionId")?.toString() ?? "",
      optionName: body.get("optionName")?.toString() ?? "",
      provider: body.get("provider")?.toString() ?? "",
      sourceUrl: body.get("sourceUrl")?.toString() ?? "",
      resolvedUrl: body.get("resolvedUrl")?.toString() ?? "",
      linkKind: body.get("linkKind")?.toString() ?? "",
      resolvedKind: body.get("resolvedKind")?.toString() ?? "",
      placement: body.get("placement")?.toString() ?? "",
      network: body.get("network")?.toString() ?? "",
    };
  }

  if (typeof body !== "string") {
    return null;
  }

  const trimmed = body.trim();
  if (!trimmed) return null;

  const type = contentType.toLowerCase();
  if (type.includes("application/json")) {
    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>;
      return stringifyPayloadFields(parsed);
    } catch {
      return null;
    }
  }

  // URL-encoded (sendBeacon URLSearchParams) — including text/plain mislabels.
  if (
    type.includes("application/x-www-form-urlencoded") ||
    type.includes("text/plain") ||
    type === "" ||
    trimmed.includes("=")
  ) {
    try {
      if (trimmed.startsWith("{")) {
        const parsed = JSON.parse(trimmed) as Record<string, unknown>;
        return stringifyPayloadFields(parsed);
      }
      const params = new URLSearchParams(trimmed);
      if (![...params.keys()].length) return null;
      return {
        optionId: params.get("optionId") ?? "",
        optionName: params.get("optionName") ?? "",
        provider: params.get("provider") ?? "",
        sourceUrl: params.get("sourceUrl") ?? "",
        resolvedUrl: params.get("resolvedUrl") ?? "",
        linkKind: params.get("linkKind") ?? "",
        resolvedKind: params.get("resolvedKind") ?? "",
        placement: params.get("placement") ?? "",
        network: params.get("network") ?? "",
      };
    } catch {
      return null;
    }
  }

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    return stringifyPayloadFields(parsed);
  } catch {
    return null;
  }
}

function stringifyPayloadFields(
  parsed: Record<string, unknown>
): Record<string, string> {
  const read = (key: string) => {
    const value = parsed[key];
    return value == null ? "" : String(value);
  };
  return {
    optionId: read("optionId"),
    optionName: read("optionName"),
    provider: read("provider"),
    sourceUrl: read("sourceUrl"),
    resolvedUrl: read("resolvedUrl"),
    linkKind: read("linkKind"),
    resolvedKind: read("resolvedKind"),
    placement: read("placement"),
    network: read("network"),
  };
}
