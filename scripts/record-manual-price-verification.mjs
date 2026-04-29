#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const DEFAULT_PATH = "data/manual-price-verifications.json";

function parseArgs(argv) {
  const args = {
    sourceId: "",
    date: "",
    verifier: "",
    notes: "",
    filePath: DEFAULT_PATH,
  };

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--source") {
      args.sourceId = argv[i + 1] ?? "";
      i += 1;
    } else if (argv[i] === "--date") {
      args.date = argv[i + 1] ?? "";
      i += 1;
    } else if (argv[i] === "--verifier") {
      args.verifier = argv[i + 1] ?? "";
      i += 1;
    } else if (argv[i] === "--notes") {
      args.notes = argv[i + 1] ?? "";
      i += 1;
    } else if (argv[i] === "--file") {
      args.filePath = argv[i + 1] ?? DEFAULT_PATH;
      i += 1;
    }
  }

  return args;
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function loadExisting(filePath) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    return { updatedAt: null, entries: [] };
  }
  const parsed = JSON.parse(fs.readFileSync(resolved, "utf8"));
  if (!parsed || !Array.isArray(parsed.entries)) {
    return { updatedAt: null, entries: [] };
  }
  return parsed;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.sourceId || !args.date || !args.verifier) {
    console.error(
      "Usage: node scripts/record-manual-price-verification.mjs --source <source_id> --date YYYY-MM-DD --verifier <name> [--notes text] [--file path]"
    );
    process.exit(2);
  }

  if (!isIsoDate(args.date)) {
    console.error("Date must be ISO format YYYY-MM-DD.");
    process.exit(2);
  }

  const existing = loadExisting(args.filePath);
  const nextEntries = existing.entries.filter((entry) => entry.sourceId !== args.sourceId);
  nextEntries.push({
    sourceId: args.sourceId,
    verifiedOn: args.date,
    verifier: args.verifier,
    notes: args.notes || "",
    recordedAt: new Date().toISOString(),
  });
  nextEntries.sort((a, b) => String(a.sourceId).localeCompare(String(b.sourceId)));

  const output = {
    updatedAt: new Date().toISOString(),
    entries: nextEntries,
  };

  const resolved = path.resolve(args.filePath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Recorded manual verification for ${args.sourceId} in ${args.filePath}`);
}

main();

