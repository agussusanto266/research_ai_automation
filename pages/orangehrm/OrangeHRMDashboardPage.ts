import type { Page } from "playwright";
import { BasePage } from "../BasePage";
import type { LocatorCandidate, LocatorUsage } from "../../utils/selfHealingLocator";

const DASHBOARD_HEADING_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-css", kind: "css", value: ".oxd-topbar-header-breadcrumb h6" },
  { name: "secondary-css", kind: "css", value: ".oxd-topbar-header--title" },
  { name: "fallback-xpath", kind: "xpath", value: "//h6[contains(@class,'oxd-topbar-header')]" },
];

const NAV_MENU_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-css", kind: "css", value: ".oxd-main-menu" },
  { name: "fallback-xpath", kind: "xpath", value: "//*[contains(@class,'oxd-main-menu')]" },
];

export class OrangeHRMDashboardPage extends BasePage {
  constructor(page: Page, scenarioLogs: string[], locatorUsages: LocatorUsage[]) {
    super(page, scenarioLogs, locatorUsages);
  }

  override async goto(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}/web/index.php/dashboard/index`, { waitUntil: "networkidle" });
    await this.page.waitForURL(/dashboard\/index/);
  }

  async getHeading(): Promise<string> {
    const el = await this.resolver.resolve("dashboardHeading", DASHBOARD_HEADING_CANDIDATES);
    return (await el.textContent())?.trim() ?? "";
  }

  async isNavMenuVisible(): Promise<boolean> {
    try {
      const el = await this.resolver.resolve("navMenu", NAV_MENU_CANDIDATES);
      return el.isVisible();
    } catch {
      return false;
    }
  }

  async getNavItemNames(): Promise<string[]> {
    await this.page
      .locator("span.oxd-main-menu-item--name")
      .first()
      .waitFor({ state: "visible", timeout: 10000 });
    return this.page.locator("span.oxd-main-menu-item--name").allTextContents();
  }

  async navigateTo(moduleName: string): Promise<void> {
    await this.page.getByRole("link", { name: moduleName, exact: false }).first().click();
    await this.page.waitForLoadState("networkidle");
  }

  async getCurrentBreadcrumb(): Promise<string> {
    const texts = await this.page.locator(".oxd-topbar-header-breadcrumb").allTextContents();
    return texts.join(" > ").trim();
  }
}
