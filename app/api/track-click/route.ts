import { NextRequest, NextResponse } from "next/server";

import { appendEvent } from "@/lib/server/event-store";
import { getPostHogServerClient } from "@/lib/server/posthog";

type ClickEvent = {
  optionId?: string;
  optionName?: string;
  provider?: string;
  sourceUrl?: string;
};

export async function GET() {
  // Simple health response so opening the URL in a browser isn't "blank".
  return NextResponse.json({ ok: true, endpoint: "track-click" });
}

export async function POST(request: NextRequest) {
  let payload: ClickEvent = {};

  try {
    payload = (await request.json()) as ClickEvent;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  await appendEvent("outbound_click", {
    optionId: payload.optionId ?? null,
    optionName: payload.optionName ?? null,
    provider: payload.provider ?? null,
    sourceUrl: payload.sourceUrl ?? null,
    referrer: request.headers.get("referer"),
    userAgent: request.headers.get("user-agent"),
  });

  const posthog = getPostHogServerClient();
  if (posthog) {
    posthog.capture({
      distinctId: "server",
      event: "outbound_click",
      properties: {
        optionId: payload.optionId ?? null,
        optionName: payload.optionName ?? null,
        provider: payload.provider ?? null,
        sourceUrl: payload.sourceUrl ?? null,
        referrer: request.headers.get("referer"),
      },
    });
  }

  return NextResponse.json({ ok: true });
}
