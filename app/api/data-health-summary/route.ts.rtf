import { promises as fs } from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

type SourceRegistryEntry = {
  sourceId: string;
  providerName: string;
  priority: number;
  lastVerifiedDate?: string;
};

type CandidateSummary = {
  generatedAt?: string;
  adaptersRun?: number;
  checksDetectedCount?: number;
  fetchFailureCount?: number;
  fetchFailureBreakdown?: Record<string, number>;
  sourceVerificationStateCounts?: Record<string, number>;
  manualReviewCount?: number;
  verificationStatus?: string;
};

type ManualVerificationEntry = {
  sourceId: string;
  verifiedOn: string;
  verifier: string;
  notes?: string;
};

const REGISTRY_PATH = path.join(process.cwd(), "data", "price-source-registry.json");
const CANDIDATE_PATH = path.join(
  process.cwd(),
  "data",
  "price-source-candidate-updates.json"
);
const MANUAL_VERIFICATIONS_PATH = path.join(
  process.cwd(),
  "data",
  "manual-price-verifications.json"
);

function toUtcDay(dateValue?: string) {
  if (!dateValue) return null;
  const parsed = new Date(`${dateValue}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function formatDate(dateValue?: string) {
  const parsed = toUtcDay(dateValue);
  if (!parsed) return null;
  return parsed.toISOString().slice(0, 10);
}

async function readJson(filePath: string) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function GET() {
  const registryRaw = (await readJson(REGISTRY_PATH)) as
    | { entries?: SourceRegistryEntry[] }
    | null;
  const candidateRaw = (await readJson(CANDIDATE_PATH)) as CandidateSummary | null;
  const manualRaw = (await readJson(MANUAL_VERIFICATIONS_PATH)) as
    | { entries?: ManualVerificationEntry[] }
    | null;

  const entries = Array.isArray(registryRaw?.entries) ? registryRaw.entries : [];
  const manualEntries = Array.isArray(manualRaw?.entries) ? manualRaw.entries : [];
  const oldestVerifiedFromCatalog = [...entries]
    .filter((entry) => Boolean(entry.lastVerifiedDate))
    .map((entry) => ({
      provider: entry.providerName,
      sourceId: entry.sourceId,
      date: entry.lastVerifiedDate as string,
      parsed: toUtcDay(entry.lastVerifiedDate),
    }))
    .filter((entry) => entry.parsed !== null)
    .sort((a, b) => a.parsed!.getTime() - b.parsed!.getTime());
  const oldestManualVerified = [...manualEntries]
    .map((entry) => ({
      provider: entry.sourceId,
      sourceId: entry.sourceId,
      date: entry.verifiedOn,
      parsed: toUtcDay(entry.verifiedOn),
    }))
    .filter((entry) => entry.parsed !== null)
    .sort((a, b) => a.parsed!.getTime() - b.parsed!.getTime());
  const oldestVerified = [...oldestVerifiedFromCatalog, ...oldestManualVerified].sort(
    (a, b) => a.parsed!.getTime() - b.parsed!.getTime()
  )[0];

  return NextResponse.json({
    ok: true,
    summary: {
      generatedAt: candidateRaw?.generatedAt ?? null,
      sourcesTracked: entries.length,
      sourcesChecked: candidateRaw?.adaptersRun ?? 0,
      sourcesWithDetectedChecks: candidateRaw?.checksDetectedCount ?? 0,
      sourcesFailed: candidateRaw?.fetchFailureCount ?? 0,
      sourcesManualReview: candidateRaw?.manualReviewCount ?? 0,
      manualVerificationsRecorded: manualEntries.length,
      verificationStatus: candidateRaw?.verificationStatus ?? "unknown",
      fetchFailureBreakdown: candidateRaw?.fetchFailureBreakdown ?? {},
      sourceVerificationStateCounts: candidateRaw?.sourceVerificationStateCounts ?? {},
      oldestVerifiedProvider: oldestVerified
        ? {
            provider: oldestVerified.provider,
            sourceId: oldestVerified.sourceId,
            date: formatDate(oldestVerified.date),
          }
        : null,
      nextScheduledCheckUtc: "Tuesday 13:00 UTC",
    },
  });
}

