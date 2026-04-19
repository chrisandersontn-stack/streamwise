#!/usr/bin/env node
/**
 * Build Google Sheets–friendly CSVs from a StreamWise catalog JSON export.
 *
 * Usage:
 *   node scripts/generate-catalog-sheet-csvs.mjs [catalog.json]
 *   npm run catalog:sheet:generate -- catalog-before.json
 *
 * Writes:
 *   data/catalog-sheet-export/services.csv
 *   data/catalog-sheet-export/options.csv
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  readCatalogJson,
  stringifyCsv,
  pipeJoin,
} from "./lib/catalog-sheet-csv.mjs";

const SERVICE_HEADERS = ["id", "label", "monthly", "group"];

const OPTION_HEADERS = [
  "id",
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
  "mutuallyExclusiveGroup",
  "notes",
  "covers",
  "requires",
  "includedWith",
];

function printHelp() {
  console.error(`Usage: node scripts/generate-catalog-sheet-csvs.mjs [catalog.json]

If catalog.json is omitted, tries ./catalog-before.json then ./catalog-after.json.

Outputs:
  data/catalog-sheet-export/services.csv
  data/catalog-sheet-export/options.csv`);
}

function resolveInputPath(argv) {
  if (argv[0]) {
    return argv[0];
  }
  for (const candidate of ["catalog-before.json", "catalog-after.json"]) {
    if (fs.existsSync(path.resolve(candidate))) {
      return candidate;
    }
  }
  return null;
}

function serviceRow(s) {
  return {
    id: s.id ?? "",
    label: s.label ?? "",
    monthly: s.monthly ?? "",
    group: s.group ?? "",
  };
}

function optionRow(o) {
  return {
    id: o.id ?? "",
    name: o.name ?? "",
    provider: o.provider ?? "",
    monthly: o.monthly ?? "",
    effectiveMonthly: o.effectiveMonthly ?? "",
    standardMonthly: o.standardMonthly ?? "",
    introLengthMonths: o.introLengthMonths ?? "",
    priceStatus: o.priceStatus ?? "",
    lastChecked: o.lastChecked ?? "",
    category: o.category ?? "",
    source: o.source ?? "",
    sourceUrl: o.sourceUrl ?? "",
    affiliateUrl: o.affiliateUrl ?? "",
    expiresAt: o.expiresAt ?? "",
    effectiveDate: o.effectiveDate ?? "",
    mutuallyExclusiveGroup: o.mutuallyExclusiveGroup ?? "",
    notes: o.notes ?? "",
    covers: pipeJoin(o.covers),
    requires: pipeJoin(o.requires),
    includedWith: o.includedWith ?? "",
  };
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("-h") || argv.includes("--help")) {
    printHelp();
    process.exit(0);
  }

  const input = resolveInputPath(argv);
  if (!input) {
    printHelp();
    console.error(
      "\nNo catalog file found. Pass catalog.json or create catalog-before.json in the project root."
    );
    process.exit(2);
  }

  const catalog = readCatalogJson(input);
  const outDir = path.join(process.cwd(), "data", "catalog-sheet-export");
  fs.mkdirSync(outDir, { recursive: true });

  const services = [...catalog.services]
    .sort((a, b) => String(a.id).localeCompare(String(b.id)))
    .map(serviceRow);

  const options = [...catalog.options]
    .sort((a, b) => String(a.id).localeCompare(String(b.id)))
    .map(optionRow);

  const servicesPath = path.join(outDir, "services.csv");
  const optionsPath = path.join(outDir, "options.csv");

  fs.writeFileSync(
    servicesPath,
    stringifyCsv(SERVICE_HEADERS, services),
    "utf8"
  );
  fs.writeFileSync(
    optionsPath,
    stringifyCsv(OPTION_HEADERS, options),
    "utf8"
  );

  console.log(`Wrote ${servicesPath} (${services.length} rows)`);
  console.log(`Wrote ${optionsPath} (${options.length} rows)`);
  console.log("\nNext: import both CSVs into Google Sheets (see docs/catalog-google-sheet.md).");
  process.exit(0);
}

main();
