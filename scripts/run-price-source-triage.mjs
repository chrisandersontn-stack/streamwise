#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function runStep(label, command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: "pipe",
  });

  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";
  const exitCode = result.status ?? 1;
  const ok = exitCode === 0;

  return { label, command: [command, ...args].join(" "), ok, exitCode, stdout, stderr };
}

function loadJsonSafe(filePath) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) return null;
  try {
    return JSON.parse(fs.readFileSync(resolved, "utf8"));
  } catch {
    return null;
  }
}

function summarize(registry, network, checks) {
  return {
    sourcesTracked: registry?.entries?.length ?? 0,
    networkHostsChecked: network?.summary?.checkedHosts ?? 0,
    networkDnsFailed: network?.summary?.dnsFailed ?? 0,
    networkHttpFailed: network?.summary?.httpFailed ?? 0,
    likelyEnvironmentDnsIssue: Boolean(network?.summary?.likelyEnvironmentDnsIssue),
    adaptersRun: checks?.adaptersRun ?? 0,
    checksDetectedCount: checks?.checksDetectedCount ?? 0,
    candidateChanges: checks?.changeCount ?? 0,
    fetchFailures: checks?.fetchFailureCount ?? 0,
    browserFallbackAttempted: checks?.browserFallbackAttemptedCount ?? 0,
    browserFallbackRecovered: checks?.browserFallbackRecoveredCount ?? 0,
    browserFallbackSkipped: checks?.browserFallbackSkippedCount ?? 0,
    verificationStatus: checks?.verificationStatus ?? "unknown",
    manualReviewGroups: checks?.manualReviewCount ?? 0,
  };
}

function writeSummaryReport(steps, metrics) {
  const outPath = path.resolve("price-source-triage-summary.md");
  const lines = [
    "## Price source triage summary",
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    "### Pipeline status",
    "",
    `- Sources tracked: ${metrics.sourcesTracked}`,
    `- Network hosts checked: ${metrics.networkHostsChecked}`,
    `- DNS failures: ${metrics.networkDnsFailed}`,
    `- HTTP failures: ${metrics.networkHttpFailed}`,
    `- Likely environment DNS issue: ${metrics.likelyEnvironmentDnsIssue ? "yes" : "no"}`,
    `- Adapters run: ${metrics.adaptersRun}`,
    `- Checks detected: ${metrics.checksDetectedCount}`,
    `- Candidate changes: ${metrics.candidateChanges}`,
    `- Fetch failures: ${metrics.fetchFailures}`,
    `- Browser fallback attempted: ${metrics.browserFallbackAttempted}`,
    `- Browser fallback recovered: ${metrics.browserFallbackRecovered}`,
    `- Browser fallback skipped: ${metrics.browserFallbackSkipped}`,
    `- Verification status: ${metrics.verificationStatus}`,
    `- Manual review groups: ${metrics.manualReviewGroups}`,
    "",
    "### Step results",
    "",
  ];

  steps.forEach((step) => {
    lines.push(`- ${step.ok ? "✅" : "❌"} **${step.label}** (exit ${step.exitCode})`);
    lines.push(`  - Command: \`${step.command}\``);
  });

  lines.push("");
  lines.push("### Output files");
  lines.push("");
  lines.push("- `data/price-source-registry.json`");
  lines.push("- `data/price-source-automation-report.json`");
  lines.push("- `data/price-source-network-health.json`");
  lines.push("- `price-source-network-health-report.md`");
  lines.push("- `data/price-source-candidate-updates.json`");
  lines.push("- `price-source-check-report.md`");
  lines.push("- `price-source-manual-review-issue.md`");
  lines.push("- `price-source-triage-summary.md`");
  lines.push("");

  fs.writeFileSync(outPath, `${lines.join("\n")}\n`, "utf8");
  return outPath;
}

function main() {
  const steps = [];

  steps.push(
    runStep("Build source registry", "npm", ["run", "catalog:price-sources:build"])
  );
  steps.push(
    runStep("Network preflight", "npm", ["run", "catalog:price-sources:network-check"])
  );
  steps.push(
    runStep("Debug source checks", "npm", ["run", "catalog:price-sources:check:debug"])
  );
  steps.push(
    runStep("Manual review issue body", "npm", [
      "run",
      "catalog:price-sources:manual-review-issue",
    ])
  );

  const registry = loadJsonSafe("data/price-source-registry.json");
  const network = loadJsonSafe("data/price-source-network-health.json");
  const checks = loadJsonSafe("data/price-source-candidate-updates.json");
  const metrics = summarize(registry, network, checks);
  const summaryPath = writeSummaryReport(steps, metrics);

  console.log(`Wrote ${path.relative(process.cwd(), summaryPath)}`);

  const hasHardFailures = steps.some((step) => step.exitCode === 2);
  if (hasHardFailures) {
    process.exit(2);
  }

  const hasDegraded =
    metrics.verificationStatus === "degraded" ||
    metrics.networkDnsFailed > 0 ||
    metrics.networkHttpFailed > 0;
  if (hasDegraded) {
    process.exit(1);
  }
}

main();

