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
    delete process.env.NEXT_PUBLIC_CJ_URL_DIRECTV;
    delete process.env.NEXT_PUBLIC_CJ_URL_HULU;
  });

  it("maps sling options when env is set", () => {
    process.env.NEXT_PUBLIC_CJ_URL_SLING = "https://example.com/sling";
    expect(getCjAffiliateUrlForOptionId("sling_orange_direct")).toBe("https://example.com/sling");
    expect(getCjAffiliateUrlForOptionId("netflix_direct")).toBeUndefined();
  });

  it("maps directv options when env is set", () => {
    process.env.NEXT_PUBLIC_CJ_URL_DIRECTV = "https://example.com/directv";
    expect(getCjAffiliateUrlForOptionId("directv_choice_direct")).toBe(
      "https://example.com/directv"
    );
  });

  it("maps disney_hulu_* options to the Hulu CJ URL when set", () => {
    process.env.NEXT_PUBLIC_CJ_URL_HULU = "https://example.com/hulu-cj";
    expect(getCjAffiliateUrlForOptionId("disney_hulu_bundle")).toBe(
      "https://example.com/hulu-cj"
    );
    expect(getCjAffiliateUrlForOptionId("disney_hulu_espn_unlimited_bundle")).toBe(
      "https://example.com/hulu-cj"
    );
    expect(getCjAffiliateUrlForOptionId("hulu_live_tv_direct")).toBe(
      "https://example.com/hulu-cj"
    );
  });
});
