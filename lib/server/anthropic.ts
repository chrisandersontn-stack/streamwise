/** Strip whitespace and accidental wrapping quotes from env values. */
export function getAnthropicApiKey(): string | null {
  const raw = process.env.ANTHROPIC_API_KEY;
  if (!raw) return null;

  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }

  return key.length > 0 ? key : null;
}

export function anthropicKeyLooksValid(key: string): boolean {
  return key.startsWith("sk-ant-");
}
