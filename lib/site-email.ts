/** Public-facing contact email for legal pages and site chrome. */
export const STREAMWISE_HELLO_EMAIL = "hello@streamwise.media";

/**
 * Support / contact mailto target. Uses NEXT_PUBLIC_SUPPORT_EMAIL when set
 * (e.g. staging), otherwise hello@streamwise.media.
 */
export function getPublicContactEmail(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : STREAMWISE_HELLO_EMAIL;
}
