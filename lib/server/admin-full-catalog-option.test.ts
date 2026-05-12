import { describe, expect, it } from "vitest";

import { parseAdminFullCatalogOption, serviceLabelsFromCatalog, suggestMutexGroupFromCatalog } from "./admin-full-catalog-option";
import { services as defaultServices } from "@/app/streamwise-data";

const labels = serviceLabelsFromCatalog(defaultServices);

describe("parseAdminFullCatalogOption", () => {
  it("accepts a minimal valid option", () => {
    const opt = parseAdminFullCatalogOption(
      {
        id: "test_plan_alpha",
        name: "Test Plan",
        provider: "direct",
        category: "bundle",
        monthly: 12.5,
        covers: ["Netflix"],
        notes: "Test notes",
        source: "TestCo",
        sourceUrl: "https://example.com/pricing",
        lastChecked: "2026-05-01",
        priceStatus: "current",
      },
      labels
    );
    expect(opt.id).toBe("test_plan_alpha");
    expect(opt.monthly).toBe(12.5);
    expect(opt.covers).toEqual(["Netflix"]);
  });

  it("rejects unknown service in covers", () => {
    expect(() =>
      parseAdminFullCatalogOption(
        {
          id: "bad_covers",
          name: "Bad",
          provider: "direct",
          category: "direct",
          monthly: 1,
          covers: ["NotARealStream"],
          notes: "",
          source: "X",
          sourceUrl: "https://example.com",
          lastChecked: "2026-05-01",
          priceStatus: "current",
        },
        labels
      )
    ).toThrow("invalid_covers");
  });

  it("rejects invalid option id", () => {
    expect(() =>
      parseAdminFullCatalogOption(
        {
          id: "a",
          name: "Short id",
          provider: "direct",
          category: "direct",
          monthly: 1,
          covers: ["Netflix"],
          notes: "",
          source: "X",
          sourceUrl: "https://example.com",
          lastChecked: "2026-05-01",
          priceStatus: "current",
        },
        labels
      )
    ).toThrow("invalid_option_id");
  });
});

describe("suggestMutexGroupFromCatalog", () => {
  it("returns mutex when another option has same covers", () => {
    const options = [
      { covers: ["Netflix", "Hulu"], mutuallyExclusiveGroup: "nh_bundle" as const },
      { covers: ["Disney+"], mutuallyExclusiveGroup: "d_only" as const },
    ];
    expect(suggestMutexGroupFromCatalog(options, ["Hulu", "Netflix"])).toBe("nh_bundle");
  });
});
