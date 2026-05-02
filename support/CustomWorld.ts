import { setWorldConstructor, World } from "@cucumber/cucumber";
import type { Browser, BrowserContext, Page } from "playwright";
import { chromium, firefox, selectors, webkit } from "playwright";
import { env } from "../config/env";
import type { LocatorUsage } from "../utils/selfHealingLocator";
import type { LoginPage } from "../pages/LoginPage";
import type { CartPage } from "../pages/CartPage";
import type { CheckoutPage } from "../pages/CheckoutPage";
import type { CheckoutCompletePage } from "../pages/CheckoutCompletePage";
import type { ProductDetailPage } from "../pages/ProductDetailPage";
import type { InventoryPage } from "../pages/InventoryPage";
import type { OrangeHRMLoginPage } from "../pages/OrangeHRMLoginPage";
import type { OrangeHRMDashboardPage } from "../pages/OrangeHRMDashboardPage";
import type { OrangeHRMEmployeePage } from "../pages/OrangeHRMEmployeePage";
import type { TodoPage } from "../pages/TodoPage";

selectors.setTestIdAttribute("data-test");

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  loginPage?: LoginPage;
  cartPage?: CartPage;
  checkoutPage?: CheckoutPage;
  checkoutCompletePage?: CheckoutCompletePage;
  productDetailPage?: ProductDetailPage;
  inventoryPage?: InventoryPage;
  orangehrmLoginPage?: OrangeHRMLoginPage;
  orangehrmDashboardPage?: OrangeHRMDashboardPage;
  orangehrmEmployeePage?: OrangeHRMEmployeePage;
  todoPage?: TodoPage;
  scenarioLogs: string[] = [];
  consoleLogs: string[] = [];
  locatorUsages: LocatorUsage[] = [];
  scenarioStartedAt = 0;

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
