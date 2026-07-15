import { describe, expect, it } from "vitest";

import {
  isAffiliateTrackedLinkKind,
  normalizeOutboundLinkKindForTracking,
  parseTrackClickPayload,
} from "./click-tracking";

describe("normalizeOutboundLinkKindForTracking", () => {
  it("maps compensated resolver kinds to affiliate", () => {
    expect(normalizeOutboundLinkKindForTracking("affiliate_override")).toBe(
      "affiliate"
    );
    expect(normalizeOutboundLinkKindForTracking("amazon_associates")).toBe(
      "affiliate"
    );
    expect(normalizeOutboundLinkKindForTracking("walmart_affiliate")).toBe(
      "affiliate"
    );
    expect(normalizeOutboundLinkKindForTracking("affiliate")).toBe("affiliate");
  });

  it("maps official/source kinds to source", () => {
    expect(normalizeOutboundLinkKindForTracking("official")).toBe("source");
    expect(normalizeOutboundLinkKindForTracking("source")).toBe("source");
  });
});

describe("isAffiliateTrackedLinkKind", () => {
  it("treats legacy amazon/walmart kinds as affiliate for dashboards", () => {
    expect(isAffiliateTrackedLinkKind("amazon_associates")).toBe(true);
    expect(isAffiliateTrackedLinkKind("official")).toBe(false);
  });
});

describe("parseTrackClickPayload", () => {
  it("parses JSON bodies", () => {
    const parsed = parseTrackClickPayload(
      JSON.stringify({
        optionId: "disney_hulu_bundle",
        linkKind: "affiliate",
        network: "CJ",
      }),
      "application/json"
    );
    expect(parsed?.optionId).toBe("disney_hulu_bundle");
    expect(parsed?.linkKind).toBe("affiliate");
    expect(parsed?.network).toBe("CJ");
  });

  it("parses URL-encoded beacon bodies even when labeled text/plain", () => {
    const body =
      "optionId=sling_orange_direct&optionName=Sling&linkKind=affiliate&resolvedKind=affiliate_override&network=CJ";
    const parsed = parseTrackClickPayload(body, "text/plain;charset=UTF-8");
    expect(parsed?.optionId).toBe("sling_orange_direct");
    expect(parsed?.linkKind).toBe("affiliate");
    expect(parsed?.resolvedKind).toBe("affiliate_override");
  });

  it("parses FormData bodies", () => {
    const form = new FormData();
    form.set("optionId", "fubo_direct");
    form.set("linkKind", "source");
    const parsed = parseTrackClickPayload(form, "multipart/form-data");
    expect(parsed?.optionId).toBe("fubo_direct");
    expect(parsed?.linkKind).toBe("source");
  });
});
