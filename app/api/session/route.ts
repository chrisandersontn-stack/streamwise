import { NextResponse } from "next/server";

import { getOrCreateSessionId } from "@/lib/server/session";

export async function GET() {
  const sessionId = await getOrCreateSessionId();
  return NextResponse.json({ sessionId });
}
