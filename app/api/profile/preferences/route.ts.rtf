import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserId } from "@/lib/server/auth";
import {
  getUserPreferences,
  saveUserPreferences,
} from "@/lib/server/preferences-store";
import { getOrCreateSessionId } from "@/lib/server/session";

async function resolveUserKey(request: NextRequest) {
  const authenticatedUserId = await getAuthenticatedUserId(
    request.headers.get("authorization")
  );
  if (authenticatedUserId) {
    return `auth:${authenticatedUserId}`;
  }
  const sessionId = await getOrCreateSessionId();
  return `session:${sessionId}`;
}

export async function GET(request: NextRequest) {
  const userKey = await resolveUserKey(request);
  const preferences = await getUserPreferences(userKey);
  return NextResponse.json({ preferences });
}

export async function PUT(request: NextRequest) {
  const userKey = await resolveUserKey(request);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const preferences = await saveUserPreferences(userKey, payload);
  return NextResponse.json({ ok: true, preferences });
}
