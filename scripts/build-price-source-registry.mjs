import fs from "node:fs/promises";
import path from "node:path";

function splitCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
}

function parseCsv(content) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const header = splitCsvLine(lines[0] ?? "");
  const rows = lines.slice(1).map((line) => splitCsvLine(line));

  return rows.map((row) => {
    const record = {};
    header.forEach((key, index) => {
      record[key] = row[index] ?? "";
    });
    return record;
  });
}

function yesNoToBool(value) {
  return String(value).toLowerCase() === "yes";
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function deriveAutomationTier(entry) {
  const loginRequired = yesNoToBool(entry.login_required);
  const antiBot = yesNoToBool(entry.captcha_or_antibot);
  const apiAvailable = yesNoToBool(entry.api_available);
  const manualOverride = yesNoToBool(entry.needs_manual_override);
  const difficulty = String(entry.data_extraction_difficulty || "").toLowerCase();

  if (manualOverride) {
    return "manual_override";
  }

  if (apiAvailable) {
    return "api";
  }

  if (loginRequired || antiBot || difficulty === "high") {
    return "manual_review";
  }

  return "html_scrape";
}

function deriveCoverageStatus(tier) {
  if (tier === "api" || tier === "html_scrape") {
    return "automatable";
  }

  if (tier === "manual_override") {
    return "manual_override";
  }

  return "manual_review";
}

function buildReport(entries) {
  const byTier = {};
  const byPriority = {};
  const providerSummaries = [];

  entries.forEach((entry) => {
    byTier[entry.automationTier] = (byTier[entry.automationTier] ?? 0) + 1;
    const priorityKey = String(entry.priority ?? "unknown");
    byPriority[priorityKey] = (byPriority[priorityKey] ?? 0) + 1;

    providerSummaries.push({
      sourceId: entry.sourceId,
      provider: entry.providerName,
      priority: entry.priority,
      automationTier: entry.automationTier,
      coverageStatus: entry.coverageStatus,
      requiresManualReview: entry.automationTier !== "api" && entry.automationTier !== "html_scrape",
      notes: entry.notesOrEdgeCases || "",
    });
  });

  return {
    generatedAt: new Date().toISOString(),
    totalSources: entries.length,
    byTier,
    byPriority,
    providerSummaries,
  };
}

async function main() {
  const inputPath = process.argv[2] || "data/price-sources.csv";
  const resolvedInputPath = path.resolve(process.cwd(), inputPath);
  const content = await fs.readFile(resolvedInputPath, "utf8");
  const rawEntries = parseCsv(content);

  const entries = rawEntries.map((entry) => {
    const automationTier = deriveAutomationTier(entry);
    return {
      sourceId: entry.source_id || "",
      providerName: entry.provider_name || "",
      servicesCovered: entry.services_covered || "",
      pricingPageUrl: entry.pricing_page_url || "",
      priceTypeToCapture: entry.price_type_to_capture || "",
      promoDetailsNeeded: yesNoToBool(entry.promo_details_needed),
      standardPriceNeeded: yesNoToBool(entry.standard_price_needed),
      loginRequired: yesNoToBool(entry.login_required),
      captchaOrAntibot: yesNoToBool(entry.captcha_or_antibot),
      dataExtractionDifficulty: entry.data_extraction_difficulty || "",
      updateFrequency: entry.update_frequency || "",
      lastVerifiedDate: entry.last_verified_date || "",
      notesOrEdgeCases: entry.notes_or_edge_cases || "",
      adapterBuilt: yesNoToBool(entry.adapter_built),
      apiAvailable: yesNoToBool(entry.api_available),
      affiliateProgram: yesNoToBool(entry.affiliate_program),
      priority: toNumber(entry.priority, 99),
      needsManualOverride: yesNoToBool(entry.needs_manual_override),
      lastPriceChangeDetected: entry.last_price_change_detected || "",
      confidenceLevel: entry.confidence_level || "",
      automationTier,
      coverageStatus: deriveCoverageStatus(automationTier),
    };
  });

  const registryPath = path.resolve(process.cwd(), "data/price-source-registry.json");
  const reportPath = path.resolve(process.cwd(), "data/price-source-automation-report.json");

  await fs.writeFile(
    registryPath,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), entries }, null, 2)}\n`,
    "utf8"
  );

  await fs.writeFile(
    reportPath,
    `${JSON.stringify(buildReport(entries), null, 2)}\n`,
    "utf8"
  );

  const report = buildReport(entries);
  console.log(`Built registry for ${entries.length} sources.`);
  console.log(`Automation tiers: ${JSON.stringify(report.byTier)}`);
  console.log(`Output: ${path.relative(process.cwd(), registryPath)}`);
  console.log(`Output: ${path.relative(process.cwd(), reportPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

