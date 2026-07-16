import { describe, expect, it } from "vitest";

import { assessDetectedPriceChange } from "./utils.mjs";

describe("assessDetectedPriceChange", () => {
  it("accepts small real plan moves", () => {
    const result = assessDetectedPriceChange({
      detectedPrice: 16.99,
      expectedPrice: 15.49,
      label: "Netflix Standard with ads",
    });
    expect(result.accept).toBe(true);
  });

  it("rejects Netflix $1 style absurd lows", () => {
    const result = assessDetectedPriceChange({
      detectedPrice: 1,
      expectedPrice: 15.49,
      label: "Netflix Standard with ads",
    });
    expect(result.accept).toBe(false);
    expect(result.reason).toBe("absurd_low_price");
  });

  it("rejects YouTube TV $0 false positives", () => {
    const result = assessDetectedPriceChange({
      detectedPrice: 0,
      expectedPrice: 82.99,
      label: "YouTube TV base",
    });
    expect(result.accept).toBe(false);
    expect(result.reason).toBe("absurd_low_price");
  });

  it("rejects Max annual sticker scraped as monthly", () => {
    const result = assessDetectedPriceChange({
      detectedPrice: 78.99,
      expectedPrice: 9.99,
      label: "Max with Ads",
    });
    expect(result.accept).toBe(false);
    expect(result.reason).toBe("suspect_annual_as_monthly");
  });

  it("routes near-12x annual mentions to manual review (not changes)", () => {
    const result = assessDetectedPriceChange({
      detectedPrice: 119.88,
      expectedPrice: 9.99,
      label: "Max billed annually",
    });
    expect(result.accept).toBe(false);
    expect(result.reason).toBe("annual_price_needs_manual_review");
  });

  it("rejects deltas beyond ~60%", () => {
    const result = assessDetectedPriceChange({
      detectedPrice: 30,
      expectedPrice: 10,
      label: "Some plan",
    });
    expect(result.accept).toBe(false);
    expect(result.reason).toBe("delta_exceeds_sanity_bound");
  });

  it("allows tiny expected prices (included / free benefits)", () => {
    const result = assessDetectedPriceChange({
      detectedPrice: 0,
      expectedPrice: 0,
      label: "Peacock included",
    });
    expect(result.accept).toBe(true);
  });
});
