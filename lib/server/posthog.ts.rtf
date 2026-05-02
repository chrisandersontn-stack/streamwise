import { PostHog } from "posthog-node";

let instance: PostHog | null | undefined;

export function getPostHogServerClient() {
  if (instance !== undefined) return instance;

  const apiKey = process.env.POSTHOG_API_KEY;
  const host = process.env.POSTHOG_HOST ?? "https://app.posthog.com";
  if (!apiKey) {
    instance = null;
    return instance;
  }

  instance = new PostHog(apiKey, { host });
  return instance;
}
