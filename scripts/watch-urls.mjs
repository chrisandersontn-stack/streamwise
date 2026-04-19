#!/usr/bin/env node
/**
 * Fetch monitored URLs, fingerprint HTML/text, compare to baseline on disk.
 *
 * Exit codes:
 *   0 — no content change vs previous baseline for any tracked id
 *   1 — one or more fingerprints changed (write report for GitHub issue)
 *   2 — configuration or fetch failure
 *
 * Writes:
 *   data/url-watch-baseline.json   (updated when fingerprints change OR new ids appear)
 *   url-watch-report.md            (only when exit 1)
 *
 * Options:
 *   --list PATH       default: data/url-watch-list.json
 *   --baseline PATH   default: data/url-watch-baseline.json
 *   --report PATH     default: url-watch-report.md
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const DEFAULT_USER_AGENT =
  "StreamWise-URLWatch/1.0 (+https://github.com/chrisandersontn-stack/streamwise)";

function loadJson(filePath) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(abs, "utf8"));
}

function normalizeBody(text) {
  return String(text)
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function sha256(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

async function fetchUrl(url) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 45000);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": process.env.URL_WATCH_USER_AGENT || DEFAULT_USER_AGENT,
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
      },
    });
    const text = await res.text();
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: `HTTP ${res.status} for ${url}`,
        text: "",
      };
    }
    return { ok: true, status: res.status, text, error: "" };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: err instanceof Error ? err.message : String(err),
      text: "",
    };
  } finally {
    clearTimeout(t);
  }
}

function printHelp() {
  console.error(`Usage: node scripts/watch-urls.mjs [--list PATH] [--baseline PATH] [--report PATH]

Monitors URLs listed in the list file and compares SHA-256 fingerprints to baseline.
See docs/url-watch.md`);
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("-h") || argv.includes("--help")) {
    printHelp();
    process.exit(0);
  }

  let listPath = "data/url-watch-list.json";
  let baselinePath = "data/url-watch-baseline.json";
  let reportPath = "url-watch-report.md";

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--list") {
      listPath = argv[++i];
    } else if (argv[i] === "--baseline") {
      baselinePath = argv[++i];
    } else if (argv[i] === "--report") {
      reportPath = argv[++i];
    }
  }

  const listRaw = loadJson(listPath);
  if (!Array.isArray(listRaw) || !listRaw.length) {
    console.error(`List file missing or empty: ${listPath}`);
    printHelp();
    process.exit(2);
  }

  for (const row of listRaw) {
    if (!row || typeof row !== "object") {
      console.error("Each list entry must be an object");
      process.exit(2);
    }
    if (!row.id || !row.url) {
      console.error('Each list entry needs "id" and "url"');
      process.exit(2);
    }
    try {
      new URL(row.url);
    } catch {
      console.error(`Invalid URL for id ${row.id}: ${row.url}`);
      process.exit(2);
    }
  }

  const baselineRaw = loadJson(baselinePath);
  const baseline =
    baselineRaw &&
    typeof baselineRaw === "object" &&
    baselineRaw.entries &&
    typeof baselineRaw.entries === "object"
      ? baselineRaw
      : { version: 1, entries: {} };

  /** @type {Map<string, { hash: string, byteLength: number }>} */
  const byUrl = new Map();
  const fetchFailures = [];

  const urlsToFetch = new Set();
  for (const row of listRaw) {
    if (row.skipAutomation) {
      continue;
    }
    urlsToFetch.add(row.url);
  }

  if (urlsToFetch.size === 0) {
    console.log("URL watch: nothing to fetch (all rows use skipAutomation).");
    process.exit(0);
  }

  // Sequential fetch to be gentle on targets (avoid parallel burst)
  for (const u of urlsToFetch) {
    if (byUrl.has(u)) {
      continue;
    }
    const result = await fetchUrl(u);
    if (!result.ok) {
      const msg = result.error || `Fetch failed for ${u}`;
      console.warn(`WARN ${msg}`);
      fetchFailures.push(msg);
      continue;
    }
    const normalized = normalizeBody(result.text);
    const hash = sha256(normalized);
    byUrl.set(u, { hash, byteLength: Buffer.byteLength(normalized, "utf8") });
  }

  if (byUrl.size === 0) {
    console.error(
      "Every monitored URL failed to fetch. Fix URLs, network, or bot blocking before relying on this job."
    );
    process.exit(2);
  }

  const fetchedAt = new Date().toISOString();
  const newEntries = { ...baseline.entries };
  const changes = [];
  let baselineDirty = false;
  let newIdCount = 0;

  for (const row of listRaw) {
    if (row.skipAutomation) {
      console.warn(
        `WARN Skipping ${row.id}: skipAutomation=true (use Distill / manual checks for this URL).`
      );
      continue;
    }
    const snap = byUrl.get(row.url);
    if (!snap) {
      if (newEntries[row.id]) {
        console.warn(
          `WARN Skipping ${row.id}: fetch failed for URL; keeping existing baseline fingerprint.`
        );
      } else {
        console.warn(
          `WARN Skipping ${row.id}: fetch failed for URL; no baseline yet (will retry next run).`
        );
      }
      continue;
    }
    const prev = newEntries[row.id];
    const nextEntry = {
      hash: snap.hash,
      url: row.url,
      label: row.label || row.id,
      fetchedAt,
      byteLength: snap.byteLength,
    };

    if (!prev) {
      newEntries[row.id] = nextEntry;
      baselineDirty = true;
      newIdCount += 1;
      continue;
    }
    if (prev.hash !== snap.hash) {
      changes.push({
        id: row.id,
        label: row.label || row.id,
        url: row.url,
        oldHash: prev.hash,
        newHash: snap.hash,
        lastFetchedAt: prev.fetchedAt,
      });
      newEntries[row.id] = nextEntry;
      baselineDirty = true;
    }
  }

  if (baselineDirty) {
    const out = {
      version: 1,
      entries: newEntries,
      updatedAt: fetchedAt,
    };
    fs.mkdirSync(path.dirname(path.resolve(baselinePath)), { recursive: true });
    fs.writeFileSync(
      path.resolve(baselinePath),
      `${JSON.stringify(out, null, 2)}\n`,
      "utf8"
    );
  }

  if (changes.length) {
    const lines = [
      "## URL watch: monitored pages changed",
      "",
      "Fingerprints (SHA-256 of normalized HTML) changed for at least one URL you track.",
      "This does **not** automatically mean the retail price changed—only that the page content changed enough to investigate.",
      "",
      "### Next steps",
      "",
      "1. Open each URL below in a browser (incognito helps).",
      "2. Confirm whether pricing or eligibility actually changed.",
      "3. If needed, update your Google Sheet / catalog JSON and `PUT /api/catalog`.",
      "",
      "### Changes",
      "",
    ];
    for (const c of changes) {
      lines.push(`- **${c.label}** (\`${c.id}\`)`);
      lines.push(`  - URL: ${c.url}`);
      lines.push(`  - Previous hash: \`${c.oldHash}\``);
      lines.push(`  - Current hash:  \`${c.newHash}\``);
      lines.push(`  - Last seen in baseline: ${c.lastFetchedAt || "(unknown)"}`);
      lines.push("");
    }
    lines.push(
      "_Baseline file in the repo was updated by automation so you are not alerted again until the next change._"
    );
    fs.writeFileSync(path.resolve(reportPath), `${lines.join("\n")}\n`, "utf8");
    console.log(`Wrote ${reportPath} (${changes.length} change(s))`);
    process.exit(1);
  }

  if (fetchFailures.length) {
    console.warn(
      `\nWARN ${fetchFailures.length} unique URL(s) failed to fetch (bot/WAF/geo). Those rows were skipped this run.`
    );
  }

  if (newIdCount && !changes.length) {
    console.log(
      `URL watch: recorded initial fingerprints for ${newIdCount} id(s). Future runs will open an issue only when a fingerprint changes.`
    );
  } else if (!changes.length) {
    console.log("URL watch: no fingerprint changes for known ids.");
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
