
"use client";

import React from "react";
import type { Session } from "@supabase/supabase-js";

import {
  defaultSelectedServices,
  options as defaultOptions,
  services as defaultServices,
  type Option,
  type Service,
} from "./streamwise-data";
import { calculateCombos } from "./streamwise-logic";
import { getSupabaseBrowserClient } from "@/lib/client/supabase-browser";
import { resolveOutboundSourceUrl } from "@/lib/affiliate/outbound-url";

type RankingMode = "starting" | "ongoing";
type Combo = ReturnType<typeof calculateCombos>[number];
type ServiceCard = Service;
type ConfidenceLevel = "high" | "medium" | "low";
type ComboStrategy = "carrier" | "bundle" | "membership" | "direct" | "hybrid";
type ProviderKey =
  | "direct"
  | "verizon"
  | "walmart_plus"
  | "tmobile"
  | "xfinity"
  | "instacart_plus"
  | "apple"
  | "amazon"
  | "hulu"
  | "philo";

type CatalogResponse = {
  services: Service[];
  options: Option[];
};

type PreferencesPayload = {
  selectedServices: string[];
  hasVerizon: boolean;
  hasWalmartPlus: boolean;
  hasTMobile: boolean;
  hasXfinity: boolean;
  hasInstacartPlus: boolean;
  rankingMode: RankingMode;
};

const services = defaultServices;

function formatMoney(value: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "$0.00";
  }

  return `$${value.toFixed(2)}`;
}

function formatPriceStatus(
  status: "current" | "scheduled_change" | "expired" | "needs_verification"
) {
  switch (status) {
    case "current":
      return "Current price";
    case "scheduled_change":
      return "Scheduled price change";
    case "expired":
      return "Expired offer";
    case "needs_verification":
      return "Needs verification";
  }
}

function normalizeText(value: string) {
  return value.toLowerCase().trim();
}

function isLiveTvService(group: string) {
  return [
    "YouTube TV",
    "Hulu + Live TV",
    "Sling TV",
    "Fubo",
    "Philo",
  ].includes(group);
}

function isIncludedPerk(item: Option) {
  return item.effectiveMonthly === 0;
}

function isPaidMembershipPath(item: Option) {
  return item.category === "membership" && item.effectiveMonthly !== 0;
}

function getPrimaryTotal(combo: Combo, rankingMode: RankingMode) {
  return rankingMode === "ongoing" ? combo.ongoingTotal : combo.total;
}

function getPrimarySavings(combo: Combo, rankingMode: RankingMode) {
  const value =
    rankingMode === "ongoing" ? combo.ongoingSavings : combo.savings;

  return typeof value === "number" && !Number.isNaN(value) ? value : 0;
}

function getStartingCost(item: Option) {
  return item.effectiveMonthly ?? item.monthly;
}

function getItemProviderKey(item: Option): ProviderKey | undefined {
  const maybeProvider = item as Option & {
    provider?: ProviderKey;
    includedWith?: ProviderKey;
  };

  return maybeProvider.provider ?? maybeProvider.includedWith;
}

function getProviderDisplayName(provider: ProviderKey | undefined) {
  switch (provider) {
    case "direct":
      return "Direct";
    case "verizon":
      return "Verizon";
    case "walmart_plus":
      return "Walmart+";
    case "tmobile":
      return "T-Mobile";
    case "xfinity":
      return "Xfinity";
    case "instacart_plus":
      return "Instacart+";
    case "apple":
      return "Apple";
    case "amazon":
      return "Amazon";
    case "hulu":
      return "Hulu";
    case "philo":
      return "Philo";
    default:
      return undefined;
  }
}

function getProviderBadgeClasses(provider: ProviderKey | undefined) {
  switch (provider) {
    case "verizon":
    case "tmobile":
    case "xfinity":
      return "bg-sky-100 text-sky-700";
    case "walmart_plus":
    case "instacart_plus":
      return "bg-emerald-100 text-emerald-700";
    case "apple":
      return "bg-zinc-100 text-zinc-700";
    case "amazon":
      return "bg-orange-100 text-orange-700";
    case "hulu":
      return "bg-lime-100 text-lime-700";
    case "philo":
      return "bg-violet-100 text-violet-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getIncludedWithLabel(item: Option) {
  const provider = getItemProviderKey(item);
  const display = getProviderDisplayName(provider);

  return display ? `via ${display}` : null;
}

function getConfidenceLabel(level: ConfidenceLevel) {
  switch (level) {
    case "high":
      return "High confidence";
    case "medium":
      return "Mixed confidence";
    case "low":
      return "Needs review";
  }
}

function getConfidenceBadgeClasses(level: ConfidenceLevel) {
  switch (level) {
    case "high":
      return "bg-emerald-100 text-emerald-700";
    case "medium":
      return "bg-amber-100 text-amber-700";
    case "low":
      return "bg-rose-100 text-rose-700";
  }
}

function renderConfidenceBadge(level: ConfidenceLevel) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getConfidenceBadgeClasses(
        level
      )}`}
    >
      {getConfidenceLabel(level)}
    </span>
  );
}

function renderProviderBadge(provider: ProviderKey | undefined) {
  const display = getProviderDisplayName(provider);

  if (!display) {
    return null;
  }

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getProviderBadgeClasses(
        provider
      )}`}
    >
      via {display}
    </span>
  );
}

function getComboConfidence(combo: Combo): ConfidenceLevel {
  const hasNeedsVerification = combo.chosen.some(
    (item) => item.priceStatus === "needs_verification"
  );
  const hasScheduledChange = combo.chosen.some(
    (item) => item.priceStatus === "scheduled_change"
  );
  const hasPromo = combo.chosen.some((item) => item.category === "promo");

  if (hasNeedsVerification) {
    return "low";
  }

  if (hasScheduledChange || hasPromo) {
    return "medium";
  }

  return "high";
}

function renderSourceLink(item: Option) {
  if (item.sourceUrl) {
    const outbound = resolveOutboundSourceUrl({
      sourceUrl: item.sourceUrl,
      affiliateUrl: item.affiliateUrl,
    });

    return (
      <a
        href={outbound.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          const payload = {
            optionId: item.id,
            optionName: item.name,
            provider: getItemProviderKey(item) ?? "direct",
            sourceUrl: item.sourceUrl,
            resolvedUrl: outbound.href,
            linkKind: outbound.kind,
          };

          try {
            const params = new URLSearchParams({
              optionId: payload.optionId,
              optionName: payload.optionName,
              provider: payload.provider,
              sourceUrl: payload.sourceUrl ?? "",
              resolvedUrl: payload.resolvedUrl,
              linkKind: payload.linkKind,
            });
            const ok = navigator.sendBeacon("/api/track-click", params);
            if (ok) return;
          } catch {
            // Fall back to fetch below.
          }

          void fetch("/api/track-click", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            keepalive: true,
          }).catch(() => undefined);
        }}
        className="font-medium text-slate-900 underline underline-offset-2 hover:text-slate-700"
      >
        {item.source}
      </a>
    );
  }

  return item.source;
}

function renderOptionHeader(item: Option) {
  const includedWithLabel = getIncludedWithLabel(item);
  const confidence =
    item.priceStatus === "needs_verification"
      ? "low"
      : item.priceStatus === "scheduled_change" || item.category === "promo"
      ? "medium"
      : "high";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="font-semibold">{item.name}</div>

      {includedWithLabel && (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getProviderBadgeClasses(
            getItemProviderKey(item)
          )}`}
        >
          {includedWithLabel}
        </span>
      )}

      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
        {item.category}
      </span>

      {item.category === "promo" && (
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
          Limited-time
        </span>
      )}

      {isIncludedPerk(item) && (
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
          Included perk
        </span>
      )}

      {isPaidMembershipPath(item) && (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
          Paid membership path
        </span>
      )}

      {item.category === "carrier" && (
        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">
          Telecom perk
        </span>
      )}

      {renderConfidenceBadge(confidence)}
    </div>
  );
}

function renderOptionMeta(item: Option) {
  const includedWithLabel = getIncludedWithLabel(item);

  return (
    <>
      {includedWithLabel && (
        <div className="mt-1 text-sm text-slate-600">
          Access path:{" "}
          <span className="font-medium text-slate-800">
            {includedWithLabel.replace("via ", "")}
          </span>
        </div>
      )}

      <div className="mt-1 text-sm text-slate-600">
        Source: {renderSourceLink(item)}
      </div>

      {item.priceStatus && (
        <div className="mt-1 text-sm text-slate-600">
          Price status: {formatPriceStatus(item.priceStatus)}
        </div>
      )}

      {item.lastChecked && (
        <div className="mt-1 text-sm text-slate-600">
          Last checked: {item.lastChecked}
        </div>
      )}

      {item.introLengthMonths && (
        <div className="mt-1 text-sm text-slate-600">
          Intro period: {item.introLengthMonths} month
          {item.introLengthMonths === 1 ? "" : "s"}
        </div>
      )}

      {item.standardMonthly !== undefined &&
        item.standardMonthly !== item.monthly && (
          <div className="mt-1 text-sm text-slate-600">
            Then returns to {formatMoney(item.standardMonthly)}/mo
          </div>
        )}

      {isIncludedPerk(item) && (
        <div className="mt-1 text-sm font-medium text-emerald-700">
          Included with existing membership or provider benefit
        </div>
      )}

      {isPaidMembershipPath(item) && (
        <div className="mt-1 text-sm font-medium text-amber-700">
          This path requires paying for the broader membership
        </div>
      )}
    </>
  );
}

function renderOptionWhyThisIsGood(item: Option) {
  if (
    item.standardMonthly !== undefined &&
    item.standardMonthly !== item.monthly
  ) {
    return (
      <div className="mt-2 text-sm font-medium text-slate-800">
        Starts at {formatMoney(item.monthly)}, then increases to{" "}
        {formatMoney(item.standardMonthly)}.
      </div>
    );
  }

  if (isIncludedPerk(item)) {
    return (
      <div className="mt-2 text-sm font-medium text-slate-800">
        Included through your existing provider or membership.
      </div>
    );
  }

  if (isPaidMembershipPath(item)) {
    return (
      <div className="mt-2 text-sm font-medium text-slate-800">
        Useful if you already value the broader membership, not just the streaming service.
      </div>
    );
  }

  if (item.category === "carrier") {
    return (
      <div className="mt-2 text-sm font-medium text-slate-800">
        Beats direct pricing by using a carrier perk instead of retail pricing.
      </div>
    );
  }

  if (item.category === "bundle") {
    return (
      <div className="mt-2 text-sm font-medium text-slate-800">
        Covers multiple services through one purchase path.
      </div>
    );
  }

  return (
    <div className="mt-2 text-sm font-medium text-slate-800">
      Standard monthly pricing.
    </div>
  );
}

function renderOptionPrice(item: Option) {
  if (isIncludedPerk(item)) {
    return (
      <div className="text-right">
        <div className="font-semibold text-emerald-700">{formatMoney(0)}</div>
        <div className="text-xs font-normal text-slate-500 line-through">
          {formatMoney(item.monthly)}
        </div>
      </div>
    );
  }

  return (
    <div className="text-right">
      <div className="font-semibold">{formatMoney(getStartingCost(item))}</div>

      {item.standardMonthly !== undefined &&
        item.standardMonthly !== item.monthly && (
          <div className="text-xs font-normal text-slate-500">
            then {formatMoney(item.standardMonthly)}
          </div>
        )}
    </div>
  );
}

function getComboCoverage(combo: Combo) {
  return [...new Set(combo.chosen.flatMap((item) => item.covers))].join(", ");
}

function getExtraCoveredServiceCount(combo: Combo, selected: string[]) {
  const selectedSet = new Set(selected);
  const coveredSet = new Set(combo.chosen.flatMap((item) => item.covers));

  let extraCount = 0;

  coveredSet.forEach((service) => {
    if (!selectedSet.has(service)) {
      extraCount += 1;
    }
  });

  return extraCount;
}

function getCoveredSelectedRetailValue(combo: Combo, selected: string[]) {
  const selectedSet = new Set(selected);
  const coveredSelected = new Set(
    combo.chosen.flatMap((item) => item.covers).filter((service) => selectedSet.has(service))
  );

  let total = 0;

  coveredSelected.forEach((service) => {
    const match = services.find((item) => item.group === service);
    total += match?.monthly ?? 0;
  });

  return total;
}

function getSelectedRetailAnnualValue(selected: string[]) {
  return selected.reduce((total, serviceName) => {
    const match = services.find((item) => item.group === serviceName);
    return total + (match?.monthly ?? 0) * 12;
  }, 0);
}

function getItemOngoingCost(item: Option) {
  if (
    typeof item.standardMonthly === "number" &&
    !Number.isNaN(item.standardMonthly)
  ) {
    return item.standardMonthly;
  }

  return getStartingCost(item);
}

function getItemAnnualCost(item: Option) {
  const startingCost = getStartingCost(item);
  const ongoingCost = getItemOngoingCost(item);
  const introMonths = Math.max(0, Math.min(12, item.introLengthMonths ?? 0));

  if (introMonths > 0 && ongoingCost !== startingCost) {
    return startingCost * introMonths + ongoingCost * (12 - introMonths);
  }

  return startingCost * 12;
}

function getComboAnnualCost(combo: Combo) {
  return combo.chosen.reduce((total, item) => total + getItemAnnualCost(item), 0);
}

function getComboAnnualSavings(combo: Combo, selected: string[]) {
  return getSelectedRetailAnnualValue(selected) - getComboAnnualCost(combo);
}

function getDisplayCombos(combos: Combo[], rankingMode: RankingMode) {
  return [...combos].sort((a, b) => {
    if (rankingMode === "ongoing") {
      return (
        a.ongoingTotal - b.ongoingTotal ||
        a.total - b.total ||
        a.chosen.length - b.chosen.length
      );
    }

    return (
      a.total - b.total ||
      a.ongoingTotal - b.ongoingTotal ||
      a.chosen.length - b.chosen.length
    );
  });
}

function getProviderMix(combo: Combo) {
  const labels = combo.chosen.map(
    (item) => getIncludedWithLabel(item) ?? `via ${getProviderDisplayName("direct")}`
  );
  return [...new Set(labels)];
}

function getComboStrategy(combo: Combo): ComboStrategy {
  const hasCarrier = combo.chosen.some((item) => item.category === "carrier");
  const hasBundle = combo.chosen.some((item) => item.category === "bundle");
  const hasMembership = combo.chosen.some((item) => item.category === "membership");
  const hasDirect = combo.chosen.some((item) => item.category === "direct");

  const types: ComboStrategy[] = [];

  if (hasCarrier) types.push("carrier");
  if (hasBundle) types.push("bundle");
  if (hasMembership) types.push("membership");
  if (hasDirect) types.push("direct");

  if (types.length === 1) {
    return types[0];
  }

  return "hybrid";
}

function renderStrategyBadge(strategy: ComboStrategy) {
  const styles: Record<ComboStrategy, string> = {
    carrier: "bg-sky-100 text-sky-700",
    bundle: "bg-purple-100 text-purple-700",
    membership: "bg-amber-100 text-amber-700",
    direct: "bg-slate-200 text-slate-700",
    hybrid: "bg-pink-100 text-pink-700",
  };

  const labels: Record<ComboStrategy, string> = {
    carrier: "Carrier strategy",
    bundle: "Bundle strategy",
    membership: "Membership strategy",
    direct: "Direct strategy",
    hybrid: "Hybrid strategy",
  };

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${styles[strategy]}`}>
      {labels[strategy]}
    </span>
  );
}

function getBestForLabel(combo: Combo, selected: string[]) {
  const strategy = getComboStrategy(combo);
  const confidence = getComboConfidence(combo);
  const hasBundle = combo.chosen.some((item) => item.category === "bundle");
  const hasMembership = combo.chosen.some((item) => item.category === "membership");
  const hasPromo = combo.chosen.some((item) => item.category === "promo");
  const extraCoveredServices = getExtraCoveredServiceCount(combo, selected);
  const planCount = combo.chosen.length;

  if (extraCoveredServices > 0) {
    return "Covers what you picked, plus bonus included value";
  }

  if (strategy === "carrier") {
    return "Best for maximizing carrier perks";
  }

  if (strategy === "hybrid" && confidence === "high") {
    return "Best balance of savings and stability";
  }

  if (strategy === "hybrid" && hasPromo) {
    return "Best balance of cost and flexibility";
  }

  if (hasBundle && planCount <= 2) {
    return "Best for fewer subscriptions";
  }

  if (hasMembership) {
    return "Best if you already pay for broader memberships";
  }

  if (hasPromo) {
    return "Best for lowest short-term cost";
  }

  if (planCount === 1) {
    return "Best for simplicity";
  }

  return "Best overall value";
}

function renderComboBadges(combo: Combo, index: number, selected: string[]) {
  const extraCoveredServices = getExtraCoveredServiceCount(combo, selected);

  return (
    <>
      {index === 0 && (
        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
          Cheapest
        </span>
      )}

      {combo.chosen.some((item) => item.category === "promo") && (
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
          Promo
        </span>
      )}

      {combo.chosen.some((item) => isIncludedPerk(item)) && (
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
          Includes $0 perk
        </span>
      )}

      {combo.chosen.some((item) => isPaidMembershipPath(item)) && (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
          Membership path
        </span>
      )}

      {combo.chosen.some((item) => item.category === "carrier") && (
        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">
          Telecom perk
        </span>
      )}

      {extraCoveredServices > 0 && (
        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
          Includes unselected service
        </span>
      )}
    </>
  );
}

function renderComboMeta(combo: Combo) {
  return (
    <div className="mt-1 space-y-1 text-xs text-slate-500">
      {combo.chosen.map((item) => (
        <div key={item.id}>
          <span className="font-medium text-slate-700">
            {getIncludedWithLabel(item)?.replace("via ", "") ?? "Direct"}
          </span>{" "}
          · {item.category}
          {item.priceStatus ? ` · ${formatPriceStatus(item.priceStatus)}` : ""}
          {item.lastChecked ? ` · Last checked: ${item.lastChecked}` : ""}
          {item.introLengthMonths ? ` · Intro: ${item.introLengthMonths} mo` : ""}
          {item.standardMonthly !== undefined && item.standardMonthly !== item.monthly
            ? ` · Then ${formatMoney(item.standardMonthly)}/mo`
            : ""}
          {isIncludedPerk(item) ? " · Included" : ""}
          {isPaidMembershipPath(item) ? " · Membership required" : ""}
        </div>
      ))}
    </div>
  );
}

function renderComboValueCell(
  combo: Combo,
  rankingMode: RankingMode,
  type: "starting" | "ongoing"
) {
  const value = type === "starting" ? combo.total : combo.ongoingTotal;
  const primaryType = rankingMode === "ongoing" ? "ongoing" : "starting";

  if (type === "ongoing" && combo.ongoingTotal === combo.total) {
    return (
      <span
        className={
          primaryType === type ? "font-semibold text-slate-900" : "text-slate-500"
        }
      >
        Same
      </span>
    );
  }

  return (
    <span className={primaryType === type ? "font-semibold text-slate-900" : "text-slate-700"}>
      {formatMoney(value)}
    </span>
  );
}

function renderSavingsCell(
  combo: Combo,
  rankingMode: RankingMode,
  type: "starting" | "ongoing"
) {
  const value = type === "starting" ? combo.savings : combo.ongoingSavings;
  const primaryType = rankingMode === "ongoing" ? "ongoing" : "starting";

  return (
    <span className={primaryType === type ? "font-semibold text-slate-900" : "text-slate-700"}>
      {formatMoney(value)}
    </span>
  );
}

function renderAnnualCostCell(combo: Combo) {
  return <span className="text-slate-700">{formatMoney(getComboAnnualCost(combo))}</span>;
}

function renderAnnualSavingsCell(combo: Combo, selected: string[]) {
  return (
    <span className="text-slate-700">{formatMoney(getComboAnnualSavings(combo, selected))}</span>
  );
}

function getRecommendedCombo(
  combos: Combo[],
  rankingMode: RankingMode,
  selected: string[]
): Combo | undefined {
  if (!combos.length) return undefined;

  const confidenceRank: Record<ConfidenceLevel, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  const paidPlanCount = (combo: Combo) =>
    combo.chosen.filter((item) => (item.effectiveMonthly ?? item.monthly) > 0).length;

  return [...combos].sort((a, b) => {
    const annualDiff = getComboAnnualCost(a) - getComboAnnualCost(b);
    if (Math.abs(annualDiff) >= 0.01) return annualDiff;

    const ongoingDiff = a.ongoingTotal - b.ongoingTotal;
    if (Math.abs(ongoingDiff) >= 0.01) return ongoingDiff;

    const rankingDiff = getPrimaryTotal(a, rankingMode) - getPrimaryTotal(b, rankingMode);
    if (Math.abs(rankingDiff) >= 0.01) return rankingDiff;

    const extrasDiff =
      getExtraCoveredServiceCount(b, selected) -
      getExtraCoveredServiceCount(a, selected);
    if (extrasDiff !== 0) return extrasDiff;

    const confidenceDiff =
      confidenceRank[getComboConfidence(a)] - confidenceRank[getComboConfidence(b)];
    if (confidenceDiff !== 0) return confidenceDiff;

    const paidPlanDiff = paidPlanCount(a) - paidPlanCount(b);
    if (paidPlanDiff !== 0) return paidPlanDiff;

    const providerDiff = getProviderMix(a).length - getProviderMix(b).length;
    if (providerDiff !== 0) return providerDiff;

    return 0;
  })[0];
}

function getBestCombosByStrategy(
  combos: Combo[],
  rankingMode: RankingMode
): Partial<Record<ComboStrategy, Combo>> {
  const sorted = getDisplayCombos(combos, rankingMode);
  const bestByStrategy: Partial<Record<ComboStrategy, Combo>> = {};

  sorted.forEach((combo) => {
    const strategy = getComboStrategy(combo);

    if (!bestByStrategy[strategy]) {
      bestByStrategy[strategy] = combo;
    }
  });

  return bestByStrategy;
}

function getWhyThisWins(combo: Combo, selected: string[]) {
  const reasons: string[] = [];
  const extraCoveredServices = getExtraCoveredServiceCount(combo, selected);

  if (combo.chosen.some((item) => item.category === "promo")) {
    reasons.push("Uses a limited-time promo for lower starting cost");
  }

  if (combo.chosen.some((item) => isIncludedPerk(item))) {
    reasons.push("Includes a subscription you already get for free");
  }

  if (combo.chosen.some((item) => item.category === "bundle")) {
    reasons.push("Bundles services together for a discount");
  }

  if (combo.chosen.some((item) => item.category === "carrier")) {
    reasons.push("Leverages carrier perks instead of retail pricing");
  }

  if (extraCoveredServices > 0) {
    reasons.push(
      `Also includes ${extraCoveredServices} unselected service${
        extraCoveredServices === 1 ? "" : "s"
      } as bonus value`
    );
  }

  if (combo.chosen.length < combo.chosen.flatMap((item) => item.covers).length) {
    reasons.push("Covers multiple services with fewer subscriptions");
  }

  if (!reasons.length) {
    reasons.push("Minimizes total monthly cost vs standalone plans");
  }

  return reasons;
}

function getTradeoffSummary(
  best: Combo,
  rankingMode: RankingMode,
  runnerUp?: Combo
) {
  if (!runnerUp) return null;

  const startingDelta = runnerUp.total - best.total;
  const ongoingDelta = runnerUp.ongoingTotal - best.ongoingTotal;
  const planDelta = runnerUp.chosen.length - best.chosen.length;

  const differences: string[] = [];

  if (rankingMode === "starting") {
    if (Math.abs(startingDelta) >= 0.01) {
      differences.push(
        startingDelta > 0
          ? `saves ${formatMoney(startingDelta)}/mo upfront vs the next best path`
          : `costs ${formatMoney(Math.abs(startingDelta))}/mo more upfront than the next best path`
      );
    }

    if (Math.abs(ongoingDelta) >= 0.01) {
      differences.push(
        ongoingDelta > 0
          ? `still stays ${formatMoney(ongoingDelta)}/mo cheaper over time`
          : `but later becomes ${formatMoney(Math.abs(ongoingDelta))}/mo more expensive`
      );
    }
  } else {
    if (Math.abs(ongoingDelta) >= 0.01) {
      differences.push(
        ongoingDelta > 0
          ? `saves ${formatMoney(ongoingDelta)}/mo over time vs the next best path`
          : `costs ${formatMoney(Math.abs(ongoingDelta))}/mo more over time than the next best path`
      );
    }

    if (Math.abs(startingDelta) >= 0.01) {
      differences.push(
        startingDelta > 0
          ? `and starts ${formatMoney(startingDelta)}/mo cheaper upfront`
          : `but starts ${formatMoney(Math.abs(startingDelta))}/mo more expensive upfront`
      );
    }
  }

  if (planDelta !== 0) {
    differences.push(
      planDelta > 0
        ? `uses ${planDelta} fewer plan${planDelta === 1 ? "" : "s"}`
        : `uses ${Math.abs(planDelta)} more plan${Math.abs(planDelta) === 1 ? "" : "s"}`
    );
  }

  if (!differences.length) {
    return "Very close to the next best option, with similar cost and structure.";
  }

  return `Compared with the next best option, this path ${differences.join(", ")}.`;
}

function getConfidenceNote(combo: Combo) {
  const hasNeedsVerification = combo.chosen.some(
    (item) => item.priceStatus === "needs_verification"
  );
  const hasScheduledChange = combo.chosen.some(
    (item) => item.priceStatus === "scheduled_change"
  );
  const hasPromo = combo.chosen.some((item) => item.category === "promo");

  if (hasNeedsVerification) {
    return "One or more items need verification before you rely on this result.";
  }

  if (hasScheduledChange && hasPromo) {
    return "This result uses promo pricing and also includes a scheduled price change.";
  }

  if (hasScheduledChange) {
    return "This result includes a scheduled price change, so future cost may shift soon.";
  }

  if (hasPromo) {
    return "This result uses promotional pricing, so the current total is temporary.";
  }

  return "All prices in this result are modeled as current standard pricing.";
}

function getBestComboRetailValue(combo: Combo, selected: string[]) {
  return getCoveredSelectedRetailValue(combo, selected);
}

function getRecommendedReason(
  combo: Combo,
  cheapest: Combo | undefined,
  selected: string[]
) {
  const annualCost = getComboAnnualCost(combo);
  const extraCoveredServices = getExtraCoveredServiceCount(combo, selected);

  if (!cheapest || cheapest.id === combo.id) {
    if (extraCoveredServices > 0) {
      return "Recommended because it is the best 12-month value and the extra service is a bonus at this price.";
    }

    return "Recommended because it has the best total 12-month value in the current dataset.";
  }

  const annualDelta = getComboAnnualCost(cheapest) - annualCost;
  const startingDelta = cheapest.total - combo.total;
  const ongoingDelta = cheapest.ongoingTotal - combo.ongoingTotal;

  if (annualDelta > 0.01) {
    return `Recommended because it saves ${formatMoney(annualDelta)} over 12 months versus the cheaper-looking option.`;
  }

  if (Math.abs(annualDelta) <= 0.01 && extraCoveredServices > 0) {
    return "Recommended because it costs the same over 12 months and the extra service is upside, not a defect.";
  }

  if (Math.abs(annualDelta) <= 0.01 && ongoingDelta < -0.01) {
    return `Recommended because it matches 12-month cost and saves ${formatMoney(Math.abs(ongoingDelta))}/mo later.`;
  }

  if (Math.abs(annualDelta) <= 0.01 && startingDelta > 0.01) {
    return `Recommended because it matches 12-month cost while starting ${formatMoney(startingDelta)}/mo cheaper.`;
  }

  return `Recommended because the 12-month tradeoff is stronger even though another path looks cheaper at first glance.`;
}

function renderBestSummary(
  combo: Combo,
  rankingMode: RankingMode,
  runnerUp: Combo | undefined,
  selected: string[],
  cheapest: Combo | undefined
) {
  const primaryTotal = getPrimaryTotal(combo, rankingMode);
  const primarySavings = getPrimarySavings(combo, rankingMode);
  const annualCost = getComboAnnualCost(combo);
  const annualSavings = getComboAnnualSavings(combo, selected);
  const tradeoffSummary = getTradeoffSummary(combo, rankingMode, runnerUp);
  const rawRetailValue = getBestComboRetailValue(combo, selected);
  const confidenceLevel = getComboConfidence(combo);
  const confidenceNote = getConfidenceNote(combo);
  const narrative = getWhyThisWins(combo, selected)[0] ?? "Best available path.";
  const extraCoveredServices = getExtraCoveredServiceCount(combo, selected);
  const annualDelta =
    cheapest && cheapest.id !== combo.id
      ? annualCost - getComboAnnualCost(cheapest)
      : 0;

  return (
    <div className="mt-4 rounded-2xl bg-slate-900 p-5 text-white">
      <div className="text-sm uppercase tracking-wide text-slate-300">
        {rankingMode === "ongoing"
          ? "Recommended long-term path"
          : "Recommended current path"}
      </div>

      <div className="mt-2 text-4xl font-bold">{formatMoney(primaryTotal)}/mo</div>

      <div className="mt-2 flex flex-wrap gap-2">
        {renderStrategyBadge(getComboStrategy(combo))}
        {renderConfidenceBadge(confidenceLevel)}
        {extraCoveredServices > 0 && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            Includes bonus service
          </span>
        )}
      </div>

      <div className="mt-2 text-slate-200">
        {rankingMode === "ongoing" ? "Ongoing savings vs retail: " : "Monthly savings vs retail: "}
        <span className="font-semibold">{formatMoney(primarySavings)}</span>
      </div>

      <div className="mt-1 text-sm text-slate-300">
        12-month total: {formatMoney(annualCost)} · 12-month savings vs retail: {formatMoney(annualSavings)}
      </div>

      {cheapest && cheapest.id !== combo.id && (
        <div className="mt-2 text-sm text-slate-300">
          {annualDelta > 0.01
            ? `${formatMoney(annualDelta)} more than the cheapest path over 12 months`
            : annualDelta < -0.01
            ? `${formatMoney(Math.abs(annualDelta))} less than the cheapest path over 12 months`
            : "Matches the cheapest path over 12 months"}
        </div>
      )}

      <div className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-sm text-slate-100">
        {narrative}
      </div>

      <div className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-sm text-slate-200">
        {confidenceNote}
      </div>

      <div className="mt-3 text-sm text-slate-300">
        Raw selected-service retail value represented: {formatMoney(rawRetailValue)}
      </div>

      {combo.ongoingTotal !== combo.total && (
        <>
          <div className="mt-1 text-sm text-slate-300">
            Starting monthly total: {formatMoney(combo.total)}/mo
          </div>
          <div className="mt-1 text-sm text-slate-300">
            Ongoing monthly total after promos: {formatMoney(combo.ongoingTotal)}/mo
          </div>
        </>
      )}

      <div className="mt-1 text-sm text-slate-300">
        Uses {combo.chosen.filter((i) => (i.effectiveMonthly ?? i.monthly) !== 0).length} paid plan{combo.chosen.filter((i) => (i.effectiveMonthly ?? i.monthly) !== 0).length === 1 ? "" : "s"}
      </div>

      {tradeoffSummary && (
        <div className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-sm text-slate-100">
          {tradeoffSummary}
        </div>
      )}
    </div>
  );
}

function renderCheapestCard(
  combo: Combo,
  rankingMode: RankingMode,
  recommended: Combo,
  selected: string[]
) {
  const confidence = getComboConfidence(combo);
  const extraCoveredServices = getExtraCoveredServiceCount(combo, selected);
  const annualDelta = getComboAnnualCost(recommended) - getComboAnnualCost(combo);

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-sm font-semibold text-slate-900">Cheapest option</div>
        {renderStrategyBadge(getComboStrategy(combo))}
        {renderConfidenceBadge(confidence)}
        {extraCoveredServices > 0 && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            Includes bonus service
          </span>
        )}
      </div>

      <div className="mt-2 text-sm text-slate-600">
        {getRecommendedReason(combo, recommended, selected)}
      </div>

      <div className="mt-3 text-xl font-bold text-slate-900">
        {formatMoney(getPrimaryTotal(combo, rankingMode))}/mo
      </div>

      <div className="mt-1 text-sm font-medium text-slate-700">
        12-month total: {formatMoney(getComboAnnualCost(combo))}
      </div>

      <div className="mt-1 text-sm font-medium text-slate-700">
        {annualDelta > 0.01
          ? `${formatMoney(annualDelta)} cheaper than the recommended path over 12 months`
          : annualDelta < -0.01
          ? `${formatMoney(Math.abs(annualDelta))} more than the recommended path over 12 months`
          : "Matches the recommended path over 12 months"}
      </div>

      <div className="mt-3 text-sm text-slate-700">
        {combo.chosen.map((item) => item.name).join(" + ")}
      </div>
    </div>
  );
}

function renderRankingModeToggle(
  rankingMode: RankingMode,
  setRankingMode: React.Dispatch<React.SetStateAction<RankingMode>>
) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => setRankingMode("starting")}
        className={`rounded-xl px-3 py-2 text-sm font-medium ${
          rankingMode === "starting"
            ? "bg-slate-900 text-white"
            : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        }`}
        aria-pressed={rankingMode === "starting"}
      >
        Best now
      </button>

      <button
        type="button"
        onClick={() => setRankingMode("ongoing")}
        className={`rounded-xl px-3 py-2 text-sm font-medium ${
          rankingMode === "ongoing"
            ? "bg-slate-900 text-white"
            : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        }`}
        aria-pressed={rankingMode === "ongoing"}
      >
        Best later
      </button>
    </div>
  );
}

function renderServiceCard(
  service: { group: string; monthly: number },
  active: boolean,
  onToggle: (group: string) => void
) {
  return (
    <button
      key={service.group}
      type="button"
      onClick={() => onToggle(service.group)}
      aria-pressed={active}
      className={`rounded-2xl border p-4 text-left transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white shadow"
          : "border-slate-200 bg-slate-50 hover:border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{service.group}</div>
          <div className={`text-sm ${active ? "text-slate-200" : "text-slate-500"}`}>
            Standalone retail: {formatMoney(service.monthly)}/mo
          </div>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            active ? "bg-white/15 text-white" : "bg-slate-200 text-slate-700"
          }`}
        >
          {active ? "Selected" : "Not selected"}
        </span>
      </div>
    </button>
  );
}

function renderTradeoffLine(combo: Combo, cheapest: Combo, selected: string[]) {
  if (combo.id === cheapest.id) {
    return null;
  }

  const costDiff = combo.total - cheapest.total;
  const extraCoveredServices = getExtraCoveredServiceCount(combo, selected);
  const parts: string[] = [];

  if (Math.abs(costDiff) >= 0.01) {
    parts.push(`${formatMoney(costDiff)} more per month`);
  }

  if (extraCoveredServices > 0) {
    parts.push(`includes ${extraCoveredServices} extra service${extraCoveredServices === 1 ? "" : "s"}`);
  }

  if (getComboConfidence(combo) === "high") {
    parts.push("more stable pricing");
  }

  return parts.join(" • ");
}

function renderStrategyCard(
  title: string,
  combo: Combo,
  rankingMode: RankingMode,
  selected: string[],
  recommended?: Combo,
  cheapest?: Combo
) {
  const isRecommended = recommended?.id === combo.id;
  const confidence = getComboConfidence(combo);
  const extraCoveredServices = getExtraCoveredServiceCount(combo, selected);

  return (
    <div
      className={`rounded-2xl border p-4 ${
        confidence === "high"
          ? "border-slate-300 bg-white shadow-sm"
          : confidence === "medium"
          ? "border-slate-200 bg-white"
          : "border-slate-200 bg-slate-50 opacity-80"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        {renderStrategyBadge(getComboStrategy(combo))}
        {renderConfidenceBadge(confidence)}
        {extraCoveredServices > 0 && (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
            Includes unselected service
          </span>
        )}
        {isRecommended && (
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            Recommended
          </span>
        )}
      </div>

      <div className="mt-1 text-xs text-slate-500">{getBestForLabel(combo, selected)}</div>

      <div className="mt-3 text-2xl font-bold text-slate-900">
        {formatMoney(getPrimaryTotal(combo, rankingMode))}/mo
      </div>

      {cheapest && combo.id !== cheapest.id && (
        <div className="mt-1 text-sm font-medium text-slate-700">
          {renderTradeoffLine(combo, cheapest, selected)}
        </div>
      )}

      <div className="mt-1 text-sm text-slate-600">
        {rankingMode === "ongoing" ? "Ongoing total" : "Starting total"} · Saves{" "}
        {formatMoney(Number.isFinite(getPrimarySavings(combo, rankingMode)) ? getPrimarySavings(combo, rankingMode) : 0)} vs retail
      </div>

      <div className="mt-3 text-sm text-slate-700">
        {combo.chosen.map((item) => item.name).join(" + ")}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {combo.chosen.map((item) => (
          <React.Fragment key={item.id}>
            {renderProviderBadge(getItemProviderKey(item))}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-3 text-xs text-slate-500">
        Covers: {getComboCoverage(combo)}
      </div>
    </div>
  );
}

function renderServiceSection(
  title: string,
  description: string,
  items: ServiceCard[],
  selected: string[],
  onToggle: (group: string) => void
) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="mb-3">
        <div className="text-sm font-semibold text-slate-800">{title}</div>
        <div className="text-sm text-slate-500">{description}</div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((service) =>
          renderServiceCard(service, selected.includes(service.group), onToggle)
        )}
      </div>
    </div>
  );
}

function getProviderUnlockSummary(
  selected: string[],
  hasTMobile: boolean,
  hasXfinity: boolean,
  hasInstacartPlus: boolean
) {
  const unlocked: string[] = [];

  if (hasTMobile) {
    if (selected.includes("Netflix")) {
      unlocked.push("T-Mobile can unlock Netflix value");
    }

    if (selected.includes("Apple TV+")) {
      unlocked.push("T-Mobile can unlock discounted Apple TV+");
    }
  }

  if (hasXfinity) {
    const streamsaverCoverage = ["Netflix", "Apple TV+", "Peacock"];
    const coveredSelected = streamsaverCoverage.filter((service) =>
      selected.includes(service)
    );

    if (coveredSelected.length >= 2) {
      unlocked.push(
        `Xfinity StreamSaver may beat direct pricing for ${coveredSelected.join(", ")}`
      );
    } else if (coveredSelected.length === 1) {
      unlocked.push(`Xfinity may unlock bundled access for ${coveredSelected[0]}`);
    }
  }

  if (hasInstacartPlus && selected.includes("Peacock")) {
    unlocked.push("Instacart+ can unlock included Peacock access");
  }

  return unlocked;
}

export default function Page() {
  const [catalog, setCatalog] = React.useState<CatalogResponse | null>(null);
  const [preferencesHydrated, setPreferencesHydrated] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>(defaultSelectedServices);
  const [hasVerizon, setHasVerizon] = React.useState(false);
  const [hasWalmartPlus, setHasWalmartPlus] = React.useState(false);
  const [hasTMobile, setHasTMobile] = React.useState(false);
  const [hasXfinity, setHasXfinity] = React.useState(false);
  const [hasInstacartPlus, setHasInstacartPlus] = React.useState(false);
  const [rankingMode, setRankingMode] = React.useState<RankingMode>("starting");
  const [serviceSearch, setServiceSearch] = React.useState("");
  const [authEmail, setAuthEmail] = React.useState("");
  const [authMessage, setAuthMessage] = React.useState<string | null>(null);
  const [authSession, setAuthSession] = React.useState<Session | null>(null);

  const serviceCatalog = catalog?.services ?? defaultServices;
  const optionCatalog = catalog?.options ?? defaultOptions;

  React.useEffect(() => {
    void fetch("/api/catalog")
      .then((res) => res.json())
      .then((data: CatalogResponse) => {
        if (Array.isArray(data.services) && Array.isArray(data.options)) {
          setCatalog({ services: data.services, options: data.options });
        }
      })
      .catch(() => undefined);
  }, []);

  React.useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    void supabase.auth.getSession().then(({ data }) => {
      setAuthSession(data.session ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    const authHeader: HeadersInit | undefined = authSession?.access_token
      ? { Authorization: `Bearer ${authSession.access_token}` }
      : undefined;

    void fetch("/api/profile/preferences", {
      headers: authHeader,
    })
      .then(async (res) => {
        const data = (await res.json()) as { preferences?: PreferencesPayload };
        return data;
      })
      .then((data) => {
        const prefs = data.preferences;
        if (!prefs) return;
        setSelected(prefs.selectedServices ?? defaultSelectedServices);
        setHasVerizon(Boolean(prefs.hasVerizon));
        setHasWalmartPlus(Boolean(prefs.hasWalmartPlus));
        setHasTMobile(Boolean(prefs.hasTMobile));
        setHasXfinity(Boolean(prefs.hasXfinity));
        setHasInstacartPlus(Boolean(prefs.hasInstacartPlus));
        setRankingMode(prefs.rankingMode === "ongoing" ? "ongoing" : "starting");
      })
      .catch(() => undefined)
      .finally(() => setPreferencesHydrated(true));
  }, [authSession]);

  React.useEffect(() => {
    if (!preferencesHydrated) return;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      const payload: PreferencesPayload = {
        selectedServices: selected,
        hasVerizon,
        hasWalmartPlus,
        hasTMobile,
        hasXfinity,
        hasInstacartPlus,
        rankingMode,
      };
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (authSession?.access_token) {
        headers.Authorization = `Bearer ${authSession.access_token}`;
      }
      void fetch("/api/profile/preferences", {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      }).catch(() => undefined);
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [
    preferencesHydrated,
    selected,
    hasVerizon,
    hasWalmartPlus,
    hasTMobile,
    hasXfinity,
    hasInstacartPlus,
    rankingMode,
    authSession,
  ]);

  const requestMagicLink = React.useCallback(async () => {
    if (!authEmail.trim()) {
      setAuthMessage("Enter your email address to receive a sign-in link.");
      return;
    }

    const response = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: authEmail.trim() }),
    });

    if (!response.ok) {
      setAuthMessage("Could not send magic link. Check setup and try again.");
      return;
    }

    setAuthMessage("Magic link sent. Check your email to sign in.");
  }, [authEmail]);

  const signOut = React.useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setAuthMessage("Signed out.");
  }, []);

  const resetSelections = () => {
    setSelected(defaultSelectedServices);
    setHasVerizon(false);
    setHasWalmartPlus(false);
    setHasTMobile(false);
    setHasXfinity(false);
    setHasInstacartPlus(false);
    setRankingMode("starting");
    setServiceSearch("");
  };

  const clearSelections = () => {
    setSelected([]);
    setHasVerizon(false);
    setHasWalmartPlus(false);
    setHasTMobile(false);
    setHasXfinity(false);
    setHasInstacartPlus(false);
    setRankingMode("starting");
    setServiceSearch("");
  };

  function toggleService(group: string) {
    setSelected((prev) =>
      prev.includes(group)
        ? prev.filter((item) => item !== group)
        : [...prev, group]
    );
  }

  const serviceCards = React.useMemo(() => {
    return Array.from(
      new Map(serviceCatalog.map((service) => [service.group, service])).values()
    );
  }, [serviceCatalog]);

  const filteredServiceCards = React.useMemo(() => {
    const query = normalizeText(serviceSearch);

    if (!query) {
      return serviceCards;
    }

    return serviceCards.filter((service) =>
      normalizeText(`${service.group} ${service.label}`).includes(query)
    );
  }, [serviceCards, serviceSearch]);

  const onDemandServices = React.useMemo(() => {
    return filteredServiceCards.filter(
      (service) => !isLiveTvService(service.group)
    );
  }, [filteredServiceCards]);

  const liveTvServices = React.useMemo(() => {
    return filteredServiceCards.filter((service) =>
      isLiveTvService(service.group)
    );
  }, [filteredServiceCards]);

  const providerUnlockSummary = React.useMemo(() => {
    return getProviderUnlockSummary(
      selected,
      hasTMobile,
      hasXfinity,
      hasInstacartPlus
    );
  }, [selected, hasTMobile, hasXfinity, hasInstacartPlus]);

  const selectedRetailTotal = React.useMemo(() => {
    return serviceCards
      .filter((service) => selected.includes(service.group))
      .reduce((sum, service) => sum + service.monthly, 0);
  }, [serviceCards, selected]);

  const combos = React.useMemo(
    () =>
      calculateCombos(
        optionCatalog,
        selected,
        hasVerizon,
        hasWalmartPlus,
        hasTMobile,
        hasXfinity,
        hasInstacartPlus,
        undefined,
        serviceCatalog
      ),
    [
      selected,
      hasVerizon,
      hasWalmartPlus,
      hasTMobile,
      hasXfinity,
      hasInstacartPlus,
      optionCatalog,
      serviceCatalog,
    ]
  );

  const displayCombos = React.useMemo(
    () => getDisplayCombos(combos, rankingMode),
    [combos, rankingMode]
  );

  const cheapest = displayCombos[0];

  const recommended = React.useMemo(
    () => getRecommendedCombo(combos, rankingMode, selected),
    [combos, rankingMode, selected]
  );

  const best = recommended ?? cheapest;

  const runnerUp = React.useMemo(() => {
    if (!displayCombos.length) return undefined;
    if (!best) return displayCombos.at(1);

    return displayCombos.find((combo) => combo.id !== best.id);
  }, [displayCombos, best]);

  const bestByStrategy = React.useMemo(
    () => getBestCombosByStrategy(combos, rankingMode),
    [combos, rankingMode]
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Prototype
            </div>
            <h1 className="text-4xl font-bold tracking-tight">StreamWise</h1>
            <p className="mt-2 max-w-3xl text-base text-slate-600">
              Find the cheapest mix of standalone plans, bundles, perks, and
              included memberships for the streaming services you want.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Version 1 goal
            </div>
            <div className="text-sm font-medium">Simple. Accurate. Fast.</div>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-800">
            Account (Phase 3 auth scaffold)
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Sign in with a magic link to sync preferences to your account.
          </div>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
            <input
              type="email"
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-500 md:max-w-sm"
            />
            <button
              type="button"
              onClick={() => void requestMagicLink()}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Send magic link
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {authSession?.user?.email
              ? `Signed in as ${authSession.user.email}`
              : "Not signed in"}
          </div>
          {authMessage && <div className="mt-1 text-xs text-slate-600">{authMessage}</div>}
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-800">
              What this compares
            </div>
            <div className="mt-2 text-sm text-slate-600">
              StreamWise compares direct plans, official bundles, carrier perks,
              promos, and included membership paths using the pricing data in
              your current dataset.
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-800">
              Current catalog
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {serviceCards.length}
            </div>
            <div className="text-sm text-slate-600">services modeled</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-800">
              Comparison paths
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {optionCatalog.length}
            </div>
            <div className="text-sm text-slate-600">options in dataset</div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">1. Pick your services</h2>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <input
                  id="has-verizon"
                  type="checkbox"
                  checked={hasVerizon}
                  onChange={() => setHasVerizon((prev) => !prev)}
                />
                <label htmlFor="has-verizon" className="text-sm text-slate-600">
                  I have Verizon (unlock carrier bundle pricing)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="has-walmart-plus"
                  type="checkbox"
                  checked={hasWalmartPlus}
                  onChange={() => setHasWalmartPlus((prev) => !prev)}
                />
                <label htmlFor="has-walmart-plus" className="text-sm text-slate-600">
                  I have Walmart+ (unlock membership-included streaming options)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="has-tmobile"
                  type="checkbox"
                  checked={hasTMobile}
                  onChange={() => setHasTMobile((prev) => !prev)}
                />
                <label htmlFor="has-tmobile" className="text-sm text-slate-600">
                  I have T-Mobile (unlock telecom streaming offers)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="has-xfinity"
                  type="checkbox"
                  checked={hasXfinity}
                  onChange={() => setHasXfinity((prev) => !prev)}
                />
                <label htmlFor="has-xfinity" className="text-sm text-slate-600">
                  I have Xfinity / Comcast (unlock telecom streaming offers)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="has-instacart-plus"
                  type="checkbox"
                  checked={hasInstacartPlus}
                  onChange={() => setHasInstacartPlus((prev) => !prev)}
                />
                <label htmlFor="has-instacart-plus" className="text-sm text-slate-600">
                  I have Instacart+ (unlock included Peacock benefit)
                </label>
              </div>
            </div>

            <p className="mt-2 text-slate-600">
              Start with the services you actually want. The engine compares
              direct subscriptions against bundle, perk, promo, and included
              access paths in your data.
            </p>

            {providerUnlockSummary.length > 0 && (
              <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-4">
                <div className="text-sm font-semibold text-sky-900">
                  Provider value detected
                </div>

                <ul className="mt-2 space-y-1 text-sm text-sky-800">
                  {providerUnlockSummary.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <label
                  htmlFor="service-search"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Search services
                </label>
                <input
                  id="service-search"
                  type="text"
                  value={serviceSearch}
                  onChange={(event) => setServiceSearch(event.target.value)}
                  placeholder="Search Netflix, Apple TV+, YouTube TV..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-500"
                />
              </div>

              <div className="flex gap-3 md:self-end">
                <button
                  type="button"
                  onClick={resetSelections}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Reset to default
                </button>

                <button
                  type="button"
                  onClick={clearSelections}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Clear all
                </button>
              </div>
            </div>

            {renderServiceSection(
              "On-demand streaming",
              "Core entertainment, premium, and niche services.",
              onDemandServices,
              selected,
              toggleService
            )}

            {renderServiceSection(
              "Live TV and streaming bundles",
              "Virtual cable-style services and live-TV-first packages.",
              liveTvServices,
              selected,
              toggleService
            )}

            {!filteredServiceCards.length && (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                No services match that search yet.
              </div>
            )}

            <div className="mt-6 rounded-2xl bg-slate-100 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-slate-600">Selected services</div>
                <div className="text-sm font-medium text-slate-800">
                  {selected.length} selected
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {selected.length ? (
                  selected.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-white px-3 py-1 text-sm font-medium shadow-sm"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">
                    Choose at least one service.
                  </span>
                )}
              </div>

              <div className="mt-4 text-sm text-slate-600">
                Retail total if bought separately:{" "}
                <span className="font-semibold text-slate-900">
                  {formatMoney(selectedRetailTotal)}/mo
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-2xl font-semibold">2. Best result</h2>
              {renderRankingModeToggle(rankingMode, setRankingMode)}
            </div>

            {!selected.length ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-700">
                  No services selected yet.
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Choose one or more streaming services on the left to see the
                  cheapest available combination.
                </p>
              </div>
            ) : best ? (
              <>
                {renderBestSummary(best, rankingMode, runnerUp, selected, cheapest)}

                {cheapest && best && cheapest.id !== best.id && (
                  renderCheapestCard(cheapest, rankingMode, best, selected)
                )}

                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-semibold text-slate-800">
                    Why this is the best option
                  </div>

                  <ul className="mt-2 space-y-1 text-sm text-slate-600">
                    {getWhyThisWins(best, selected).map((reason, i) => (
                      <li key={i}>• {reason}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 space-y-4">
                  {best.chosen.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          {renderOptionHeader(item)}

                          <div className="mt-1 text-sm text-slate-600">
                            Covers: {item.covers.join(", ")}
                          </div>

                          {renderOptionMeta(item)}

                          {renderOptionWhyThisIsGood(item)}

                          <div className="mt-1 text-sm text-slate-500">
                            {item.notes}
                          </div>
                        </div>

                        {renderOptionPrice(item)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-4 text-slate-600">
                No combination found with the current data set.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-semibold">
              3. Alternative combinations
            </h2>
            <div className="text-sm text-slate-500">
              Compare the best path inside each strategy, not just one flat list.
            </div>
          </div>

          <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {rankingMode === "ongoing"
              ? "Grouped by strategy using lowest ongoing monthly cost."
              : "Grouped by strategy using lowest starting monthly cost."}
          </div>

          {displayCombos.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {bestByStrategy.carrier &&
                renderStrategyCard(
                  "Best carrier strategy",
                  bestByStrategy.carrier,
                  rankingMode,
                  selected,
                  best,
                  cheapest
                )}

              {bestByStrategy.bundle &&
                renderStrategyCard(
                  "Best bundle strategy",
                  bestByStrategy.bundle,
                  rankingMode,
                  selected,
                  best,
                  cheapest
                )}

              {bestByStrategy.membership &&
                renderStrategyCard(
                  "Best membership strategy",
                  bestByStrategy.membership,
                  rankingMode,
                  selected,
                  best,
                  cheapest
                )}

              {bestByStrategy.direct &&
                renderStrategyCard(
                  "Best direct strategy",
                  bestByStrategy.direct,
                  rankingMode,
                  selected,
                  best,
                  cheapest
                )}

              {bestByStrategy.hybrid &&
                renderStrategyCard(
                  "Best hybrid strategy",
                  bestByStrategy.hybrid,
                  rankingMode,
                  selected,
                  best,
                  cheapest
                )}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              No combinations yet.
            </div>
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-semibold">
              4. Full comparison table
            </h2>
            <div className="text-sm text-slate-500">
              Compare nearby options by starting cost, ongoing cost, ongoing savings, and 12-month total paid.
            </div>
          </div>

          <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {rankingMode === "ongoing"
              ? "Sorted by lowest ongoing monthly cost first."
              : "Sorted by lowest starting monthly cost first."}
          </div>

          <div className="mt-5 overflow-x-auto">
            <div className="min-w-[1120px] overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-[1.4fr_0.95fr_0.6fr_0.7fr_0.8fr_0.8fr_0.8fr_0.8fr] bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                <div>Combination</div>
                <div>Coverage</div>
                <div>Starting</div>
                <div>Ongoing</div>
                <div>12 mo total</div>
                <div>Save now</div>
                <div>Save later</div>
                <div>12 mo savings</div>
              </div>

              {displayCombos.length ? (
                displayCombos.map((combo, index) => (
                  <div
                    key={combo.id}
                    className={`grid grid-cols-[1.4fr_0.95fr_0.6fr_0.7fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-3 border-t px-4 py-4 text-sm ${
                      index === 0
                        ? "border-slate-900 bg-slate-900/5"
                        : "border-slate-200"
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-start gap-2">
                        {renderComboBadges(combo, index, selected)}
                        <span>{combo.chosen.map((item) => item.name).join(" + ")}</span>
                      </div>
                      {renderComboMeta(combo)}
                    </div>

                    <div>{getComboCoverage(combo)}</div>
                    <div>{renderComboValueCell(combo, rankingMode, "starting")}</div>
                    <div>{renderComboValueCell(combo, rankingMode, "ongoing")}</div>
                    <div>{renderAnnualCostCell(combo)}</div>
                    <div>{renderSavingsCell(combo, rankingMode, "starting")}</div>
                    <div>{renderSavingsCell(combo, rankingMode, "ongoing")}</div>
                    <div>{renderAnnualSavingsCell(combo, selected)}</div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-slate-500">
                  No combinations yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">What this proves</h3>
            <p className="mt-2 text-sm text-slate-600">
              The value here is not streaming commentary. It is a pricing engine
              that helps people make bundle decisions quickly and with more
              confidence.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">What comes next</h3>
            <p className="mt-2 text-sm text-slate-600">
              Replace hard-coded pricing with a real data source and expand
              coverage so users trust that every major option is represented.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">Important warning</h3>
            <p className="mt-2 text-sm text-slate-600">
              Bundles, promos, and carrier perks change often. The product only
              works if pricing data stays current, complete, and well sourced.
            </p>
          </div>
        </div>

        <footer className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a className="underline underline-offset-2 hover:text-slate-700" href="/privacy">
              Privacy
            </a>
            <a className="underline underline-offset-2 hover:text-slate-700" href="/terms">
              Terms
            </a>
            <a
              className="underline underline-offset-2 hover:text-slate-700"
              href="/affiliate-disclosure"
            >
              Affiliate disclosure
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
