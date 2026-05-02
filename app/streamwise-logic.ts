import { services as defaultServices, type Option, type Service } from "./streamwise-data";

export type ComboResult = {
  id: string;
  chosen: Option[];
  total: number;
  ongoingTotal: number;
  annualTotal: number;
  savings: number;
  ongoingSavings: number;
  annualSavings: number;
};

const MAX_RESULTS = 60;

function toStartOfUtcDay(dateValue: string) {
  const parsed = new Date(`${dateValue}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

function isAfterToday(dateValue: string, today: Date) {
  const parsed = toStartOfUtcDay(dateValue);
  if (!parsed) {
    return false;
  }
  return parsed.getTime() > today.getTime();
}

function isBeforeToday(dateValue: string, today: Date) {
  const parsed = toStartOfUtcDay(dateValue);
  if (!parsed) {
    return false;
  }
  return parsed.getTime() < today.getTime();
}

function isOptionAvailableToday(
  opt: Option,
  hasVerizon: boolean,
  hasWalmartPlus: boolean,
  hasTMobile: boolean,
  hasXfinity: boolean,
  hasInstacartPlus: boolean,
  today: Date
) {
  if (opt.priceStatus === "expired") {
    return false;
  }

  if (opt.effectiveDate && isAfterToday(opt.effectiveDate, today)) {
    return false;
  }

  if (opt.expiresAt && isBeforeToday(opt.expiresAt, today)) {
    return false;
  }

  if (!opt.requires || opt.requires.length === 0) {
    return true;
  }

  if (opt.requires.includes("verizon") && !hasVerizon) {
    return false;
  }

  if (opt.requires.includes("walmart_plus") && !hasWalmartPlus) {
    return false;
  }

  if (opt.requires.includes("tmobile") && !hasTMobile) {
    return false;
  }

  if (opt.requires.includes("xfinity") && !hasXfinity) {
    return false;
  }

  if (opt.requires.includes("instacart_plus") && !hasInstacartPlus) {
    return false;
  }

  return true;
}

function toFiniteNumber(value: number | undefined) {
  return Number.isFinite(value) ? (value as number) : 0;
}

function getStartingMonthly(option: Option) {
  return toFiniteNumber(option.effectiveMonthly ?? option.monthly);
}

function getOngoingMonthly(option: Option) {
  return toFiniteNumber(
    option.standardMonthly ?? option.effectiveMonthly ?? option.monthly
  );
}

function buildServiceMonthlyByGroup(serviceCatalog: Service[]) {
  const monthlyByGroup = new Map<string, number>();

  serviceCatalog.forEach((service) => {
    monthlyByGroup.set(service.group, toFiniteNumber(service.monthly));
  });

  return monthlyByGroup;
}

function isFreeAccess(option: Option) {
  return (option.effectiveMonthly ?? option.monthly) === 0;
}

function coversSelectedServices(
  covered: Set<string>,
  selectedSet: Set<string>
) {
  return [...selectedSet].every((item) => covered.has(item));
}

function hasCoverageOverlap(option: Option, covered: Set<string>) {
  return option.covers.some((item) => covered.has(item));
}

function violatesExclusiveGroup(
  option: Option,
  usedExclusiveGroups: Set<string>
) {
  return Boolean(
    option.mutuallyExclusiveGroup &&
      usedExclusiveGroups.has(option.mutuallyExclusiveGroup)
  );
}

function getStartingTotal(chosen: Option[]) {
  return chosen.reduce((sum, item) => sum + getStartingMonthly(item), 0);
}

function getOngoingTotal(chosen: Option[]) {
  return chosen.reduce((sum, item) => sum + getOngoingMonthly(item), 0);
}

function getIntroMonths(option: Option) {
  if (!Number.isFinite(option.introLengthMonths)) {
    return 0;
  }

  const intro = option.introLengthMonths as number;
  return Math.max(0, Math.min(12, intro));
}

export function getOptionAnnualCost(option: Option) {
  const startingCost = getStartingMonthly(option);
  const ongoingCost = getOngoingMonthly(option);
  const introMonths = getIntroMonths(option);

  if (introMonths > 0 && ongoingCost !== startingCost) {
    return startingCost * introMonths + ongoingCost * (12 - introMonths);
  }

  return startingCost * 12;
}

export function getComboAnnualTotal(chosen: Option[]) {
  return chosen.reduce((sum, item) => sum + getOptionAnnualCost(item), 0);
}

function getCoveredSelectedRetailTotal(
  chosen: Option[],
  selectedSet: Set<string>,
  monthlyByGroup: Map<string, number>
) {
  const coveredSelected = new Set(
    chosen
      .flatMap((item) => item.covers)
      .filter((service) => selectedSet.has(service))
  );

  let total = 0;

  coveredSelected.forEach((service) => {
    total += toFiniteNumber(monthlyByGroup.get(service));
  });

  return total;
}

function buildComboResult(
  chosen: Option[],
  selectedSet: Set<string>,
  monthlyByGroup: Map<string, number>
): ComboResult {
  const startingTotal = getStartingTotal(chosen);
  const ongoingTotal = getOngoingTotal(chosen);
  const annualTotal = getComboAnnualTotal(chosen);
  const coveredSelectedRetailTotal = getCoveredSelectedRetailTotal(
    chosen,
    selectedSet,
    monthlyByGroup
  );
  const coveredSelectedRetailAnnualTotal = coveredSelectedRetailTotal * 12;

  return {
    id: chosen.map((item) => item.id).join("-"),
    chosen,
    total: startingTotal,
    ongoingTotal,
    annualTotal,
    savings: Math.max(0, coveredSelectedRetailTotal - startingTotal),
    ongoingSavings: Math.max(0, coveredSelectedRetailTotal - ongoingTotal),
    annualSavings: coveredSelectedRetailAnnualTotal - annualTotal,
  };
}

function getComboCoverageSignature(combo: ComboResult) {
  return [...new Set(combo.chosen.flatMap((item) => item.covers))]
    .sort()
    .join("|");
}

function getComboSignature(combo: ComboResult) {
  return [
    getComboCoverageSignature(combo),
    combo.total.toFixed(2),
    combo.ongoingTotal.toFixed(2),
    combo.annualTotal.toFixed(2),
  ].join("|");
}

function getPaidPlanCount(chosen: Option[]) {
  return chosen.filter((opt) => !isFreeAccess(opt)).length;
}

function compareCombos(a: ComboResult, b: ComboResult) {
  return (
    a.annualTotal - b.annualTotal ||
    a.total - b.total ||
    a.ongoingTotal - b.ongoingTotal ||
    b.annualSavings - a.annualSavings ||
    b.savings - a.savings ||
    b.ongoingSavings - a.ongoingSavings ||
    getPaidPlanCount(a.chosen) - getPaidPlanCount(b.chosen) ||
    a.id.localeCompare(b.id)
  );
}

function getAvailableOptions(
  options: Option[],
  hasVerizon: boolean,
  hasWalmartPlus: boolean,
  hasTMobile: boolean,
  hasXfinity: boolean,
  hasInstacartPlus: boolean,
  today: Date
) {
  return options
    .filter((opt) =>
      isOptionAvailableToday(
        opt,
        hasVerizon,
        hasWalmartPlus,
        hasTMobile,
        hasXfinity,
        hasInstacartPlus,
        today
      )
    )
    .sort(
      (a, b) =>
        b.covers.length - a.covers.length ||
        getStartingMonthly(a) - getStartingMonthly(b) ||
        getOngoingMonthly(a) - getOngoingMonthly(b) ||
        a.id.localeCompare(b.id)
    );
}

function getMaxPlansPerCombo(selectedCount: number) {
  if (selectedCount <= 3) return 4;
  if (selectedCount <= 5) return 5;
  if (selectedCount <= 8) return 7;
  return 7;
}

function shouldStopBranch(
  chosenCount: number,
  bestPlanCountByCoverageSize: Map<number, number>,
  coveredCount: number,
  maxPlansPerCombo: number
) {
  if (chosenCount > maxPlansPerCombo) {
    return true;
  }

  const bestKnownPlanCount = bestPlanCountByCoverageSize.get(coveredCount);

  if (
    bestKnownPlanCount !== undefined &&
    chosenCount > bestKnownPlanCount &&
    coveredCount > 0
  ) {
    return true;
  }

  return false;
}

function tryAddResult(
  chosen: Option[],
  selectedSet: Set<string>,
  results: ComboResult[],
  seen: Set<string>,
  monthlyByGroup: Map<string, number>
) {
  const combo = buildComboResult(chosen, selectedSet, monthlyByGroup);
  const signature = getComboSignature(combo);

  if (seen.has(signature)) {
    return;
  }

  seen.add(signature);
  results.push(combo);
}

function canStillCover(
  remainingOptions: Option[],
  covered: Set<string>,
  selectedSet: Set<string>
) {
  const possibleCoverage = new Set(covered);

  remainingOptions.forEach((option) => {
    option.covers.forEach((item) => possibleCoverage.add(item));
  });

  return [...selectedSet].every((item) => possibleCoverage.has(item));
}

function searchCombos(
  availableOptions: Option[],
  selectedSet: Set<string>,
  maxPlansPerCombo: number,
  monthlyByGroup: Map<string, number>
) {
  const results: ComboResult[] = [];
  const seen = new Set<string>();
  const bestPlanCountByCoverageSize = new Map<number, number>();

  function dfs(
    startIndex: number,
    chosen: Option[],
    covered: Set<string>,
    usedExclusiveGroups: Set<string>
  ) {
    const coveredCount = covered.size;

    if (
      shouldStopBranch(
        chosen.length,
        bestPlanCountByCoverageSize,
        coveredCount,
        maxPlansPerCombo
      )
    ) {
      return;
    }

    if (coversSelectedServices(covered, selectedSet)) {
      tryAddResult(chosen, selectedSet, results, seen, monthlyByGroup);

      const currentBest = bestPlanCountByCoverageSize.get(coveredCount);
      if (currentBest === undefined || chosen.length < currentBest) {
        bestPlanCountByCoverageSize.set(coveredCount, chosen.length);
      }

      return;
    }

    for (let i = startIndex; i < availableOptions.length; i++) {
      const option = availableOptions[i];
      if (!option) continue;

      if (hasCoverageOverlap(option, covered) && !isFreeAccess(option)) {
        continue;
      }

      if (violatesExclusiveGroup(option, usedExclusiveGroups)) {
        continue;
      }

      const nextChosen = [...chosen, option];
      const nextCovered = new Set(covered);
      const nextUsedExclusiveGroups = new Set(usedExclusiveGroups);

      option.covers.forEach((item) => nextCovered.add(item));

      if (option.mutuallyExclusiveGroup) {
        nextUsedExclusiveGroups.add(option.mutuallyExclusiveGroup);
      }

      const remainingOptions = availableOptions.slice(i + 1);

      if (!canStillCover(remainingOptions, nextCovered, selectedSet)) {
        continue;
      }

      dfs(i + 1, nextChosen, nextCovered, nextUsedExclusiveGroups);
    }
  }

  dfs(0, [], new Set<string>(), new Set<string>());

  return results;
}

function dedupeAndRankCombos(valid: ComboResult[]) {
  return [...valid].sort(compareCombos);
}

export function calculateCombos(
  options: Option[],
  selected: string[],
  hasVerizon: boolean,
  hasWalmartPlus: boolean,
  hasTMobile: boolean,
  hasXfinity: boolean,
  hasInstacartPlus: boolean,
  todayOverride?: Date,
  serviceCatalog: Service[] = defaultServices
): ComboResult[] {
  if (selected.length === 0) {
    return [];
  }

  const runtimeToday = todayOverride ?? new Date();
  const today = new Date(
    Date.UTC(
      runtimeToday.getUTCFullYear(),
      runtimeToday.getUTCMonth(),
      runtimeToday.getUTCDate()
    )
  );

  const availableOptions = getAvailableOptions(
    options,
    hasVerizon,
    hasWalmartPlus,
    hasTMobile,
    hasXfinity,
    hasInstacartPlus,
    today
  );

  if (availableOptions.length === 0) {
    return [];
  }

  const selectedSet = new Set(selected);
  const maxPlansPerCombo = getMaxPlansPerCombo(selected.length);

  const valid = searchCombos(
    availableOptions,
    selectedSet,
    maxPlansPerCombo,
    buildServiceMonthlyByGroup(serviceCatalog)
  );

  return dedupeAndRankCombos(valid).slice(0, MAX_RESULTS);
}
