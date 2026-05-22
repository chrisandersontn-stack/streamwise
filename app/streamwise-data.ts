export type Service = {
  id: string;
  label: string;
  monthly: number;
  group: string;
};

export type Requirement =
  | "verizon"
  | "walmart_plus"
  | "tmobile"
  | "xfinity"
  | "instacart_plus"
  | "amazon_prime"
  | "att"
  | "spectrum_charter"
  | "apple_one";

export type IncludedWith =
  | "verizon"
  | "walmart_plus"
  | "tmobile"
  | "xfinity"
  | "instacart_plus"
  | "amazon_prime"
  | "att"
  | "spectrum_charter"
  | "apple_one";

export type OptionCategory =
  | "direct"
  | "bundle"
  | "carrier"
  | "membership"
  | "promo";

export type PriceStatus =
  | "current"
  | "scheduled_change"
  | "expired"
  | "needs_verification";

export type Provider =
  | "direct"
  | "verizon"
  | "walmart_plus"
  | "tmobile"
  | "xfinity"
  | "instacart_plus"
  | "apple"
  | "amazon"
  | "hulu"
  | "philo"
  | "roku";

export type Option = {
  id: string;
  name: string;
  provider: Provider;
  monthly: number;
  effectiveMonthly?: number;
  covers: string[];
  notes: string;
  source: string;
  sourceUrl?: string;
  affiliateUrl?: string;
  requires?: Requirement[];
  includedWith?: IncludedWith;
  category: OptionCategory;
  effectiveDate?: string;
  expiresAt?: string;
  introLengthMonths?: number;
  standardMonthly?: number;
  mutuallyExclusiveGroup?: string;
  lastChecked?: string;
  priceStatus?: PriceStatus;
};

/** Per-plan verification date (ISO YYYY-MM-DD). Update only options you re-checked. */
const LEGACY_LAST_CHECKED = "2026-05-02";
const VERIFIED_LAST_CHECKED = "2026-05-22";

/** Option ids verified against official sources on VERIFIED_LAST_CHECKED. */
const VERIFIED_OPTION_IDS = new Set<string>([
  "apple_tv_rokt_30day_promo",
  "directv_choice_direct",
  "directv_entertainment_direct",
  "directv_premier_direct",
  "directv_stream_5day_trial",
  "directv_stream_choice",
  "directv_stream_choice_intro",
  "directv_stream_entertainment",
  "directv_stream_entertainment_intro",
  "directv_stream_premier",
  "directv_stream_premier_intro",
  "directv_stream_ultimate",
  "directv_stream_ultimate_intro",
  "directv_ultimate_direct",
  "disney_hulu_max_bundle",
  "disney_hulu_max_bundle_no_ads",
  "peacock_apple_tv_bundle",
  "peacock_direct",
  "peacock_premium_plus_direct",
  "peacock_select_direct",
  "sling_blue_3mo_prepay",
  "sling_blue_direct",
  "sling_orange_3mo_prepay",
  "sling_orange_blue_3mo_prepay",
  "sling_orange_blue_direct",
  "sling_orange_blue_promo",
  "sling_orange_direct",
  "sling_select_3mo_prepay",
  "roku_amcplus_streaming_day_26",
  "roku_apple_tv_streaming_day_26",
  "roku_crunchyroll_streaming_day_26",
  "roku_discoveryplus_streaming_day_26",
  "roku_starz_streaming_day_26",
]);

function catalogLastChecked(optionId: string): string {
  return VERIFIED_OPTION_IDS.has(optionId)
    ? VERIFIED_LAST_CHECKED
    : LEGACY_LAST_CHECKED;
}

export const services: Service[] = [
  {
    id: "netflix",
    label: "Netflix",
    monthly: 8.99,
    group: "Netflix",
  },
  {
    id: "disney",
    label: "Disney+",
    monthly: 11.99,
    group: "Disney+",
  },
  {
    id: "hulu",
    label: "Hulu",
    monthly: 11.99,
    group: "Hulu",
  },
  {
    id: "max",
    label: "Max",
    monthly: 10.99,
    group: "Max",
  },
  {
    id: "peacock",
    label: "Peacock",
    monthly: 10.99,
    group: "Peacock",
  },
  {
    id: "paramount",
    label: "Paramount+",
    monthly: 8.99,
    group: "Paramount+",
  },
  {
    id: "apple",
    label: "Apple TV+",
    monthly: 12.99,
    group: "Apple TV+",
  },
  {
    id: "prime",
    label: "Prime Video",
    monthly: 8.99,
    group: "Prime Video",
  },
  {
    id: "espn",
    label: "ESPN+",
    monthly: 12.99,
    group: "ESPN+",
  },
  {
    id: "amcplus",
    label: "AMC+",
    monthly: 7.99,
    group: "AMC+",
  },
  {
    id: "starz",
    label: "STARZ",
    monthly: 11.99,
    group: "STARZ",
  },
  {
    id: "crunchyroll",
    label: "Crunchyroll",
    monthly: 9.99,
    group: "Crunchyroll",
  },
  {
    id: "discoveryplus",
    label: "discovery+",
    monthly: 5.99,
    group: "discovery+",
  },
  {
    id: "youtube_tv",
    label: "YouTube TV",
    monthly: 82.99,
    group: "YouTube TV",
  },
  {
    id: "hulu_live_tv",
    label: "Hulu + Live TV",
    monthly: 89.99,
    group: "Hulu + Live TV",
  },
  {
    id: "sling_tv",
    label: "Sling TV",
    monthly: 60.99,
    group: "Sling TV",
  },
  {
    id: "fubo",
    label: "Fubo",
    monthly: 55.99,
    group: "Fubo",
  },
  {
    id: "philo",
    label: "Philo",
    monthly: 25,
    group: "Philo",
  },
  {
    id: "directv",
    label: "DirecTV",
    monthly: 94.99,
    group: "DirecTV",
  },
];

export const options: Option[] = [
  // DIRECT STREAMING PLANS
  {
    id: "netflix_direct",
    name: "Netflix Standard with Ads",
    provider: "direct",
    monthly: 8.99,
    covers: ["Netflix"],
    notes: "Standard direct Netflix plan.",
    source: "Netflix",
    sourceUrl: "https://help.netflix.com/en/node/24926",
    category: "direct",
    mutuallyExclusiveGroup: "netflix_access",
    lastChecked: catalogLastChecked("netflix_direct"),
    priceStatus: "current",
  },
  {
    id: "disney_direct",
    name: "Disney+ (With Ads)",
    provider: "direct",
    monthly: 11.99,
    covers: ["Disney+"],
    notes:
      "Disney+ with ads; source is Disney+ commerce signup on disneyplus.com (package=disney_duo_basic)—intentional for this solo option.",
    source: "Disney+",
    sourceUrl: "https://www.disneyplus.com/commerce/cadence?package=disney_duo_basic",
    category: "direct",
    mutuallyExclusiveGroup: "disney_access",
    lastChecked: catalogLastChecked("disney_direct"),
    priceStatus: "current",
  },
  {
    id: "hulu_direct",
    name: "Hulu (With Ads)",
    provider: "direct",
    monthly: 11.99,
    covers: ["Hulu"],
    notes:
      "Hulu with ads; source is Hulu commerce plans on secure.hulu.com (tracking query params stripped).",
    source: "Hulu",
    sourceUrl:
      "https://secure.hulu.com/commerce/plans?offerType=FLAGSHIP_BUNDLE&default=bundle",
    category: "direct",
    mutuallyExclusiveGroup: "hulu_access",
    lastChecked: catalogLastChecked("hulu_direct"),
    priceStatus: "current",
  },
  {
    id: "max_direct",
    name: "Max Basic with Ads",
    provider: "direct",
    monthly: 10.99,
    covers: ["Max"],
    notes: "Lowest-priced current Max plan.",
    source: "Max",
    sourceUrl: "https://help.max.com/us/Answer/Detail/000002524",
    category: "direct",
    mutuallyExclusiveGroup: "max_access",
    lastChecked: catalogLastChecked("max_direct"),
    priceStatus: "current",
  },
  {
    id: "peacock_select_direct",
    name: "Peacock Select (With Ads)",
    provider: "direct",
    monthly: 7.99,
    covers: ["Peacock"],
    notes:
      "Entry Peacock tier with ads. Includes TV favorites from NBC, Bravo, and more; excludes live sports, hit movies, and Peacock Originals. Annual plan $79.99/yr also offered on peacocktv.com.",
    source: "Peacock",
    sourceUrl: "https://www.peacocktv.com/",
    category: "direct",
    mutuallyExclusiveGroup: "peacock_access",
    lastChecked: catalogLastChecked("peacock_select_direct"),
    priceStatus: "current",
  },
  {
    id: "peacock_direct",
    name: "Peacock Premium (With Ads)",
    provider: "direct",
    monthly: 10.99,
    covers: ["Peacock"],
    notes:
      "Most popular Peacock tier with ads: live sports and events, hit movies, and Peacock Originals, plus NBC/Bravo TV favorites. Annual plan $109.99/yr (12 months for price of 10) also offered.",
    source: "Peacock",
    sourceUrl: "https://www.peacocktv.com/",
    category: "direct",
    mutuallyExclusiveGroup: "peacock_access",
    lastChecked: catalogLastChecked("peacock_direct"),
    priceStatus: "current",
  },
  {
    id: "peacock_premium_plus_direct",
    name: "Peacock Premium Plus (No Ads)",
    provider: "direct",
    monthly: 16.99,
    covers: ["Peacock"],
    notes:
      "Peacock Premium Plus: stream with no ads on most on-demand content (limited exclusions). Includes downloads, local NBC channel live, sports, movies, and Originals. Some live sports/events and sponsored pages may still include ads. Annual plan $169.99/yr also offered.",
    source: "Peacock",
    sourceUrl: "https://www.peacocktv.com/",
    category: "direct",
    mutuallyExclusiveGroup: "peacock_access",
    lastChecked: catalogLastChecked("peacock_premium_plus_direct"),
    priceStatus: "current",
  },
  {
    id: "peacock_apple_tv_bundle",
    name: "Apple TV + Peacock bundle",
    provider: "apple",
    monthly: 14.99,
    covers: ["Apple TV+", "Peacock"],
    notes:
      "Peacock + Apple TV bundle starting at $14.99/mo on peacocktv.com (cancel anytime). Billed as one bundle; Peacock tier is typically Premium with ads—confirm at signup. For existing Peacock subscribers billed by Peacock, upgrade via account settings.",
    source: "Peacock",
    sourceUrl: "https://www.peacocktv.com/",
    category: "bundle",
    mutuallyExclusiveGroup: "apple_peacock_bundle_family",
    lastChecked: catalogLastChecked("peacock_apple_tv_bundle"),
    priceStatus: "current",
  },
  {
    id: "paramount_direct",
    name: "Paramount+ Essential",
    provider: "direct",
    monthly: 8.99,
    covers: ["Paramount+"],
    notes: "Standard Paramount+ Essential plan.",
    source: "Paramount+",
    sourceUrl: "https://www.paramountplus.com/",
    category: "direct",
    mutuallyExclusiveGroup: "paramount_access",
    lastChecked: catalogLastChecked("paramount_direct"),
    priceStatus: "current",
  },
  {
    id: "apple_direct",
    name: "Apple TV+",
    provider: "direct",
    monthly: 12.99,
    covers: ["Apple TV+"],
    notes: "Standard Apple TV+ subscription.",
    source: "Apple",
    sourceUrl: "https://www.apple.com/apple-tv/",
    category: "direct",
    mutuallyExclusiveGroup: "apple_tv_access",
    lastChecked: catalogLastChecked("apple_direct"),
    priceStatus: "current",
  },
  {
    id: "prime_video_direct",
    name: "Prime Video standalone",
    provider: "direct",
    monthly: 8.99,
    covers: ["Prime Video"],
    notes: "Standalone Prime Video subscription without full Prime membership.",
    source: "Amazon",
    sourceUrl:
      "https://www.amazon.com/gp/help/customer/display.html?nodeId=G34EUPKVMYFW8N2U",
    category: "direct",
    mutuallyExclusiveGroup: "prime_video_access",
    lastChecked: catalogLastChecked("prime_video_direct"),
    priceStatus: "current",
  },
  {
    id: "espn_select_direct",
    name: "ESPN Select",
    provider: "direct",
    monthly: 12.99,
    covers: ["ESPN+"],
    notes: "Direct ESPN streaming plan that includes ESPN+ content only.",
    source: "ESPN",
    sourceUrl:
      "https://support.espn.com/hc/en-us/articles/40375475974036-ESPN-Select-or-Unlimited-Plans-and-Prices",
    category: "direct",
    mutuallyExclusiveGroup: "espn_plus_access",
    lastChecked: catalogLastChecked("espn_select_direct"),
    priceStatus: "current",
  },
  {
    id: "amcplus_direct",
    name: "AMC+ Monthly with Ads",
    provider: "direct",
    monthly: 7.99,
    covers: ["AMC+"],
    notes: "Current ad-supported AMC+ plan.",
    source: "AMC+",
    sourceUrl: "https://www.amcplus.com",
    category: "direct",
    mutuallyExclusiveGroup: "amcplus_access",
    lastChecked: catalogLastChecked("amcplus_direct"),
    priceStatus: "current",
  },
  {
    id: "starz_direct",
    name: "STARZ standard monthly plan",
    provider: "direct",
    monthly: 11.99,
    covers: ["STARZ"],
    notes: "Current standard monthly STARZ price after introductory offers.",
    source: "STARZ",
    sourceUrl: "https://www.starz.com/us/en/buy",
    category: "direct",
    mutuallyExclusiveGroup: "starz_access",
    lastChecked: catalogLastChecked("starz_direct"),
    priceStatus: "current",
  },
  {
    id: "crunchyroll_direct",
    name: "Crunchyroll Fan",
    provider: "direct",
    monthly: 9.99,
    covers: ["Crunchyroll"],
    notes: "Current entry-level Crunchyroll premium tier.",
    source: "Crunchyroll",
    sourceUrl: "https://www.crunchyroll.com/premium",
    category: "direct",
    mutuallyExclusiveGroup: "crunchyroll_access",
    lastChecked: catalogLastChecked("crunchyroll_direct"),
    priceStatus: "current",
  },
  {
    id: "discoveryplus_direct",
    name: "discovery+",
    provider: "direct",
    monthly: 5.99,
    covers: ["discovery+"],
    notes: "Base discovery+ plan with ads.",
    source: "discovery+",
    sourceUrl: "https://www.discoveryplus.com",
    category: "direct",
    mutuallyExclusiveGroup: "discoveryplus_access",
    lastChecked: catalogLastChecked("discoveryplus_direct"),
    priceStatus: "current",
  },

  // LIVE TV DIRECT PATHS
  {
    id: "youtube_tv_direct",
    name: "YouTube TV Base Plan",
    provider: "direct",
    monthly: 82.99,
    covers: ["YouTube TV"],
    notes: "Standard YouTube TV base plan after promo pricing.",
    source: "YouTube TV",
    sourceUrl: "https://tv.youtube.com/welcome/",
    category: "direct",
    mutuallyExclusiveGroup: "youtube_tv_access",
    lastChecked: catalogLastChecked("youtube_tv_direct"),
    priceStatus: "current",
  },
  {
    id: "youtube_tv_promo",
    name: "YouTube TV Base Plan promo",
    provider: "direct",
    monthly: 67.99,
    standardMonthly: 82.99,
    introLengthMonths: 3,
    covers: ["YouTube TV"],
    notes: "New-user introductory YouTube TV offer for 3 months.",
    source: "YouTube TV",
    sourceUrl: "https://tv.youtube.com/welcome/",
    category: "promo",
    mutuallyExclusiveGroup: "youtube_tv_access",
    lastChecked: catalogLastChecked("youtube_tv_promo"),
    priceStatus: "current",
  },
  {
    id: "hulu_live_tv_direct",
    name: "Hulu + Live TV",
    provider: "hulu",
    monthly: 89.99,
    covers: ["Hulu + Live TV", "Hulu", "Disney+", "ESPN+"],
    notes:
      "Live TV bundle includes Hulu, Disney+, and ESPN content paths in separate apps.",
    source: "Hulu",
    sourceUrl: "https://www.hulu.com/live-tv",
    category: "bundle",
    mutuallyExclusiveGroup: "hulu_live_tv_access",
    lastChecked: catalogLastChecked("hulu_live_tv_direct"),
    priceStatus: "current",
  },
  {
    id: "sling_orange_direct",
    name: "Sling Orange (monthly)",
    provider: "direct",
    monthly: 45.99,
    covers: ["Sling TV"],
    notes:
      "Sling Orange billed monthly after any prepay term ends. One stream at a time; includes ESPN, TNT, TBS, and related channels per Sling.",
    source: "Sling TV",
    sourceUrl: "https://www.sling.com/service/compare-plans",
    category: "direct",
    mutuallyExclusiveGroup: "sling_tv_access",
    lastChecked: catalogLastChecked("sling_orange_direct"),
    priceStatus: "current",
  },
  {
    id: "sling_blue_direct",
    name: "Sling Blue (monthly)",
    provider: "direct",
    monthly: 45.99,
    covers: ["Sling TV"],
    notes:
      "Sling Blue billed monthly after any prepay term ends. Up to three simultaneous streams; includes FOX News, USA, NBC in select markets, etc.",
    source: "Sling TV",
    sourceUrl: "https://www.sling.com/service/compare-plans",
    category: "direct",
    mutuallyExclusiveGroup: "sling_tv_access",
    lastChecked: catalogLastChecked("sling_blue_direct"),
    priceStatus: "current",
  },
  {
    id: "sling_orange_blue_direct",
    name: "Sling Orange & Blue (monthly)",
    provider: "direct",
    monthly: 60.99,
    covers: ["Sling TV"],
    notes:
      "Combined Orange and Blue package billed monthly. Everyday price after 3-month prepay promos ends unless canceled online.",
    source: "Sling TV",
    sourceUrl: "https://www.sling.com/service/sling-orange-and-blue",
    category: "direct",
    mutuallyExclusiveGroup: "sling_tv_access",
    lastChecked: catalogLastChecked("sling_orange_blue_direct"),
    priceStatus: "current",
  },
  {
    id: "sling_select_3mo_prepay",
    name: "Sling Select — 3-month prepay",
    provider: "direct",
    monthly: 16.67,
    standardMonthly: 19.99,
    introLengthMonths: 3,
    covers: ["Sling TV"],
    notes:
      "Pay $49.99 upfront for three months of Sling Select (lowest prepay on sling.com), then $19.99/mo. New customers; one per account; taxes extra. Local channels vary by market.",
    source: "Sling TV",
    sourceUrl: "https://www.sling.com/service/prepay",
    category: "promo",
    mutuallyExclusiveGroup: "sling_tv_access",
    lastChecked: catalogLastChecked("sling_select_3mo_prepay"),
    priceStatus: "current",
  },
  {
    id: "sling_orange_3mo_prepay",
    name: "Sling Orange — 3-month prepay",
    provider: "direct",
    monthly: 38.33,
    standardMonthly: 45.99,
    introLengthMonths: 3,
    covers: ["Sling TV"],
    notes:
      "Pay $114.99 upfront for three months of Sling Orange, then $45.99/mo. Limited-time prepay for new customers on the official prepay page.",
    source: "Sling TV",
    sourceUrl: "https://www.sling.com/service/prepay",
    category: "promo",
    mutuallyExclusiveGroup: "sling_tv_access",
    lastChecked: catalogLastChecked("sling_orange_3mo_prepay"),
    priceStatus: "current",
  },
  {
    id: "sling_blue_3mo_prepay",
    name: "Sling Blue — 3-month prepay",
    provider: "direct",
    monthly: 38.33,
    standardMonthly: 45.99,
    introLengthMonths: 3,
    covers: ["Sling TV"],
    notes:
      "Pay $114.99 upfront for three months of Sling Blue, then $45.99/mo. Limited-time prepay for new customers on the official prepay page.",
    source: "Sling TV",
    sourceUrl: "https://www.sling.com/service/prepay",
    category: "promo",
    mutuallyExclusiveGroup: "sling_tv_access",
    lastChecked: catalogLastChecked("sling_blue_3mo_prepay"),
    priceStatus: "current",
  },
  {
    id: "sling_orange_blue_3mo_prepay",
    name: "Sling Orange & Blue — 3-month prepay",
    provider: "direct",
    monthly: 53.33,
    standardMonthly: 60.99,
    introLengthMonths: 3,
    covers: ["Sling TV"],
    notes:
      "Pay $159.99 upfront for three months of Orange & Blue, then $60.99/mo. Full combo prepay on sling.com; new customers only. Third-party promos (e.g. $50 for 3 months) may differ—confirm at checkout.",
    source: "Sling TV",
    sourceUrl: "https://www.sling.com/service/prepay",
    category: "promo",
    mutuallyExclusiveGroup: "sling_tv_access",
    lastChecked: catalogLastChecked("sling_orange_blue_3mo_prepay"),
    priceStatus: "current",
  },
  {
    id: "sling_orange_blue_promo",
    name: "Sling Orange & Blue — first month promo",
    provider: "direct",
    monthly: 29.99,
    standardMonthly: 60.99,
    introLengthMonths: 1,
    covers: ["Sling TV"],
    notes:
      "Half-off first month for Orange & Blue when offered on sling.com/deals or channels promos—not the 3-month prepay path.",
    source: "Sling TV",
    sourceUrl: "https://www.sling.com/deals",
    category: "promo",
    mutuallyExclusiveGroup: "sling_tv_access",
    lastChecked: catalogLastChecked("sling_orange_blue_promo"),
    priceStatus: "needs_verification",
  },
  {
    id: "fubo_direct",
    name: "Fubo Pro",
    provider: "direct",
    monthly: 55.99,
    covers: ["Fubo"],
    notes:
      "Ongoing monthly rate for Fubo’s main English Pro plan; other tiers (Elite, Premier, Latino, etc.) are on the same official channels page.",
    source: "Fubo",
    sourceUrl: "https://www.fubo.tv/welcome/channels",
    category: "direct",
    mutuallyExclusiveGroup: "fubo_access",
    lastChecked: catalogLastChecked("fubo_direct"),
    priceStatus: "current",
  },
  {
    id: "fubo_promo",
    name: "Fubo promo plan",
    provider: "direct",
    monthly: 45.99,
    standardMonthly: 55.99,
    introLengthMonths: 1,
    covers: ["Fubo"],
    notes:
      "Current first-month Fubo promotional price, then regular monthly rate.",
    source: "Fubo",
    sourceUrl: "https://www.fubo.tv/welcome/channels",
    category: "promo",
    mutuallyExclusiveGroup: "fubo_access",
    lastChecked: catalogLastChecked("fubo_promo"),
    priceStatus: "current",
  },
  {
    id: "philo_essential_direct",
    name: "Philo Essential",
    provider: "direct",
    monthly: 25,
    covers: ["Philo"],
    notes: "Base Philo plan.",
    source: "Philo",
    sourceUrl: "https://help.philo.com/account-billing/packages/",
    category: "direct",
    mutuallyExclusiveGroup: "philo_access",
    lastChecked: catalogLastChecked("philo_essential_direct"),
    priceStatus: "current",
  },
  {
    id: "philo_bundle_plus",
    name: "Philo Bundle+",
    provider: "philo",
    monthly: 33,
    covers: ["Philo", "Max", "discovery+"],
    notes:
      "Bundle+ includes Philo plus access to Max Basic with Ads and ad-supported discovery+.",
    source: "Philo",
    sourceUrl: "https://help.philo.com/account-billing/packages/",
    category: "bundle",
    mutuallyExclusiveGroup: "philo_bundle_plus_family",
    lastChecked: catalogLastChecked("philo_bundle_plus"),
    priceStatus: "current",
  },
  {
    id: "directv_entertainment_direct",
    name: "DirecTV Entertainment (Signature / affiliate)",
    provider: "direct",
    monthly: 94.99,
    covers: ["DirecTV"],
    notes:
      "Signature streaming tier with 90+ channels. Advertised price includes required fees; excludes taxes. Regional sports fee does not apply. Gemini device lease ($10/mo) and promos vary by ZIP—confirm on directv.com before signup.",
    source: "DirecTV",
    sourceUrl:
      "https://www.directv.com/affiliates/#plancard-EntertainmentPackage",
    category: "direct",
    mutuallyExclusiveGroup: "directv_access",
    lastChecked: catalogLastChecked("directv_entertainment_direct"),
    priceStatus: "needs_verification",
  },
  {
    id: "directv_choice_direct",
    name: "DirecTV Choice (Signature / affiliate)",
    provider: "direct",
    monthly: 104.98,
    standardMonthly: 112.98,
    covers: ["DirecTV"],
    notes:
      "Signature Choice tier with 125+ channels. Price shown is with required fees for month 1; ongoing rate often higher after promos. Regional sports network fee up to $19.99/mo may apply by ZIP. Gemini lease $10/mo extra.",
    source: "DirecTV",
    sourceUrl: "https://www.directv.com/affiliates/#plancard-ChoicePackage",
    category: "direct",
    mutuallyExclusiveGroup: "directv_access",
    lastChecked: catalogLastChecked("directv_choice_direct"),
    priceStatus: "needs_verification",
  },
  {
    id: "directv_ultimate_direct",
    name: "DirecTV Ultimate (Signature / affiliate)",
    provider: "direct",
    monthly: 134.98,
    standardMonthly: 137.98,
    covers: ["DirecTV"],
    notes:
      "Signature Ultimate tier with 160+ channels. Includes broader sports and movie channels vs Choice. RSN fee up to $19.99/mo may apply. Confirm current rate and fees for your address.",
    source: "DirecTV",
    sourceUrl: "https://www.directv.com/affiliates/#plancard-UltimatePackage",
    category: "direct",
    mutuallyExclusiveGroup: "directv_access",
    lastChecked: catalogLastChecked("directv_ultimate_direct"),
    priceStatus: "needs_verification",
  },
  {
    id: "directv_premier_direct",
    name: "DirecTV Premier (Signature / affiliate)",
    provider: "direct",
    monthly: 177.98,
    covers: ["DirecTV"],
    notes:
      "Top Signature tier with 185+ channels including premium movie networks. Promotional price locks are common; standard rate with fees can exceed advertised promo. RSN and Gemini fees may apply.",
    source: "DirecTV",
    sourceUrl: "https://www.directv.com/affiliates/#plancard-PremierPackage",
    category: "direct",
    mutuallyExclusiveGroup: "directv_access",
    lastChecked: catalogLastChecked("directv_premier_direct"),
    priceStatus: "needs_verification",
  },
  {
    id: "directv_stream_5day_trial",
    name: "DirecTV Stream — 5-day free trial (new customers)",
    provider: "direct",
    monthly: 0,
    effectiveMonthly: 0,
    standardMonthly: 94.99,
    introLengthMonths: 1,
    covers: ["DirecTV"],
    notes:
      "Streaming App Only: 5-day free trial for new residential customers on directv.com/stream (card hold during trial). Then billed at your chosen package rate with required fees. Modeled as $0 for the first month in comparisons; actual trial is 5 days.",
    source: "DirecTV",
    sourceUrl: "https://www.directv.com/stream/stream-packages/",
    affiliateUrl:
      "https://www.directv.com/stream/stream-packages/?cjdata=MXxOfDB8WXww&utm_medium=Affiliate&utm_source=5370367&utm_campaign=Premium&utm_audience=Prospect&utm_creative=Skimlinks&cjevent=399a71f655ec11f181be00bb0a82b824&utm_content=Skimlinks+DIRECTV+App+Only+Free+Trial+Default+Link",
    category: "promo",
    mutuallyExclusiveGroup: "directv_access",
    lastChecked: catalogLastChecked("directv_stream_5day_trial"),
    priceStatus: "current",
  },
  {
    id: "directv_stream_entertainment_intro",
    name: "DirecTV Entertainment intro (Stream app only)",
    provider: "direct",
    monthly: 84.99,
    standardMonthly: 94.99,
    introLengthMonths: 1,
    covers: ["DirecTV"],
    notes:
      "Advertised intro price on stream-packages before required fees; ongoing Entertainment with fees is $94.99/mo ($5 off for 24 months). No RSN fee on Entertainment. App-only, no satellite dish.",
    source: "DirecTV",
    sourceUrl: "https://www.directv.com/stream/stream-packages/",
    affiliateUrl:
      "https://www.directv.com/stream/stream-packages/?cjdata=MXxOfDB8WXww&utm_medium=Affiliate&utm_source=5370367&utm_campaign=Premium&utm_audience=Prospect&utm_creative=Skimlinks&cjevent=399a71f655ec11f181be00bb0a82b824&utm_content=Skimlinks+DIRECTV+App+Only+Free+Trial+Default+Link",
    category: "promo",
    mutuallyExclusiveGroup: "directv_access",
    lastChecked: catalogLastChecked("directv_stream_entertainment_intro"),
    priceStatus: "current",
  },
  {
    id: "directv_stream_entertainment",
    name: "DirecTV Entertainment (Stream app only)",
    provider: "direct",
    monthly: 94.99,
    covers: ["DirecTV"],
    notes:
      "Streaming App Only ongoing rate with required fees—90+ channels. $5 off for 24 months on new accounts. No regional sports fee on Entertainment. Optional $10/mo Gemini device lease if you add hardware.",
    source: "DirecTV",
    sourceUrl: "https://www.directv.com/stream/stream-packages/",
    affiliateUrl:
      "https://www.directv.com/stream/stream-packages/?cjdata=MXxOfDB8WXww&utm_medium=Affiliate&utm_source=5370367&utm_campaign=Premium&utm_audience=Prospect&utm_creative=Skimlinks&cjevent=399a71f655ec11f181be00bb0a82b824&utm_content=Skimlinks+DIRECTV+App+Only+Free+Trial+Default+Link",
    category: "direct",
    mutuallyExclusiveGroup: "directv_access",
    lastChecked: catalogLastChecked("directv_stream_entertainment"),
    priceStatus: "current",
  },
  {
    id: "directv_stream_choice_intro",
    name: "DirecTV Choice intro (Stream app only)",
    provider: "direct",
    monthly: 84.99,
    standardMonthly: 114.98,
    introLengthMonths: 1,
    covers: ["DirecTV"],
    notes:
      "Intro price shown on stream-packages ($84.99/mo before fees); ongoing Choice with required fees is $114.98/mo ($10 off for 24 months). RSN fee up to $19.99/mo may apply by ZIP.",
    source: "DirecTV",
    sourceUrl: "https://www.directv.com/stream/stream-packages/",
    affiliateUrl:
      "https://www.directv.com/stream/stream-packages/?cjdata=MXxOfDB8WXww&utm_medium=Affiliate&utm_source=5370367&utm_campaign=Premium&utm_audience=Prospect&utm_creative=Skimlinks&cjevent=399a71f655ec11f181be00bb0a82b824&utm_content=Skimlinks+DIRECTV+App+Only+Free+Trial+Default+Link",
    category: "promo",
    mutuallyExclusiveGroup: "directv_access",
    lastChecked: catalogLastChecked("directv_stream_choice_intro"),
    priceStatus: "current",
  },
  {
    id: "directv_stream_choice",
    name: "DirecTV Choice (Stream app only)",
    provider: "direct",
    monthly: 114.98,
    covers: ["DirecTV"],
    notes:
      "Streaming App Only Choice tier—125+ channels. Ongoing price with required fees; $10 off for 24 months. Regional sports fee up to $19.99/mo may apply by ZIP. Unlimited cloud DVR included.",
    source: "DirecTV",
    sourceUrl: "https://www.directv.com/stream/stream-packages/",
    affiliateUrl:
      "https://www.directv.com/stream/stream-packages/?cjdata=MXxOfDB8WXww&utm_medium=Affiliate&utm_source=5370367&utm_campaign=Premium&utm_audience=Prospect&utm_creative=Skimlinks&cjevent=399a71f655ec11f181be00bb0a82b824&utm_content=Skimlinks+DIRECTV+App+Only+Free+Trial+Default+Link",
    category: "direct",
    mutuallyExclusiveGroup: "directv_access",
    lastChecked: catalogLastChecked("directv_stream_choice"),
    priceStatus: "current",
  },
  {
    id: "directv_stream_ultimate_intro",
    name: "DirecTV Ultimate intro (Stream app only)",
    provider: "direct",
    monthly: 109.99,
    standardMonthly: 139.98,
    introLengthMonths: 1,
    covers: ["DirecTV"],
    notes:
      "Intro price on stream-packages; ongoing Ultimate with required fees is $139.98/mo ($15 off for 24 months). RSN fee up to $19.99/mo may apply.",
    source: "DirecTV",
    sourceUrl: "https://www.directv.com/stream/stream-packages/",
    affiliateUrl:
      "https://www.directv.com/stream/stream-packages/?cjdata=MXxOfDB8WXww&utm_medium=Affiliate&utm_source=5370367&utm_campaign=Premium&utm_audience=Prospect&utm_creative=Skimlinks&cjevent=399a71f655ec11f181be00bb0a82b824&utm_content=Skimlinks+DIRECTV+App+Only+Free+Trial+Default+Link",
    category: "promo",
    mutuallyExclusiveGroup: "directv_access",
    lastChecked: catalogLastChecked("directv_stream_ultimate_intro"),
    priceStatus: "current",
  },
  {
    id: "directv_stream_ultimate",
    name: "DirecTV Ultimate (Stream app only)",
    provider: "direct",
    monthly: 139.98,
    covers: ["DirecTV"],
    notes:
      "Streaming App Only Ultimate—160+ channels. Ongoing rate with required fees; $15 off for 24 months. RSN fee up to $19.99/mo may apply.",
    source: "DirecTV",
    sourceUrl: "https://www.directv.com/stream/stream-packages/",
    affiliateUrl:
      "https://www.directv.com/stream/stream-packages/?cjdata=MXxOfDB8WXww&utm_medium=Affiliate&utm_source=5370367&utm_campaign=Premium&utm_audience=Prospect&utm_creative=Skimlinks&cjevent=399a71f655ec11f181be00bb0a82b824&utm_content=Skimlinks+DIRECTV+App+Only+Free+Trial+Default+Link",
    category: "direct",
    mutuallyExclusiveGroup: "directv_access",
    lastChecked: catalogLastChecked("directv_stream_ultimate"),
    priceStatus: "current",
  },
  {
    id: "directv_stream_premier_intro",
    name: "DirecTV Premier intro (Stream app only)",
    provider: "direct",
    monthly: 149.99,
    standardMonthly: 179.98,
    introLengthMonths: 1,
    covers: ["DirecTV"],
    notes:
      "Intro price on stream-packages; ongoing Premier with required fees is $179.98/mo ($20 off for 24 months). RSN fee up to $19.99/mo may apply.",
    source: "DirecTV",
    sourceUrl: "https://www.directv.com/stream/stream-packages/",
    affiliateUrl:
      "https://www.directv.com/stream/stream-packages/?cjdata=MXxOfDB8WXww&utm_medium=Affiliate&utm_source=5370367&utm_campaign=Premium&utm_audience=Prospect&utm_creative=Skimlinks&cjevent=399a71f655ec11f181be00bb0a82b824&utm_content=Skimlinks+DIRECTV+App+Only+Free+Trial+Default+Link",
    category: "promo",
    mutuallyExclusiveGroup: "directv_access",
    lastChecked: catalogLastChecked("directv_stream_premier_intro"),
    priceStatus: "current",
  },
  {
    id: "directv_stream_premier",
    name: "DirecTV Premier (Stream app only)",
    provider: "direct",
    monthly: 179.98,
    covers: ["DirecTV"],
    notes:
      "Streaming App Only Premier—185+ channels including premium movie networks. Ongoing rate with required fees; $20 off for 24 months. RSN fee may apply. Taxes extra; cancel anytime.",
    source: "DirecTV",
    sourceUrl: "https://www.directv.com/stream/stream-packages/",
    affiliateUrl:
      "https://www.directv.com/stream/stream-packages/?cjdata=MXxOfDB8WXww&utm_medium=Affiliate&utm_source=5370367&utm_campaign=Premium&utm_audience=Prospect&utm_creative=Skimlinks&cjevent=399a71f655ec11f181be00bb0a82b824&utm_content=Skimlinks+DIRECTV+App+Only+Free+Trial+Default+Link",
    category: "direct",
    mutuallyExclusiveGroup: "directv_access",
    lastChecked: catalogLastChecked("directv_stream_premier"),
    priceStatus: "current",
  },

  // MEMBERSHIP / INCLUDED PATHS
  {
    id: "prime_membership_video",
    name: "Prime Video included with Amazon Prime",
    provider: "amazon",
    monthly: 8.99,
    effectiveMonthly: 0,
    covers: ["Prime Video"],
    notes:
      "Prime Video is included with Amazon Prime at no extra streaming cost. Membership cost is not included in this comparison.",
    source: "Amazon Prime",
    sourceUrl: "https://www.amazon.com/amazonprime",
    requires: ["amazon_prime"],
    includedWith: "amazon_prime",
    category: "membership",
    mutuallyExclusiveGroup: "prime_video_access",
    lastChecked: catalogLastChecked("prime_membership_video"),
    priceStatus: "current",
  },
  {
    id: "apple_one_individual",
    name: "Apple TV+ included with Apple One",
    provider: "apple",
    monthly: 12.99,
    effectiveMonthly: 0,
    covers: ["Apple TV+"],
    notes:
      "Apple TV+ is included with Apple One at no extra streaming cost. Membership cost is not included in this comparison.",
    source: "Apple One",
    sourceUrl: "https://www.apple.com/apple-one/",
    requires: ["apple_one"],
    includedWith: "apple_one",
    category: "membership",
    mutuallyExclusiveGroup: "apple_tv_access",
    lastChecked: catalogLastChecked("apple_one_individual"),
    priceStatus: "current",
  },
  {
    id: "instacart_peacock",
    name: "Peacock Premium included with Instacart+",
    provider: "instacart_plus",
    monthly: 0,
    effectiveMonthly: 0,
    covers: ["Peacock"],
    notes:
      "Peacock Premium is included with Instacart+. Membership cost is not included in this comparison.",
    source: "Instacart+",
    sourceUrl: "https://www.instacart.com/instacart-plus",
    requires: ["instacart_plus"],
    includedWith: "instacart_plus",
    category: "carrier",
    mutuallyExclusiveGroup: "peacock_access",
    lastChecked: catalogLastChecked("instacart_peacock"),
    priceStatus: "current",
  },
  {
    id: "walmart_paramount",
    name: "Paramount+ Essential included with Walmart+",
    provider: "walmart_plus",
    monthly: 8.99,
    effectiveMonthly: 0,
    covers: ["Paramount+"],
    notes:
      "Walmart+ members can choose Paramount+ Essential at no extra streaming cost.",
    source: "Walmart+",
    sourceUrl:
      "https://www.walmart.com/help/article/walmart-benefits-streaming-services/35624ec8e133496ab647a398a90cf779",
    requires: ["walmart_plus"],
    includedWith: "walmart_plus",
    category: "membership",
    mutuallyExclusiveGroup: "walmart_streaming_choice",
    lastChecked: catalogLastChecked("walmart_paramount"),
    priceStatus: "current",
  },
  {
    id: "walmart_peacock",
    name: "Peacock Premium included with Walmart+",
    provider: "walmart_plus",
    monthly: 10.99,
    effectiveMonthly: 0,
    covers: ["Peacock"],
    notes:
      "Walmart+ members can choose Peacock Premium with ads at no extra streaming cost. Only one Walmart+ streaming benefit can be active at a time.",
    source: "Walmart+",
    sourceUrl:
      "https://www.walmart.com/help/article/walmart-benefits-streaming-services/35624ec8e133496ab647a398a90cf779",
    requires: ["walmart_plus"],
    includedWith: "walmart_plus",
    category: "membership",
    mutuallyExclusiveGroup: "walmart_streaming_choice",
    lastChecked: catalogLastChecked("walmart_peacock"),
    priceStatus: "current",
  },

  // CORE BUNDLES
  {
    id: "disney_hulu_bundle",
    name: "Disney+, Hulu Bundle",
    provider: "hulu",
    monthly: 12.99,
    covers: ["Disney+", "Hulu"],
    notes: "Official two-service ad-supported bundle.",
    source: "Disney / Hulu",
    sourceUrl: "https://www.hulu.com/disney-hulu-bundle",
    category: "bundle",
    mutuallyExclusiveGroup: "disney_hulu_family",
    lastChecked: catalogLastChecked("disney_hulu_bundle"),
    priceStatus: "current",
  },
  {
    id: "disney_hulu_espn_unlimited_bundle",
    name: "Disney+, Hulu, ESPN Unlimited Bundle",
    provider: "hulu",
    monthly: 35.99,
    covers: ["Disney+", "Hulu", "ESPN+"],
    notes:
      "Bundle includes Disney+, Hulu, and ESPN Unlimited; modeled here as satisfying ESPN+ access.",
    source: "Hulu",
    sourceUrl: "https://www.hulu.com/disney-hulu-espn-unlimited-bundle",
    category: "bundle",
    mutuallyExclusiveGroup: "disney_hulu_espn_family",
    lastChecked: catalogLastChecked("disney_hulu_espn_unlimited_bundle"),
    priceStatus: "current",
  },
  {
    id: "disney_hulu_max_bundle",
    name: "Disney+, Hulu, HBO Max Bundle (With Ads)",
    provider: "hulu",
    monthly: 19.99,
    covers: ["Disney+", "Hulu", "Max"],
    notes:
      "Direct-billed Disney+, Hulu, HBO Max Bundle with ads. Advertised savings vs $34.97/mo standalone retail for the three services (~42% off). Billed by Hulu; access each app separately. U.S. only, 18+.",
    source: "Hulu",
    sourceUrl: "https://www.hulu.com/disney-hulu-hbomax-bundle",
    category: "bundle",
    mutuallyExclusiveGroup: "disney_hulu_max_family",
    lastChecked: catalogLastChecked("disney_hulu_max_bundle"),
    priceStatus: "current",
  },
  {
    id: "disney_hulu_max_bundle_no_ads",
    name: "Disney+, Hulu, HBO Max Bundle (No Ads)",
    provider: "hulu",
    monthly: 32.99,
    covers: ["Disney+", "Hulu", "Max"],
    notes:
      "Ad-free Disney+, Hulu, and HBO Max bundle. Advertised savings vs $56.47/mo standalone retail (~41% off). Ads may still appear in select live and linear content. ESPN Unlimited add-on available on the same signup page.",
    source: "Hulu",
    sourceUrl: "https://www.hulu.com/disney-hulu-hbomax-bundle",
    category: "bundle",
    mutuallyExclusiveGroup: "disney_hulu_max_family",
    lastChecked: catalogLastChecked("disney_hulu_max_bundle_no_ads"),
    priceStatus: "current",
  },

  // ROKU PROMOS (Phase 1)
  // Alternate signup paths via Roku / The Roku Channel for services users already select
  // (Hulu, STARZ, etc.). No "Roku" service card. Id prefix: roku_<service>_<deal>.
  // See docs/pricing-data-process.md § Roku deals.
  {
    id: "roku_amcplus_streaming_day_26",
    name: "AMC+ — Roku Streaming Day 2026",
    provider: "roku",
    monthly: 1.99,
    standardMonthly: 7.99,
    introLengthMonths: 2,
    covers: ["AMC+"],
    notes:
      "Roku Streaming Day (May 15–25, 2026): $1.99/mo for 2 months via Premium Subscriptions on The Roku Channel, then standard AMC+ rate. US only; redeem on a Roku device. New/eligible subs per Roku terms.",
    source: "Roku",
    sourceUrl:
      "https://therokuchannel.roku.com/browse/w.LewpyBv9QLf8QoxavlrZH2y175zoj8TK9KJbw8RWs0PaVBqNv5CrgdPlVGalta9BvrB8gmikvv3kVGbJc4AjPZ1jVriK31ZDwDJefDGbeQqgMpCmzBKegpZwIe9k6YD00JIyz5eq/amc",
    category: "promo",
    effectiveDate: "2026-05-15",
    expiresAt: "2026-05-25",
    mutuallyExclusiveGroup: "amcplus_access",
    lastChecked: catalogLastChecked("roku_amcplus_streaming_day_26"),
    priceStatus: "current",
  },
  {
    id: "roku_apple_tv_streaming_day_26",
    name: "Apple TV+ — Roku Streaming Day 2026",
    provider: "roku",
    monthly: 5.99,
    standardMonthly: 12.99,
    introLengthMonths: 2,
    covers: ["Apple TV+"],
    notes:
      "Listed as “Apple TV” on Roku’s Streaming Day page: $5.99/mo for 2 months through The Roku Channel, then regular Apple TV+ monthly billing. US Roku device required during offer window.",
    source: "Roku",
    sourceUrl:
      "https://therokuchannel.roku.com/browse/w.xdGNYBW4w8hPd97D31aLsLJvepwgM5fvBvlxe57Mh0vA69wlD3CAR9gG6wPGCGdY2jY1e8Hv22JvxkM1iZ7dA3emApuDLQzlPlRmf924kd0zjpU7V9GdQ2oZCV1oZvBGGbC0xGP1/apple-tv",
    category: "promo",
    effectiveDate: "2026-05-15",
    expiresAt: "2026-05-25",
    mutuallyExclusiveGroup: "apple_tv_access",
    lastChecked: catalogLastChecked("roku_apple_tv_streaming_day_26"),
    priceStatus: "current",
  },
  {
    id: "roku_crunchyroll_streaming_day_26",
    name: "Crunchyroll — Roku Streaming Day 2026",
    provider: "roku",
    monthly: 1.99,
    standardMonthly: 9.99,
    introLengthMonths: 2,
    covers: ["Crunchyroll"],
    notes:
      "Roku Streaming Day: $1.99/mo for 2 months via The Roku Channel or Roku-managed Crunchyroll signup. Tier on Roku may differ from direct crunchyroll.com Fan plan—confirm in checkout.",
    source: "Roku",
    sourceUrl:
      "https://therokuchannel.roku.com/browse/w.r2BADo4GwMFGV4ekdKLpiPNALm0exvIVrV4bopyYUoRl7zV2QZtwMm2Aq3lAC9ylqVlDjkc5GGk5NZa4cx3r9Z6Q5lIVQejlxmW2UJR3dQoN3RsG21W3JJgBHw91m73APAFzN6W6LDaPCDb/crunchyroll",
    category: "promo",
    effectiveDate: "2026-05-15",
    expiresAt: "2026-05-25",
    mutuallyExclusiveGroup: "crunchyroll_access",
    lastChecked: catalogLastChecked("roku_crunchyroll_streaming_day_26"),
    priceStatus: "current",
  },
  {
    id: "roku_discoveryplus_streaming_day_26",
    name: "discovery+ — Roku Streaming Day 2026",
    provider: "roku",
    monthly: 2.99,
    standardMonthly: 5.99,
    introLengthMonths: 3,
    covers: ["discovery+"],
    notes:
      "Roku Streaming Day: $2.99/mo for 3 months on The Roku Channel, then standard discovery+ monthly rate. Offer window May 15–25, 2026; US Roku device.",
    source: "Roku",
    sourceUrl:
      "https://therokuchannel.roku.com/browse/w.wBG0ZdW46btY169yjMrptWqo9b48LYIYVYQy6owLCb2PRBNqVzIPg6GJvjYJUJapQzp5ZkcNwwPNJ1x7FjBgrb7W5ZcPRL8QkLraiorMlD6DzJcvy305j94WfVKjGrMqJocAgLyVWGG2Ub0xRg/discovery",
    category: "promo",
    effectiveDate: "2026-05-15",
    expiresAt: "2026-05-25",
    mutuallyExclusiveGroup: "discoveryplus_access",
    lastChecked: catalogLastChecked("roku_discoveryplus_streaming_day_26"),
    priceStatus: "current",
  },
  {
    id: "roku_starz_streaming_day_26",
    name: "STARZ — Roku Streaming Day 2026",
    provider: "roku",
    monthly: 1.99,
    standardMonthly: 11.99,
    introLengthMonths: 2,
    covers: ["STARZ"],
    notes:
      "Roku Streaming Day: $1.99/mo for 2 months via The Roku Channel, then standard STARZ monthly rate. Same offer window as roku.com/blog/streaming-day-26 (May 15–25, 2026).",
    source: "Roku",
    sourceUrl:
      "https://therokuchannel.roku.com/browse/w.9wKL8Dq0JasxW5r18Zq9SVD2b8pZqjCl0lwradoGfwqjy25keWs24aAG8dYGi8kQZpQBA0fBmmJBkwJyFv3NlbgNzduZAJGMyrJAtjlGP6LLm5hPYrM36d9dH9pqrqeWvKfYQ/starz",
    category: "promo",
    effectiveDate: "2026-05-15",
    expiresAt: "2026-05-25",
    mutuallyExclusiveGroup: "starz_access",
    lastChecked: catalogLastChecked("roku_starz_streaming_day_26"),
    priceStatus: "current",
  },

  // PROMOS
  {
    id: "disney_hulu_bundle_promo",
    name: "Disney+, Hulu Bundle promo",
    provider: "hulu",
    monthly: 4.99,
    standardMonthly: 12.99,
    introLengthMonths: 3,
    covers: ["Disney+", "Hulu"],
    notes:
      "Limited-time introductory price for the Disney+, Hulu Bundle, then renews at the current regular bundle rate.",
    source: "Hulu",
    sourceUrl: "https://www.hulu.com/disney-hulu-bundle",
    category: "promo",
    effectiveDate: "2026-03-05",
    expiresAt: "2026-12-31",
    mutuallyExclusiveGroup: "disney_hulu_family",
    lastChecked: catalogLastChecked("disney_hulu_bundle_promo"),
    priceStatus: "current",
  },
  {
    id: "starz_promo",
    name: "STARZ limited-time offer",
    provider: "direct",
    monthly: 4.99,
    standardMonthly: 11.99,
    introLengthMonths: 3,
    covers: ["STARZ"],
    notes:
      "STARZ limited-time monthly offer ($4.99/mo for 3 months on starz.com), then renews at the current standard monthly rate ($11.99/mo).",
    source: "STARZ",
    sourceUrl: "https://www.starz.com/us/en/buy",
    category: "promo",
    mutuallyExclusiveGroup: "starz_access",
    lastChecked: catalogLastChecked("starz_promo"),
    priceStatus: "current",
  },
  {
    id: "apple_tv_rokt_30day_promo",
    name: "Apple TV+ — 30 days free (promo code)",
    provider: "apple",
    monthly: 0,
    effectiveMonthly: 0,
    standardMonthly: 12.99,
    introLengthMonths: 1,
    covers: ["Apple TV+"],
    notes:
      "Redeem at the linked Apple offer page: 30 days free, then $12.99/mo until canceled. New and qualified returning subscribers only; US only. Promotional code expires January 7, 2027. Requires Apple ID with payment method on file. Cannot be combined with other offers for the same Apple TV service.",
    source: "Apple",
    sourceUrl: "https://redeem.services.apple/roktappletv-amr-v2",
    category: "promo",
    expiresAt: "2027-01-07",
    mutuallyExclusiveGroup: "apple_tv_access",
    lastChecked: catalogLastChecked("apple_tv_rokt_30day_promo"),
    priceStatus: "current",
  },

  // CARRIER / TELECOM PERKS
  {
    id: "verizon_netflix_max_current",
    name: "Verizon Netflix + Max perk",
    provider: "verizon",
    monthly: 10,
    covers: ["Netflix", "Max"],
    notes:
      "Current Verizon streaming perk price before the scheduled increase.",
    source: "Verizon",
    sourceUrl: "https://www.verizon.com/support/netflix-max-perk-faqs/",
    requires: ["verizon"],
    includedWith: "verizon",
    category: "carrier",
    effectiveDate: "2026-04-05",
    expiresAt: "2026-05-05",
    mutuallyExclusiveGroup: "verizon_netflix_max_family",
    lastChecked: catalogLastChecked("verizon_netflix_max_current"),
    priceStatus: "current",
  },
  {
    id: "verizon_netflix_max_future",
    name: "Verizon Netflix + Max perk",
    provider: "verizon",
    monthly: 13,
    covers: ["Netflix", "Max"],
    notes: "Scheduled Verizon perk price beginning May 6, 2026.",
    source: "Verizon",
    sourceUrl: "https://www.verizon.com/support/netflix-max-perk-faqs/",
    requires: ["verizon"],
    includedWith: "verizon",
    category: "carrier",
    effectiveDate: "2026-05-06",
    mutuallyExclusiveGroup: "verizon_netflix_max_family",
    lastChecked: catalogLastChecked("verizon_netflix_max_future"),
    priceStatus: "scheduled_change",
  },
  {
    id: "verizon_disney_bundle",
    name: "Verizon Disney+, Hulu, ESPN+ perk",
    provider: "verizon",
    monthly: 10,
    covers: ["Disney+", "Hulu", "ESPN+"],
    notes:
      "Verizon perk includes Disney+, Hulu, and ESPN+ with ads on eligible plans.",
    source: "Verizon",
    sourceUrl: "https://www.verizon.com/support/disney-bundle-perk-faqs/",
    requires: ["verizon"],
    includedWith: "verizon",
    category: "carrier",
    mutuallyExclusiveGroup: "verizon_disney_family",
    lastChecked: catalogLastChecked("verizon_disney_bundle"),
    priceStatus: "current",
  },
  {
    id: "tmobile_netflix_on_us",
    name: "T-Mobile Netflix On Us",
    provider: "tmobile",
    monthly: 8.99,
    effectiveMonthly: 0,
    covers: ["Netflix"],
    notes:
      "Eligible T-Mobile plans include Netflix Standard with Ads at no extra streaming cost.",
    source: "T-Mobile",
    sourceUrl: "https://www.t-mobile.com/tv-streaming/netflix-on-us",
    requires: ["tmobile"],
    includedWith: "tmobile",
    category: "carrier",
    mutuallyExclusiveGroup: "netflix_access",
    lastChecked: catalogLastChecked("tmobile_netflix_on_us"),
    priceStatus: "current",
  },
  {
    id: "tmobile_apple_tv_discount",
    name: "T-Mobile Apple TV benefit",
    provider: "tmobile",
    monthly: 3,
    covers: ["Apple TV+"],
    notes:
      "Eligible T-Mobile plans can get Apple TV billed through T-Mobile for $3/month.",
    source: "T-Mobile",
    sourceUrl: "https://www.t-mobile.com/tv-streaming/apple-tv-plus-deal/faq",
    requires: ["tmobile"],
    includedWith: "tmobile",
    category: "carrier",
    mutuallyExclusiveGroup: "apple_tv_access",
    lastChecked: catalogLastChecked("tmobile_apple_tv_discount"),
    priceStatus: "current",
  },
  {
    id: "xfinity_streamsaver",
    name: "Xfinity StreamSaver",
    provider: "xfinity",
    monthly: 18,
    covers: ["Netflix", "Apple TV+", "Peacock"],
    notes:
      "Xfinity StreamSaver bundles Netflix Standard with Ads, Apple TV+, and Peacock Premium with ads for Xfinity Internet or TV customers.",
    source: "Xfinity",
    sourceUrl: "https://www.xfinity.com/learn/digital-cable-tv/streaming-services",
    requires: ["xfinity"],
    includedWith: "xfinity",
    category: "carrier",
    mutuallyExclusiveGroup: "xfinity_streamsaver_family",
    lastChecked: catalogLastChecked("xfinity_streamsaver"),
    priceStatus: "current",
  },
];

export const defaultSelectedServices: string[] = [
  "Netflix",
  "Disney+",
  "Hulu",
];
