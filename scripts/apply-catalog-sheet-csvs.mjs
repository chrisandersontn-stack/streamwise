#!/usr/bin/env node
/**
 * Merge Google Sheets–exported CSVs back into a catalog JSON file.
 *
 * Rules:
 * - Rows match existing catalog entries by "id".
 * - Empty cell = leave the existing JSON value unchanged.
 * - covers / requires use pipe-separated values (e.g. Netflix|Hulu).
 * - Unknown option/service ids in the CSV are reported and skipped.
 *
 * Usage:
 *   node scripts/apply-catalog-sheet-csvs.mjs <base.json> <services.csv> <options.csv> [out.json]
 *   npm run catalog:sheet:apply -- catalog-before.json data/catalog-sheet-export/services.csv data/catalog-sheet-export/options.csv catalog-merged.json
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  readCatalogJson,
  parseCsv,
  rowsToObjects,
  pipeSplit,
} from "./lib/catalog-sheet-csv.mjs";

function printHelp() {
  console.error(`Usage: node scripts/apply-catalog-sheet-csvs.mjs <base.json> <services.csv> <options.csv> [out.json]

Default out.json: catalog-merged.json`);
}

function numOrUndefined(raw) {
  const t = String(raw).trim();
  if (!t) {
    return undefined;
  }
  const n = Number(t);
  if (Number.isNaN(n)) {
    throw new Error(`Not a number: "${raw}"`);
  }
  return n;
}

function intOrUndefined(raw) {
  const n = numOrUndefined(raw);
  if (n === undefined) {
    return undefined;
  }
  if (!Number.isInteger(n)) {
    throw new Error(`Expected whole number: "${raw}"`);
  }
  return n;
}

function strOrUndefined(raw) {
  const t = String(raw).trim();
  return t ? t : undefined;
}

function applyServicePatches(catalog, rows) {
  const byId = new Map(catalog.services.map((s) => [s.id, s]));
  for (const row of rows) {
    const id = strOrUndefined(row.id);
    if (!id) {
      continue;
    }
    const target = byId.get(id);
    if (!target) {
      console.warn(`[services] Unknown id skipped: ${id}`);
      continue;
    }
    if (strOrUndefined(row.label) !== undefined) {
      target.label = row.label.trim();
    }
    if (strOrUndefined(row.group) !== undefined) {
      target.group = row.group.trim();
    }
    const monthly = numOrUndefined(row.monthly);
    if (monthly !== undefined) {
      target.monthly = monthly;
    }
  }
}

function applyOptionPatches(catalog, rows) {
  const byId = new Map(catalog.options.map((o) => [o.id, o]));
  for (const row of rows) {
    const id = strOrUndefined(row.id);
    if (!id) {
      continue;
    }
    const target = byId.get(id);
    if (!target) {
      console.warn(`[options] Unknown id skipped: ${id}`);
      continue;
    }

    const stringFields = [
      "name",
      "provider",
      "priceStatus",
      "lastChecked",
      "category",
      "source",
      "sourceUrl",
      "affiliateUrl",
      "expiresAt",
      "effectiveDate",
      "mutuallyExclusiveGroup",
      "notes",
      "includedWith",
    ];
    for (const key of stringFields) {
      if (strOrUndefined(row[key]) !== undefined) {
        target[key] = row[key].trim();
      }
    }

    const monthly = numOrUndefined(row.monthly);
    if (monthly !== undefined) {
      target.monthly = monthly;
    }
    const effectiveMonthly = numOrUndefined(row.effectiveMonthly);
    if (effectiveMonthly !== undefined) {
      target.effectiveMonthly = effectiveMonthly;
    }
    const standardMonthly = numOrUndefined(row.standardMonthly);
    if (standardMonthly !== undefined) {
      target.standardMonthly = standardMonthly;
    }
    const intro = intOrUndefined(row.introLengthMonths);
    if (intro !== undefined) {
      target.introLengthMonths = intro;
    }

    if (strOrUndefined(row.covers) !== undefined) {
      const parts = pipeSplit(row.covers);
      target.covers = parts && parts.length ? parts : [];
    }
    if (strOrUndefined(row.requires) !== undefined) {
      const parts = pipeSplit(row.requires);
      if (parts && parts.length) {
        target.requires = parts;
      } else {
        delete target.requires;
      }
    }
    if (strOrUndefined(row.includedWith) !== undefined) {
      target.includedWith = row.includedWith.trim();
    }
  }
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("-h") || argv.includes("--help")) {
    printHelp();
    process.exit(0);
  }
  if (argv.length < 3) {
    printHelp();
    process.exit(2);
  }

  const [basePath, servicesCsvPath, optionsCsvPath, outPathArg] = argv;
  const outPath = outPathArg || "catalog-merged.json";

  const catalog = readCatalogJson(basePath);
  const merged = JSON.parse(JSON.stringify(catalog));

  const servicesText = fs.readFileSync(path.resolve(servicesCsvPath), "utf8");
  const optionsText = fs.readFileSync(path.resolve(optionsCsvPath), "utf8");

  const serviceRows = rowsToObjects(parseCsv(servicesText));
  const optionRows = rowsToObjects(parseCsv(optionsText));

  applyServicePatches(merged, serviceRows);
  applyOptionPatches(merged, optionRows);

  fs.writeFileSync(
    path.resolve(outPath),
    `${JSON.stringify(merged, null, 2)}\n`,
    "utf8"
  );

  console.log(`Wrote ${path.resolve(outPath)}`);
  console.log(
    "Next: npm run catalog:diff -- catalog-before.json catalog-merged.json"
  );
  process.exit(0);
}

main();
