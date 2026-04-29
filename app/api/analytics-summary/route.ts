import { promises as fs } from "node:fs";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/server/supabase-admin";

type StoredEvent = {
  event?: string;
  event_name?: string;
  at?: string;
  created_at?: string;
  optionId?: string;
  option_id?: string;
  optionName?: string;
  option_name?: string;
  linkKind?: string;
  link_kind?: string;
  payload?: Record<string, unknown>;
};

type Summary = {
  recommendationViews: number;
  outboundClicks: number;
  affiliateClicks: number;
  sourceClicks: number;
  clickThroughRate: number;
  topClickedOptions: Array<{ optionName: string; clicks: number }>;
};

const eventPath = path.join(process.cwd(), "data", "events.ndjson");

function toSummary(events: StoredEvent[]): Summary {
  const recommendationViews = events.filter(
    (event) =>
      (event.event ?? event.event_name) === "outbound_click" &&
      (event.optionId ?? event.option_id) === "ui:recommendation_viewed"
  ).length;

  const outboundEvents = events.filter((event) => {
    if ((event.event ?? event.event_name) !== "outbound_click") return false;
    const optionId = event.optionId ?? event.option_id;
    return Boolean(optionId && !optionId.startsWith("ui:"));
  });

  const outboundClicks = outboundEvents.length;
  const affiliateClicks = outboundEvents.filter(
    (event) => (event.linkKind ?? event.link_kind) === "affiliate"
  ).length;
  const sourceClicks = outboundEvents.filter(
    (event) => (event.linkKind ?? event.link_kind) === "source"
  ).length;

  const clicksByOption = new Map<string, number>();
  outboundEvents.forEach((event) => {
    const optionName = event.optionName ?? event.option_name ?? "Unknown option";
    clicksByOption.set(optionName, (clicksByOption.get(optionName) ?? 0) + 1);
  });

  const topClickedOptions = [...clicksByOption.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([optionName, clicks]) => ({ optionName, clicks }));

  return {
    recommendationViews,
    outboundClicks,
    affiliateClicks,
    sourceClicks,
    clickThroughRate:
      recommendationViews > 0 ? outboundClicks / recommendationViews : 0,
    topClickedOptions,
  };
}

async function loadEventsFromSupabase(): Promise<StoredEvent[] | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("analytics_events")
    .select("event_name,payload,created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error || !data) return null;

  return data.map((row) => ({
    event_name: row.event_name,
    created_at: row.created_at,
    ...(typeof row.payload === "object" && row.payload ? row.payload : {}),
  }));
}

async function loadEventsFromFile(): Promise<StoredEvent[]> {
  try {
    const raw = await fs.readFile(eventPath, "utf8");
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(-500)
      .map((line) => {
        try {
          return JSON.parse(line) as StoredEvent;
        } catch {
          return {};
        }
      });
  } catch {
    return [];
  }
}

function filterEventsByWindow(events: StoredEvent[], windowDays: number) {
  if (!Number.isFinite(windowDays) || windowDays <= 0) {
    return events;
  }

  const now = Date.now();
  const windowMs = windowDays * 24 * 60 * 60 * 1000;

  return events.filter((event) => {
    const timestamp = event.at ?? event.created_at;
    if (!timestamp) return false;
    const parsed = new Date(timestamp).getTime();
    if (Number.isNaN(parsed)) return false;
    return now - parsed <= windowMs;
  });
}

function parseWindowDays(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("window");
  if (!raw) return 7;
  const parsed = Number(raw);
  if (parsed === 1 || parsed === 7 || parsed === 30) {
    return parsed;
  }
  return 7;
}

export async function GET(request: NextRequest) {
  const windowDays = parseWindowDays(request);
  const supabaseEvents = await loadEventsFromSupabase();
  const events = supabaseEvents ?? (await loadEventsFromFile());
  const filteredEvents = filterEventsByWindow(events, windowDays);
  const summary = toSummary(filteredEvents);
  return NextResponse.json({ ok: true, windowDays, summary });
}

