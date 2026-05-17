import { afterEach, describe, expect, it } from "vitest";
import { getCjAffiliateUrlForOptionId, getCjNordVpnUrl } from "./cj-links";

describe("getCjNordVpnUrl", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_CJ_NORDVPN_URL;
  });

  it("uses env when set", () => {
    process.env.NEXT_PUBLIC_CJ_NORDVPN_URL = "https://example.com/nord";
    expect(getCjNordVpnUrl()).toBe("https://example.com/nord");
  });
});

describe("getCjAffiliateUrlForOptionId", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_CJ_URL_SLING;
  });

  it("maps sling options when env is set", () => {
    process.env.NEXT_PUBLIC_CJ_URL_SLING = "https://example.com/sling";
    expect(getCjAffiliateUrlForOptionId("sling_orange_direct")).toBe("https://example.com/sling");
    expect(getCjAffiliateUrlForOptionId("netflix_direct")).toBeUndefined();
  });
});
