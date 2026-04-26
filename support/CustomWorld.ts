import { setWorldConstructor, World } from "@cucumber/cucumber";
import type { Browser, BrowserContext, Page } from "playwright";
import { chromium } from "playwright";
import type { LoginPage } from "../pages/LoginPage";
import type { CartPage } from "../pages/CartPage";
import type { CheckoutCompletePage } from "../pages/CheckoutCompletePage";
import type { ProductDetailPage } from "../pages/ProductDetailPage";

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  loginPage?: LoginPage;
  cartPage?: CartPage;
  checkoutCompletePage?: CheckoutCompletePage;
  productDetailPage?: ProductDetailPage;
  scenarioLogs: string[] = [];
  consoleLogs: string[] = [];

  async initBrowser(): Promise<void> {
    this.browser = await chromium.launch({ headless: process.env.HEADLESS === "true" });
  }
}

setWorldConstructor(CustomWorld);
