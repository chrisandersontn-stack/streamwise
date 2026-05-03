import { describe, expect, it } from "vitest";

import { options as defaultOptions } from "@/app/streamwise-data";
import { calculateCombos } from "@/app/streamwise-logic";

import { repairCatalogOptions } from "./catalog-store";

describe("repairCatalogOptions (STARZ promo)", () => {
  it("replaces a flat standard-rate starz_promo row with the canonical promo shape", () => {
    const broken = defaultOptions.map((o) =>
      o.id === "starz_promo"
        ? {
            ...o,
            monthly: 11.99,
            introLengthMonths: undefined,
            standardMonthly: undefined,
          }
        : o
    );

    const fixed = repairCatalogOptions(broken);
    const promo = fixed.find((o) => o.id === "starz_promo");
    expect(promo?.monthly).toBe(4.99);
    expect(promo?.standardMonthly).toBe(11.99);
    expect(promo?.introLengthMonths).toBe(3);

    const combos = calculateCombos(
      fixed,
      ["STARZ"],
      false,
      false,
      false,
      false,
      false,
      new Date("2026-05-02T00:00:00Z")
    );
    expect(combos[0]?.chosen.some((c) => c.id === "starz_promo")).toBe(true);
  });

  it("appends starz_promo when missing from the snapshot", () => {
    const withoutPromo = defaultOptions.filter((o) => o.id !== "starz_promo");
    const fixed = repairCatalogOptions(withoutPromo);
    expect(fixed.some((o) => o.id === "starz_promo")).toBe(true);
  });
});
