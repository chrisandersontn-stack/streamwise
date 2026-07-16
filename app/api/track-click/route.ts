import { NextRequest, NextResponse } from "next/server";

import {
  normalizeOutboundLinkKindForTracking,
  parseTrackClickPayload,
} from "@/lib/affiliate/click-tracking";
import { appendEvent } from "@/lib/server/event-store";
import { getPostHogServerClient } from "@/lib/server/posthog";

export async function GET() {
  // Simple health response so opening the URL in a browser isn't "blank".
  return NextResponse.json({ ok: true, endpoint: "track-click" });
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  let rawBody: unknown;

  try {
    if (
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

  const parsed = parseTrackClickPayload(rawBody, contentType);
  if (!parsed) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const rawKind = parsed.linkKind || parsed.resolvedKind;
  const linkKind = normalizeOutboundLinkKindForTracking(rawKind);

  await appendEvent("outbound_click", {
    optionId: parsed.optionId || null,
    optionName: parsed.optionName || null,
    provider: parsed.provider || null,
    sourceUrl: parsed.sourceUrl || null,
    resolvedUrl: parsed.resolvedUrl || null,
    linkKind,
    resolvedKind: parsed.resolvedKind || rawKind || null,
    placement: parsed.placement || null,
    network: parsed.network || null,
    referrer: request.headers.get("referer"),
    userAgent: request.headers.get("user-agent"),
  });

  const posthog = getPostHogServerClient();
  if (posthog) {
    posthog.capture({
      distinctId: "server",
      event: "outbound_click",
      properties: {
        optionId: parsed.optionId || null,
        optionName: parsed.optionName || null,
        provider: parsed.provider || null,
        sourceUrl: parsed.sourceUrl || null,
        resolvedUrl: parsed.resolvedUrl || null,
        linkKind,
        resolvedKind: parsed.resolvedKind || rawKind || null,
        placement: parsed.placement || null,
        network: parsed.network || null,
        referrer: request.headers.get("referer"),
      },
    });
    // Serverless freezes after the response; flush so capture actually leaves the isolate.
    await posthog.flush();
  }

  return NextResponse.json({ ok: true });
}
