import { setWorldConstructor, World } from "@cucumber/cucumber";
import type { Browser, BrowserContext, Page } from "playwright";
import { chromium } from "playwright";
import type { LoginPage } from "../pages/LoginPage";

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  loginPage?: LoginPage;
  scenarioLogs: string[] = [];
  consoleLogs: string[] = [];

  async initBrowser(): Promise<void> {
    this.browser = await chromium.launch({ headless: process.env.HEADLESS === "true" });
  }
}

setWorldConstructor(CustomWorld);
