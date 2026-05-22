import { describe, expect, it } from "vitest";

import type { Option } from "@/app/streamwise-data";
import {
  getCatalogRefreshSummary,
  getLastCheckedByServiceGroup,
} from "@/lib/catalog-freshness";

function makeOption(overrides: Partial<Option>): Option {
  return {
    id: "test",
    name: "Test",
    provider: "direct",
    monthly: 10,
    covers: ["Netflix"],
    notes: "n",
    source: "s",
    category: "direct",
    ...overrides,
  };
}

describe("getCatalogRefreshSummary", () => {
  it("returns latest and oldest ISO dates", () => {
    const summary = getCatalogRefreshSummary([
      makeOption({ lastChecked: "2026-05-02" }),
      makeOption({ id: "b", lastChecked: "2026-05-22", covers: ["Hulu"] }),
    ]);
    expect(summary.oldest).toBe("2026-05-02");
    expect(summary.latest).toBe("2026-05-22");
  });
});

describe("getLastCheckedByServiceGroup", () => {
  it("uses the newest lastChecked among options covering a group", () => {
    const map = getLastCheckedByServiceGroup([
      makeOption({ id: "old", lastChecked: "2026-05-02", covers: ["Peacock"] }),
      makeOption({
        id: "new",
        lastChecked: "2026-05-22",
        covers: ["Peacock"],
      }),
      makeOption({
        id: "apple",
        lastChecked: "2026-05-22",
        covers: ["Apple TV+"],
      }),
    ]);
    expect(map.get("Peacock")).toBe("2026-05-22");
    expect(map.get("Apple TV+")).toBe("2026-05-22");
    expect(map.has("Netflix")).toBe(false);
  });
});
