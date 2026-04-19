#!/usr/bin/env node
/**
 * Build data/url-watch-list.json from a catalog export (options with sourceUrl).
 *
 * Usage:
 *   node scripts/generate-url-watch-list.mjs [catalog.json]
 *   npm run catalog:url-watch:generate-list -- catalog-before.json
 *
 * Tries catalog-before.json, then catalog-after.json, if no arg.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function resolveCatalogPath(argv) {
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

function main() {
  const input = resolveCatalogPath(process.argv.slice(2));
  if (!input) {
    console.error(
      "Pass a catalog JSON path, or create catalog-before.json / catalog-after.json in the repo root."
    );
    process.exit(2);
  }

  const catalog = JSON.parse(fs.readFileSync(path.resolve(input), "utf8"));
  if (!Array.isArray(catalog.options)) {
    console.error("Catalog must contain an options array");
    process.exit(2);
  }

  const list = [];
  for (const opt of catalog.options) {
    if (!opt || !opt.sourceUrl) {
      continue;
    }
    const entry = {
      id: `opt-${opt.id}`,
      url: opt.sourceUrl,
      label: opt.name || opt.id,
    };
    // Many support sites block datacenter IPs (GitHub Actions). Track manually or with Distill.
    if (opt.sourceUrl.includes("support.espn.com")) {
      entry.skipAutomation = true;
    }
    list.push(entry);
  }

  list.sort((a, b) => a.id.localeCompare(b.id));

  const outPath = path.join(process.cwd(), "data", "url-watch-list.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(list, null, 2)}\n`, "utf8");
  console.log(`Wrote ${outPath} (${list.length} URLs from options with sourceUrl)`);
}

main();
