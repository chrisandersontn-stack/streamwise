import { promises as fs } from "node:fs";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

const DEFAULT_PATH = path.join(process.cwd(), "data", "manual-price-verifications.json");

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

type Body = {
  sourceId?: string;
  date?: string;
  verifier?: string;
  notes?: string;
};

async function loadExisting(filePath: string) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as { updatedAt?: string; entries?: unknown[] };
    if (!parsed || !Array.isArray(parsed.entries)) {
      return { updatedAt: null as string | null, entries: [] as Record<string, unknown>[] };
    }
    return { updatedAt: parsed.updatedAt ?? null, entries: parsed.entries as Record<string, unknown>[] };
  } catch {
    return { updatedAt: null as string | null, entries: [] as Record<string, unknown>[] };
  }
}

export async function POST(request: NextRequest) {
  const adminToken = process.env.CATALOG_ADMIN_TOKEN;
  const providedToken = request.headers.get("x-admin-token");

  if (!adminToken || providedToken !== adminToken) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const sourceId = String(body.sourceId ?? "").trim();
  const date = String(body.date ?? "").trim();
  const verifier = String(body.verifier ?? "").trim();
  const notes = String(body.notes ?? "").trim();

  if (!sourceId || !date || !verifier) {
    return NextResponse.json(
      { ok: false, error: "missing_fields", required: ["sourceId", "date", "verifier"] },
      { status: 400 }
    );
  }

  if (!isIsoDate(date)) {
    return NextResponse.json({ ok: false, error: "invalid_date", expected: "YYYY-MM-DD" }, { status: 400 });
  }

  const existing = await loadExisting(DEFAULT_PATH);
  const nextEntries = existing.entries.filter((entry) => String(entry.sourceId) !== sourceId);
  nextEntries.push({
    sourceId,
    verifiedOn: date,
    verifier,
    notes,
    recordedAt: new Date().toISOString(),
  });
  nextEntries.sort((a, b) => String(a.sourceId).localeCompare(String(b.sourceId)));

  const output = {
    updatedAt: new Date().toISOString(),
    entries: nextEntries,
  };

  await fs.mkdir(path.dirname(DEFAULT_PATH), { recursive: true });
  await fs.writeFile(DEFAULT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");

  return NextResponse.json({ ok: true, sourceId, verifiedOn: date });
}
