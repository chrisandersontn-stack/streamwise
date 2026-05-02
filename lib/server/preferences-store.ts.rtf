import { promises as fs } from "node:fs";
import path from "node:path";

import { getSupabaseAdminClient } from "@/lib/server/supabase-admin";

type UserPreferences = {
  selectedServices: string[];
  hasVerizon: boolean;
  hasWalmartPlus: boolean;
  hasTMobile: boolean;
  hasXfinity: boolean;
  hasInstacartPlus: boolean;
  rankingMode: "starting" | "ongoing";
  updatedAt: string;
};

type PreferencesRecord = Record<string, UserPreferences>;

const preferencesPath = path.join(process.cwd(), "data", "preferences.json");

const defaultPreferences: Omit<UserPreferences, "updatedAt"> = {
  selectedServices: ["Netflix", "Disney+", "Hulu"],
  hasVerizon: false,
  hasWalmartPlus: false,
  hasTMobile: false,
  hasXfinity: false,
  hasInstacartPlus: false,
  rankingMode: "starting",
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizePreferences(value: unknown): UserPreferences {
  if (!isObject(value)) {
    return { ...defaultPreferences, updatedAt: new Date().toISOString() };
  }

  return {
    selectedServices: Array.isArray(value.selectedServices)
      ? value.selectedServices.filter((item): item is string => typeof item === "string")
      : defaultPreferences.selectedServices,
    hasVerizon: Boolean(value.hasVerizon),
    hasWalmartPlus: Boolean(value.hasWalmartPlus),
    hasTMobile: Boolean(value.hasTMobile),
    hasXfinity: Boolean(value.hasXfinity),
    hasInstacartPlus: Boolean(value.hasInstacartPlus),
    rankingMode: value.rankingMode === "ongoing" ? "ongoing" : "starting",
    updatedAt:
      typeof value.updatedAt === "string" ? value.updatedAt : new Date().toISOString(),
  };
}

async function readPreferences(): Promise<PreferencesRecord> {
  try {
    const raw = await fs.readFile(preferencesPath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (isObject(parsed)) {
      return parsed as PreferencesRecord;
    }
  } catch {
    // fall through
  }
  return {};
}

async function writePreferences(record: PreferencesRecord) {
  await fs.mkdir(path.dirname(preferencesPath), { recursive: true });
  await fs.writeFile(preferencesPath, JSON.stringify(record, null, 2), "utf8");
}

export async function getUserPreferences(sessionId: string): Promise<UserPreferences> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    const { data } = await supabase
      .from("user_preferences")
      .select("preferences")
      .eq("user_key", sessionId)
      .maybeSingle();
    if (data?.preferences) {
      return normalizePreferences(data.preferences);
    }
  }

  const allPreferences = await readPreferences();
  return normalizePreferences(allPreferences[sessionId]);
}

export async function saveUserPreferences(
  sessionId: string,
  incoming: unknown
): Promise<UserPreferences> {
  const normalized = normalizePreferences(incoming);
  normalized.updatedAt = new Date().toISOString();

  const supabase = getSupabaseAdminClient();
  if (supabase) {
    await supabase.from("user_preferences").upsert(
      {
        user_key: sessionId,
        preferences: normalized,
        updated_at: normalized.updatedAt,
      },
      { onConflict: "user_key" }
    );
    return normalized;
  }

  const allPreferences = await readPreferences();
  allPreferences[sessionId] = normalized;
  await writePreferences(allPreferences);
  return normalized;
}
