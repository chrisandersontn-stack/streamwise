import { describe, expect, it } from "vitest";

import type { Option } from "./streamwise-data";
import { options as defaultCatalogOptions } from "./streamwise-data";
import { calculateCombos, getOptionAnnualCost } from "./streamwise-logic";

function makeOption(overrides: Partial<Option>): Option {
  return {
    id: "id",
    name: "name",
    provider: "direct",
    monthly: 10,
    covers: ["Netflix"],
    notes: "test",
    source: "test",
    category: "direct",
    ...overrides,
  };
}

describe("calculateCombos", () => {
  it("returns a lowest-cost combo that covers all selected services", () => {
    const localOptions: Option[] = [
      makeOption({
        id: "netflix_direct",
        name: "Netflix direct",
        monthly: 8.99,
        covers: ["Netflix"],
        mutuallyExclusiveGroup: "netflix_access",
      }),
      makeOption({
        id: "max_direct",
        name: "Max direct",
        monthly: 10.99,
        covers: ["Max"],
        mutuallyExclusiveGroup: "max_access",
      }),
      makeOption({
        id: "bundle",
        name: "Bundle",
        monthly: 12.99,
        covers: ["Netflix", "Max"],
        category: "bundle",
      }),
    ];

    const results = calculateCombos(
      localOptions,
      ["Netflix", "Max"],
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      new Date("2026-04-10T00:00:00Z")
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.chosen.map((item) => item.id)).toEqual(["bundle"]);
    expect(results[0]?.total).toBe(12.99);
  });

  it("excludes options with priceStatus expired (even if expiresAt is missing)", () => {
    const localOptions: Option[] = [
      makeOption({
        id: "retired_promo",
        monthly: 4.99,
        standardMonthly: 11.99,
        introLengthMonths: 3,
        covers: ["STARZ"],
        category: "promo",
        mutuallyExclusiveGroup: "starz_access",
        priceStatus: "expired",
      }),
      makeOption({
        id: "direct_plan",
        monthly: 11.99,
        covers: ["STARZ"],
        category: "direct",
        mutuallyExclusiveGroup: "starz_access",
      }),
    ];

    const results = calculateCombos(
      localOptions,
      ["STARZ"],
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      new Date("2026-05-02T00:00:00Z")
    );

    expect(results[0]?.chosen.map((item) => item.id)).toEqual(["direct_plan"]);
    expect(results[0]?.total).toBe(11.99);
  });

  it("excludes options that are not yet effective", () => {
    const localOptions: Option[] = [
      makeOption({
        id: "future_offer",
        monthly: 1,
        covers: ["Netflix"],
        effectiveDate: "2026-05-01",
      }),
      makeOption({
        id: "fallback_direct",
        monthly: 8.99,
        covers: ["Netflix"],
      }),
    ];

    const results = calculateCombos(
      localOptions,
      ["Netflix"],
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      new Date("2026-04-10T00:00:00Z")
    );

    expect(results[0]?.chosen.map((item) => item.id)).toEqual(["fallback_direct"]);
  });

  it("respects provider requirements", () => {
    const localOptions: Option[] = [
      makeOption({
        id: "tmobile_free",
        monthly: 8.99,
        effectiveMonthly: 0,
        covers: ["Netflix"],
        category: "carrier",
        requires: ["tmobile"],
      }),
      makeOption({
        id: "direct",
        monthly: 8.99,
        covers: ["Netflix"],
      }),
    ];

    const withoutProvider = calculateCombos(
      localOptions,
      ["Netflix"],
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      new Date("2026-04-10T00:00:00Z")
    );

    const withProvider = calculateCombos(
      localOptions,
      ["Netflix"],
      false,
      false,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      new Date("2026-04-10T00:00:00Z")
    );

    expect(withoutProvider[0]?.chosen.map((item) => item.id)).toEqual(["direct"]);
    expect(withProvider[0]?.chosen.map((item) => item.id)).toEqual(["tmobile_free"]);
  });

  it("computes promo annual cost when JSON supplies numeric fields as strings", () => {
    const promo = makeOption({
      id: "starz_like_promo",
      monthly: "4.99" as unknown as number,
      standardMonthly: "11.99" as unknown as number,
      introLengthMonths: "3" as unknown as number,
      covers: ["STARZ"],
      category: "promo",
      mutuallyExclusiveGroup: "starz_access",
    });
    expect(getOptionAnnualCost(promo)).toBeCloseTo(4.99 * 3 + 11.99 * 9, 5);
  });

  it("prioritizes lower 12-month total when monthly totals tie", () => {
    const localOptions: Option[] = [
      makeOption({
        id: "promo_1_month",
        monthly: 5,
        standardMonthly: 15,
        introLengthMonths: 1,
        covers: ["Netflix"],
        category: "promo",
        mutuallyExclusiveGroup: "netflix_access",
      }),
      makeOption({
        id: "promo_3_month",
        monthly: 5,
        standardMonthly: 15,
        introLengthMonths: 3,
        covers: ["Netflix"],
        category: "promo",
        mutuallyExclusiveGroup: "netflix_access",
      }),
    ];

    const results = calculateCombos(
      localOptions,
      ["Netflix"],
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      new Date("2026-04-10T00:00:00Z")
    );

    expect(results[0]?.chosen.map((item) => item.id)).toEqual(["promo_3_month"]);
    expect(results[0]?.annualTotal).toBe(150);
    expect(results[1]?.annualTotal).toBe(170);
  });

  it("caps introLengthMonths above 12 when computing annual totals", () => {
    const localOptions: Option[] = [
      makeOption({
        id: "over_cap_intro",
        monthly: 5,
        standardMonthly: 20,
        introLengthMonths: 18,
        covers: ["Netflix"],
      }),
    ];

    const results = calculateCombos(
      localOptions,
      ["Netflix"],
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      new Date("2026-04-10T00:00:00Z")
    );

    expect(results[0]?.annualTotal).toBe(60);
  });

  it("treats equal standard and starting monthly as flat annual pricing", () => {
    const localOptions: Option[] = [
      makeOption({
        id: "flat_price",
        monthly: 12,
        standardMonthly: 12,
        introLengthMonths: 4,
        covers: ["Netflix"],
      }),
    ];

    const results = calculateCombos(
      localOptions,
      ["Netflix"],
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      new Date("2026-04-10T00:00:00Z")
    );

    expect(results[0]?.annualTotal).toBe(144);
  });

  it("uses monthly totals as tie-breaker when annual totals are equal", () => {
    const localOptions: Option[] = [
      makeOption({
        id: "steady_10",
        monthly: 10,
        covers: ["Netflix"],
        mutuallyExclusiveGroup: "netflix_access",
      }),
      makeOption({
        id: "promo_then_14",
        monthly: 8,
        standardMonthly: 12,
        introLengthMonths: 6,
        covers: ["Netflix"],
        category: "promo",
        mutuallyExclusiveGroup: "netflix_access",
      }),
    ];

    const results = calculateCombos(
      localOptions,
      ["Netflix"],
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      new Date("2026-04-10T00:00:00Z")
    );

    expect(results[0]?.annualTotal).toBe(120);
    expect(results[1]?.annualTotal).toBe(120);
    expect(results[0]?.chosen.map((item) => item.id)).toEqual(["promo_then_14"]);
  });

  it("respects amazon_prime and apple_one requirements", () => {
    const today = new Date("2026-05-02T00:00:00Z");

    const primeMembershipOnly: Option[] = [
      makeOption({
        id: "prime_membership_video",
        name: "Prime Video via Amazon Prime",
        provider: "amazon",
        monthly: 14.99,
        effectiveMonthly: 14.99,
        covers: ["Prime Video"],
        requires: ["amazon_prime"],
        includedWith: "amazon_prime",
        category: "membership",
        mutuallyExclusiveGroup: "prime_video_access",
      }),
    ];

    const blockedWithoutPrime = calculateCombos(
      primeMembershipOnly,
      ["Prime Video"],
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      today
    );
    expect(blockedWithoutPrime.length).toBe(0);

    const allowedWithPrime = calculateCombos(
      primeMembershipOnly,
      ["Prime Video"],
      false,
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      today
    );
    expect(allowedWithPrime[0]?.chosen.map((c) => c.id)).toEqual(["prime_membership_video"]);

    const appleOneOnly: Option[] = [
      makeOption({
        id: "apple_one_individual",
        name: "Apple One Individual",
        provider: "apple",
        monthly: 19.95,
        covers: ["Apple TV+"],
        requires: ["apple_one"],
        includedWith: "apple_one",
        category: "membership",
        mutuallyExclusiveGroup: "apple_tv_access",
      }),
    ];

    const blockedWithoutAppleOne = calculateCombos(
      appleOneOnly,
      ["Apple TV+"],
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      today
    );
    expect(blockedWithoutAppleOne.length).toBe(0);

    const allowedWithAppleOne = calculateCombos(
      appleOneOnly,
      ["Apple TV+"],
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
      today
    );
    expect(allowedWithAppleOne[0]?.chosen.map((c) => c.id)).toEqual(["apple_one_individual"]);
  });

  it("prefers Prime-included Prime Video over standalone when user has Amazon Prime (full catalog)", () => {
    const today = new Date("2026-05-02T00:00:00Z");

    const withoutPrime = calculateCombos(
      defaultCatalogOptions,
      ["Prime Video"],
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      today
    );
    expect(withoutPrime[0]?.chosen.map((c) => c.id)).toEqual(["prime_video_direct"]);

    const withPrime = calculateCombos(
      defaultCatalogOptions,
      ["Prime Video"],
      false,
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      today
    );
    expect(withPrime[0]?.chosen.map((c) => c.id)).toEqual(["prime_membership_video"]);
    expect(withPrime[0]?.total).toBe(0);
    expect(withPrime[0]?.savings).toBeGreaterThan(0);
  });

  it("prefers Apple-One-included Apple TV+ over standalone when user has Apple One (full catalog)", () => {
    const today = new Date("2026-05-02T00:00:00Z");

    const withoutAppleOne = calculateCombos(
      defaultCatalogOptions,
      ["Apple TV+"],
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      today
    );
    expect(withoutAppleOne[0]?.chosen.map((c) => c.id)).toEqual([
      "apple_tv_rokt_30day_promo",
    ]);
    expect(withoutAppleOne[0]?.total).toBe(0);

    const withAppleOne = calculateCombos(
      defaultCatalogOptions,
      ["Apple TV+"],
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
      today
    );
    expect(withAppleOne[0]?.chosen.map((c) => c.id)).toEqual(["apple_one_individual"]);
    expect(withAppleOne[0]?.total).toBe(0);
    expect(withAppleOne[0]?.savings).toBeGreaterThan(0);
  });

  it("includes exactly one DirecTV Signature tier when DirecTV is selected", () => {
    const directvOptions = defaultCatalogOptions.filter((opt) =>
      opt.covers.includes("DirecTV")
    );
    expect(directvOptions.length).toBeGreaterThanOrEqual(4);

    const results = calculateCombos(
      defaultCatalogOptions,
      ["DirecTV"],
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      new Date("2026-05-19")
    );

    expect(results.length).toBeGreaterThan(0);
    const cheapest = results[0];
    const directvChosen = cheapest.chosen.filter((c) => c.covers.includes("DirecTV"));
    expect(directvChosen).toHaveLength(1);
    expect(directvChosen[0]?.id).toMatch(/^directv_/);
  });
});
