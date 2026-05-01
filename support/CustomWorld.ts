import { setWorldConstructor, World } from "@cucumber/cucumber";
import type { Browser, BrowserContext, Page } from "playwright";
import { chromium } from "playwright";
import { env } from "../config/env";
import type { LoginPage } from "../pages/LoginPage";
import type { CartPage } from "../pages/CartPage";
import type { CheckoutCompletePage } from "../pages/CheckoutCompletePage";
import type { ProductDetailPage } from "../pages/ProductDetailPage";
import type { OrangeHRMLoginPage } from "../pages/OrangeHRMLoginPage";

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  loginPage?: LoginPage;
  cartPage?: CartPage;
  checkoutCompletePage?: CheckoutCompletePage;
  productDetailPage?: ProductDetailPage;
  orangehrmLoginPage?: OrangeHRMLoginPage;
  scenarioLogs: string[] = [];
  consoleLogs: string[] = [];

  async initBrowser(): Promise<void> {
    this.browser = await chromium.launch({ headless: env.headless });
  }
}

setWorldConstructor(CustomWorld);
