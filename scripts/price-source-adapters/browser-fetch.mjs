async function loadPlaywright() {
  try {
    const mod = await import("playwright");
    return mod;
  } catch {
    return null;
  }
}

export async function fetchHtmlWithBrowser(url, debugFetch = false) {
  const playwright = await loadPlaywright();
  if (!playwright) {
    return {
      ok: false,
      status: 0,
      html: "",
      error: "playwright_not_installed",
      errorCode: "PLAYWRIGHT_MISSING",
      durationMs: 0,
      fetchMode: "browser",
    };
  }

  const startedAt = Date.now();
  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent:
        process.env.PRICE_WATCH_USER_AGENT ||
        "StreamWise-BrowserWatch/1.0 (+https://github.com/chrisandersontn-stack/streamwise)",
      locale: "en-US",
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(1500);
    const html = await page.content();
    const status = 200;
    if (debugFetch) {
      console.log(
        `[debug-fetch] BROWSER OK ${status} for ${url} (${Date.now() - startedAt}ms, bytes=${Buffer.byteLength(
          html,
          "utf8"
        )})`
      );
    }
    await context.close();
    await browser.close();
    return {
      ok: true,
      status,
      html,
      error: "",
      durationMs: Date.now() - startedAt,
      fetchMode: "browser",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (debugFetch) {
      console.warn(
        `[debug-fetch] BROWSER EXCEPTION for ${url} (${Date.now() - startedAt}ms) message=${message}`
      );
    }
    if (browser) {
      try {
        await browser.close();
      } catch {
        // Ignore browser close failures after exception.
      }
    }
    return {
      ok: false,
      status: 0,
      html: "",
      error: message,
      errorCode: "BROWSER_FETCH_FAILED",
      durationMs: Date.now() - startedAt,
      fetchMode: "browser",
    };
  }
}

