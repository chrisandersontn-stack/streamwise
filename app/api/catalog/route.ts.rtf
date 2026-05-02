import { NextResponse } from "next/server";

import { getCatalog, saveCatalog } from "@/lib/server/catalog-store";

export async function GET() {
  const catalog = await getCatalog();

  return NextResponse.json(
    {
      ...catalog,
      generatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}

export async function PUT(request: Request) {
  const adminToken = process.env.CATALOG_ADMIN_TOKEN;
  const providedToken = request.headers.get("x-admin-token");

  if (!adminToken || providedToken !== adminToken) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  try {
    await saveCatalog(payload as Parameters<typeof saveCatalog>[0]);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, updatedAt: new Date().toISOString() });
}
