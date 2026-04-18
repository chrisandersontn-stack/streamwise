import { NextRequest, NextResponse } from "next/server";

import { appendEvent } from "@/lib/server/event-store";
import { getPostHogServerClient } from "@/lib/server/posthog";

type ClickEvent = {
  optionId?: string;
  optionName?: string;
  provider?: string;
  sourceUrl?: string;
};

function parseClickEvent(request: NextRequest, body: unknown): ClickEvent | null {
  const contentType = request.headers.get("content-type") ?? "";

  if (typeof body === "string") {
    if (!body.trim()) {
      return null;
    }

    if (contentType.includes("application/json")) {
      try {
        return JSON.parse(body) as ClickEvent;
      } catch {
        return null;
      }
    }

    if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      return null;
    }

    try {
      return JSON.parse(body) as ClickEvent;
    } catch {
      return null;
    }
  }

  if (body instanceof FormData) {
    return {
      optionId: body.get("optionId")?.toString(),
      optionName: body.get("optionName")?.toString(),
      provider: body.get("provider")?.toString(),
      sourceUrl: body.get("sourceUrl")?.toString(),
    };
  }

  return null;
}

export async function GET() {
  // Simple health response so opening the URL in a browser isn't "blank".
  return NextResponse.json({ ok: true, endpoint: "track-click" });
}

export async function POST(request: NextRequest) {
  let payload: ClickEvent = {};

  const contentType = request.headers.get("content-type") ?? "";
  let rawBody: unknown;

  try {
    if (contentType.includes("application/json")) {
      rawBody = await request.text();
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      rawBody = await request.formData();
    } else {
      rawBody = await request.text();
    }
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const parsed = parseClickEvent(request, rawBody);
  if (!parsed) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  payload = parsed;

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
