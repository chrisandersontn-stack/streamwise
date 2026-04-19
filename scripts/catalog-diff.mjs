#!/usr/bin/env node
/**
 * Compare two StreamWise catalog JSON blobs (services + options) before PUT.
 *
 * Accepts the shape returned by GET /api/catalog: { services, options, generatedAt? }.
 * Only `services` and `options` are compared; `generatedAt` is ignored.
 *
 * Usage:
 *   node scripts/catalog-diff.mjs <before.json> <after.json>
 *   npm run catalog:diff -- snapshots/old.json snapshots/new.json
 *
 * Exit codes (same spirit as `diff(1)`):
 *   0 — no differences in services/options
 *   1 — one or more differences (or added/removed ids)
 *   2 — usage or file/JSON error
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const SERVICE_KEYS = ["label", "monthly", "group"];
const OPTION_KEYS = [
  "name",
  "provider",
  "monthly",
  "effectiveMonthly",
  "standardMonthly",
  "introLengthMonths",
  "priceStatus",
  "lastChecked",
  "category",
  "source",
  "sourceUrl",
  "affiliateUrl",
  "expiresAt",
  "effectiveDate",
  "requires",
  "includedWith",
  "covers",
  "mutuallyExclusiveGroup",
  "notes",
];

function printHelp() {
  console.error(`Usage: node scripts/catalog-diff.mjs <before.json> <after.json>

Compares catalog.services and catalog.options by id.
Ignores GET /api/catalog "generatedAt".

Exit: 0 = identical, 1 = differences, 2 = error`);
}

function readCatalog(filePath) {
  const absolute = path.resolve(filePath);
  let raw;
  try {
    raw = fs.readFileSync(absolute, "utf8");
  } catch (err) {
    throw new Error(`Cannot read file: ${absolute}\n${err.message}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON: ${absolute}\n${err.message}`);
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error(`Expected object root in ${absolute}`);
  }
  if (!Array.isArray(parsed.services) || !Array.isArray(parsed.options)) {
    throw new Error(
      `Expected { services: [], options: [] } in ${absolute} (arrays required)`
    );
  }
  return { services: parsed.services, options: parsed.options };
}

function indexById(items, label) {
  const map = new Map();
  for (const item of items) {
    if (!item || typeof item !== "object") {
      throw new Error(`Invalid ${label} entry (not an object)`);
    }
    if (!item.id || typeof item.id !== "string") {
      throw new Error(`Invalid ${label} entry missing string id`);
    }
    if (map.has(item.id)) {
      throw new Error(`Duplicate ${label} id: ${item.id}`);
    }
    map.set(item.id, item);
  }
  return map;
}

function normalizeForCompare(key, value) {
  if (value === undefined) {
    return undefined;
  }
  if (key === "requires" || key === "covers") {
    if (!Array.isArray(value)) {
      return JSON.stringify(value);
    }
    return JSON.stringify([...value].map(String).sort());
  }
  if (typeof value === "number" && Number.isNaN(value)) {
    return JSON.stringify(value);
  }
  return JSON.stringify(value);
}

function diffEntity(beforeObj, afterObj, keys) {
  const changes = [];
  for (const key of keys) {
    const b = beforeObj ? beforeObj[key] : undefined;
    const a = afterObj ? afterObj[key] : undefined;
    const nb = normalizeForCompare(key, b);
    const na = normalizeForCompare(key, a);
    if (nb !== na) {
      changes.push({
        key,
        before: b,
        after: a,
      });
    }
  }
  return changes;
}

function formatValue(value) {
  if (value === undefined) {
    return "(missing)";
  }
  if (typeof value === "string") {
    const max = 120;
    return value.length > max ? `${value.slice(0, max)}…` : value;
  }
  return JSON.stringify(value);
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv.includes("-h") || argv.includes("--help")) {
    printHelp();
    process.exit(argv.length === 0 ? 2 : 0);
  }
  if (argv.length !== 2) {
    printHelp();
    process.exit(2);
  }

  const [beforePath, afterPath] = argv;

  let before;
  let after;
  try {
    before = readCatalog(beforePath);
    after = readCatalog(afterPath);
  } catch (err) {
    console.error(err.message || String(err));
    process.exit(2);
  }

  const beforeServices = indexById(before.services, "service");
  const afterServices = indexById(after.services, "service");
  const beforeOptions = indexById(before.options, "option");
  const afterOptions = indexById(after.options, "option");

  let hasDiff = false;

  function section(title) {
    console.log(`\n${"=".repeat(72)}\n${title}\n${"=".repeat(72)}`);
  }

  // Services
  const serviceIds = new Set([
    ...beforeServices.keys(),
    ...afterServices.keys(),
  ]);
  const addedServices = [];
  const removedServices = [];
  const changedServices = [];

  for (const id of [...serviceIds].sort()) {
    const b = beforeServices.get(id);
    const a = afterServices.get(id);
    if (b && !a) {
      removedServices.push(id);
      hasDiff = true;
    } else if (!b && a) {
      addedServices.push(id);
      hasDiff = true;
    } else if (b && a) {
      const changes = diffEntity(b, a, SERVICE_KEYS);
      if (changes.length) {
        changedServices.push({ id, changes });
        hasDiff = true;
      }
    }
  }

  if (
    addedServices.length ||
    removedServices.length ||
    changedServices.length
  ) {
    section("Services");
    if (addedServices.length) {
      console.log("\n+ Added:");
      for (const id of addedServices) {
        console.log(`  ${id}`);
      }
    }
    if (removedServices.length) {
      console.log("\n- Removed:");
      for (const id of removedServices) {
        console.log(`  ${id}`);
      }
    }
    if (changedServices.length) {
      console.log("\n~ Changed:");
      for (const { id, changes } of changedServices) {
        console.log(`\n  [${id}]`);
        for (const { key, before: bv, after: av } of changes) {
          console.log(
            `    ${key}: ${formatValue(bv)} → ${formatValue(av)}`
          );
        }
      }
    }
  }

  // Options
  const optionIds = new Set([
    ...beforeOptions.keys(),
    ...afterOptions.keys(),
  ]);
  const addedOptions = [];
  const removedOptions = [];
  const changedOptions = [];

  for (const id of [...optionIds].sort()) {
    const b = beforeOptions.get(id);
    const a = afterOptions.get(id);
    if (b && !a) {
      removedOptions.push(id);
      hasDiff = true;
    } else if (!b && a) {
      addedOptions.push(id);
      hasDiff = true;
    } else if (b && a) {
      const changes = diffEntity(b, a, OPTION_KEYS);
      if (changes.length) {
        changedOptions.push({ id, changes });
        hasDiff = true;
      }
    }
  }

  if (addedOptions.length || removedOptions.length || changedOptions.length) {
    section("Options");
    if (addedOptions.length) {
      console.log("\n+ Added:");
      for (const id of addedOptions) {
        console.log(`  ${id}`);
      }
    }
    if (removedOptions.length) {
      console.log("\n- Removed:");
      for (const id of removedOptions) {
        console.log(`  ${id}`);
      }
    }
    if (changedOptions.length) {
      console.log("\n~ Changed:");
      for (const { id, changes } of changedOptions) {
        console.log(`\n  [${id}]`);
        for (const { key, before: bv, after: av } of changes) {
          console.log(
            `    ${key}: ${formatValue(bv)} → ${formatValue(av)}`
          );
        }
      }
    }
  }

  console.log(`\n${"-".repeat(72)}`);
  if (!hasDiff) {
    console.log("No differences in services or options.");
    process.exit(0);
  }

  console.log("Summary:");
  console.log(
    `  services: +${addedServices.length} -${removedServices.length} ~${changedServices.length}`
  );
  console.log(
    `  options:  +${addedOptions.length} -${removedOptions.length} ~${changedOptions.length}`
  );
  console.log(
    "\nReview the above, then PUT the after file if changes are intended."
  );
  process.exit(1);
}

main();
