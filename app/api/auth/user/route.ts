import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserId } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request.headers.get("authorization"));
  if (!userId) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user: { id: userId } });
}
