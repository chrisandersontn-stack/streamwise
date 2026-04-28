#!/usr/bin/env node

import dns from "node:dns/promises";
import fs from "node:fs";
import path from "node:path";

const DEFAULT_REGISTRY_PATH = "data/price-source-registry.json";
const DEFAULT_OUTPUT_PATH = "data/price-source-network-health.json";
const DEFAULT_REPORT_PATH = "price-source-network-health-report.md";

function parseArgs(argv) {
  const args = {
    registryPath: DEFAULT_REGISTRY_PATH,
    outputPath: DEFAULT_OUTPUT_PATH,
    reportPath: DEFAULT_REPORT_PATH,
  };

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--registry") {
      args.registryPath = argv[i + 1];
      i += 1;
    } else if (argv[i] === "--output") {
      args.outputPath = argv[i + 1];
      i += 1;
    } else if (argv[i] === "--report") {
      args.reportPath = argv[i + 1];
      i += 1;
    }
  }

  return args;
}

function loadRegistry(filePath) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Registry not found: ${filePath}`);
  }
  const raw = JSON.parse(fs.readFileSync(resolved, "utf8"));
  if (!raw || !Array.isArray(raw.entries)) {
    throw new Error(`Registry malformed: expected { entries: [] } in ${filePath}`);
  }
  return raw.entries;
}

async function probeDns(hostname) {
  try {
    const [a4, a6] = await Promise.allSettled([
      dns.resolve4(hostname),
      dns.resolve6(hostname),
    ]);
    const ipv4 = a4.status === "fulfilled" ? a4.value : [];
    const ipv6 = a6.status === "fulfilled" ? a6.value : [];
    if (ipv4.length || ipv6.length) {
      return { ok: true, ipv4Count: ipv4.length, ipv6Count: ipv6.length, error: "" };
    }
    return { ok: false, ipv4Count: 0, ipv6Count: 0, error: "no_dns_records" };
  } catch (error) {
    return {
      ok: false,
      ipv4Count: 0,
      ipv6Count: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function probeHttp(url) {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent":
          process.env.PRICE_WATCH_USER_AGENT ||
          "StreamWise-NetworkCheck/1.0 (+https://github.com/chrisandersontn-stack/streamwise)",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    return {
      ok: response.ok,
      status: response.status,
      durationMs: Date.now() - startedAt,
      error: response.ok ? "" : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

function summarize(results) {
  const summary = {
    checkedHosts: results.length,
    dnsOk: 0,
    dnsFailed: 0,
    httpOk: 0,
    httpFailed: 0,
    likelyEnvironmentDnsIssue: false,
  };

  results.forEach((result) => {
    if (result.dns.ok) summary.dnsOk += 1;
    else summary.dnsFailed += 1;
    if (result.http.ok) summary.httpOk += 1;
    else summary.httpFailed += 1;
  });

  if (summary.checkedHosts > 0 && summary.dnsFailed === summary.checkedHosts) {
    summary.likelyEnvironmentDnsIssue = true;
  }

  return summary;
}

function writeJson(filePath, value) {
  const resolved = path.resolve(filePath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeReport(filePath, payload) {
  const { generatedAt, summary, results } = payload;
  const lines = [
    "## Price source network health",
    "",
    `Generated at: ${generatedAt}`,
    `Hosts checked: ${summary.checkedHosts}`,
    `DNS ok: ${summary.dnsOk}`,
    `DNS failed: ${summary.dnsFailed}`,
    `HTTP ok: ${summary.httpOk}`,
    `HTTP failed: ${summary.httpFailed}`,
    `Likely environment DNS issue: ${summary.likelyEnvironmentDnsIssue ? "yes" : "no"}`,
    "",
    "### Host results",
    "",
  ];

  results.forEach((result) => {
    lines.push(`- **${result.hostname}**`);
    lines.push(`  - URL: ${result.url}`);
    lines.push(
      `  - DNS: ${result.dns.ok ? "ok" : "failed"} (A=${result.dns.ipv4Count}, AAAA=${result.dns.ipv6Count}${result.dns.error ? `, error=${result.dns.error}` : ""})`
    );
    lines.push(
      `  - HTTP: ${result.http.ok ? "ok" : "failed"} (status=${result.http.status}, duration=${result.http.durationMs}ms${result.http.error ? `, error=${result.http.error}` : ""})`
    );
    lines.push("");
  });

  fs.writeFileSync(path.resolve(filePath), `${lines.join("\n")}\n`, "utf8");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const entries = loadRegistry(args.registryPath);
  const uniqueUrls = [...new Set(entries.map((entry) => entry.pricingPageUrl).filter(Boolean))];

  const byHostname = new Map();
  uniqueUrls.forEach((url) => {
    try {
      const parsed = new URL(url);
      if (!byHostname.has(parsed.hostname)) {
        byHostname.set(parsed.hostname, parsed.origin);
      }
    } catch {
      // Ignore malformed URL rows here; they should be fixed in registry generation.
    }
  });

  const hosts = [...byHostname.entries()].map(([hostname, origin]) => ({
    hostname,
    url: origin,
  }));

  const results = [];
  for (const host of hosts) {
    const dnsResult = await probeDns(host.hostname);
    const httpResult = await probeHttp(host.url);
    results.push({
      hostname: host.hostname,
      url: host.url,
      dns: dnsResult,
      http: httpResult,
    });
  }

  const summary = summarize(results);
  const payload = {
    generatedAt: new Date().toISOString(),
    summary,
    results,
  };

  writeJson(args.outputPath, payload);
  writeReport(args.reportPath, payload);

  console.log(
    `Network health: hosts=${summary.checkedHosts} dnsFailed=${summary.dnsFailed} httpFailed=${summary.httpFailed} likelyDnsIssue=${summary.likelyEnvironmentDnsIssue}`
  );
  console.log(`Wrote ${args.outputPath}`);
  console.log(`Wrote ${args.reportPath}`);

  if (summary.dnsFailed > 0 || summary.httpFailed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});

