#!/usr/bin/env node

const baseUrl = (process.env.MOBILE_SMOKE_BASE_URL || "http://localhost:3000").replace(
  /\/$/,
  ""
);

const checks = [
  { label: "Home page", path: "/" },
  { label: "Catalog API", path: "/api/catalog" },
  { label: "Support page", path: "/support" },
  { label: "Privacy page", path: "/privacy" },
  { label: "Terms page", path: "/terms" },
  { label: "Affiliate disclosure", path: "/affiliate-disclosure" },
  { label: "App privacy details", path: "/app-privacy-details" },
];

function printHeader() {
  console.log("");
  console.log("StreamWise Mobile Smoke Checklist");
  console.log("================================");
  console.log(`Base URL: ${baseUrl}`);
  console.log("");
}

async function runHttpChecks() {
  console.log("1) HTTP checks");
  for (const check of checks) {
    const url = `${baseUrl}${check.path}`;
    try {
      const res = await fetch(url, { redirect: "follow" });
      const ok = res.status >= 200 && res.status < 400;
      const status = ok ? "PASS" : "FAIL";
      console.log(`- [${status}] ${check.label}: ${res.status} ${url}`);
    } catch (error) {
      console.log(`- [FAIL] ${check.label}: request error for ${url}`);
      console.log(`  ${String(error)}`);
    }
  }
  console.log("");
}

function printManualSteps() {
  console.log("2) Manual iPhone/TestFlight checks");
  console.log("- [ ] Home renders without horizontal overflow.");
  console.log("- [ ] Service cards are readable and selectable without pinch zoom.");
  console.log("- [ ] Recommendation panel shows clear CTA: 'Start with this offer'.");
  console.log("- [ ] Recommendation updates after changing selected services.");
  console.log("- [ ] Freshness and verification warning blocks are visible and readable.");
  console.log("- [ ] Support / Privacy / Terms / Affiliate links open correctly.");
  console.log("- [ ] Contact support mailto link opens email composer.");
  console.log("- [ ] Outbound offer click opens provider page in external browser.");
  console.log("- [ ] Returning to app preserves selected services/preferences.");
  console.log("");
  console.log("3) Release gate");
  console.log("- [ ] Latest checked date matches current verification run.");
  console.log("- [ ] No expired promo path appears in recommendation ranking.");
  console.log("- [ ] App Privacy Details page matches App Store privacy answers.");
  console.log("");
}

async function main() {
  printHeader();
  await runHttpChecks();
  printManualSteps();
}

await main();
