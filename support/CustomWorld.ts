import { setWorldConstructor, World } from "@cucumber/cucumber";
import type { Browser, BrowserContext, Page } from "playwright";
import { chromium, firefox, selectors, webkit } from "playwright";
import { env } from "../config/env";
import { BasePage } from "../pages/BasePage";
import type { LocatorUsage } from "../utils/selfHealingLocator";

// Single location for test-id attribute — sessionCache.ts must NOT re-set this.
selectors.setTestIdAttribute("data-test");

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  scenarioLogs: string[] = [];
  consoleLogs: string[] = [];
  locatorUsages: LocatorUsage[] = [];
  scenarioStartedAt = 0;

  // Map-based page factory — no manual property registration needed when adding new pages.
  // Each World instance is created fresh per scenario, so the cache is naturally reset.
  private readonly _pageCache = new Map<
    new (page: Page, scenarioLogs: string[], locatorUsages: LocatorUsage[]) => BasePage,
    BasePage
  >();

  getPage<T extends BasePage>(
    PageClass: new (page: Page, scenarioLogs: string[], locatorUsages: LocatorUsage[]) => T
  ): T {
    if (!this._pageCache.has(PageClass)) {
      this._pageCache.set(
        PageClass,
        new PageClass(this.page, this.scenarioLogs, this.locatorUsages)
      );
    }
    return this._pageCache.get(PageClass) as T;
  }

  async initBrowser(): Promise<void> {
    const launchOptions = { headless: env.headless };
    switch (env.browser) {
      case "firefox":
        this.browser = await firefox.launch(launchOptions);
        break;
      case "webkit":
        this.browser = await webkit.launch(launchOptions);
        break;
      default:
        this.browser = await chromium.launch(launchOptions);
    }
  }
}

setWorldConstructor(CustomWorld);
