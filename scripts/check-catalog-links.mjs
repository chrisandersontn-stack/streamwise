#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const DEFAULT_DATA_FILE = "app/streamwise-data.ts";
const DEFAULT_OUTPUT_FILE = "data/catalog-link-health.json";

function parseArgs(argv) {
  const args = {
    dataFile: DEFAULT_DATA_FILE,
    outputFile: DEFAULT_OUTPUT_FILE,
  };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--data") {
      args.dataFile = argv[i + 1] ?? DEFAULT_DATA_FILE;
      i += 1;
    } else if (argv[i] === "--output") {
      args.outputFile = argv[i + 1] ?? DEFAULT_OUTPUT_FILE;
      i += 1;
    }
  }
  return args;
}

function parseUrlsFromStreamwiseData(raw) {
  const records = [];
  const entryRegex = /id:\s*"([^"]+)"[\s\S]*?(sourceUrl|affiliateUrl):\s*"([^"]+)"/g;
  let match = entryRegex.exec(raw);
  while (match) {
    records.push({
      optionId: match[1],
      linkType: match[2],
      url: match[3],
    });
    match = entryRegex.exec(raw);
  }
  return records;
}

async function checkUrl(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const startedAt = Date.now();
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent":
          process.env.PRICE_WATCH_USER_AGENT ||
          "StreamWise-LinkHealth/1.0 (+https://github.com/chrisandersontn-stack/streamwise)",
      },
    });
    return {
      ok: response.ok,
      status: response.status,
      finalUrl: response.url,
      durationMs: Date.now() - startedAt,
      error: response.ok ? "" : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      finalUrl: url,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

function classify(result) {
  const finalUrl = String(result.finalUrl ?? "").toLowerCase();
  if (finalUrl.includes("help.hulu.com") && finalUrl.includes("can't find the page")) {
    return "broken_hulu_help_page";
  }
  if (!result.ok) return "http_or_network_failure";
  return "ok";
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dataPath = path.resolve(args.dataFile);
  const outputPath = path.resolve(args.outputFile);
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Data file not found: ${args.dataFile}`);
  }

  const raw = fs.readFileSync(dataPath, "utf8");
  const links = parseUrlsFromStreamwiseData(raw);
  const uniqueLinks = Array.from(
    new Map(links.map((item) => [`${item.linkType}:${item.url}`, item])).values()
  );

  const results = [];
  for (const link of uniqueLinks) {
    const checked = await checkUrl(link.url);
    const issueClass = classify(checked);
    results.push({
      ...link,
      ...checked,
      issueClass,
    });
  }

  const failures = results.filter((item) => item.issueClass !== "ok");
  const summary = {
    generatedAt: new Date().toISOString(),
    linksChecked: results.length,
    failures: failures.length,
    failureClasses: failures.reduce((acc, item) => {
      acc[item.issueClass] = (acc[item.issueClass] ?? 0) + 1;
      return acc;
    }, {}),
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify({ summary, results, failures }, null, 2)}\n`,
    "utf8"
  );

  console.log(
    `Catalog link health: checked=${summary.linksChecked} failures=${summary.failures}`
  );
  console.log(`Wrote ${path.relative(process.cwd(), outputPath)}`);
  if (summary.failures > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});

