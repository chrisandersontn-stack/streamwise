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
  | "instacart_plus";

export type IncludedWith =
  | "verizon"
  | "walmart_plus"
  | "tmobile"
  | "xfinity"
  | "instacart_plus";

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
  | "philo";

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

const LAST_CHECKED = "2026-04-05";

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
    monthly: 45.99,
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
    lastChecked: LAST_CHECKED,
    priceStatus: "current",
  },
  {
    id: "disney_direct",
    name: "Disney+ (With Ads)",
    provider: "direct",
    monthly: 11.99,
    covers: ["Disney+"],
    notes: "Disney+ standalone with ads.",
    source: "Disney+",
    sourceUrl: "https://www.disneyplus.com/welcome/disney-bundle-duo",
    category: "direct",
    mutuallyExclusiveGroup: "disney_access",
    lastChecked: LAST_CHECKED,
    priceStatus: "current",
  },
  {
    id: "hulu_direct",
    name: "Hulu (With Ads)",
    provider: "direct",
    monthly: 11.99,
    covers: ["Hulu"],
    notes: "Standard direct Hulu plan.",
    source: "Hulu",
    sourceUrl: "https://www.hulu.com/premium-no-ads",
    category: "direct",
    mutuallyExclusiveGroup: "hulu_access",
    lastChecked: LAST_CHECKED,
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
    lastChecked: LAST_CHECKED,
    priceStatus: "current",
  },
  {
    id: "peacock_direct",
    name: "Peacock Premium",
    provider: "direct",
    monthly: 10.99,
    covers: ["Peacock"],
    notes: "Standard Peacock Premium monthly plan.",
    source: "Peacock",
    sourceUrl: "https://www.peacocktv.com/sports",
    category: "direct",
    mutuallyExclusiveGroup: "peacock_access",
    lastChecked: LAST_CHECKED,
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
    lastChecked: LAST_CHECKED,
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
    sourceUrl: "https://tv.apple.com/",
    category: "direct",
    mutuallyExclusiveGroup: "apple_tv_access",
    lastChecked: LAST_CHECKED,
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
    lastChecked: LAST_CHECKED,
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
    lastChecked: LAST_CHECKED,
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
    sourceUrl:
      "https://support.amcplus.com/kb/guide/en/price-change-cenwVPBMYg/Steps/5010804",
    category: "direct",
    mutuallyExclusiveGroup: "amcplus_access",
    lastChecked: LAST_CHECKED,
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
    lastChecked: LAST_CHECKED,
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
    lastChecked: LAST_CHECKED,
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
    sourceUrl:
      "https://help.discoveryplus.com/hc/en-us/articles/360058773493-discovery-plans-and-prices",
    category: "direct",
    mutuallyExclusiveGroup: "discoveryplus_access",
    lastChecked: LAST_CHECKED,
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
    lastChecked: LAST_CHECKED,
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
    lastChecked: LAST_CHECKED,
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
    lastChecked: LAST_CHECKED,
    priceStatus: "current",
  },
  {
    id: "sling_orange_direct",
    name: "Sling Orange",
    provider: "direct",
    monthly: 45.99,
    covers: ["Sling TV"],
    notes: "Standard Sling Orange monthly plan.",
    source: "Sling TV",
    sourceUrl: "https://www.sling.com/service/compare-plans",
    category: "direct",
    mutuallyExclusiveGroup: "sling_tv_access",
    lastChecked: LAST_CHECKED,
    priceStatus: "current",
  },
  {
    id: "sling_blue_direct",
    name: "Sling Blue",
    provider: "direct",
    monthly: 45.99,
    covers: ["Sling TV"],
    notes: "Standard Sling Blue monthly plan.",
    source: "Sling TV",
    sourceUrl: "https://www.sling.com/service/compare-plans",
    category: "direct",
    mutuallyExclusiveGroup: "sling_tv_access",
    lastChecked: LAST_CHECKED,
    priceStatus: "current",
  },
  {
    id: "sling_orange_blue_promo",
    name: "Sling Orange & Blue promo",
    provider: "direct",
    monthly: 29.99,
    standardMonthly: 60.99,
    introLengthMonths: 1,
    covers: ["Sling TV"],
    notes: "Half-off first month promotional price for Sling Orange & Blue.",
    source: "Sling TV",
    sourceUrl: "https://www.sling.com/channels",
    category: "promo",
    mutuallyExclusiveGroup: "sling_tv_access",
    lastChecked: LAST_CHECKED,
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
    lastChecked: LAST_CHECKED,
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
    lastChecked: LAST_CHECKED,
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
    lastChecked: LAST_CHECKED,
    priceStatus: "current",
  },

  // MEMBERSHIP / INCLUDED PATHS
  {
    id: "prime_membership_video",
    name: "Prime Video via Amazon Prime",
    provider: "amazon",
    monthly: 14.99,
    effectiveMonthly: 14.99,
    covers: ["Prime Video"],
    notes:
      "Full Amazon Prime membership includes Prime Video, but costs more than the standalone video plan if streaming is your only goal.",
    source: "Amazon Prime",
    sourceUrl:
      "https://www.amazon.com/gp/help/customer/display.html?nodeId=G34EUPKVMYFW8N2U",
    category: "membership",
    mutuallyExclusiveGroup: "prime_video_access",
    lastChecked: LAST_CHECKED,
    priceStatus: "current",
  },
  {
    id: "apple_one_individual",
    name: "Apple One Individual",
    provider: "apple",
    monthly: 19.95,
    covers: ["Apple TV+"],
    notes:
      "Apple One includes Apple TV+ plus other Apple subscriptions, but costs more than standalone Apple TV+ if that is all you need.",
    source: "Apple One",
    sourceUrl: "https://www.apple.com/apple-one/",
    category: "membership",
    mutuallyExclusiveGroup: "apple_tv_access",
    lastChecked: LAST_CHECKED,
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
    lastChecked: LAST_CHECKED,
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
    lastChecked: LAST_CHECKED,
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
    lastChecked: LAST_CHECKED,
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
    lastChecked: LAST_CHECKED,
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
    lastChecked: LAST_CHECKED,
    priceStatus: "current",
  },
  {
    id: "disney_hulu_max_bundle",
    name: "Disney+, Hulu, HBO Max Bundle",
    provider: "hulu",
    monthly: 19.99,
    covers: ["Disney+", "Hulu", "Max"],
    notes: "Three-service ad-supported bundle.",
    source: "Hulu",
    sourceUrl: "https://help.max.com/us/answer/detail/000002578",
    category: "bundle",
    mutuallyExclusiveGroup: "disney_hulu_max_family",
    lastChecked: LAST_CHECKED,
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
    sourceUrl: "https://help.hulu.com/article/hulu-offer-2026",
    category: "promo",
    effectiveDate: "2026-03-05",
    expiresAt: "2026-12-31",
    mutuallyExclusiveGroup: "disney_hulu_family",
    lastChecked: LAST_CHECKED,
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
      "Limited-time STARZ offer for 3 months, then standard monthly pricing.",
    source: "STARZ",
    sourceUrl: "https://www.starz.com/us/en/buy",
    category: "promo",
    mutuallyExclusiveGroup: "starz_access",
    lastChecked: LAST_CHECKED,
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
    lastChecked: LAST_CHECKED,
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
    lastChecked: LAST_CHECKED,
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
    lastChecked: LAST_CHECKED,
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
    lastChecked: LAST_CHECKED,
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
    lastChecked: LAST_CHECKED,
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
    lastChecked: LAST_CHECKED,
    priceStatus: "current",
  },
];

export const defaultSelectedServices: string[] = [
  "Netflix",
  "Disney+",
  "Hulu",
];
