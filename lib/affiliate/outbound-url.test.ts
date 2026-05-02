import { describe, expect, it } from "vitest";

import { hasResolvableOutbound, resolveOutboundSourceUrl } from "./outbound-url";

describe("outbound-url", () => {
  it("prefers affiliateUrl when both are present", () => {
    const r = resolveOutboundSourceUrl({
      sourceUrl: "https://example.com/official",
      affiliateUrl: "https://example.com/affiliate",
    });
    expect(r.href).toBe("https://example.com/affiliate");
    expect(r.kind).toBe("affiliate_override");
  });

  it("uses sourceUrl when affiliateUrl is absent", () => {
    const r = resolveOutboundSourceUrl({
      sourceUrl: "https://example.com/official",
    });
    expect(r.href).toBe("https://example.com/official");
    expect(r.kind).toBe("official");
  });

  it("uses affiliateUrl when sourceUrl is absent", () => {
    const r = resolveOutboundSourceUrl({
      affiliateUrl: "https://example.com/affiliate-only",
    });
    expect(r.href).toBe("https://example.com/affiliate-only");
    expect(r.kind).toBe("affiliate_override");
  });

  it("hasResolvableOutbound is true when only affiliateUrl is set", () => {
    expect(
      hasResolvableOutbound({
        affiliateUrl: "https://example.com/a",
      })
    ).toBe(true);
    expect(hasResolvableOutbound({})).toBe(false);
  });
});
