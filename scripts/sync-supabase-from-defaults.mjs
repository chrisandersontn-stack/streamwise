#!/usr/bin/env node
/**
 * Sync Supabase catalog from the live /api/catalog defaults.
 *
 * Phase 1 of the catalog cleanup. While STREAMWISE_USE_DEFAULT_CATALOG=1 is set
 * on the target host, GET /api/catalog serves the corrected embedded defaults
 * from app/streamwise-data.ts (see TODO-supabase-catalog.md). This script
 * fetches that payload and PUTs it back, which `saveCatalog` writes to
 * Supabase as a fresh catalog_snapshots row.
 *
 * Usage:
 *   node --env-file=.env.local scripts/sync-supabase-from-defaults.mjs
 *   node --env-file=.env.local scripts/sync-supabase-from-defaults.mjs --commit
 *
 * Flags:
 *   --base <url>   API base (default https://streamwise-xi.vercel.app)
 *   --commit       Actually PUT to /api/catalog (default is dry-run)
 *   --verbose      Print the full payload before pushing
 *
 * Requires CATALOG_ADMIN_TOKEN in the environment. The script refuses to push
 * unless its local sanity checks pass on the two rows we care about
 * (prime_membership_video, apple_one_individual).
 */

import process from "node:process";

const DEFAULT_BASE = "https://streamwise-xi.vercel.app";

function parseArgs(argv) {
  const args = { base: DEFAULT_BASE, commit: false, verbose: false };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === "--base") {
      args.base = argv[i + 1];
      i += 1;
    } else if (flag === "--commit") {
      args.commit = true;
    } else if (flag === "--verbose") {
      args.verbose = true;
    } else if (flag === "--help" || flag === "-h") {
      printHelp();
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${flag}`);
      printHelp();
      process.exit(2);
    }
  }
  return args;
}

function printHelp() {
  console.log(`Sync Supabase catalog from live /api/catalog defaults.

Usage:
  node --env-file=.env.local scripts/sync-supabase-from-defaults.mjs           (dry-run)
  node --env-file=.env.local scripts/sync-supabase-from-defaults.mjs --commit  (actually push)

Flags:
  --base <url>   API base (default ${DEFAULT_BASE})
  --commit       Actually push to Supabase (default is dry-run)
  --verbose      Print the full payload before pushing

Requires CATALOG_ADMIN_TOKEN in the environment.`);
}

function checkOptionRow(label, opt, expected) {
  if (!opt) {
    console.error(`  FAIL ${label}: not found in payload`);
    return false;
  }
  const problems = [];
  for (const [key, want] of Object.entries(expected)) {
    const got = opt[key];
    const match = Array.isArray(want)
      ? Array.isArray(got) &&
        got.length === want.length &&
        want.every((v, i) => v === got[i])
      : got === want;
    if (!match) {
      problems.push(`${key}: want ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);
    }
  }
  if (problems.length === 0) {
    console.log(`  OK   ${label}`);
    return true;
  }
  console.error(`  FAIL ${label}`);
  for (const p of problems) console.error(`         ${p}`);
  return false;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const token = process.env.CATALOG_ADMIN_TOKEN;
  if (!token) {
    console.error(
      "Missing CATALOG_ADMIN_TOKEN. Run with: node --env-file=.env.local scripts/sync-supabase-from-defaults.mjs"
    );
    process.exit(2);
  }

  const catalogUrl = `${args.base}/api/catalog`;
  console.log(`Fetching ${catalogUrl} ...`);
  const getRes = await fetch(catalogUrl, { cache: "no-store" });
  if (!getRes.ok) {
    console.error(`GET failed: HTTP ${getRes.status}`);
    process.exit(3);
  }
  const payload = await getRes.json();
  if (!Array.isArray(payload?.services) || !Array.isArray(payload?.options)) {
    console.error("Unexpected payload shape (missing services/options).");
    process.exit(3);
  }

  console.log(`  catalogSource: ${payload.catalogSource ?? "(unknown)"}`);
  console.log(
    `  services: ${payload.services.length}, options: ${payload.options.length}`
  );

  console.log("\nSanity checks on the two corrected rows:");
  const prime = payload.options.find((o) => o.id === "prime_membership_video");
  const apple = payload.options.find((o) => o.id === "apple_one_individual");

  const okPrime = checkOptionRow("prime_membership_video", prime, {
    monthly: 8.99,
    effectiveMonthly: 0,
    requires: ["amazon_prime"],
    includedWith: "amazon_prime",
    mutuallyExclusiveGroup: "prime_video_access",
  });
  const okApple = checkOptionRow("apple_one_individual", apple, {
    monthly: 12.99,
    effectiveMonthly: 0,
    requires: ["apple_one"],
    includedWith: "apple_one",
    mutuallyExclusiveGroup: "apple_tv_access",
  });

  if (!okPrime || !okApple) {
    console.error(
      "\nSanity check failed. The remote /api/catalog isn't serving the corrected defaults."
    );
    console.error(
      "Possible causes: STREAMWISE_USE_DEFAULT_CATALOG is not set on the target host,"
    );
    console.error(
      "or app/streamwise-data.ts hasn't been deployed yet. Aborting."
    );
    process.exit(4);
  }

  if (args.verbose) {
    console.log("\nFull payload to be pushed:");
    console.log(
      JSON.stringify(
        { services: payload.services, options: payload.options },
        null,
        2
      )
    );
  }

  if (!args.commit) {
    console.log(
      "\nDry run complete. Re-run with --commit to actually push to Supabase."
    );
    return;
  }

  console.log(`\nPushing to ${catalogUrl} via PUT ...`);
  const putRes = await fetch(catalogUrl, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      "x-admin-token": token,
    },
    body: JSON.stringify({
      services: payload.services,
      options: payload.options,
    }),
  });
  if (!putRes.ok) {
    const text = await putRes.text();
    console.error(`PUT failed: HTTP ${putRes.status} — ${text}`);
    process.exit(5);
  }
  const result = await putRes.json();
  console.log(`  pushed. updatedAt=${result.updatedAt ?? "(unknown)"}`);
  console.log("\nDone.\n");
  console.log("Next steps (do these in Vercel/your browser, not in this script):");
  console.log(
    "  1. Open a Vercel Preview deployment that does NOT have STREAMWISE_USE_DEFAULT_CATALOG set."
  );
  console.log(
    "     Verify Prime Video (with 'I have Amazon Prime') and Apple TV+ (with 'I have Apple One') show $0.00/mo."
  );
  console.log(
    "  2. If verified, remove STREAMWISE_USE_DEFAULT_CATALOG from Production env vars in Vercel."
  );
  console.log(
    "  3. Redeploy Production and re-test the four scenarios on the live site."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(99);
});
