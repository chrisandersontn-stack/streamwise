#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const DEFAULT_CATALOG_PATH = "catalog-before.json";
const DEFAULT_CHECKS_PATH = "data/price-source-candidate-updates.json";
const DEFAULT_OUTPUT_PATH = "catalog-after-auto.json";

function parseArgs(argv) {
  const args = {
    catalogPath: DEFAULT_CATALOG_PATH,
    checksPath: DEFAULT_CHECKS_PATH,
    outputPath: DEFAULT_OUTPUT_PATH,
    applyPrices: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--catalog") {
      args.catalogPath = argv[i + 1] ?? DEFAULT_CATALOG_PATH;
      i += 1;
    } else if (argv[i] === "--checks") {
      args.checksPath = argv[i + 1] ?? DEFAULT_CHECKS_PATH;
      i += 1;
    } else if (argv[i] === "--output") {
      args.outputPath = argv[i + 1] ?? DEFAULT_OUTPUT_PATH;
      i += 1;
    } else if (argv[i] === "--apply-prices") {
      args.applyPrices = true;
    }
  }

  return args;
}

function loadJson(filePath) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(resolved, "utf8"));
}

function toIsoDay(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function getOptionIdFromField(field) {
  if (typeof field !== "string") return null;
  const dot = field.indexOf(".");
  if (dot <= 0) return null;
  return field.slice(0, dot);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const catalog = loadJson(args.catalogPath);
  const checks = loadJson(args.checksPath);

  if (!Array.isArray(catalog?.options)) {
    throw new Error(`Catalog malformed: expected options[] in ${args.catalogPath}`);
  }
  if (!Array.isArray(checks?.adapterResults)) {
    throw new Error(`Checks malformed: expected adapterResults[] in ${args.checksPath}`);
  }

  const optionsById = new Map(catalog.options.map((option) => [String(option.id), option]));
  const verifiedAutomatedSources = new Set(
    Array.isArray(checks?.sourceVerificationStates)
      ? checks.sourceVerificationStates
          .filter((entry) => entry?.state === "verified_automated")
          .map((entry) => String(entry?.sourceId ?? ""))
          .filter(Boolean)
      : []
  );
  let optionsTouched = 0;
  let pricesUpdated = 0;

  checks.adapterResults.forEach((result) => {
    const checkedDay = toIsoDay(result?.checkedAt);
    if (!checkedDay) return;
    if (!verifiedAutomatedSources.has(String(result?.sourceId ?? ""))) return;
    if (!Array.isArray(result.checks)) return;

    const touchedThisAdapter = new Set();

    result.checks.forEach((check) => {
      const optionId = getOptionIdFromField(check?.field);
      if (!optionId) return;
      const option = optionsById.get(optionId);
      if (!option) return;
      const detectedPrice = Number(check?.detectedPrice);
      if (!Number.isFinite(detectedPrice)) return;

      // Mark lastChecked whenever this option had a successful verified check.
      option.lastChecked = checkedDay;
      touchedThisAdapter.add(optionId);

      if (!args.applyPrices) return;
      if (!String(check?.field ?? "").endsWith(".monthly")) return;
      option.monthly = Number(detectedPrice.toFixed(2));
      pricesUpdated += 1;
    });

    optionsTouched += touchedThisAdapter.size;
  });

  const outputResolved = path.resolve(args.outputPath);
  fs.writeFileSync(outputResolved, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  console.log(`Applied automated check results to ${args.outputPath}`);
  console.log(`Options with refreshed lastChecked: ${optionsTouched}`);
  console.log(`Prices updated: ${pricesUpdated}`);
  console.log(
    args.applyPrices
      ? "Price updates applied from detected checks."
      : "Run with --apply-prices to apply detected monthly values automatically."
  );
}

main();

