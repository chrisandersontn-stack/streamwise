#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

import { runDisneyPlusAdapter } from "./price-source-adapters/disneyplus.mjs";
import { runFuboAdapter } from "./price-source-adapters/fubo.mjs";
import { runHuluAdapter } from "./price-source-adapters/hulu.mjs";
import { runInstacartPlusAdapter } from "./price-source-adapters/instacart-plus.mjs";
import { runMaxAdapter } from "./price-source-adapters/max.mjs";
import { runNetflixAdapter } from "./price-source-adapters/netflix.mjs";
import { runPeacockAdapter } from "./price-source-adapters/peacock.mjs";
import { runPhiloAdapter } from "./price-source-adapters/philo.mjs";
import { runSlingAdapter } from "./price-source-adapters/sling.mjs";
import { runTmobileAdapter } from "./price-source-adapters/tmobile.mjs";
import { runVerizonAdapter } from "./price-source-adapters/verizon.mjs";
import { runWalmartPlusAdapter } from "./price-source-adapters/walmart-plus.mjs";
import { runXfinityAdapter } from "./price-source-adapters/xfinity.mjs";
import { runYoutubeTvAdapter } from "./price-source-adapters/youtube-tv.mjs";

const DEFAULT_REGISTRY_PATH = "data/price-source-registry.json";
const DEFAULT_OUTPUT_PATH = "data/price-source-candidate-updates.json";
const DEFAULT_REPORT_PATH = "price-source-check-report.md";
const DEFAULT_MANUAL_VERIFICATIONS_PATH = "data/manual-price-verifications.json";

const ADAPTERS = {
  netflix_signup: runNetflixAdapter,
  hulu_start: runHuluAdapter,
  disneyplus_pricing: runDisneyPlusAdapter,
  peacock_pricing: runPeacockAdapter,
  max_pricing: runMaxAdapter,
  youtube_tv_pricing: runYoutubeTvAdapter,
  sling_pricing: runSlingAdapter,
  fubo_pricing: runFuboAdapter,
  philo_pricing: runPhiloAdapter,
  walmart_plus: runWalmartPlusAdapter,
  instacart_plus: runInstacartPlusAdapter,
  verizon_unlimited_bundles: runVerizonAdapter,
  tmobile_offers: runTmobileAdapter,
  xfinity_offers: runXfinityAdapter,
};

function parseArgs(argv) {
  const args = {
    registryPath: DEFAULT_REGISTRY_PATH,
    outputPath: DEFAULT_OUTPUT_PATH,
    reportPath: DEFAULT_REPORT_PATH,
    manualVerificationsPath: DEFAULT_MANUAL_VERIFICATIONS_PATH,
    debugFetch: false,
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
    } else if (argv[i] === "--manual-verifications") {
      args.manualVerificationsPath = argv[i + 1];
      i += 1;
    } else if (argv[i] === "--debug-fetch") {
      args.debugFetch = true;
    }
  }

  return args;
}

function classifyFetchFailure(result) {
  const status = Number(result.fetch?.status ?? 0);
  const error = String(result.fetch?.error ?? "").toLowerCase();
  const errorCode = String(result.fetch?.errorCode ?? "").toUpperCase();

  if (status === 401 || status === 403) return "blocked_or_unauthorized";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "upstream_server_error";
  if (error.includes("abort") || error.includes("timeout")) return "timeout";
  if (errorCode === "ENOTFOUND" || errorCode === "EAI_AGAIN")
    return "dns_resolution_failure";
  if (errorCode === "ECONNRESET" || errorCode === "ECONNREFUSED")
    return "connection_failure";
  if (error.includes("fetch failed")) return "runtime_fetch_failure";
  return "unknown_fetch_failure";
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

function loadManualVerifications(filePath) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    return new Map();
  }
  const raw = JSON.parse(fs.readFileSync(resolved, "utf8"));
  const entries = Array.isArray(raw?.entries) ? raw.entries : [];
  const bySourceId = new Map();
  entries.forEach((entry) => {
    const sourceId = String(entry?.sourceId ?? "");
    const verifiedOn = String(entry?.verifiedOn ?? "");
    if (!sourceId) return;
    bySourceId.set(sourceId, {
      sourceId,
      verifiedOn,
      verifier: String(entry?.verifier ?? ""),
      notes: String(entry?.notes ?? ""),
    });
  });
  return bySourceId;
}

function computeSourceVerificationState(result, manualVerificationsBySourceId) {
  const sourceId = String(result.sourceId ?? "");
  const hasManualVerification = manualVerificationsBySourceId.has(sourceId);
  const hasDetectedChecks = Array.isArray(result.checks) && result.checks.length > 0;
  const hasManualTasks =
    Array.isArray(result.manualReviewTasks) && result.manualReviewTasks.length > 0;

  if (hasManualVerification) {
    return "verified_manual";
  }
  if (result.fetch?.ok && hasDetectedChecks) {
    return "verified_automated";
  }
  if (hasManualTasks) {
    return "manual_required";
  }
  if (!result.fetch?.ok) {
    return "failed_fetch";
  }
  return "manual_required";
}

function evaluateChecks(adapterResults, manualVerificationsBySourceId) {
  const changes = [];
  const unknown = [];
  const manualReview = [];
  const fetchFailures = [];
  const fetchFailureBreakdown = {};
  const sourceVerificationStates = [];
  const sourceVerificationStateCounts = {
    verified_automated: 0,
    verified_manual: 0,
    failed_fetch: 0,
    manual_required: 0,
  };
  let browserFallbackAttemptedCount = 0;
  let browserFallbackRecoveredCount = 0;
  let browserFallbackSkippedCount = 0;
  let checksDetectedCount = 0;

  adapterResults.forEach((result) => {
    const state = computeSourceVerificationState(result, manualVerificationsBySourceId);
    sourceVerificationStateCounts[state] += 1;
    sourceVerificationStates.push({
      sourceId: result.sourceId,
      provider: result.provider,
      state,
      fetchOk: Boolean(result.fetch?.ok),
      checksDetected: Array.isArray(result.checks) ? result.checks.length : 0,
      manualTasks: Array.isArray(result.manualReviewTasks)
        ? result.manualReviewTasks.length
        : 0,
      manualVerifiedOn: manualVerificationsBySourceId.get(result.sourceId)?.verifiedOn ?? null,
    });

    if (result.fetch?.browserFallbackAttempted) {
      browserFallbackAttemptedCount += 1;
    }
    if (result.fetch?.fallbackFromHttpFailure) {
      browserFallbackRecoveredCount += 1;
    }
    if (result.fetch?.browserFallbackSkipped) {
      browserFallbackSkippedCount += 1;
    }

    if (!result.fetch?.ok) {
      const failureClass = classifyFetchFailure(result);
      fetchFailureBreakdown[failureClass] = (fetchFailureBreakdown[failureClass] ?? 0) + 1;
      fetchFailures.push({
        sourceId: result.sourceId,
        provider: result.provider,
        url: result.url,
        status: result.fetch?.status ?? 0,
        error: result.fetch?.error ?? "fetch_failed",
        errorCode: result.fetch?.errorCode ?? "",
        durationMs: result.fetch?.durationMs ?? null,
        fetchMode: result.fetch?.fetchMode ?? "http",
        browserFallbackAttempted: Boolean(result.fetch?.browserFallbackAttempted),
        browserFallbackSkipped: result.fetch?.browserFallbackSkipped ?? "",
        failureClass,
      });
    }

    if (Array.isArray(result.checks) && result.checks.length > 0) {
      checksDetectedCount += 1;
    }

    if (Array.isArray(result.manualReviewTasks) && result.manualReviewTasks.length) {
      manualReview.push({
        sourceId: result.sourceId,
        provider: result.provider,
        url: result.url,
        tasks: result.manualReviewTasks,
      });
    }

    result.checks.forEach((check) => {
      if (typeof check.detectedPrice !== "number" || Number.isNaN(check.detectedPrice)) {
        unknown.push({
          sourceId: result.sourceId,
          field: check.field,
          label: check.label,
          reason: "no_price_detected",
        });
        return;
      }

      if (typeof check.expectedPrice === "number") {
        const delta = Number((check.detectedPrice - check.expectedPrice).toFixed(2));
        if (Math.abs(delta) >= 0.01) {
          changes.push({
            sourceId: result.sourceId,
            provider: result.provider,
            field: check.field,
            label: check.label,
            expectedPrice: check.expectedPrice,
            detectedPrice: check.detectedPrice,
            delta,
            url: result.url,
          });
        }
      }
    });
  });

  return {
    changes,
    unknown,
    manualReview,
    fetchFailures,
    fetchFailureBreakdown,
    browserFallbackAttemptedCount,
    browserFallbackRecoveredCount,
    browserFallbackSkippedCount,
    sourceVerificationStates,
    sourceVerificationStateCounts,
    checksDetectedCount,
  };
}

function writeJson(filePath, value) {
  const resolved = path.resolve(filePath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeReport(filePath, summary) {
  const lines = [
    "## Price source check report",
    "",
    `Generated at: ${summary.generatedAt}`,
    `Adapters run: ${summary.adaptersRun}`,
    `Detected changes: ${summary.changeCount}`,
    `Unknown checks (manual review): ${summary.unknownCount}`,
    `Manual review task groups: ${summary.manualReviewCount}`,
    `Fetch failures: ${summary.fetchFailureCount}`,
    `Verification status: ${summary.verificationStatus}`,
    `Browser fallback attempted: ${summary.browserFallbackAttemptedCount}`,
    `Browser fallback recovered: ${summary.browserFallbackRecoveredCount}`,
    `Browser fallback skipped: ${summary.browserFallbackSkippedCount}`,
    `Source states (automated/manual/failed/manual-required): ${summary.sourceVerificationStateCounts.verified_automated}/${summary.sourceVerificationStateCounts.verified_manual}/${summary.sourceVerificationStateCounts.failed_fetch}/${summary.sourceVerificationStateCounts.manual_required}`,
    "",
    "### Adapter coverage",
    "",
  ];

  if (summary.fetchFailures.length) {
    lines.push("### Fetch failures (not verified)");
    lines.push("");
    summary.fetchFailures.forEach((failure) => {
      lines.push(`- **${failure.provider}** (\`${failure.sourceId}\`)`);
      lines.push(`  - URL: ${failure.url}`);
      lines.push(`  - Status: ${failure.status || 0}`);
      lines.push(`  - Error: ${failure.error}`);
      if (failure.errorCode) {
        lines.push(`  - Error code: ${failure.errorCode}`);
      }
      if (typeof failure.durationMs === "number") {
        lines.push(`  - Duration: ${failure.durationMs}ms`);
      }
      lines.push(`  - Fetch mode: ${failure.fetchMode}`);
      if (failure.browserFallbackAttempted) {
        lines.push("  - Browser fallback: attempted");
      }
      if (failure.browserFallbackSkipped) {
        lines.push(`  - Browser fallback: skipped (${failure.browserFallbackSkipped})`);
      }
      lines.push(`  - Classified as: ${failure.failureClass}`);
      lines.push("");
    });
    lines.push(
      "When fetch failures exist, `0 detected changes` does not imply prices were verified."
    );
    lines.push("");
    lines.push("Failure breakdown:");
    lines.push("");
    Object.entries(summary.fetchFailureBreakdown).forEach(([error, count]) => {
      lines.push(`- ${error}: ${count}`);
    });
    lines.push("");
  }

  lines.push("### Per-source verification state");
  lines.push("");
  summary.sourceVerificationStates.forEach((entry) => {
    lines.push(`- **${entry.provider}** (\`${entry.sourceId}\`): ${entry.state}`);
    if (entry.manualVerifiedOn) {
      lines.push(`  - Manual verified on: ${entry.manualVerifiedOn}`);
    }
    lines.push(
      `  - Signals: fetchOk=${entry.fetchOk ? "yes" : "no"}, checksDetected=${entry.checksDetected}, manualTasks=${entry.manualTasks}`
    );
    lines.push("");
  });

  summary.adapterResults.forEach((result) => {
    lines.push(`- **${result.provider}** (\`${result.sourceId}\`)`);
    lines.push(`  - URL: ${result.url}`);
    lines.push(`  - Fetch: ${result.fetch?.ok ? "ok" : "failed"}${result.fetch?.status ? ` (status ${result.fetch.status})` : ""}`);
    if (result.notes?.length) {
      result.notes.forEach((note) => lines.push(`  - Note: ${note}`));
    }
    lines.push("");
  });

  if (summary.changes.length) {
    lines.push("### Candidate price changes");
    lines.push("");
    summary.changes.forEach((change) => {
      lines.push(`- **${change.provider}** · ${change.label}`);
      lines.push(`  - Field: \`${change.field}\``);
      lines.push(`  - Expected: $${change.expectedPrice.toFixed(2)}`);
      lines.push(`  - Detected: $${change.detectedPrice.toFixed(2)}`);
      lines.push(`  - Delta: ${change.delta > 0 ? "+" : ""}$${change.delta.toFixed(2)}`);
      lines.push(`  - Source: ${change.url}`);
      lines.push("");
    });
  } else {
    lines.push("### Candidate price changes");
    lines.push("");
    lines.push("No price deltas detected versus current expected values.");
    lines.push("");
  }

  if (summary.unknown.length) {
    lines.push("### Needs manual review");
    lines.push("");
    summary.unknown.forEach((item) => {
      lines.push(`- ${item.sourceId} · ${item.label} (\`${item.field}\`): ${item.reason}`);
    });
    lines.push("");
  }

  if (summary.manualReview.length) {
    lines.push("### Manual review tasks");
    lines.push("");
    summary.manualReview.forEach((item) => {
      lines.push(`- **${item.provider}** (\`${item.sourceId}\`)`);
      lines.push(`  - URL: ${item.url}`);
      item.tasks.forEach((task) => lines.push(`  - [ ] ${task}`));
      lines.push("");
    });
  }

  fs.writeFileSync(path.resolve(filePath), `${lines.join("\n")}\n`, "utf8");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.debugFetch) {
    process.env.PRICE_WATCH_DEBUG_FETCH = "1";
  }
  const entries = loadRegistry(args.registryPath);
  const manualVerificationsBySourceId = loadManualVerifications(
    args.manualVerificationsPath
  );

  const targets = entries.filter((entry) => ADAPTERS[entry.sourceId]);
  const adapterResults = [];

  for (const target of targets) {
    const adapter = ADAPTERS[target.sourceId];
    const result = await adapter(target);
    adapterResults.push(result);
  }

  const {
    changes,
    unknown,
    manualReview,
    fetchFailures,
    fetchFailureBreakdown,
    browserFallbackAttemptedCount,
    browserFallbackRecoveredCount,
    browserFallbackSkippedCount,
    sourceVerificationStates,
    sourceVerificationStateCounts,
    checksDetectedCount,
  } = evaluateChecks(adapterResults, manualVerificationsBySourceId);

  const summary = {
    generatedAt: new Date().toISOString(),
    adaptersRun: adapterResults.length,
    checksDetectedCount,
    changeCount: changes.length,
    unknownCount: unknown.length,
    manualReviewCount: manualReview.length,
    fetchFailureCount: fetchFailures.length,
    browserFallbackAttemptedCount,
    browserFallbackRecoveredCount,
    browserFallbackSkippedCount,
    sourceVerificationStates,
    sourceVerificationStateCounts,
    verificationStatus: fetchFailures.length > 0 ? "degraded" : "ok",
    debugFetchEnabled: args.debugFetch,
    changes,
    unknown,
    manualReview,
    fetchFailures,
    fetchFailureBreakdown,
    adapterResults,
  };

  writeJson(args.outputPath, summary);
  writeReport(args.reportPath, summary);

  console.log(
    `Price source checks complete. adapters=${summary.adaptersRun} checksDetected=${summary.checksDetectedCount} changes=${summary.changeCount} unknown=${summary.unknownCount} manualReview=${summary.manualReviewCount} fetchFailures=${summary.fetchFailureCount} status=${summary.verificationStatus}`
  );
  console.log(`Wrote ${args.outputPath}`);
  console.log(`Wrote ${args.reportPath}`);

  if (summary.changeCount > 0 || summary.fetchFailureCount > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});

