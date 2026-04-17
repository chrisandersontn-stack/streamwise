import { promises as fs } from "node:fs";
import path from "node:path";

import { getSupabaseAdminClient } from "@/lib/server/supabase-admin";

const eventPath = path.join(process.cwd(), "data", "events.ndjson");

async function ensureEventDirectory() {
  await fs.mkdir(path.dirname(eventPath), { recursive: true });
}

export async function appendEvent(eventName: string, payload: Record<string, unknown>) {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    const { error } = await supabase.from("analytics_events").insert({
      event_name: eventName,
      payload,
      created_at: new Date().toISOString(),
    });
    if (!error) {
      return;
    }
  }

  await ensureEventDirectory();
  const line = JSON.stringify({
    event: eventName,
    at: new Date().toISOString(),
    ...payload,
  });
  await fs.appendFile(eventPath, `${line}\n`, "utf8");
}
