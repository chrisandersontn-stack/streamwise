import { describe, expect, it } from "vitest";
import { anthropicKeyLooksValid, getAnthropicApiKey } from "./anthropic";

describe("getAnthropicApiKey", () => {
  it("strips wrapping quotes", () => {
    process.env.ANTHROPIC_API_KEY = '"sk-ant-api03-test"';
    expect(getAnthropicApiKey()).toBe("sk-ant-api03-test");
    delete process.env.ANTHROPIC_API_KEY;
  });
});

describe("anthropicKeyLooksValid", () => {
  it("accepts sk-ant- prefix", () => {
    expect(anthropicKeyLooksValid("sk-ant-api03-abc")).toBe(true);
  });
  it("rejects other prefixes", () => {
    expect(anthropicKeyLooksValid("sk-proj-abc")).toBe(false);
  });
});
