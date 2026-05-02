#!/usr/bin/env node

/**
 * Smoke-test Playwright install + Chromium launch (used by PRICE_WATCH_BROWSER_FETCH path).
 * Run: npm run catalog:price-sources:playwright-verify
 */

async function main() {
  let playwright;
  try {
    playwright = await import("playwright");
  } catch {
    console.error("FAIL: playwright package not installed. Run: npm install");
    process.exit(2);
  }

  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("https://example.com", { waitUntil: "domcontentloaded", timeout: 15000 });
    const title = await page.title();
    await context.close();
    await browser.close();
    console.log(`OK: Playwright Chromium launched and navigated (page title: ${title})`);
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`FAIL: ${message}`);
    console.error("Hint: run `npx playwright install chromium` then retry.");
    if (browser) {
      try {
        await browser.close();
      } catch {
        // ignore
      }
    }
    process.exit(1);
  }
}

main();
