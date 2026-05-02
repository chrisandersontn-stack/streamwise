import { NextRequest, NextResponse } from "next/server";

import { getSupabasePublicConfig } from "@/lib/server/supabase-admin";

type MagicLinkBody = {
  email?: string;
};

export async function POST(request: NextRequest) {
  const config = getSupabasePublicConfig();
  if (!config) {
    return NextResponse.json(
      { ok: false, error: "supabase_not_configured" },
      { status: 503 }
    );
  }

  let body: MagicLinkBody;
  try {
    body = (await request.json()) as MagicLinkBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const email = body.email?.trim();
  if (!email) {
    return NextResponse.json({ ok: false, error: "email_required" }, { status: 400 });
  }

  const redirectTo = process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL;
  const response = await fetch(`${config.url}/auth/v1/otp`, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      create_user: true,
      ...(redirectTo ? { email_redirect_to: redirectTo } : {}),
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ ok: false, error: "magic_link_failed" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
