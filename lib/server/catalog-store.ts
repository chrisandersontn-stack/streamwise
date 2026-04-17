import { promises as fs } from "node:fs";
import path from "node:path";

import { options as defaultOptions, services as defaultServices } from "@/app/streamwise-data";
import { getSupabaseAdminClient } from "@/lib/server/supabase-admin";

type Service = (typeof defaultServices)[number];
type Option = (typeof defaultOptions)[number];

type CatalogPayload = {
  services: Service[];
  options: Option[];
};

const catalogPath = path.join(process.cwd(), "data", "catalog.json");

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidCatalogPayload(value: unknown): value is CatalogPayload {
  if (!isObject(value)) return false;
  if (!Array.isArray(value.services) || !Array.isArray(value.options)) return false;
  return true;
}

async function ensureCatalogDirectory() {
  await fs.mkdir(path.dirname(catalogPath), { recursive: true });
}

export async function getCatalog(): Promise<CatalogPayload> {
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    const { data } = await supabase
      .from("catalog_snapshots")
      .select("services, options")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data && Array.isArray(data.services) && Array.isArray(data.options)) {
      return {
        services: data.services as Service[],
        options: data.options as Option[],
      };
    }
  }

  try {
    const raw = await fs.readFile(catalogPath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (isValidCatalogPayload(parsed)) {
      return parsed;
    }
  } catch {
    // fall through to defaults
  }

  return {
    services: defaultServices,
    options: defaultOptions,
  };
}

export async function saveCatalog(payload: CatalogPayload) {
  if (!isValidCatalogPayload(payload)) {
    throw new Error("invalid_catalog_payload");
  }

  const supabase = getSupabaseAdminClient();
  if (supabase) {
    await supabase.from("catalog_snapshots").insert({
      services: payload.services,
      options: payload.options,
      is_active: true,
      updated_at: new Date().toISOString(),
    });
    return;
  }

  await ensureCatalogDirectory();
  await fs.writeFile(catalogPath, JSON.stringify(payload, null, 2), "utf8");
}
