import { describe, expect, it } from "vitest";

import { options as defaultOptions } from "@/app/streamwise-data";
import { calculateCombos } from "@/app/streamwise-logic";

import { repairCatalogOptions } from "./catalog-store";

describe("repairCatalogOptions (AMC+ direct)", () => {
  it("replaces a corrupted amcplus_direct row (wrong service) with the embedded default", () => {
    const corrupted = defaultOptions.map((o) =>
      o.id === "amcplus_direct"
        ? {
            ...o,
            name: "Crunchyroll Fan – Ani-May Promo (May 2026)",
            covers: ["Crunchyroll"] as typeof o.covers,
            monthly: 1.99,
            source: "Crunchyroll",
            category: "promo" as const,
            mutuallyExclusiveGroup: "crunchyroll_animay_2026",
          }
        : o
    );

    const fixed = repairCatalogOptions(corrupted);
    const amc = fixed.find((o) => o.id === "amcplus_direct");
    expect(amc?.covers).toContain("AMC+");
    expect(amc?.monthly).toBe(7.99);

    const combos = calculateCombos(
      fixed,
      ["AMC+"],
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      new Date("2026-05-22T00:00:00Z")
    );
    expect(combos.length).toBeGreaterThan(0);
    expect(combos[0]?.chosen.some((c) => c.covers.includes("AMC+"))).toBe(true);
  });
});

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
    expect(promo?.monthly).toBe(2.99);
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
      false,
      false,
      false,
      false,
      new Date("2026-05-02T00:00:00Z")
    );
    const starzPick = combos[0]?.chosen.find((c) => c.covers?.includes("STARZ"));
    expect(["starz_promo", "starz_annual_prepay"]).toContain(starzPick?.id);
  });

  it("appends starz_promo when missing from the snapshot", () => {
    const withoutPromo = defaultOptions.filter((o) => o.id !== "starz_promo");
    const fixed = repairCatalogOptions(withoutPromo);
    expect(fixed.some((o) => o.id === "starz_promo")).toBe(true);
  });

  it("replaces snapshot priceStatus so a stale expired row cannot hide the promo", () => {
    const withExpired = defaultOptions.map((o) =>
      o.id === "starz_promo" ? { ...o, priceStatus: "expired" as const } : o
    );
    const fixed = repairCatalogOptions(withExpired);
    expect(fixed.find((x) => x.id === "starz_promo")?.priceStatus).toBe("current");
  });

  it("merges lastChecked from embedded defaults when the snapshot is older", () => {
    const stale = defaultOptions.map((o) => ({
      ...o,
      lastChecked: "2026-05-02",
    }));
    const fixed = repairCatalogOptions(stale);
    expect(fixed.find((o) => o.id === "prime_video_direct")?.lastChecked).toBe(
      "2026-05-22"
    );
    expect(fixed.find((o) => o.id === "disney_hulu_bundle_promo")?.lastChecked).toBe(
      "2026-05-22"
    );
  });

  it("keeps a snapshot lastChecked when it is newer than the embedded default", () => {
    const withNewer = defaultOptions.map((o) =>
      o.id === "paramount_direct"
        ? { ...o, lastChecked: "2026-06-01" }
        : { ...o, lastChecked: "2026-05-02" }
    );
    const fixed = repairCatalogOptions(withNewer);
    expect(fixed.find((o) => o.id === "paramount_direct")?.lastChecked).toBe(
      "2026-06-01"
    );
  });

  it("overwrites a snapshot row that looks like a valid promo but uses wrong numbers", () => {
    const wrongNumbers = defaultOptions.map((o) =>
      o.id === "starz_promo"
        ? {
            ...o,
            monthly: 5.99,
            standardMonthly: 12.99,
            introLengthMonths: 3,
          }
        : o
    );
    const fixed = repairCatalogOptions(wrongNumbers);
    const promo = fixed.find((o) => o.id === "starz_promo");
    expect(promo?.monthly).toBe(2.99);
    expect(promo?.standardMonthly).toBe(11.99);
  });
});
