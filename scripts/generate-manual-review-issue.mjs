#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const args = {
    checksPath: "data/price-source-candidate-updates.json",
    registryPath: "data/price-source-registry.json",
    outputPath: "price-source-manual-review-issue.md",
  };

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--checks") {
      args.checksPath = argv[i + 1];
      i += 1;
    } else if (argv[i] === "--registry") {
      args.registryPath = argv[i + 1];
      i += 1;
    } else if (argv[i] === "--output") {
      args.outputPath = argv[i + 1];
      i += 1;
    }
  }

  return args;
}

function loadJson(filePath) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Missing file: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(resolved, "utf8"));
}

function buildPriorityMap(registry) {
  const map = new Map();
  const entries = Array.isArray(registry?.entries) ? registry.entries : [];
  entries.forEach((entry) => {
    map.set(entry.sourceId, Number(entry.priority ?? 99));
  });
  return map;
}

function buildMarkdown(summary, priorityMap) {
  const manualReview = Array.isArray(summary?.manualReview)
    ? summary.manualReview
    : [];

  const sorted = [...manualReview].sort((a, b) => {
    const ap = priorityMap.get(a.sourceId) ?? 99;
    const bp = priorityMap.get(b.sourceId) ?? 99;
    return ap - bp || String(a.provider).localeCompare(String(b.provider));
  });

  const lines = [
    "## Price source manual review checklist",
    "",
    `Generated at: ${summary?.generatedAt ?? new Date().toISOString()}`,
    `Manual review groups: ${sorted.length}`,
    "",
    "### How to use",
    "",
    "1. Work from top to bottom by priority.",
    "2. Open source URL and verify current pricing/eligibility in an incognito window.",
    "3. Update catalog values and `lastChecked`, then run catalog diff before publish.",
    "",
  ];

  if (!sorted.length) {
    lines.push("No manual review tasks found in the current checks output.");
    lines.push("");
    return lines.join("\n");
  }

  lines.push("### Provider tasks");
  lines.push("");

  sorted.forEach((item) => {
    const priority = priorityMap.get(item.sourceId) ?? 99;
    lines.push(`- [ ] **${item.provider}** (\`${item.sourceId}\`) · Priority ${priority}`);
    lines.push(`  - URL: ${item.url}`);
    if (Array.isArray(item.tasks) && item.tasks.length) {
      item.tasks.forEach((task) => lines.push(`  - [ ] ${task}`));
    } else {
      lines.push("  - [ ] Review current pricing and eligibility terms.");
    }
    lines.push("");
  });

  lines.push("### Publish guardrail");
  lines.push("");
  lines.push("- [ ] Run `npm run catalog:diff -- <before.json> <after.json>`");
  lines.push("- [ ] Publish only after confirming changes are intentional");
  lines.push("");

  return lines.join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const checks = loadJson(args.checksPath);
  const registry = loadJson(args.registryPath);
  const priorityMap = buildPriorityMap(registry);
  const markdown = buildMarkdown(checks, priorityMap);

  const outputResolved = path.resolve(args.outputPath);
  fs.mkdirSync(path.dirname(outputResolved), { recursive: true });
  fs.writeFileSync(outputResolved, `${markdown}\n`, "utf8");

  const count = Array.isArray(checks?.manualReview) ? checks.manualReview.length : 0;
  console.log(`Wrote ${args.outputPath} (${count} manual-review groups)`);
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exit(2);
}

