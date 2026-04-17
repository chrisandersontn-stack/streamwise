import { describe, expect, it } from "vitest";

import type { Option } from "./streamwise-data";
import { calculateCombos } from "./streamwise-logic";

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
      new Date("2026-04-10T00:00:00Z")
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.chosen.map((item) => item.id)).toEqual(["bundle"]);
    expect(results[0]?.total).toBe(12.99);
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
      new Date("2026-04-10T00:00:00Z")
    );

    expect(withoutProvider[0]?.chosen.map((item) => item.id)).toEqual(["direct"]);
    expect(withProvider[0]?.chosen.map((item) => item.id)).toEqual(["tmobile_free"]);
  });
});
